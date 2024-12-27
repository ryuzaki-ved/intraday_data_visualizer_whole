import pandas as pd
import os
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import duckdb
from app.core.config import settings
from app.core.logger import logger
from app.models.schemas import SymbolInfo, DataType, OptionType, Granularity


class DataProcessor:
    """Data processor for CSV to Parquet conversion and database ingestion"""
    
    def __init__(self):
        self.csv_data_path = Path(settings.CSV_DATA_PATH)
        self.parquet_dir = Path(settings.PARQUET_DIR)
        self.parquet_dir.mkdir(parents=True, exist_ok=True)
    
    def scan_data_directory(self) -> Dict[str, List[str]]:
        """Scan the data directory and return available symbols and dates"""
        try:
            data_structure = {}
            
            if not self.csv_data_path.exists():
                logger.warning(f"Data directory not found: {self.csv_data_path}")
                return data_structure
            
            # Scan expiry directories
            for expiry_dir in self.csv_data_path.iterdir():
                if expiry_dir.is_dir():
                    expiry_name = expiry_dir.name
                    data_structure[expiry_name] = []
                    
                    # Scan date directories
                    for date_dir in expiry_dir.iterdir():
                        if date_dir.is_dir():
                            date_name = date_dir.name
                            data_structure[expiry_name].append(date_name)
            
            logger.info(f"Scanned data directory: {len(data_structure)} expiry dates found")
            return data_structure
            
        except Exception as e:
            logger.error(f"Error scanning data directory: {e}")
            return {}
    
    def extract_symbol_info(self, filename: str) -> Optional[SymbolInfo]:
        """Extract symbol information from filename"""
        try:
            base_name = filename.replace('.csv', '')
            
            # F&O options pattern: 24000CE, 24000PE
            fno_match = re.match(r'^(\d+)(CE|PE)$', base_name)
            if fno_match:
                strike_price = int(fno_match.group(1))
                option_type = OptionType(fno_match.group(2))
                return SymbolInfo(
                    symbol=base_name,
                    name=f"NIFTY {strike_price} {option_type.value}",
                    type=DataType.FNO_TICK,
                    exchange="NSE",
                    strike_price=strike_price,
                    option_type=option_type
                )
            
            # Futures pattern: NIFTYAUGFUT
            if base_name.endswith('FUT'):
                return SymbolInfo(
                    symbol=base_name,
                    name=f"{base_name} Futures",
                    type=DataType.FUTURES_TICK,
                    exchange="NSE"
                )
            
            # Equity pattern: RELIANCE_EQ
            if base_name.endswith('_EQ'):
                symbol_name = base_name.replace('_EQ', '')
                return SymbolInfo(
                    symbol=base_name,
                    name=f"{symbol_name} Equity",
                    type=DataType.EQUITY,
                    exchange="NSE"
                )
            
            # Index pattern: NIFTY, BANKNIFTY
            if base_name in ['NIFTY', 'BANKNIFTY']:
                return SymbolInfo(
                    symbol=base_name,
                    name=f"{base_name} Index",
                    type=DataType.INDEX,
                    exchange="NSE"
                )
            
            # 5S folder pattern: nse_nifty2580724000ce_min.csv
            if '_min.csv' in filename:
                parts = base_name.split('_')
                if len(parts) >= 4:
                    symbol = parts[2]  # Extract symbol from filename
                    return SymbolInfo(
                        symbol=symbol,
                        name=f"{symbol} OHLCV",
                        type=DataType.EQUITY,
                        exchange="NSE"
                    )
            
            # Default case
            return SymbolInfo(
                symbol=base_name,
                name=base_name,
                type=DataType.EQUITY,
                exchange="NSE"
            )
            
        except Exception as e:
            logger.error(f"Error extracting symbol info from {filename}: {e}")
            return None
    
    def parse_tick_data(self, file_path: Path) -> Optional[pd.DataFrame]:
        """Parse tick data CSV file"""
        try:
            # Read CSV with different possible formats
            df = pd.read_csv(file_path, header=None)
            
            # Determine column structure based on number of columns
            if len(df.columns) >= 4:
                # Assume format: timestamp, price, qty, trnvr, ...
                df.columns = ['timestamp', 'price', 'qty', 'trnvr'] + [f'col_{i}' for i in range(4, len(df.columns))]
                
                # Convert timestamp
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                # Convert numeric columns
                df['price'] = pd.to_numeric(df['price'], errors='coerce')
                df['qty'] = pd.to_numeric(df['qty'], errors='coerce')
                df['trnvr'] = pd.to_numeric(df['trnvr'], errors='coerce')
                
                # Calculate cumulative turnover
                df['cum_trnvr'] = df['trnvr'].cumsum()
                
                # Add symbol column
                symbol_info = self.extract_symbol_info(file_path.name)
                if symbol_info:
                    df['symbol'] = symbol_info.symbol
                    df['data_type'] = symbol_info.type.value
                
                return df[['symbol', 'timestamp', 'price', 'qty', 'trnvr', 'cum_trnvr', 'data_type']]
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing tick data from {file_path}: {e}")
            return None
    
    def parse_ohlcv_data(self, file_path: Path) -> Optional[pd.DataFrame]:
        """Parse OHLCV data CSV file"""
        try:
            # Read CSV with different possible formats
            df = pd.read_csv(file_path, header=None)
            
            # Determine column structure based on number of columns
            if len(df.columns) >= 6:
                # Assume format: timestamp, open, high, low, close, volume, ...
                df.columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume'] + [f'col_{i}' for i in range(6, len(df.columns))]
                
                # Convert timestamp
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                # Convert numeric columns
                for col in ['open', 'high', 'low', 'close', 'volume']:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                
                # Determine granularity from filename
                granularity = Granularity.ONE_MIN  # Default
                if '5s' in file_path.name or '5S' in str(file_path.parent):
                    granularity = Granularity.FIVE_SEC
                elif 'min' in file_path.name:
                    granularity = Granularity.ONE_MIN
                
                # Add symbol column
                symbol_info = self.extract_symbol_info(file_path.name)
                if symbol_info:
                    df['symbol'] = symbol_info.symbol
                    df['data_type'] = symbol_info.type.value
                    df['granularity'] = granularity.value
                
                return df[['symbol', 'timestamp', 'open', 'high', 'low', 'close', 'volume', 'granularity', 'data_type']]
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing OHLCV data from {file_path}: {e}")
            return None
    
    def process_csv_file(self, file_path: Path) -> Tuple[Optional[pd.DataFrame], str]:
        """Process a single CSV file and return DataFrame and data type"""
        try:
            # Determine if it's tick data or OHLCV data
            if 'min' in file_path.name or '5S' in str(file_path.parent):
                df = self.parse_ohlcv_data(file_path)
                return df, 'ohlcv'
            else:
                df = self.parse_tick_data(file_path)
                return df, 'tick'
                
        except Exception as e:
            logger.error(f"Error processing CSV file {file_path}: {e}")
            return None, 'unknown'
    
    def convert_to_parquet(self, df: pd.DataFrame, output_path: Path, data_type: str):
        """Convert DataFrame to Parquet format"""
        try:
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write to parquet
            df.to_parquet(output_path, index=False, compression='snappy')
            logger.info(f"Converted to parquet: {output_path}")
            
        except Exception as e:
            logger.error(f"Error converting to parquet {output_path}: {e}")
    
    def ingest_to_database(self, df: pd.DataFrame, data_type: str, db_connection):
        """Ingest DataFrame to DuckDB database"""
        try:
            if data_type == 'tick':
                # Insert into tick_data table
                db_connection.execute("""
                    INSERT OR REPLACE INTO tick_data 
                    (symbol, timestamp, price, qty, trnvr, cum_trnvr, granularity, data_type)
                    SELECT symbol, timestamp, price, qty, trnvr, cum_trnvr, granularity, data_type
                    FROM df
                """, {"df": df})
                
            elif data_type == 'ohlcv':
                # Insert into ohlcv_data table
                db_connection.execute("""
                    INSERT OR REPLACE INTO ohlcv_data 
                    (symbol, timestamp, open, high, low, close, volume, granularity, data_type)
                    SELECT symbol, timestamp, open, high, low, close, volume, granularity, data_type
                    FROM df
                """, {"df": df})
            
            logger.info(f"Ingested {len(df)} records of {data_type} data")
            
        except Exception as e:
            logger.error(f"Error ingesting {data_type} data to database: {e}")
    
    def process_all_data(self, db_connection) -> Dict[str, int]:
        """Process all CSV files in the data directory"""
        try:
            stats = {'tick_files': 0, 'ohlcv_files': 0, 'errors': 0}
            
            data_structure = self.scan_data_directory()
            
            for expiry_name, dates in data_structure.items():
                for date_name in dates:
                    date_path = self.csv_data_path / expiry_name / date_name
                    
                    # Process regular files
                    for file_path in date_path.glob('*.csv'):
                        df, data_type = self.process_csv_file(file_path)
                        
                        if df is not None and not df.empty:
                            # Convert to parquet
                            parquet_path = self.parquet_dir / expiry_name / date_name / f"{file_path.stem}.parquet"
                            self.convert_to_parquet(df, parquet_path, data_type)
                            
                            # Ingest to database
                            self.ingest_to_database(df, data_type, db_connection)
                            
                            if data_type == 'tick':
                                stats['tick_files'] += 1
                            elif data_type == 'ohlcv':
                                stats['ohlcv_files'] += 1
                        else:
                            stats['errors'] += 1
                    
                    # Process 5S folder
                    five_s_path = date_path / '5S'
                    if five_s_path.exists():
                        for file_path in five_s_path.glob('*.csv'):
                            df, data_type = self.process_csv_file(file_path)
                            
                            if df is not None and not df.empty:
                                # Convert to parquet
                                parquet_path = self.parquet_dir / expiry_name / date_name / '5S' / f"{file_path.stem}.parquet"
                                self.convert_to_parquet(df, parquet_path, data_type)
                                
                                # Ingest to database
                                self.ingest_to_database(df, data_type, db_connection)
                                
                                if data_type == 'tick':
                                    stats['tick_files'] += 1
                                elif data_type == 'ohlcv':
                                    stats['ohlcv_files'] += 1
                            else:
                                stats['errors'] += 1
            
            logger.info(f"Data processing completed: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error processing all data: {e}")
            return {'tick_files': 0, 'ohlcv_files': 0, 'errors': 0}


# Global data processor instance
data_processor = DataProcessor() 