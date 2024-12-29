import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface ChartPanelProps {
  columns: string[];
  rows: any[][];
  loading: boolean;
}

function isNumeric(col: string, rows: any[][], colIdx: number) {
  return rows.slice(0, 20).every(r => r[colIdx] !== null && !isNaN(Number(r[colIdx])));
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ columns, rows, loading }) => {
  // Find numeric columns
  const numericCols = useMemo(() =>
    columns
      .map((col, i) => ({ col, i }))
      .filter(({ i }) => isNumeric(columns[i], rows, i)),
    [columns, rows]
  );
  // Find first non-numeric (for X)
  const defaultX = columns.find((col, i) => !isNumeric(col, rows, i)) || columns[0];
  const defaultY = numericCols.length ? numericCols[0].col : columns[0];
  const [xCol, setXCol] = useState(defaultX);
  const [yCol, setYCol] = useState(defaultY);

  // Downsample for charting if needed
  const maxPoints = 2000;
  const xIdx = columns.indexOf(xCol);
  const yIdx = columns.indexOf(yCol);
  const data = useMemo(() => {
    if (!columns.length || !rows.length) return [];
    let arr = rows.map(r => [r[xIdx], Number(r[yIdx])]);
    if (arr.length > maxPoints) {
      const step = Math.ceil(arr.length / maxPoints);
      arr = arr.filter((_, i) => i % step === 0);
    }
    return arr;
  }, [columns, rows, xCol, yCol]);

  const option = useMemo(() => ({
    animation: true,
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 40, bottom: 60 },
    xAxis: {
      type: 'category',
      name: xCol,
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: { rotate: 30, fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: yCol,
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: { fontSize: 12 },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        data,
        lineStyle: { width: 2 },
        areaStyle: {},
      },
    ],
    dataZoom: [
      { type: 'slider', xAxisIndex: 0, start: 0, end: 100 },
      { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
    ],
  }), [data, xCol, yCol]);

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!columns.length || !rows.length) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>No data</div>;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0 8px 8px' }}>
        <span style={{ fontWeight: 500 }}>X:</span>
        <select value={xCol} onChange={e => setXCol(e.target.value)}>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
        <span style={{ fontWeight: 500 }}>Y:</span>
        <select value={yCol} onChange={e => setYCol(e.target.value)}>
          {numericCols.map(({ col }) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>
      <ReactECharts
        option={option}
        style={{ width: '100%', height: 'calc(100% - 40px)' }}
        notMerge
        lazyUpdate
        theme={undefined}
      />
    </div>
  );
};