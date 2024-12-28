# CSV to Parquet Converter

This script converts all CSV files in the "07 Aug Exp" directory to Parquet format while maintaining the same folder structure.

## Features

- **Parallel Processing**: Uses ThreadPoolExecutor for faster conversion
- **Maintains Structure**: Preserves the exact folder hierarchy
- **Comprehensive Logging**: Detailed logs for monitoring and debugging
- **Error Handling**: Graceful handling of conversion errors
- **Progress Tracking**: Real-time progress updates and summary

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Make sure your CSV files are in the "07 Aug Exp" directory
2. Run the script:
```bash
python csv_to_parquet_converter.py
```

## Output

- **Parquet Files**: Converted files will be saved in "07 Aug Exp Parquet" directory
- **Log File**: `csv_to_parquet_conversion.log` contains detailed conversion logs
- **Console Output**: Real-time progress updates

## Configuration

You can modify these settings in the script:
- `source_dir`: Source directory containing CSV files (default: "07 Aug Exp")
- `output_dir`: Output directory for Parquet files (default: "07 Aug Exp Parquet")
- `max_workers`: Number of parallel workers (default: 4)

## File Structure

The script maintains the exact folder structure:
```
07 Aug Exp/
├── 01 Aug/
│   ├── 5S/
│   ├── fno_tick/
│   ├── ind_fno_min/
│   └── stocks/
└── 31 Jul/
    ├── 5S/
    ├── fno_tick/
    ├── ind_fno_min/
    └── stocks/

07 Aug Exp Parquet/
├── 01 Aug/
│   ├── 5S/
│   ├── fno_tick/
│   ├── ind_fno_min/
│   └── stocks/
└── 31 Jul/
    ├── 5S/
    ├── fno_tick/
    ├── ind_fno_min/
    └── stocks/
```

## Benefits of Parquet Format

- **Compression**: Significantly smaller file sizes
- **Performance**: Faster read/write operations
- **Columnar Storage**: Efficient for analytical queries
- **Schema Evolution**: Better support for schema changes 