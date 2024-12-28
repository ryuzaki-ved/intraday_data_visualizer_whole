import pandas as pd
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import re
from datetime import datetime
import duckdb

logger = logging.getLogger(__name__)

class DataProcessor:
    """Processes CSV data and loads it into DuckDB"""
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.data_directory = Path("../07 Aug Exp")  # Relative to backend directory
        
    async def process_all_data(self):
        """Process all data files in the directory structure"""
        try:
            logger.info("Starting data processing...")
            
            # Process each expiry directory
            for expiry_dir in self.data_directory.iterdir():
                if expiry_dir.is_dir():
                    await self._process_expiry_directory(expiry_dir)
            
            # Create indexes for better performance
            await self.db_manager.create_indexes()
            
            logger.info("Data processing completed successfully")
            
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            raise
    
    async def _process_expiry_directory(self, expiry_dir: Path):
        """Process all trading dates in an expiry directory"""
        expiry_name = expiry_dir.name
        logger.info(f"Processing expiry: {expiry_name}")
        
        for trading_date_dir in expiry_dir.iterdir():
            if trading_date_dir.is_dir() and not trading_date_dir.name.startswith('.'):
                await self._process_trading_date_directory(expiry_name, trading_date_dir)
    
    async def _process_trading_date_directory(self, expiry_name: str, trading_date_dir: Path):
        """Process all files in a trading date directory"""
        trading_date = trading_date_dir.name
        logger.info(f"Processing trading date: {trading_date}")
        
        # Process CSV files
        csv_files = list(trading_date_dir.glob("*.csv"))
        await self._process_csv_files(expiry_name, trading_date, csv_files)
        
        # Process 5S directory if it exists
        five_s_dir = trading_date_dir / "5S"
        if five_s_dir.exists():
            await self._process_five_second_data(expiry_name, trading_date, five_s_dir)
    
    async def _process_csv_files(self, expiry_name: str, trading_date: str, csv_files: List[Path]):
        """Process CSV files and extract symbol information"""
        symbols_data = []
        
        for csv_file in csv_files:
            try:
                symbol_info = await self._extract_symbol_info(csv_file, expiry_name, trading_date)
                if symbol_info:
                    symbols_data.append(symbol_info)
                    
                    # Process the actual data
                    await self._process_csv_data(csv_file, symbol_info)
                    
            except Exception as e:
                logger.error(f"Error processing {csv_file}: {e}")
                continue
        
        # Insert symbol information
        if symbols_data:
            await self._insert_symbols_data(symbols_data)
    
    async def _extract_symbol_info(self, csv_file: Path, expiry_name: str, trading_date: str) -> Optional[Dict[str, Any]]:
        """Extract symbol information from CSV filename"""
        filename = csv_file.stem
        
        # Parse symbol name and type
        if filename.endswith('_EQ'):
            # Equity symbol
            symbol = filename.replace('_EQ', '')
            symbol_info = {
                'symbol': symbol,
                'name': f"{symbol} Equity",
                'type': 'equity',
                'expiry_date': expiry_name,
                'trading_date': trading_date,
                'strike_price': None,
                'option_type': None,
                'has_tick_data': True,
                'has_ohlcv_data': True,
                'available_timeframes': '1min,5min,15min,1hour,daily'
            }
        elif filename.endswith('CE') or filename.endswith('PE'):
            # Option symbol
            option_type = filename[-2:]  # CE or PE
            strike_price = filename[:-2]  # Remove CE/PE suffix
            
            symbol_info = {
                'symbol': filename,
                'name': f"NIFTY {strike_price} {option_type}",
                'type': 'fno_tick',
                'expiry_date': expiry_name,
                'trading_date': trading_date,
                'strike_price': float(strike_price),
                'option_type': option_type,
                'has_tick_data': True,
                'has_ohlcv_data': False,
                'available_timeframes': 'tick'
            }
        else:
            # Other symbols (futures, etc.)
            symbol_info = {
                'symbol': filename,
                'name': filename,
                'type': 'fno_tick',
                'expiry_date': expiry_name,
                'trading_date': trading_date,
                'strike_price': None,
                'option_type': None,
                'has_tick_data': True,
                'has_ohlcv_data': False,
                'available_timeframes': 'tick'
            }
        
        return symbol_info
    
    async def _process_csv_data(self, csv_file: Path, symbol_info: Dict[str, Any]):
        """Process CSV data and load into appropriate tables"""
        try:
            # Read CSV file
            df = pd.read_csv(csv_file)
            
            if df.empty:
                logger.warning(f"Empty CSV file: {csv_file}")
                return
            
            # Determine data type and process accordingly
            if symbol_info['type'] == 'equity':
                await self._process_equity_data(df, symbol_info)
            else:
                await self._process_tick_data(df, symbol_info)
                
        except Exception as e:
            logger.error(f"Error processing CSV data for {csv_file}: {e}")
    
    async def _process_equity_data(self, df: pd.DataFrame, symbol_info: Dict[str, Any]):
        """Process equity data (OHLCV format)"""
        try:
            # Standardize column names
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Check if it's OHLCV data
            if all(col in df.columns for col in ['open', 'high', 'low', 'close', 'volume']):
                # Add symbol column
                df['symbol'] = symbol_info['symbol']
                
                # Convert timestamp if needed
                if 'timestamp' in df.columns:
                    df['timestamp'] = pd.to_datetime(df['timestamp'])
                elif 'time' in df.columns:
                    df['timestamp'] = pd.to_datetime(df['time'])
                else:
                    # Create timestamp from index
                    df['timestamp'] = pd.date_range(
                        start=f"{symbol_info['trading_date']} 09:15:00",
                        periods=len(df),
                        freq='1min'
                    )
                
                # Select and reorder columns
                ohlcv_df = df[['symbol', 'timestamp', 'open', 'high', 'low', 'close', 'volume']].copy()
                
                # Insert into 1-minute OHLCV table
                await self.db_manager.insert_dataframe('ohlcv_1min', ohlcv_df)
                
                # Generate other timeframes
                await self._generate_timeframes(ohlcv_df, symbol_info['symbol'])
                
            else:
                # Treat as tick data
                await self._process_tick_data(df, symbol_info)
                
        except Exception as e:
            logger.error(f"Error processing equity data for {symbol_info['symbol']}: {e}")
    
    async def _process_tick_data(self, df: pd.DataFrame, symbol_info: Dict[str, Any]):
        """Process tick data"""
        try:
            # Standardize column names
            df.columns = [col.lower().strip() for col in df.columns]
            
            # Add symbol column
            df['symbol'] = symbol_info['symbol']
            
            # Convert timestamp if needed
            if 'timestamp' in df.columns:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
            elif 'time' in df.columns:
                df['timestamp'] = pd.to_datetime(df['time'])
            else:
                # Create timestamp from index
                df['timestamp'] = pd.date_range(
                    start=f"{symbol_info['trading_date']} 09:15:00",
                    periods=len(df),
                    freq='1s'
                )
            
            # Map columns to expected format
            tick_df = pd.DataFrame()
            tick_df['symbol'] = df['symbol']
            tick_df['timestamp'] = df['timestamp']
            
            # Map price column
            if 'price' in df.columns:
                tick_df['price'] = df['price']
            elif 'close' in df.columns:
                tick_df['price'] = df['close']
            else:
                tick_df['price'] = 0.0
            
            # Map quantity column
            if 'quantity' in df.columns:
                tick_df['quantity'] = df['quantity']
            elif 'volume' in df.columns:
                tick_df['quantity'] = df['volume']
            elif 'qty' in df.columns:
                tick_df['quantity'] = df['qty']
            else:
                tick_df['quantity'] = 0
            
            # Map turnover column
            if 'trnvr' in df.columns:
                tick_df['trnvr'] = df['trnvr']
            elif 'turnover' in df.columns:
                tick_df['trnvr'] = df['turnover']
            else:
                tick_df['trnvr'] = tick_df['price'] * tick_df['quantity']
            
            # Insert into tick data table
            await self.db_manager.insert_dataframe('tick_data', tick_df)
            
        except Exception as e:
            logger.error(f"Error processing tick data for {symbol_info['symbol']}: {e}")
    
    async def _process_five_second_data(self, expiry_name: str, trading_date: str, five_s_dir: Path):
        """Process 5-second data files"""
        try:
            csv_files = list(five_s_dir.glob("*.csv"))
            
            for csv_file in csv_files:
                # Extract symbol from filename (e.g., nse_nifty2580724000ce_min.csv)
                filename = csv_file.stem
                symbol_match = re.search(r'nse_nifty\d+(\d{4})(ce|pe)_min', filename)
                
                if symbol_match:
                    strike_price = symbol_match.group(1)
                    option_type = symbol_match.group(2).upper()
                    symbol = f"{strike_price}{option_type}"
                    
                    symbol_info = {
                        'symbol': symbol,
                        'name': f"NIFTY {strike_price} {option_type}",
                        'type': 'fno_ohlcv',
                        'expiry_date': expiry_name,
                        'trading_date': trading_date,
                        'strike_price': float(strike_price),
                        'option_type': option_type,
                        'has_tick_data': False,
                        'has_ohlcv_data': True,
                        'available_timeframes': '5s'
                    }
                    
                    # Process the 5-second data
                    df = pd.read_csv(csv_file)
                    if not df.empty:
                        await self._process_equity_data(df, symbol_info)
                        
        except Exception as e:
            logger.error(f"Error processing 5-second data: {e}")
    
    async def _generate_timeframes(self, df: pd.DataFrame, symbol: str):
        """Generate different timeframe data from 1-minute data"""
        try:
            # Set timestamp as index for resampling
            df_resample = df.set_index('timestamp')
            
            # Generate 5-minute data
            df_5min = df_resample.resample('5T').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).reset_index()
            df_5min['symbol'] = symbol
            await self.db_manager.insert_dataframe('ohlcv_5min', df_5min)
            
            # Generate 15-minute data
            df_15min = df_resample.resample('15T').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).reset_index()
            df_15min['symbol'] = symbol
            await self.db_manager.insert_dataframe('ohlcv_15min', df_15min)
            
            # Generate 1-hour data
            df_1hour = df_resample.resample('1H').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).reset_index()
            df_1hour['symbol'] = symbol
            await self.db_manager.insert_dataframe('ohlcv_1hour', df_1hour)
            
            # Generate daily data
            df_daily = df_resample.resample('1D').agg({
                'open': 'first',
                'high': 'max',
                'low': 'min',
                'close': 'last',
                'volume': 'sum'
            }).reset_index()
            df_daily['symbol'] = symbol
            await self.db_manager.insert_dataframe('ohlcv_daily', df_daily)
            
        except Exception as e:
            logger.error(f"Error generating timeframes for {symbol}: {e}")
    
    async def _insert_symbols_data(self, symbols_data: List[Dict[str, Any]]):
        """Insert symbol information into the database"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame(symbols_data)
            
            # Insert into symbols table
            await self.db_manager.insert_dataframe('symbols', df)
            
            logger.info(f"Inserted {len(symbols_data)} symbols")
            
        except Exception as e:
            logger.error(f"Error inserting symbols data: {e}")
            raise 