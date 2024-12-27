import type { SymbolInfo } from '@/types'

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
} 