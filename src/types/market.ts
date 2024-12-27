// Market data types for intraday analysis

export type DataGranularity = 'tick' | '5sec' | '1min' | '5min' | '15min' | '1hour' | 'daily'
export type DataType = 'equity' | 'fno_tick' | 'futures_tick' | 'fno_ohlcv' | 'futures_ohlcv' | 'index_ohlcv'
export type OptionType = 'CE' | 'PE' | null

// Base market data point
export interface BaseMarketData {
  symbol: string
  timestamp: string
  dataType: DataType
  granularity: DataGranularity
}

// Tick data structure (granular data)
export interface TickDataPoint extends BaseMarketData {
  price: number
  qty: number
  trnvr: number // Turnover
  cumTrnvr: number // Cumulative turnover
  dataType: 'equity' | 'fno_tick' | 'futures_tick'
  granularity: 'tick'
}

// OHLCV data structure (minute/second data)
export interface OHLCVDataPoint extends BaseMarketData {
  open: number
  high: number
  low: number
  close: number
  volume: number
  oi?: number // Open Interest (for F&O)
  dataType: 'fno_ohlcv' | 'futures_ohlcv' | 'index_ohlcv'
  granularity: '5sec' | '1min' | '5min' | '15min' | '1hour' | 'daily'
}

// Symbol metadata
export interface SymbolInfo {
  symbol: string
  name: string
  type: DataType
  expiryDate?: string
  strikePrice?: number
  optionType?: OptionType
  hasTickData: boolean
  hasOHLCVData: boolean
  availableTimeframes: DataGranularity[]
}

// Trading session info
export interface TradingSession {
  date: string
  expiryDate: string
  symbol: string
  tickDataCount: number
  ohlcvDataCount: number
  startTime: string
  endTime: string
}

// Chart data for visualization
export interface ChartDataPoint {
  timestamp: string
  value: number
  volume?: number
  oi?: number
}

// Candlestick data for OHLCV charts
export interface CandlestickDataPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  oi?: number
}

// Volume profile data
export interface VolumeProfilePoint {
  price: number
  volume: number
  percentage: number
}

// Technical indicator data
export interface TechnicalIndicator {
  name: string
  values: Array<{
    timestamp: string
    value: number
  }>
  parameters: Record<string, number>
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Query parameters
export interface DataQueryParams {
  symbol: string
  startDate: string
  endDate: string
  granularity?: DataGranularity
  limit?: number
  offset?: number
}

// Filter options
export interface FilterOptions {
  symbols: string[]
  dateRange: {
    start: string
    end: string
  }
  granularity: DataGranularity
  dataType: DataType[]
} 