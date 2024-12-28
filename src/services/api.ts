import axios, { AxiosResponse } from 'axios'
import type { 
  SymbolInfo, 
  OHLCVDataPoint, 
  TickDataPoint,
  ExpiryDateResponse,
  DataQueryParams 
} from '@/types'

// API Configuration
const API_BASE_URL = 'http://localhost:8000'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
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

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export class ApiService {
  // Expiry dates
  static async getExpiryDates(): Promise<ExpiryDateResponse[]> {
    try {
      const response = await apiClient.get<ExpiryDateResponse[]>('/api/expiry-dates')
      return response.data
    } catch (error) {
      console.error('Error fetching expiry dates:', error)
      throw error
    }
  }

  // Trading dates for expiry
  static async getTradingDatesForExpiry(expiry: string): Promise<string[]> {
    if (!expiry) return []
    
    try {
      const response = await apiClient.get<string[]>(`/api/trading-dates/${expiry}`)
      return response.data
    } catch (error) {
      console.error('Error fetching trading dates:', error)
      throw error
    }
  }

  // Symbols for date
  static async getSymbolsForDate(date: string): Promise<SymbolInfo[]> {
    if (!date) return []
    
    try {
      const response = await apiClient.get<SymbolInfo[]>(`/api/symbols/${date}`)
      return response.data
    } catch (error) {
      console.error('Error fetching symbols:', error)
      throw error
    }
  }

  // Search symbols
  static async searchSymbols(query: string, date?: string, type?: string): Promise<SymbolInfo[]> {
    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (date) params.append('date', date)
      if (type) params.append('type', type)

      const response = await apiClient.get<SymbolInfo[]>(`/api/symbols?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error searching symbols:', error)
      throw error
    }
  }

  // OHLCV data
  static async getOHLCVData(
    symbol: string, 
    timeframe: string, 
    params: { startDate: string; endDate: string }
  ): Promise<OHLCVDataPoint[]> {
    try {
      const response = await apiClient.get<OHLCVDataPoint[]>(`/api/ohlcv/${symbol}`, {
        params: {
          timeframe,
          start_date: params.startDate,
          end_date: params.endDate
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching OHLCV data:', error)
      throw error
    }
  }

  // Tick data
  static async getTickData(params: { symbol: string; startDate: string; endDate: string }): Promise<TickDataPoint[]> {
    try {
      const response = await apiClient.get<TickDataPoint[]>(`/api/tick/${params.symbol}`, {
        params: {
          start_date: params.startDate,
          end_date: params.endDate
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching tick data:', error)
      throw error
    }
  }

  // Health check
  static async healthCheck(): Promise<{ message: string; status: string }> {
    try {
      const response = await apiClient.get('/')
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }
}

export default ApiService 