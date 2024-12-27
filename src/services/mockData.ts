import type { SymbolInfo, TickDataPoint, OHLCVDataPoint } from '@/types'

// Mock symbols data
const mockSymbols: SymbolInfo[] = [
  { symbol: 'NIFTY', name: 'NIFTY 50', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'BANKNIFTY', name: 'NIFTY BANK', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: '24000CE', name: 'NIFTY 24000 CE', type: 'fno_tick', strikePrice: 24000, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: '24000PE', name: 'NIFTY 24000 PE', type: 'fno_tick', strikePrice: 24000, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: '24050CE', name: 'NIFTY 24050 CE', type: 'fno_tick', strikePrice: 24050, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: '24050PE', name: 'NIFTY 24050 PE', type: 'fno_tick', strikePrice: 24050, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: '24100CE', name: 'NIFTY 24100 CE', type: 'fno_tick', strikePrice: 24100, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: '24100PE', name: 'NIFTY 24100 PE', type: 'fno_tick', strikePrice: 24100, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
  { symbol: 'RELIANCE_EQ', name: 'Reliance Industries Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'TCS_EQ', name: 'Tata Consultancy Services Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'HDFCBANK_EQ', name: 'HDFC Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'INFY_EQ', name: 'Infosys Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'ICICIBANK_EQ', name: 'ICICI Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'HINDUNILVR_EQ', name: 'Hindustan Unilever Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'ITC_EQ', name: 'ITC Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'SBIN_EQ', name: 'State Bank of India', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'BHARTIARTL_EQ', name: 'Bharti Airtel Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'KOTAKBANK_EQ', name: 'Kotak Mahindra Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'AXISBANK_EQ', name: 'Axis Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
  { symbol: 'ASIANPAINT_EQ', name: 'Asian Paints Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] }
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
      dataType: 'fno_ohlcv'
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
      dataType: 'fno_tick'
    })
  }
  
  return data
}

// Mock expiry dates with their trading dates
const mockExpiryDates = [
  {
    expiry: '07 Aug Exp',
    tradingDates: ['01 Aug', '02 Aug', '03 Aug', '04 Aug', '05 Aug', '07 Aug']
  },
  {
    expiry: '14 Aug Exp',
    tradingDates: ['08 Aug', '09 Aug', '10 Aug', '11 Aug', '12 Aug', '14 Aug']
  },
  {
    expiry: '21 Aug Exp',
    tradingDates: ['15 Aug', '16 Aug', '17 Aug', '18 Aug', '21 Aug', '22 Aug']
  },
  {
    expiry: '28 Aug Exp',
    tradingDates: ['23 Aug', '24 Aug', '25 Aug', '28 Aug', '29 Aug', '30 Aug', '31 Aug']
  }
]

// Mock symbols by date
const mockSymbolsByDate: Record<string, SymbolInfo[]> = {
  '01 Aug': [
    { symbol: 'NIFTY', name: 'NIFTY 50', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: '24000CE', name: 'NIFTY 24000 CE', type: 'fno_tick', strikePrice: 24000, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: '24000PE', name: 'NIFTY 24000 PE', type: 'fno_tick', strikePrice: 24000, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: 'RELIANCE_EQ', name: 'Reliance Industries Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: 'TCS_EQ', name: 'Tata Consultancy Services Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] }
  ],
  '02 Aug': [
    { symbol: 'NIFTY', name: 'NIFTY 50', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: '24050CE', name: 'NIFTY 24050 CE', type: 'fno_tick', strikePrice: 24050, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: '24050PE', name: 'NIFTY 24050 PE', type: 'fno_tick', strikePrice: 24050, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: 'HDFCBANK_EQ', name: 'HDFC Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: 'INFY_EQ', name: 'Infosys Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] }
  ],
  '07 Aug': [
    { symbol: 'NIFTY', name: 'NIFTY 50', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: '24100CE', name: 'NIFTY 24100 CE', type: 'fno_tick', strikePrice: 24100, optionType: 'CE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: '24100PE', name: 'NIFTY 24100 PE', type: 'fno_tick', strikePrice: 24100, optionType: 'PE', hasTickData: true, hasOHLCVData: false, availableTimeframes: ['tick'] },
    { symbol: 'ICICIBANK_EQ', name: 'ICICI Bank Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] },
    { symbol: 'HINDUNILVR_EQ', name: 'Hindustan Unilever Ltd', type: 'equity', hasTickData: true, hasOHLCVData: true, availableTimeframes: ['1min', '5min', '15min', '1hour', 'daily'] }
  ]
}

export class MockDataService {
  static async getSymbols(): Promise<SymbolInfo[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockSymbols
  }

  static async getExpiryDates(): Promise<{ expiry: string; tradingDates: string[] }[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockExpiryDates
  }

  static async getTradingDatesForExpiry(expiry: string): Promise<string[]> {
    if (!expiry) return []
    await new Promise(resolve => setTimeout(resolve, 200))
    const expiryData = mockExpiryDates.find(e => e.expiry === expiry)
    return expiryData ? expiryData.tradingDates : []
  }

  static async getSymbolsForDate(date: string): Promise<SymbolInfo[]> {
    if (!date) return []
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockSymbolsByDate[date] || []
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