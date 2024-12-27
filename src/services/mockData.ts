import type { SymbolInfo, TickDataPoint, OHLCVDataPoint } from '@/types'

// Mock symbols data
const mockSymbols: SymbolInfo[] = [
  { symbol: 'NIFTY', name: 'NIFTY 50', type: 'index', exchange: 'NSE' },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK', type: 'index', exchange: 'NSE' },
  { symbol: '24000CE', name: 'NIFTY 24000 CE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24000, optionType: 'CE' },
  { symbol: '24000PE', name: 'NIFTY 24000 PE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24000, optionType: 'PE' },
  { symbol: '24050CE', name: 'NIFTY 24050 CE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24050, optionType: 'CE' },
  { symbol: '24050PE', name: 'NIFTY 24050 PE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24050, optionType: 'PE' },
  { symbol: '24100CE', name: 'NIFTY 24100 CE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24100, optionType: 'CE' },
  { symbol: '24100PE', name: 'NIFTY 24100 PE', type: 'fno_tick', exchange: 'NSE', strikePrice: 24100, optionType: 'PE' },
  { symbol: 'RELIANCE_EQ', name: 'Reliance Industries Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'TCS_EQ', name: 'Tata Consultancy Services Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'HDFCBANK_EQ', name: 'HDFC Bank Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'INFY_EQ', name: 'Infosys Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'ICICIBANK_EQ', name: 'ICICI Bank Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'HINDUNILVR_EQ', name: 'Hindustan Unilever Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'ITC_EQ', name: 'ITC Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'SBIN_EQ', name: 'State Bank of India', type: 'equity', exchange: 'NSE' },
  { symbol: 'BHARTIARTL_EQ', name: 'Bharti Airtel Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'KOTAKBANK_EQ', name: 'Kotak Mahindra Bank Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'AXISBANK_EQ', name: 'Axis Bank Ltd', type: 'equity', exchange: 'NSE' },
  { symbol: 'ASIANPAINT_EQ', name: 'Asian Paints Ltd', type: 'equity', exchange: 'NSE' }
]

// Generate mock OHLCV data
function generateMockOHLCVData(symbol: string, basePrice: number = 24000): OHLCVDataPoint[] {
  const data: OHLCVDataPoint[] = []
  const startTime = new Date('2024-08-01T09:15:00')
  
  for (let i = 0; i < 75; i++) { // 75 minutes of data
    const timestamp = new Date(startTime.getTime() + i * 60 * 1000)
    const open = basePrice + (Math.random() - 0.5) * 100
    const high = open + Math.random() * 50
    const low = open - Math.random() * 50
    const close = low + Math.random() * (high - low)
    const volume = Math.floor(Math.random() * 1000000) + 100000
    
    data.push({
      symbol,
      timestamp: timestamp.toISOString(),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      granularity: '1min',
      dataType: 'equity'
    })
  }
  
  return data
}

// Generate mock tick data
function generateMockTickData(symbol: string, basePrice: number = 24000): TickDataPoint[] {
  const data: TickDataPoint[] = []
  const startTime = new Date('2024-08-01T09:15:00')
  
  for (let i = 0; i < 1000; i++) { // 1000 ticks
    const timestamp = new Date(startTime.getTime() + i * 1000) // 1 second intervals
    const price = basePrice + (Math.random() - 0.5) * 200
    const qty = Math.floor(Math.random() * 1000) + 100
    const trnvr = price * qty
    const cumTrnvr = (data[i - 1]?.cumTrnvr || 0) + trnvr
    
    data.push({
      symbol,
      timestamp: timestamp.toISOString(),
      price: Math.round(price * 100) / 100,
      qty,
      trnvr: Math.round(trnvr),
      cumTrnvr: Math.round(cumTrnvr),
      granularity: 'tick',
      dataType: 'equity'
    })
  }
  
  return data
}

// Mock trading dates
const mockTradingDates = [
  '01 Aug',
  '02 Aug', 
  '03 Aug',
  '04 Aug',
  '05 Aug',
  '07 Aug',
  '08 Aug',
  '09 Aug',
  '10 Aug',
  '11 Aug',
  '12 Aug',
  '14 Aug',
  '15 Aug',
  '16 Aug',
  '17 Aug',
  '18 Aug',
  '21 Aug',
  '22 Aug',
  '23 Aug',
  '24 Aug',
  '25 Aug',
  '28 Aug',
  '29 Aug',
  '30 Aug',
  '31 Aug'
]

// Mock expiry dates
const mockExpiryDates = [
  '07 Aug Exp',
  '14 Aug Exp',
  '21 Aug Exp',
  '28 Aug Exp',
  '05 Sep Exp',
  '12 Sep Exp',
  '19 Sep Exp',
  '26 Sep Exp',
  '03 Oct Exp',
  '10 Oct Exp',
  '17 Oct Exp',
  '24 Oct Exp',
  '31 Oct Exp'
]

export class MockDataService {
  static async getSymbols(): Promise<SymbolInfo[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockSymbols
  }

  static async getTradingDates(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTradingDates
  }

  static async getExpiryDates(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockExpiryDates
  }

  static async searchSymbols(query: string): Promise<SymbolInfo[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const lowercaseQuery = query.toLowerCase()
    return mockSymbols.filter(symbol =>
      symbol.symbol.toLowerCase().includes(lowercaseQuery) ||
      symbol.name.toLowerCase().includes(lowercaseQuery)
    )
  }

  static async getOHLCVData(symbol: string, timeframe: string): Promise<OHLCVDataPoint[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const basePrice = symbol.includes('NIFTY') ? 24000 : 1000
    return generateMockOHLCVData(symbol, basePrice)
  }

  static async getTickData(symbol: string): Promise<TickDataPoint[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const basePrice = symbol.includes('NIFTY') ? 24000 : 1000
    return generateMockTickData(symbol, basePrice)
  }
} 