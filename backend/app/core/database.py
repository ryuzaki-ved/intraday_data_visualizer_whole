import duckdb
import asyncio
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages DuckDB database operations"""
    
    def __init__(self, db_path: str = "intraday_data.db"):
        self.db_path = db_path
        self.connection = None
        self._lock = asyncio.Lock()
    
    async def initialize(self):
        """Initialize database connection and create tables"""
        try:
            # Create connection
            self.connection = duckdb.connect(self.db_path)
            
            # Enable extensions
            self.connection.execute("INSTALL parquet")
            self.connection.execute("LOAD parquet")
            
            # Create tables
            await self._create_tables()
            
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise
    
    async def _create_tables(self):
        """Create necessary tables"""
        try:
            # Symbols table
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS symbols (
                    symbol VARCHAR PRIMARY KEY,
                    name VARCHAR,
                    type VARCHAR,
                    expiry_date VARCHAR,
                    trading_date VARCHAR,
                    strike_price DOUBLE,
                    option_type VARCHAR,
                    has_tick_data BOOLEAN,
                    has_ohlcv_data BOOLEAN,
                    available_timeframes VARCHAR
                )
            """)
            
            # OHLCV tables for different timeframes
            timeframes = ['1min', '5min', '15min', '1hour', 'daily']
            for timeframe in timeframes:
                table_name = f"ohlcv_{timeframe.replace('1hour', '1hour')}"
                self.connection.execute(f"""
                    CREATE TABLE IF NOT EXISTS {table_name} (
                        symbol VARCHAR,
                        timestamp TIMESTAMP,
                        open DOUBLE,
                        high DOUBLE,
                        low DOUBLE,
                        close DOUBLE,
                        volume BIGINT,
                        PRIMARY KEY (symbol, timestamp)
                    )
                """)
            
            # Tick data table
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS tick_data (
                    symbol VARCHAR,
                    timestamp TIMESTAMP,
                    price DOUBLE,
                    quantity BIGINT,
                    trnvr DOUBLE,
                    PRIMARY KEY (symbol, timestamp)
                )
            """)
            
            logger.info("Tables created successfully")
            
        except Exception as e:
            logger.error(f"Error creating tables: {e}")
            raise
    
    async def table_exists(self, table_name: str) -> bool:
        """Check if a table exists"""
        try:
            result = self.connection.execute(f"""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = '{table_name}'
            """).fetchone()
            return result[0] > 0
        except Exception as e:
            logger.error(f"Error checking table existence: {e}")
            return False
    
    async def execute_query(self, query: str, params: Optional[List] = None) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dictionaries"""
        async with self._lock:
            try:
                if params:
                    result = self.connection.execute(query, params)
                else:
                    result = self.connection.execute(query)
                
                # Convert to list of dictionaries
                columns = result.description
                rows = result.fetchall()
                
                return [dict(zip([col[0] for col in columns], row)) for row in rows]
                
            except Exception as e:
                logger.error(f"Error executing query: {e}")
                raise
    
    async def execute_many(self, query: str, params_list: List[List]):
        """Execute a query with multiple parameter sets"""
        async with self._lock:
            try:
                self.connection.executemany(query, params_list)
                self.connection.commit()
            except Exception as e:
                logger.error(f"Error executing batch query: {e}")
                raise
    
    async def insert_dataframe(self, table_name: str, df: pd.DataFrame):
        """Insert a pandas DataFrame into a table"""
        async with self._lock:
            try:
                # Convert DataFrame to Arrow table
                arrow_table = pa.Table.from_pandas(df)
                
                # Write to Parquet file temporarily
                temp_parquet = f"temp_{table_name}.parquet"
                pq.write_table(arrow_table, temp_parquet)
                
                # Insert from Parquet
                self.connection.execute(f"""
                    INSERT OR REPLACE INTO {table_name} 
                    SELECT * FROM read_parquet('{temp_parquet}')
                """)
                
                # Clean up temp file
                Path(temp_parquet).unlink(missing_ok=True)
                
                logger.info(f"Inserted {len(df)} rows into {table_name}")
                
            except Exception as e:
                logger.error(f"Error inserting DataFrame into {table_name}: {e}")
                raise
    
    async def create_indexes(self):
        """Create indexes for better query performance"""
        try:
            # Indexes for symbols table
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_symbols_trading_date ON symbols(trading_date)")
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_symbols_expiry_date ON symbols(expiry_date)")
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(type)")
            
            # Indexes for OHLCV tables
            timeframes = ['1min', '5min', '15min', '1hour', 'daily']
            for timeframe in timeframes:
                table_name = f"ohlcv_{timeframe.replace('1hour', '1hour')}"
                self.connection.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_symbol_timestamp ON {table_name}(symbol, timestamp)")
            
            # Indexes for tick data
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_tick_data_symbol_timestamp ON tick_data(symbol, timestamp)")
            
            logger.info("Indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
            raise
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def __del__(self):
        """Destructor to ensure connection is closed"""
        if hasattr(self, 'connection') and self.connection:
            self.connection.close() 