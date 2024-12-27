// Chart and visualization types

export interface ChartConfig {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  colors: {
    primary: string
    secondary: string
    positive: string
    negative: string
    volume: string
    grid: string
  }
}

export interface ChartProps {
  data: any[]
  config?: Partial<ChartConfig>
  className?: string
}

// Candlestick chart specific types
export interface CandlestickChartProps extends ChartProps {
  data: Array<{
    timestamp: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  showVolume?: boolean
  showGrid?: boolean
  showTooltip?: boolean
}

// Line chart types
export interface LineChartProps extends ChartProps {
  data: Array<{
    timestamp: string
    value: number
  }>
  yAxisLabel?: string
  showGrid?: boolean
  showTooltip?: boolean
  color?: string
}

// Volume chart types
export interface VolumeChartProps extends ChartProps {
  data: Array<{
    timestamp: string
    volume: number
    price?: number
  }>
  color?: string
  showGrid?: boolean
}

// Multi-axis chart types
export interface MultiAxisChartProps extends ChartProps {
  datasets: Array<{
    name: string
    data: Array<{
      timestamp: string
      value: number
    }>
    color: string
    axis: 'left' | 'right'
    type: 'line' | 'bar'
  }>
  showGrid?: boolean
  showLegend?: boolean
}

// Technical indicator types
export interface TechnicalIndicatorConfig {
  name: string
  parameters: Record<string, number>
  color: string
  lineWidth?: number
  opacity?: number
}

// Chart tooltip types
export interface TooltipData {
  timestamp: string
  values: Array<{
    label: string
    value: number | string
    color?: string
  }>
}

// Chart interaction types
export interface ChartInteraction {
  type: 'hover' | 'click' | 'zoom' | 'pan'
  data?: any
  position?: { x: number; y: number }
}

// Chart legend types
export interface LegendItem {
  name: string
  color: string
  visible: boolean
  type: 'line' | 'bar' | 'area'
}

// Time range selector types
export interface TimeRange {
  start: string
  end: string
  label: string
}

export interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  ranges?: TimeRange[]
  custom?: boolean
} 