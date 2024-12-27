import React, { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import Sidebar from '@/components/layout/Sidebar'
import ChartContainer from '@/components/charts/ChartContainer'
import { useRecentSymbolsManager } from '@/hooks'

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedExpiry, setSelectedExpiry] = useState<string>('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const { recentSymbols, addSymbol } = useRecentSymbolsManager()

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol)
    addSymbol(symbol)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSymbol('') // Clear symbol when date changes
  }

  const handleExpirySelect = (expiry: string) => {
    setSelectedExpiry(expiry)
    setSelectedDate('') // Clear date when expiry changes
    setSelectedSymbol('') // Clear symbol when expiry changes
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Intraday History Data Analyzer
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {selectedSymbol && (
                <span className="mr-4">
                  Symbol: <span className="font-medium text-gray-900">{selectedSymbol}</span>
                </span>
              )}
              {selectedDate && (
                <span className="mr-4">
                  Date: <span className="font-medium text-gray-900">{selectedDate}</span>
                </span>
              )}
            </div>
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <Sidebar
            onSymbolSelect={handleSymbolSelect}
            onDateSelect={handleDateSelect}
            onExpirySelect={handleExpirySelect}
            selectedSymbol={selectedSymbol}
            selectedDate={selectedDate}
            selectedExpiry={selectedExpiry}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {console.log('App render:', { selectedSymbol, selectedDate, selectedExpiry })}
          {!selectedSymbol ? (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Intraday History Data Analyzer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      This application provides interactive visualizations for your intraday market data.
                      To get started:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Select a symbol from the sidebar</li>
                      <li>Choose a trading date</li>
                      <li>Optionally select an expiry date for F&O data</li>
                      <li>View charts and analysis</li>
                    </ol>
                    
                    {recentSymbols.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Recent Symbols</h3>
                        <div className="flex flex-wrap gap-2">
                          {recentSymbols.slice(0, 5).map((symbol) => (
                            <Button
                              key={symbol}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSymbolSelect(symbol)}
                            >
                              {symbol}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Data Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600">
                        {selectedSymbol}
                      </div>
                      <div className="text-sm text-gray-500">Selected Symbol</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedDate || 'Not selected'}
                      </div>
                      <div className="text-sm text-gray-500">Trading Date</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedExpiry || 'Not selected'}
                      </div>
                      <div className="text-sm text-gray-500">Expiry Date</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              {selectedDate && (
                <ChartContainer
                  symbol={selectedSymbol}
                  date={selectedDate}
                />
              )}

              {/* Data Table Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-600">Data table will be implemented</p>
                      <p className="text-sm text-gray-500">
                        Showing tick data and OHLCV data
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App 