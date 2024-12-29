# Parquet Visualizer Frontend

## Setup

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Features
- Browse Parquet files (tree view)
- Write and run DuckDB SQL queries
- View results in a virtualized table (handles large data)
- Visualize data with advanced, professional ECharts (smooth, interactive, and beautiful)

## Tech Stack
- React (TypeScript)
- ECharts (via echarts-for-react)
- react-virtualized (for big tables)
- axios (API calls)

## Next Steps
- Implement file browser, query editor, results table, and chart components
- Connect to backend API