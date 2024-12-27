# Intraday History Data Analyzer

An interactive data visualization application for analyzing intraday market history data with support for multiple data granularities and advanced charting capabilities.

## Features

- **Multi-granularity data support**: Tick data, 5-second, 1-minute, and higher timeframe data
- **Interactive visualizations**: Candlestick charts, volume profiles, technical indicators
- **Fast data querying**: Powered by DuckDB and Parquet for optimal performance
- **Flexible dashboard**: Customizable layouts with React Grid Layout
- **Real-time calculations**: Fast technical indicator computations

## Data Structure

The application supports various data formats:

### Tick Data (Granular)
- Format: `date,price,qty,trnvr,cum_trnvr`
- Examples: `24000CE.csv`, `NIFTYAUGFUT.csv`, `*_EQ.csv`

### OHLCV Data (Minute/5-second)
- Format: `symbol,timestamp,open,high,low,close,volume,oi`
- Examples: `*_min.csv` files in 5S folder

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Recharts** for primary charting
- **D3.js** for advanced visualizations
- **React Grid Layout** for dashboard layouts
- **Tailwind CSS** for styling

### Backend (Coming Soon)
- **Python FastAPI** for API
- **DuckDB** for analytical database
- **Parquet** for data storage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd intraday-history-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── services/      # API services
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 