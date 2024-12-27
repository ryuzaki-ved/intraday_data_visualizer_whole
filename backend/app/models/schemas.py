from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime
from enum import Enum


class DataType(str, Enum):
    EQUITY = "equity"
    FNO_TICK = "fno_tick"
    FUTURES_TICK = "futures_tick"
    INDEX = "index"


class OptionType(str, Enum):
    CE = "CE"
    PE = "PE"


class Granularity(str, Enum):
    TICK = "tick"
    FIVE_SEC = "5s"
    ONE_MIN = "1min"
    FIVE_MIN = "5min"
    FIFTEEN_MIN = "15min"
    ONE_HOUR = "1hour"
    DAILY = "daily"


# Base Models
class SymbolInfo(BaseModel):
    symbol: str
    name: str
    type: DataType
    exchange: str
    strike_price: Optional[int] = None
    option_type: Optional[OptionType] = None


class TickDataPoint(BaseModel):
    symbol: str
    timestamp: datetime
    price: float
    qty: int
    trnvr: float
    cum_trnvr: float
    granularity: Granularity = Granularity.TICK
    data_type: DataType = DataType.EQUITY


class OHLCVDataPoint(BaseModel):
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    granularity: Granularity
    data_type: DataType = DataType.EQUITY


# API Request Models
class DataQueryParams(BaseModel):
    symbol: str
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    limit: Optional[int] = Field(default=1000, le=10000)
    offset: Optional[int] = Field(default=0, ge=0)


class OHLCVQueryParams(BaseModel):
    symbol: str
    timeframe: str
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    limit: Optional[int] = Field(default=1000, le=10000)
    offset: Optional[int] = Field(default=0, ge=0)


# API Response Models
class ApiResponse(BaseModel):
    success: bool
    data: Union[List, dict, str, int, float]
    message: Optional[str] = None
    error: Optional[str] = None


class PaginationInfo(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel):
    success: bool
    data: List[Union[TickDataPoint, OHLCVDataPoint, SymbolInfo]]
    pagination: PaginationInfo
    message: Optional[str] = None
    error: Optional[str] = None


class DataSummary(BaseModel):
    symbol: str
    date: str
    tick_count: int
    ohlcv_count: int
    start_time: datetime
    end_time: datetime
    total_volume: int
    total_turnover: float


class TradingSession(BaseModel):
    symbol: str
    date: str
    session_start: datetime
    session_end: datetime
    pre_market_start: Optional[datetime] = None
    pre_market_end: Optional[datetime] = None
    market_start: datetime
    market_end: datetime
    post_market_start: Optional[datetime] = None
    post_market_end: Optional[datetime] = None


# Error Models
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: Optional[str] = None
    details: Optional[dict] = None 