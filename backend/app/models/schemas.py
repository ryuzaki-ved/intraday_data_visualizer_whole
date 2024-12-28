from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum

class DataGranularity(str, Enum):
    TICK = "tick"
    FIVE_SECOND = "5s"
    ONE_MINUTE = "1min"
    FIVE_MINUTE = "5min"
    FIFTEEN_MINUTE = "15min"
    ONE_HOUR = "1hour"
    DAILY = "daily"

class DataType(str, Enum):
    EQUITY = "equity"
    FNO_TICK = "fno_tick"
    FNO_OHLCV = "fno_ohlcv"
    FUTURES = "futures"
    INDEX = "index"

class OptionType(str, Enum):
    CE = "CE"
    PE = "PE"

class BaseMarketData(BaseModel):
    symbol: str
    timestamp: datetime
    data_type: DataType
    granularity: DataGranularity

class TickDataPoint(BaseModel):
    timestamp: datetime
    price: float
    quantity: int
    trnvr: float

class OHLCVDataPoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class SymbolInfo(BaseModel):
    symbol: str
    name: str
    type: str
    expiryDate: Optional[str] = None
    strikePrice: Optional[float] = None
    optionType: Optional[OptionType] = None
    hasTickData: bool = False
    hasOHLCVData: bool = False
    availableTimeframes: List[str] = []

class TradingSession(BaseModel):
    date: str
    start_time: str
    end_time: str
    is_active: bool = False

class ChartDataPoint(BaseModel):
    timestamp: datetime
    value: float
    volume: Optional[int] = None

class CandlestickDataPoint(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class VolumeProfilePoint(BaseModel):
    price_level: float
    volume: int
    trades: int

class TechnicalIndicator(BaseModel):
    name: str
    values: List[float]
    parameters: dict

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Union[List, dict]] = None
    message: Optional[str] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel):
    data: List[dict]
    total: int
    page: int
    page_size: int
    total_pages: int

class DataQueryParams(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    granularity: Optional[DataGranularity] = DataGranularity.ONE_MINUTE
    data_type: Optional[DataType] = DataType.EQUITY

class FilterOptions(BaseModel):
    symbols: Optional[List[str]] = None
    date_range: Optional[tuple[str, str]] = None
    data_types: Optional[List[DataType]] = None
    granularities: Optional[List[DataGranularity]] = None

class ExpiryDateResponse(BaseModel):
    expiry: str
    tradingDates: List[str]

class TradingDateResponse(BaseModel):
    date: str
    expiry: str 