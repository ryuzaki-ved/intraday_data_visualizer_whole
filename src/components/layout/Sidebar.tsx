import React, { useState } from 'react'
import { clsx } from 'clsx'
import { Card, CardContent } from '@/components/ui'
import { useExpiryDates, useTradingDatesForExpiry, useSymbolsForDate } from '@/hooks'
import { LoadingSpinner } from '@/components/ui'

interface SidebarProps {
  className?: string
  onSymbolSelect?: (symbol: string) => void
  onDateSelect?: (date: string) => void
  onExpirySelect?: (expiry: string) => void
  selectedSymbol?: string
  selectedDate?: string
  selectedExpiry?: string
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  onSymbolSelect,
  onDateSelect,
  onExpirySelect,
  selectedSymbol,
  selectedDate,
  selectedExpiry
}) => {
  const [activeTab, setActiveTab] = useState<'dates' | 'symbols'>('dates')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: expiryDates, loading: expiryLoading, error: expiryError } = useExpiryDates()
  const { data: tradingDates, loading: datesLoading, error: datesError } = useTradingDatesForExpiry(selectedExpiry || '')
  const { data: symbols, loading: symbolsLoading, error: symbolsError } = useSymbolsForDate(selectedDate || '')

  const filteredSymbols = symbols?.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const tabs = [
    { id: 'dates', label: 'Select Date', count: tradingDates?.length || 0 },
    { id: 'symbols', label: 'Symbols', count: symbols?.length || 0 }
  ] as const

  const renderContent = () => {
    switch (activeTab) {
      case 'dates':
        return (
          <div className="space-y-4">
            {/* Expiry Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Select Expiry</h3>
              {expiryLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="md" />
                </div>
              ) : expiryError ? (
                <div className="text-sm text-red-600 p-2">
                  Error loading expiry dates: {expiryError}
                </div>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {expiryDates?.map((expiryData) => (
                    <button
                      key={expiryData.expiry}
                      onClick={() => onExpirySelect?.(expiryData.expiry)}
                      className={clsx(
                        'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150',
                        selectedExpiry === expiryData.expiry
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      )}
                    >
                      {expiryData.expiry}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trading Dates Selection */}
            {selectedExpiry && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Select Trading Date</h3>
                {datesLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : datesError ? (
                  <div className="text-sm text-red-600 p-2">
                    Error loading dates: {datesError}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {tradingDates?.map((date) => (
                      <button
                        key={date}
                        onClick={() => onDateSelect?.(date)}
                        className={clsx(
                          'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150',
                          selectedDate === date
                            ? 'bg-primary-100 text-primary-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'symbols':
        return (
          <div className="space-y-3">
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                <p>Please select a date first to view available symbols</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search symbols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                
                {symbolsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : symbolsError ? (
                  <div className="text-sm text-red-600 p-2">
                    Error loading symbols: {symbolsError}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {filteredSymbols.map((symbol) => (
                      <button
                        key={symbol.symbol}
                        onClick={() => onSymbolSelect?.(symbol.symbol)}
                        className={clsx(
                          'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-150',
                          selectedSymbol === symbol.symbol
                            ? 'bg-primary-100 text-primary-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        )}
                      >
                        <div className="font-medium">{symbol.symbol}</div>
                        <div className="text-xs text-gray-500 truncate">{symbol.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={clsx('w-80 bg-white border-r border-gray-200', className)}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="p-4">
        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-4">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Sidebar 