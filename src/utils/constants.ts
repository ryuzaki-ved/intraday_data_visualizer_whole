// Application constants and default configurations

// Chart default configurations
export const DEFAULT_CHART_CONFIG = {
  width: 800,
  height: 400,
  margin: {
    top: 20,
    right: 30,
    bottom: 30,
    left: 60
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    positive: '#10b981',
    negative: '#ef4444',
    volume: '#8b5cf6',
    grid: '#e5e7eb'
  }
}

// Chart colors for different data types
export const CHART_COLORS = {
  equity: '#3b82f6',
  fno: '#8b5cf6',
  futures: '#f59e0b',
  index: '#10b981',
  volume: '#6b7280',
  oi: '#ec4899'
}

// Time ranges for quick selection
export const TIME_RANGES = [
  { label: '1 Hour', start: '09:15:00', end: '10:15:00' },
  { label: 'Morning Session', start: '09:15:00', end: '12:00:00' },
  { label: 'Afternoon Session', start: '12:00:00', end: '15:30:00' },
  { label: 'Full Day', start: '09:15:00', end: '15:30:00' }
]

// Data granularity options
export const GRANULARITY_OPTIONS = [
  { value: 'tick', label: 'Tick Data' },
  { value: '5sec', label: '5 Seconds' },
  { value: '1min', label: '1 Minute' },
  { value: '5min', label: '5 Minutes' },
  { value: '15min', label: '15 Minutes' },
  { value: '1hour', label: '1 Hour' },
  { value: 'daily', label: 'Daily' }
]

// Data type options
export const DATA_TYPE_OPTIONS = [
  { value: 'equity', label: 'Equity' },
  { value: 'fno_tick', label: 'F&O Tick' },
  { value: 'futures_tick', label: 'Futures Tick' },
  { value: 'fno_ohlcv', label: 'F&O OHLCV' },
  { value: 'futures_ohlcv', label: 'Futures OHLCV' },
  { value: 'index_ohlcv', label: 'Index OHLCV' }
]

// Technical indicators
export const TECHNICAL_INDICATORS = [
  { name: 'SMA', label: 'Simple Moving Average' },
  { name: 'EMA', label: 'Exponential Moving Average' },
  { name: 'RSI', label: 'Relative Strength Index' },
  { name: 'MACD', label: 'MACD' },
  { name: 'BB', label: 'Bollinger Bands' },
  { name: 'VWAP', label: 'Volume Weighted Average Price' }
]

// Default technical indicator parameters
export const DEFAULT_INDICATOR_PARAMS = {
  SMA: { period: 20 },
  EMA: { period: 20 },
  RSI: { period: 14 },
  MACD: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  BB: { period: 20, stdDev: 2 },
  VWAP: { period: 20 }
}

// API endpoints
export const API_ENDPOINTS = {
  BASE_URL: '/api',
  TICK_DATA: '/tick-data',
  OHLCV_DATA: '/ohlcv',
  SYMBOLS: '/symbols',
  EXPIRY_DATES: '/expiry-dates'
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  CHART_SETTINGS: 'chart_settings',
  RECENT_SYMBOLS: 'recent_symbols'
}

// Error messages
export const ERROR_MESSAGES = {
  DATA_LOAD_FAILED: 'Failed to load data. Please try again.',
  INVALID_SYMBOL: 'Invalid symbol selected.',
  NO_DATA_AVAILABLE: 'No data available for the selected criteria.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  PARSE_ERROR: 'Error parsing data. Please check the file format.'
}

// Success messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  LAYOUT_SAVED: 'Dashboard layout saved.'
}

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 1000,
  MAX_PAGE_SIZE: 10000,
  DEFAULT_PAGE: 1
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss'
}

// File extensions
export const FILE_EXTENSIONS = {
  CSV: '.csv',
  PARQUET: '.parquet',
  JSON: '.json'
}

// Market hours (IST)
export const MARKET_HOURS = {
  PRE_MARKET: '09:00:00',
  OPEN: '09:15:00',
  CLOSE: '15:30:00',
  POST_MARKET: '16:00:00'
} 