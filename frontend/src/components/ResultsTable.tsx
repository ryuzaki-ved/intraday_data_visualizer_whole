import React from 'react';
import { AutoSizer, Column, Table } from 'react-virtualized';
import 'react-virtualized/styles.css';

interface ResultsTableProps {
  columns: string[];
  rows: any[][];
  loading: boolean;
  maxRows: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ columns, rows, loading, maxRows }) => {
  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Loading...</div>;
  if (!columns.length) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>No data</div>;
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {rows.length === maxRows && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: '#fffbe6', color: '#b26a00', padding: '2px 10px', borderRadius: 0, fontSize: 13, zIndex: 2 }}>
          Showing first {maxRows} rows (truncated)
        </div>
      )}
      <AutoSizer>
        {({ width, height }) => (
          <Table
            width={width}
            height={height}
            headerHeight={32}
            rowHeight={28}
            rowCount={rows.length}
            rowGetter={({ index }) => {
              const row: any = {};
              columns.forEach((col, i) => (row[col] = rows[index][i]));
              return row;
            }}
          >
            {columns.map(col => (
              <Column
                key={col}
                label={col}
                dataKey={col}
                width={Math.max(120, width / columns.length)}
              />
            ))}
          </Table>
        )}
      </AutoSizer>
    </div>
  );
};