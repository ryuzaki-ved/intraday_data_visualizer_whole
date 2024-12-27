import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/utils/constants'

// Generic hook for local storage with type safety
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, removeValue]
}

// Hook for user preferences
export function useUserPreferences() {
  return useLocalStorage(STORAGE_KEYS.USER_PREFERENCES, {
    theme: 'light' as 'light' | 'dark',
    defaultTimeframe: '1min' as string,
    defaultGranularity: 'tick' as string,
    showVolume: true,
    showGrid: true,
    showTooltip: true,
    chartHeight: 400,
    autoRefresh: false,
    refreshInterval: 30
  })
}

// Hook for dashboard layout
export function useDashboardLayout() {
  return useLocalStorage(STORAGE_KEYS.DASHBOARD_LAYOUT, {
    layout: [] as any[],
    widgets: [] as string[],
    columns: 12,
    rowHeight: 30
  })
}

// Hook for chart settings
export function useChartSettings() {
  return useLocalStorage(STORAGE_KEYS.CHART_SETTINGS, {
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      positive: '#10b981',
      negative: '#ef4444',
      volume: '#8b5cf6',
      grid: '#e5e7eb'
    },
    defaultConfig: {
      width: 800,
      height: 400,
      margin: {
        top: 20,
        right: 30,
        bottom: 30,
        left: 60
      }
    },
    indicators: [] as string[],
    timeRange: {
      start: '09:15:00',
      end: '15:30:00',
      label: 'Full Day'
    }
  })
}

// Hook for recent symbols
export function useRecentSymbols() {
  return useLocalStorage(STORAGE_KEYS.RECENT_SYMBOLS, [] as string[])
}

// Hook for adding symbol to recent list
export function useRecentSymbolsManager() {
  const [recentSymbols, setRecentSymbols] = useRecentSymbols()

  const addSymbol = useCallback((symbol: string) => {
    setRecentSymbols(prev => {
      const filtered = prev.filter(s => s !== symbol)
      return [symbol, ...filtered].slice(0, 10) // Keep only last 10
    })
  }, [setRecentSymbols])

  const removeSymbol = useCallback((symbol: string) => {
    setRecentSymbols(prev => prev.filter(s => s !== symbol))
  }, [setRecentSymbols])

  const clearRecent = useCallback(() => {
    setRecentSymbols([])
  }, [setRecentSymbols])

  return {
    recentSymbols,
    addSymbol,
    removeSymbol,
    clearRecent
  }
}

// Hook for managing multiple storage keys
export function useMultiStorage<T extends Record<string, any>>(
  keys: Record<keyof T, string>,
  initialValues: T
): [T, (key: keyof T, value: T[keyof T]) => void, (key: keyof T) => void] {
  const [values, setValues] = useState<T>(() => {
    const result = { ...initialValues }
    
    Object.entries(keys).forEach(([key, storageKey]) => {
      try {
        const item = window.localStorage.getItem(storageKey)
        if (item) {
          result[key as keyof T] = JSON.parse(item)
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${storageKey}":`, error)
      }
    })
    
    return result
  })

  const setValue = useCallback((key: keyof T, value: T[keyof T]) => {
    try {
      setValues(prev => ({ ...prev, [key]: value }))
      window.localStorage.setItem(keys[key], JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${keys[key]}":`, error)
    }
  }, [keys])

  const removeValue = useCallback((key: keyof T) => {
    try {
      setValues(prev => ({ ...prev, [key]: initialValues[key] }))
      window.localStorage.removeItem(keys[key])
    } catch (error) {
      console.error(`Error removing localStorage key "${keys[key]}":`, error)
    }
  }, [keys, initialValues])

  return [values, setValue, removeValue]
} 