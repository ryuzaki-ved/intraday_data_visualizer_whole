from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Intraday History Data Analyzer API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Intraday History Data Analyzer API", "status": "running"}

@app.get("/api/expiry-dates")
async def get_expiry_dates():
    return [
        {
            "expiry": "07 Aug Exp",
            "tradingDates": ["01 Aug", "02 Aug", "03 Aug", "04 Aug", "05 Aug", "07 Aug"]
        },
        {
            "expiry": "31 Jul Exp", 
            "tradingDates": ["31 Jul"]
        }
    ]

@app.get("/api/trading-dates/{expiry}")
async def get_trading_dates_for_expiry(expiry: str):
    if expiry == "07 Aug Exp":
        return ["01 Aug", "02 Aug", "03 Aug", "04 Aug", "05 Aug", "07 Aug"]
    elif expiry == "31 Jul Exp":
        return ["31 Jul"]
    return []

@app.get("/api/symbols/{date}")
async def get_symbols_for_date(date: str):
    return [
        {
            "symbol": "NIFTY",
            "name": "NIFTY 50",
            "type": "equity",
            "expiryDate": "07 Aug Exp",
            "strikePrice": None,
            "optionType": None,
            "hasTickData": True,
            "hasOHLCVData": True,
            "availableTimeframes": ["1min", "5min", "15min", "1hour", "daily"]
        },
        {
            "symbol": "24000CE",
            "name": "NIFTY 24000 CE",
            "type": "fno_tick",
            "expiryDate": "07 Aug Exp",
            "strikePrice": 24000,
            "optionType": "CE",
            "hasTickData": True,
            "hasOHLCVData": False,
            "availableTimeframes": ["tick"]
        }
    ]

@app.get("/api/ohlcv/{symbol}")
async def get_ohlcv_data(symbol: str, timeframe: str = "1min", start_date: str = "2024-08-01", end_date: str = "2024-08-01"):
    # Generate mock OHLCV data
    import random
    from datetime import datetime, timedelta
    
    data = []
    base_price = 24000
    
    # Convert date format from "01 Aug" to "2024-08-01"
    try:
        if " " in start_date:
            # Parse "01 Aug" format
            day, month = start_date.split()
            month_map = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
                "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
            }
            month_num = month_map.get(month, "08")
            start_date = f"2024-{month_num}-{day.zfill(2)}"
        
        current_time = datetime.strptime(f"{start_date} 09:15:00", "%Y-%m-%d %H:%M:%S")
    except:
        # Fallback to default
        current_time = datetime.strptime("2024-08-01 09:15:00", "%Y-%m-%d %H:%M:%S")
    
    for i in range(100):
        open_price = base_price + random.uniform(-100, 100)
        high_price = open_price + random.uniform(0, 50)
        low_price = open_price - random.uniform(0, 50)
        close_price = open_price + random.uniform(-30, 30)
        volume = random.randint(1000, 10000)
        
        data.append({
            "timestamp": current_time.isoformat(),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "close": round(close_price, 2),
            "volume": volume
        })
        
        current_time += timedelta(minutes=1)
        base_price = close_price
    
    return data

@app.get("/api/tick/{symbol}")
async def get_tick_data(symbol: str, start_date: str = "2024-08-01", end_date: str = "2024-08-01"):
    # Generate mock tick data
    import random
    from datetime import datetime, timedelta
    
    data = []
    base_price = 24000
    
    # Convert date format from "01 Aug" to "2024-08-01"
    try:
        if " " in start_date:
            # Parse "01 Aug" format
            day, month = start_date.split()
            month_map = {
                "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
                "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
            }
            month_num = month_map.get(month, "08")
            start_date = f"2024-{month_num}-{day.zfill(2)}"
        
        current_time = datetime.strptime(f"{start_date} 09:15:00", "%Y-%m-%d %H:%M:%S")
    except:
        # Fallback to default
        current_time = datetime.strptime("2024-08-01 09:15:00", "%Y-%m-%d %H:%M:%S")
    
    for i in range(100):
        price = base_price + random.uniform(-50, 50)
        quantity = random.randint(100, 1000)
        trnvr = price * quantity
        
        data.append({
            "timestamp": current_time.isoformat(),
            "price": round(price, 2),
            "quantity": quantity,
            "trnvr": round(trnvr, 2)
        })
        
        current_time += timedelta(seconds=1)
        base_price = price
    
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 