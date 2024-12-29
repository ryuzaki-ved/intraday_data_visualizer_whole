# Backend API for Parquet Visualizer

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## Endpoints

- `GET /api/files` — List all Parquet files and folders under `07 Aug Exp Parquet` (for frontend tree view)

## Next Steps
- Add endpoint to run DuckDB queries on selected Parquet files
- Add error handling and validation