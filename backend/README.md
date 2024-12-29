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
- `POST /api/query` — Run a DuckDB SQL query on a selected Parquet file

### `/api/query` Example

**Request:**
```json
{
  "file_path": "01 Aug/5S/nse_nifty2580724000ce_min.parquet",
  "query": "SELECT * FROM '{file}' WHERE open > 700 ORDER BY timestamp LIMIT 100"
}
```
- Use `{file}` as a placeholder for the full Parquet file path in your SQL query.

**Response:**
```json
{
  "columns": ["symbol", "timestamp", "open", ...],
  "rows": [[...], [...], ...],
  "row_count": 100
}
```

## Next Steps
- Scaffold React frontend to browse files, run queries, and visualize results