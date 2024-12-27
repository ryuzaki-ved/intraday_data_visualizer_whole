import { format, parseISO } from 'date-fns'
import type { 
  TickDataPoint, 
  OHLCVDataPoint, 
  DataGranularity, 
  DataType,
  OptionType 
} from '@/types'

// Parse CSV tick data line
export function parseTickDataLine(line: string): Omit<TickDataPoint, 'symbol' | 'dataType' | 'granularity'> | null {
  try {
    const [date, price, qty, trnvr, cumTrnvr] = line.split(',')
    
    return {
      timestamp: date.trim(),
      price: parseFloat(price),
      qty: parseInt(qty),
      trnvr: parseFloat(trnvr),
      cumTrnvr: parseFloat(cumTrnvr)
    }
  } catch (error) {
    console.error('Error parsing tick data line:', line, error)
    return null
  }
}

// Parse CSV OHLCV data line
export function parseOHLCVDataLine(line: string): Omit<OHLCVDataPoint, 'dataType' | 'granularity'> | null {
  try {
    const [symbol, timestamp, open, high, low, close, volume, oi] = line.split(',')
    
    return {
      symbol: symbol.trim(),
      timestamp: timestamp.trim(),
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
      volume: parseInt(volume),
      oi: oi ? parseInt(oi) : undefined
    }
  } catch (error) {
    console.error('Error parsing OHLCV data line:', line, error)
    return null
  }
}

// Determine data type from filename
export function getDataTypeFromFilename(filename: string): DataType {
  if (filename.includes('_EQ.csv')) return 'equity'
  if (filename.includes('FUT.csv')) return 'futures_tick'
  if (filename.includes('CE.csv') || filename.includes('PE.csv')) return 'fno_tick'
  if (filename.includes('_min.csv')) {
    if (filename.includes('fut')) return 'futures_ohlcv'
    if (filename.includes('index')) return 'index_ohlcv'
    return 'fno_ohlcv'
  }
  return 'equity' // default fallback
}

// Determine granularity from filename
export function getGranularityFromFilename(filename: string): DataGranularity {
  if (filename.includes('5S/')) return '5sec'
  if (filename.includes('_min.csv')) return '1min'
  return 'tick'
}

// Extract symbol info from filename
export function extractSymbolInfo(filename: string): {
  symbol: string
  expiryDate?: string
  strikePrice?: number
  optionType?: OptionType
} {
  const baseName = filename.replace('.csv', '')
  
  // Handle F&O symbols like "24000CE"
  const fnoMatch = baseName.match(/^(\d+)(CE|PE)$/)
  if (fnoMatch) {
    return {
      symbol: baseName,
      strikePrice: parseInt(fnoMatch[1]),
      optionType: fnoMatch[2] as OptionType
    }
  }
  
  // Handle equity symbols like "BOROLTD_EQ"
  const equityMatch = baseName.match(/^(.+)_EQ$/)
  if (equityMatch) {
    return {
      symbol: equityMatch[1]
    }
  }
  
  // Handle futures like "NIFTYAUGFUT"
  const futMatch = baseName.match(/^(.+)FUT$/)
  if (futMatch) {
    return {
      symbol: baseName
    }
  }
  
  return { symbol: baseName }
}

// Format timestamp for display
export function formatTimestamp(timestamp: string, formatStr: string = 'HH:mm:ss'): string {
  try {
    return format(parseISO(timestamp), formatStr)
  } catch (error) {
    return timestamp
  }
}

// Format price with proper decimal places
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals)
}

// Format volume with K, M, B suffixes
export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return (volume / 1000000000).toFixed(1) + 'B'
  }
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(1) + 'M'
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(1) + 'K'
  }
  return volume.toString()
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Validate data point
export function validateDataPoint(data: any): boolean {
  return data && 
         typeof data.timestamp === 'string' && 
         !isNaN(data.price) && 
         !isNaN(data.qty)
}

// Group data by date
export function groupDataByDate<T extends { timestamp: string }>(data: T[]): Record<string, T[]> {
  return data.reduce((groups, item) => {
    const date = item.timestamp.split(' ')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// Sort data by timestamp
export function sortDataByTimestamp<T extends { timestamp: string }>(data: T[]): T[] {
  return [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

// Filter data by date range
export function filterDataByDateRange<T extends { timestamp: string }>(
  data: T[], 
  startDate: string, 
  endDate: string
): T[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  return data.filter(item => {
    const timestamp = new Date(item.timestamp).getTime()
    return timestamp >= start && timestamp <= end
  })
} 