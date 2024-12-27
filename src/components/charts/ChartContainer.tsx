import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { LoadingSpinner, Select } from '@/components/ui'
import CandlestickChart from './CandlestickChart'
import LineChart from './LineChart'
import VolumeChart from './VolumeChart'
import { useOHLCVData, useTickData } from '@/hooks'

interface ChartContainerProps {
  symbol: string
  date: string
  className?: string
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  symbol,
  date,
  className
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'volume'>('candlestick')
  const [timeframe, setTimeframe] = useState('1min')
  const [dataType, setDataType] = useState<'ohlcv' | 'tick'>('ohlcv')

  // Fetch OHLCV data
  const { 
    data: ohlcvData, 
    loading: ohlcvLoading, 
    error: ohlcvError 
  } = useOHLCVData(symbol, timeframe, { startDate: date, endDate: date })

  // Fetch tick data
  const { 
    data: tickData, 
    loading: tickLoading, 
    error: tickError 
  } = useTickData({ symbol, startDate: date, endDate: date })

  const chartOptions = [
    { value: 'candlestick', label: 'Candlestick' },
    { value: 'line', label: 'Line Chart' },
    { value: 'volume', label: 'Volume' }
  ]

  const timeframeOptions = [
    { value: '1min', label: '1 Minute' },
    { value: '5min', label: '5 Minutes' },
    { value: '15min', label: '15 Minutes' },
    { value: '1hour', label: '1 Hour' }
  ]

  const dataTypeOptions = [
    { value: 'ohlcv', label: 'OHLCV Data' },
    { value: 'tick', label: 'Tick Data' }
  ]

  const renderChart = () => {
    console.log('ChartContainer renderChart called:', { dataType, chartType, symbol, date })
    console.log('OHLCV data:', ohlcvData?.length, 'Tick data:', tickData?.length)
    
    if (dataType === 'ohlcv') {
      if (ohlcvLoading) {
        return (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        )
      }

      if (ohlcvError) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600">Error loading OHLCV data</p>
              <p className="text-sm text-gray-500">{ohlcvError}</p>
            </div>
          </div>
        )
      }

      if (!ohlcvData || ohlcvData.length === 0) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No OHLCV data available</p>
              <p className="text-sm text-gray-500">Try selecting a different symbol or date</p>
            </div>
          </div>
        )
      }

      switch (chartType) {
        case 'candlestick':
          return (
            <div className="relative">
              <CandlestickChart data={ohlcvData} height={400} />
            </div>
          )
        case 'line':
          return (
            <div className="relative">
              <LineChart data={ohlcvData} dataKey="close" height={400} title="Price Chart" />
            </div>
          )
        case 'volume':
          return (
            <div className="relative">
              <VolumeChart data={ohlcvData} height={300} title="Volume Chart" />
            </div>
          )
        default:
          return (
            <div className="relative">
              <CandlestickChart data={ohlcvData} height={400} />
            </div>
          )
      }
    } else {
      if (tickLoading) {
        return (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        )
      }

      if (tickError) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-red-600">Error loading tick data</p>
              <p className="text-sm text-gray-500">{tickError}</p>
            </div>
          </div>
        )
      }

      if (!tickData || tickData.length === 0) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600">No tick data available</p>
              <p className="text-sm text-gray-500">Try selecting a different symbol or date</p>
            </div>
          </div>
        )
      }

      switch (chartType) {
        case 'line':
          return (
            <div className="relative">
              <LineChart data={tickData} dataKey="price" height={400} title="Price Chart" />
            </div>
          )
        case 'volume':
          return (
            <div className="relative">
              <LineChart data={tickData} dataKey="trnvr" height={300} title="Turnover Chart" />
            </div>
          )
        default:
          return (
            <div className="relative">
              <LineChart data={tickData} dataKey="price" height={400} title="Price Chart" />
            </div>
          )
      }
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Charts - {symbol}</CardTitle>
          <div className="flex items-center space-x-4">
            <Select
              options={dataTypeOptions}
              value={dataType}
              onChange={(value) => setDataType(value as 'ohlcv' | 'tick')}
              className="w-32"
            />
            {dataType === 'ohlcv' && (
              <Select
                options={timeframeOptions}
                value={timeframe}
                onChange={setTimeframe}
                className="w-32"
              />
            )}
            <Select
              options={chartOptions}
              value={chartType}
              onChange={(value) => setChartType(value as 'candlestick' | 'line' | 'volume')}
              className="w-40"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}

export default ChartContainer 