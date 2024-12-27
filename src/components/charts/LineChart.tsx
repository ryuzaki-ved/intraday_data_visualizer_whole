import React, { useMemo } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format } from 'date-fns'
import type { TickDataPoint, OHLCVDataPoint } from '@/types'

interface LineChartProps {
  data: TickDataPoint[] | OHLCVDataPoint[]
  dataKey: 'price' | 'close' | 'volume' | 'turnover'
  height?: number
  color?: string
  showGrid?: boolean
  className?: string
  title?: string
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  dataKey,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  className,
  title
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      time: new Date(item.timestamp),
      timeStr: format(new Date(item.timestamp), 'HH:mm:ss'),
      value: dataKey === 'price' ? (item as TickDataPoint).price :
             dataKey === 'close' ? (item as OHLCVDataPoint).close :
             dataKey === 'volume' ? (item as OHLCVDataPoint).volume :
             (item as TickDataPoint).trnvr
    }))
  }, [data, dataKey])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.timeStr}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">{dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}:</span>
              <span className="font-medium ml-2">
                {dataKey === 'volume' || dataKey === 'turnover' 
                  ? data.value.toLocaleString()
                  : `₹${data.value.toFixed(2)}`
                }
              </span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    if (dataKey === 'volume' || dataKey === 'turnover') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toString()
    }
    return `₹${value.toFixed(0)}`
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
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          
          <XAxis
            dataKey="timeStr"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            interval="preserveStartEnd"
          />
          
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={formatYAxis}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart 