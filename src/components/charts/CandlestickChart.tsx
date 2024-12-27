import React, { useMemo } from 'react'
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line
} from 'recharts'
import { format } from 'date-fns'
import type { OHLCVDataPoint } from '@/types'

interface CandlestickChartProps {
  data: OHLCVDataPoint[]
  height?: number
  showVolume?: boolean
  className?: string
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 400,
  showVolume = true,
  className
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      time: new Date(item.timestamp),
      timeStr: format(new Date(item.timestamp), 'HH:mm'),
      // Calculate candlestick properties
      bodyTop: Math.max(item.open, item.close),
      bodyBottom: Math.min(item.open, item.close),
      bodyHeight: Math.abs(item.close - item.open),
      isGreen: item.close >= item.open,
      // Volume data
      volumeBar: showVolume ? item.volume : 0
    }))
  }, [data, showVolume])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.timeStr}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Open:</span> <span className="font-medium">₹{data.open.toFixed(2)}</span></p>
            <p><span className="text-gray-600">High:</span> <span className="font-medium">₹{data.high.toFixed(2)}</span></p>
            <p><span className="text-gray-600">Low:</span> <span className="font-medium">₹{data.low.toFixed(2)}</span></p>
            <p><span className="text-gray-600">Close:</span> <span className="font-medium">₹{data.close.toFixed(2)}</span></p>
            {showVolume && (
              <p><span className="text-gray-600">Volume:</span> <span className="font-medium">{data.volume.toLocaleString()}</span></p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props
    const data = payload
    
    if (!data) return null

    const isGreen = data.isGreen
    const bodyColor = isGreen ? '#10b981' : '#ef4444'
    const wickColor = isGreen ? '#059669' : '#dc2626'

    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke={wickColor}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={y + (data.high - data.bodyTop) * height / (data.high - data.low)}
          width={width * 0.6}
          height={Math.max(1, data.bodyHeight * height / (data.high - data.low))}
          fill={bodyColor}
          stroke={bodyColor}
        />
      </g>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
          <p className="text-sm text-gray-500">Select a symbol and date to view chart</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="timeStr"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `₹${value.toFixed(0)}`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Candlestick bars */}
          <Bar
            dataKey="high"
            fill="transparent"
            shape={<CustomCandlestick />}
          />
          
          {/* Volume bars */}
          {showVolume && (
            <Bar
              dataKey="volumeBar"
              fill="#8b5cf6"
              opacity={0.3}
              yAxisId={1}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CandlestickChart 