import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

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