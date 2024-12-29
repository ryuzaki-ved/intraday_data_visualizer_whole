// File/folder structure for tree view
export type FileNode = {
  type: 'file' | 'folder';
  name: string;
  path?: string; // only for files
  children?: FileNode[];
};

// Query API
export interface QueryRequest {
  file_path: string;
  query: string;
}

export interface QueryResponse {
  columns: string[];
  rows: any[][];
  row_count: number;
}