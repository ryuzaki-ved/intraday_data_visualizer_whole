import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'
import type { OHLCVDataPoint } from '@/types'

interface VolumeChartProps {
  data: OHLCVDataPoint[]
  height?: number
  className?: string
  title?: string
}

const VolumeChart: React.FC<VolumeChartProps> = ({
  data,
  height = 200,
  className,
  title
}) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      time: new Date(item.timestamp),
      timeStr: format(new Date(item.timestamp), 'HH:mm'),
      // Color based on price movement
      isGreen: item.close >= item.open,
      volumeColor: item.close >= item.open ? '#10b981' : '#ef4444'
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.timeStr}</p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium ml-2">{data.volume.toLocaleString()}</span>
            </p>
            <p>
              <span className="text-gray-600">Price:</span>
              <span className="font-medium ml-2">₹{data.close.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600">No volume data available</p>
          <p className="text-sm text-gray-500">Select a symbol and date to view volume</p>
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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
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
          
          <Bar
            dataKey="volume"
            fill="#8b5cf6"
            opacity={0.7}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default VolumeChart 