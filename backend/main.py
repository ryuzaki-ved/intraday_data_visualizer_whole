from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import os
import logging

from app.core.config import settings
from app.core.database import DatabaseManager
from app.core.logger import setup_logger
from app.data.processor import DataProcessor
from app.models.schemas import (
    SymbolInfo, 
    OHLCVDataPoint, 
    TickDataPoint, 
    ExpiryDateResponse,
    TradingDateResponse,
    DataQueryParams
)

# Setup logging
logger = setup_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Intraday History Data Analyzer API",
    description="API for analyzing intraday market data with Parquet and DuckDB",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database manager
db_manager = DatabaseManager()
data_processor = DataProcessor(db_manager)

@app.on_event("startup")
async def startup_event():
    """Initialize database and load data on startup"""
    try:
        await db_manager.initialize()
        logger.info("Database initialized successfully")
        
        # Check if data needs to be processed
        if not await db_manager.table_exists("symbols"):
            logger.info("Processing data files...")
            await data_processor.process_all_data()
            logger.info("Data processing completed")
        else:
            logger.info("Data already processed, skipping initialization")
            
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await db_manager.close()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Intraday History Data Analyzer API", "status": "running"}

@app.get("/api/expiry-dates", response_model=List[ExpiryDateResponse])
async def get_expiry_dates():
    """Get all available expiry dates with their trading dates"""
    try:
        query = """
        SELECT DISTINCT expiry_date, trading_date 
        FROM symbols 
        ORDER BY expiry_date, trading_date
        """
        result = await db_manager.execute_query(query)
        
        # Group by expiry date
        expiry_groups = {}
        for row in result:
            expiry = row['expiry_date']
            trading_date = row['trading_date']
            
            if expiry not in expiry_groups:
                expiry_groups[expiry] = []
            expiry_groups[expiry].append(trading_date)
        
        # Convert to response format
        response = []
        for expiry, trading_dates in expiry_groups.items():
            response.append(ExpiryDateResponse(
                expiry=expiry,
                tradingDates=sorted(trading_dates)
            ))
        
        return response
    except Exception as e:
        logger.error(f"Error fetching expiry dates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trading-dates/{expiry}", response_model=List[str])
async def get_trading_dates_for_expiry(expiry: str):
    """Get trading dates for a specific expiry"""
    try:
        query = """
        SELECT DISTINCT trading_date 
        FROM symbols 
        WHERE expiry_date = ? 
        ORDER BY trading_date
        """
        result = await db_manager.execute_query(query, [expiry])
        return [row['trading_date'] for row in result]
    except Exception as e:
        logger.error(f"Error fetching trading dates for expiry {expiry}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/symbols/{date}", response_model=List[SymbolInfo])
async def get_symbols_for_date(date: str):
    """Get all symbols available for a specific date"""
    try:
        query = """
        SELECT 
            symbol,
            name,
            type,
            expiry_date,
            strike_price,
            option_type,
            has_tick_data,
            has_ohlcv_data,
            available_timeframes
        FROM symbols 
        WHERE trading_date = ?
        ORDER BY symbol
        """
        result = await db_manager.execute_query(query, [date])
        
        symbols = []
        for row in result:
            # Parse available timeframes from string
            timeframes = row['available_timeframes'].split(',') if row['available_timeframes'] else []
            
            symbol_info = SymbolInfo(
                symbol=row['symbol'],
                name=row['name'],
                type=row['type'],
                expiryDate=row['expiry_date'],
                strikePrice=row['strike_price'],
                optionType=row['option_type'],
                hasTickData=bool(row['has_tick_data']),
                hasOHLCVData=bool(row['has_ohlcv_data']),
                availableTimeframes=timeframes
            )
            symbols.append(symbol_info)
        
        return symbols
    except Exception as e:
        logger.error(f"Error fetching symbols for date {date}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ohlcv/{symbol}", response_model=List[OHLCVDataPoint])
async def get_ohlcv_data(
    symbol: str,
    timeframe: str = Query("1min", description="Timeframe: 1min, 5min, 15min, 1hour, daily"),
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """Get OHLCV data for a symbol"""
    try:
        # Determine table name based on timeframe
        table_mapping = {
            "1min": "ohlcv_1min",
            "5min": "ohlcv_5min", 
            "15min": "ohlcv_15min",
            "1hour": "ohlcv_1hour",
            "daily": "ohlcv_daily"
        }
        
        table_name = table_mapping.get(timeframe)
        if not table_name:
            raise HTTPException(status_code=400, detail=f"Invalid timeframe: {timeframe}")
        
        query = f"""
        SELECT 
            timestamp,
            open,
            high,
            low,
            close,
            volume
        FROM {table_name}
        WHERE symbol = ? AND date(timestamp) BETWEEN ? AND ?
        ORDER BY timestamp
        """
        
        result = await db_manager.execute_query(query, [symbol, start_date, end_date])
        
        data_points = []
        for row in result:
            data_point = OHLCVDataPoint(
                timestamp=row['timestamp'],
                open=float(row['open']),
                high=float(row['high']),
                low=float(row['low']),
                close=float(row['close']),
                volume=int(row['volume'])
            )
            data_points.append(data_point)
        
        return data_points
    except Exception as e:
        logger.error(f"Error fetching OHLCV data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tick/{symbol}", response_model=List[TickDataPoint])
async def get_tick_data(
    symbol: str,
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)")
):
    """Get tick data for a symbol"""
    try:
        query = """
        SELECT 
            timestamp,
            price,
            quantity,
            trnvr
        FROM tick_data
        WHERE symbol = ? AND date(timestamp) BETWEEN ? AND ?
        ORDER BY timestamp
        LIMIT 10000
        """
        
        result = await db_manager.execute_query(query, [symbol, start_date, end_date])
        
        data_points = []
        for row in result:
            data_point = TickDataPoint(
                timestamp=row['timestamp'],
                price=float(row['price']),
                quantity=int(row['quantity']),
                trnvr=float(row['trnvr'])
            )
            data_points.append(data_point)
        
        return data_points
    except Exception as e:
        logger.error(f"Error fetching tick data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/symbols")
async def search_symbols(
    query: str = Query("", description="Search query for symbols"),
    date: str = Query("", description="Filter by date"),
    type: str = Query("", description="Filter by type (equity, fno_tick, fno_ohlcv)")
):
    """Search symbols with filters"""
    try:
        conditions = []
        params = []
        
        if query:
            conditions.append("symbol ILIKE ? OR name ILIKE ?")
            params.extend([f"%{query}%", f"%{query}%"])
        
        if date:
            conditions.append("trading_date = ?")
            params.append(date)
        
        if type:
            conditions.append("type = ?")
            params.append(type)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        sql = f"""
        SELECT 
            symbol,
            name,
            type,
            expiry_date,
            strike_price,
            option_type,
            has_tick_data,
            has_ohlcv_data,
            available_timeframes
        FROM symbols 
        WHERE {where_clause}
        ORDER BY symbol
        LIMIT 100
        """
        
        result = await db_manager.execute_query(sql, params)
        
        symbols = []
        for row in result:
            timeframes = row['available_timeframes'].split(',') if row['available_timeframes'] else []
            
            symbol_info = SymbolInfo(
                symbol=row['symbol'],
                name=row['name'],
                type=row['type'],
                expiryDate=row['expiry_date'],
                strikePrice=row['strike_price'],
                optionType=row['option_type'],
                hasTickData=bool(row['has_tick_data']),
                hasOHLCVData=bool(row['has_ohlcv_data']),
                availableTimeframes=timeframes
            )
            symbols.append(symbol_info)
        
        return symbols
    except Exception as e:
        logger.error(f"Error searching symbols: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 