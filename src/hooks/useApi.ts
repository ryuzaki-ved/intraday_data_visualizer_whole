import { useState, useEffect, useCallback, useRef } from 'react'
import ApiService from '@/services/api'
import type { 
  TickDataPoint, 
  OHLCVDataPoint, 
  SymbolInfo, 
  TradingSession,
  DataQueryParams 
} from '@/types'

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  useEffect(() => {
    execute()
  }, dependencies)

  return { data, loading, error, refetch: execute }
}

// Hook for symbols data
export function useSymbols() {
  return useApiCall(() => ApiService.getSymbols(), [])
}

// Hook for trading dates
export function useTradingDates() {
  return useApiCall(() => ApiService.getTradingDates(), [])
}

// Hook for expiry dates
export function useExpiryDates() {
  return useApiCall(() => ApiService.getExpiryDates(), [])
}

// Hook for tick data with parameters
export function useTickData(params: DataQueryParams | null) {
  const apiCall = useCallback(() => {
    if (!params) throw new Error('No parameters provided')
    return ApiService.getTickData(params)
  }, [params])

  return useApiCall(apiCall, [params])
}

// Hook for OHLCV data with parameters
export function useOHLCVData(
  symbol: string | null,
  timeframe: string | null,
  params: Omit<DataQueryParams, 'symbol'> | null
) {
  const apiCall = useCallback(() => {
    if (!symbol || !timeframe || !params) {
      throw new Error('Missing required parameters')
    }
    return ApiService.getOHLCVData(symbol, timeframe, params)
  }, [symbol, timeframe, params])

  return useApiCall(apiCall, [symbol, timeframe, params])
}

// Hook for trading sessions
export function useTradingSessions(symbol: string | null, date: string | null) {
  const apiCall = useCallback(() => {
    if (!symbol || !date) throw new Error('Symbol and date required')
    return ApiService.getTradingSessions(symbol, date)
  }, [symbol, date])

  return useApiCall(apiCall, [symbol, date])
}

// Hook for data summary
export function useDataSummary(symbol: string | null, date: string | null) {
  const apiCall = useCallback(() => {
    if (!symbol || !date) throw new Error('Symbol and date required')
    return ApiService.getDataSummary(symbol, date)
  }, [symbol, date])

  return useApiCall(apiCall, [symbol, date])
}

// Hook for symbol search with debouncing
export function useSymbolSearch(query: string) {
  const [searchResults, setSearchResults] = useState<SymbolInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const results = await ApiService.searchSymbols(query)
        setSearchResults(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query])

  return { searchResults, loading, error }
}

// Hook for paginated data with infinite scroll support
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number) => Promise<{
    data: T[]
    pagination: { page: number; total: number; totalPages: number }
  }>,
  pageSize: number = 1000
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const loadMore = useCallback(async (page: number = 1) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(page, pageSize)
      
      if (page === 1) {
        setData(result.data)
      } else {
        setData(prev => [...prev, ...result.data])
      }
      
      setCurrentPage(result.pagination.page)
      setHasMore(result.pagination.page < result.pagination.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, pageSize, loading])

  const loadNextPage = useCallback(() => {
    if (hasMore && !loading) {
      loadMore(currentPage + 1)
    }
  }, [hasMore, loading, currentPage, loadMore])

  const reset = useCallback(() => {
    setData([])
    setCurrentPage(1)
    setHasMore(true)
    setError(null)
    loadMore(1)
  }, [loadMore])

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    loadNextPage,
    reset
  }
}

// Hook for paginated tick data
export function usePaginatedTickData(params: DataQueryParams | null) {
  const fetchFunction = useCallback(
    (page: number, limit: number) => {
      if (!params) throw new Error('No parameters provided')
      return ApiService.getTickDataPaginated({
        ...params,
        limit,
        offset: (page - 1) * limit
      })
    },
    [params]
  )

  return usePaginatedData(fetchFunction)
}

// Hook for paginated OHLCV data
export function usePaginatedOHLCVData(
  symbol: string | null,
  timeframe: string | null,
  params: Omit<DataQueryParams, 'symbol'> | null
) {
  const fetchFunction = useCallback(
    (page: number, limit: number) => {
      if (!symbol || !timeframe || !params) {
        throw new Error('Missing required parameters')
      }
      return ApiService.getOHLCVDataPaginated(symbol, timeframe, {
        ...params,
        limit,
        offset: (page - 1) * limit
      })
    },
    [symbol, timeframe, params]
  )

  return usePaginatedData(fetchFunction)
} 