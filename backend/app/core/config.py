from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Intraday History Data Analyzer"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Database Settings
    DATABASE_URL: str = "duckdb:///./data/market_data.duckdb"
    DATA_DIR: str = "./data"
    PARQUET_DIR: str = "./data/parquet"
    
    # Data Processing Settings
    BATCH_SIZE: int = 10000
    MAX_WORKERS: int = 4
    
    # File Paths
    CSV_DATA_PATH: str = "../07 Aug Exp"  # Relative to backend directory
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 