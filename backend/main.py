import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from fastapi import HTTPException, Request
from pydantic import BaseModel
import duckdb
import pandas as pd

app = FastAPI()

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PARQUET_ROOT = os.path.abspath("07 Aug Exp Parquet")


def list_parquet_files(base_dir: str) -> List[Dict]:
    """
    Recursively list all Parquet files and folders under base_dir.
    Returns a nested structure for frontend tree view.
    """
    items = []
    for entry in sorted(os.listdir(base_dir)):
        full_path = os.path.join(base_dir, entry)
        if os.path.isdir(full_path):
            items.append({
                "type": "folder",
                "name": entry,
                "children": list_parquet_files(full_path)
            })
        elif entry.endswith(".parquet"):
            items.append({
                "type": "file",
                "name": entry,
                "path": os.path.relpath(full_path, PARQUET_ROOT)
            })
    return items

@app.get("/api/files")
def get_parquet_files():
    if not os.path.exists(PARQUET_ROOT):
        return []
    return list_parquet_files(PARQUET_ROOT)

class QueryRequest(BaseModel):
    file_path: str  # relative to PARQUET_ROOT
    query: str      # DuckDB SQL query, use '{file}' as placeholder for file path

@app.post("/api/query")
def run_duckdb_query(req: QueryRequest):
    # Validate file path
    parquet_file = os.path.abspath(os.path.join(PARQUET_ROOT, req.file_path))
    if not parquet_file.startswith(PARQUET_ROOT) or not os.path.isfile(parquet_file):
        raise HTTPException(status_code=400, detail="Invalid Parquet file path.")

    # Replace {file} placeholder in query with the actual file path
    query = req.query.replace("{file}", parquet_file.replace("\\", "/"))
    try:
        con = duckdb.connect(database=':memory:')
        df = con.execute(query).df()
        # Limit rows for safety
        max_rows = 10000
        if len(df) > max_rows:
            df = df.head(max_rows)
        return {
            "columns": list(df.columns),
            "rows": df.values.tolist(),
            "row_count": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DuckDB query error: {str(e)}")