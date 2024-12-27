import duckdb
import os
from pathlib import Path
from app.core.config import settings
from app.core.logger import logger


class DatabaseManager:
    """Database manager for DuckDB operations"""
    
    def __init__(self):
        self.connection = None
        self.db_path = settings.DATABASE_URL.replace("duckdb:///", "")
        
    async def connect(self):
        """Create database connection"""
        try:
            # Ensure data directory exists
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            # Create connection
            self.connection = duckdb.connect(self.db_path)
            
            # Enable HTTP extension for potential future use
            self.connection.install_extension("http")
            self.connection.load_extension("http")
            
            logger.info(f"Connected to DuckDB database: {self.db_path}")
            
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    async def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    async def init_tables(self):
        """Initialize database tables"""
        try:
            # Create tables for different data types
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS symbols (
                    symbol VARCHAR PRIMARY KEY,
                    name VARCHAR,
                    type VARCHAR,
                    exchange VARCHAR,
                    strike_price INTEGER,
                    option_type VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS trading_dates (
                    date VARCHAR PRIMARY KEY,
                    expiry_date VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS tick_data (
                    symbol VARCHAR,
                    timestamp TIMESTAMP,
                    price DOUBLE,
                    qty INTEGER,
                    trnvr DOUBLE,
                    cum_trnvr DOUBLE,
                    granularity VARCHAR DEFAULT 'tick',
                    data_type VARCHAR DEFAULT 'equity',
                    PRIMARY KEY (symbol, timestamp)
                )
            """)
            
            self.connection.execute("""
                CREATE TABLE IF NOT EXISTS ohlcv_data (
                    symbol VARCHAR,
                    timestamp TIMESTAMP,
                    open DOUBLE,
                    high DOUBLE,
                    low DOUBLE,
                    close DOUBLE,
                    volume INTEGER,
                    granularity VARCHAR,
                    data_type VARCHAR DEFAULT 'equity',
                    PRIMARY KEY (symbol, timestamp, granularity)
                )
            """)
            
            # Create indexes for better query performance
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_tick_symbol_timestamp ON tick_data(symbol, timestamp)")
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_ohlcv_symbol_timestamp ON ohlcv_data(symbol, timestamp)")
            self.connection.execute("CREATE INDEX IF NOT EXISTS idx_ohlcv_granularity ON ohlcv_data(granularity)")
            
            logger.info("Database tables initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize tables: {e}")
            raise
    
    def get_connection(self):
        """Get database connection"""
        return self.connection


# Global database manager instance
db_manager = DatabaseManager()


async def init_db():
    """Initialize database connection and tables"""
    await db_manager.connect()
    await db_manager.init_tables()


async def close_db():
    """Close database connection"""
    await db_manager.disconnect()


def get_db():
    """Get database connection for dependency injection"""
    return db_manager.get_connection() 