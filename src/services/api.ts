import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  DataQueryParams,
  TickDataPoint,
  OHLCVDataPoint,
  SymbolInfo,
  TradingSession
} from '@/types'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/utils/constants'
import { MockDataService } from './mockData'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Temporary flag to use mock data
const USE_MOCK_DATA = true

// Request interceptor for logging and error handling
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR))
    } else {
      // Something else happened
      return Promise.reject(new Error(error.message))
    }
  }
)

// Generic API response handler
async function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): Promise<T> {
  if (response.data.success) {
    return response.data.data
  } else {
    throw new Error(response.data.error || response.data.message || ERROR_MESSAGES.DATA_LOAD_FAILED)
  }
}

// Generic paginated response handler
async function handlePaginatedResponse<T>(response: AxiosResponse<PaginatedResponse<T>>): Promise<{
  data: T[]
  pagination: PaginatedResponse<T>['pagination']
}> {
  if (response.data.success) {
    return {
      data: response.data.data,
      pagination: response.data.pagination
    }
  } else {
    throw new Error(response.data.error || response.data.message || ERROR_MESSAGES.DATA_LOAD_FAILED)
  }
}

// API service class
export class ApiService {
  // Get available symbols
  static async getSymbols(): Promise<SymbolInfo[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.getSymbols()
    }
    const response = await apiClient.get<ApiResponse<SymbolInfo[]>>(API_ENDPOINTS.SYMBOLS)
    return handleApiResponse(response)
  }

  // Get trading dates
  static async getTradingDates(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.getTradingDates()
    }
    const response = await apiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.TRADING_DATES)
    return handleApiResponse(response)
  }

  // Get expiry dates
  static async getExpiryDates(): Promise<string[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.getExpiryDates()
    }
    const response = await apiClient.get<ApiResponse<string[]>>(API_ENDPOINTS.EXPIRY_DATES)
    return handleApiResponse(response)
  }

  // Get tick data
  static async getTickData(params: DataQueryParams): Promise<TickDataPoint[]> {
    const response = await apiClient.get<ApiResponse<TickDataPoint[]>>(
      `${API_ENDPOINTS.TICK_DATA}/${params.symbol}`,
      { params }
    )
    return handleApiResponse(response)
  }

  // Get tick data with pagination
  static async getTickDataPaginated(params: DataQueryParams): Promise<{
    data: TickDataPoint[]
    pagination: PaginatedResponse<TickDataPoint>['pagination']
  }> {
    const response = await apiClient.get<PaginatedResponse<TickDataPoint>>(
      `${API_ENDPOINTS.TICK_DATA}/${params.symbol}/paginated`,
      { params }
    )
    return handlePaginatedResponse(response)
  }

  // Get OHLCV data
  static async getOHLCVData(
    symbol: string,
    timeframe: string,
    params: Omit<DataQueryParams, 'symbol'>
  ): Promise<OHLCVDataPoint[]> {
    const response = await apiClient.get<ApiResponse<OHLCVDataPoint[]>>(
      `${API_ENDPOINTS.OHLCV_DATA}/${symbol}/${timeframe}`,
      { params }
    )
    return handleApiResponse(response)
  }

  // Get OHLCV data with pagination
  static async getOHLCVDataPaginated(
    symbol: string,
    timeframe: string,
    params: Omit<DataQueryParams, 'symbol'>
  ): Promise<{
    data: OHLCVDataPoint[]
    pagination: PaginatedResponse<OHLCVDataPoint>['pagination']
  }> {
    const response = await apiClient.get<PaginatedResponse<OHLCVDataPoint>>(
      `${API_ENDPOINTS.OHLCV_DATA}/${symbol}/${timeframe}/paginated`,
      { params }
    )
    return handlePaginatedResponse(response)
  }

  // Get trading sessions
  static async getTradingSessions(symbol: string, date: string): Promise<TradingSession[]> {
    const response = await apiClient.get<ApiResponse<TradingSession[]>>(
      `/trading-sessions/${symbol}/${date}`
    )
    return handleApiResponse(response)
  }

  // Search symbols
  static async searchSymbols(query: string): Promise<SymbolInfo[]> {
    if (USE_MOCK_DATA) {
      return MockDataService.searchSymbols(query)
    }
    const response = await apiClient.get<ApiResponse<SymbolInfo[]>>(
      `/symbols/search?q=${encodeURIComponent(query)}`
    )
    return handleApiResponse(response)
  }

  // Get data summary
  static async getDataSummary(symbol: string, date: string): Promise<{
    tickCount: number
    ohlcvCount: number
    startTime: string
    endTime: string
    totalVolume: number
    totalTurnover: number
  }> {
    const response = await apiClient.get<ApiResponse<any>>(
      `/data-summary/${symbol}/${date}`
    )
    return handleApiResponse(response)
  }
}

export default ApiService 