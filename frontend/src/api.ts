import axios from 'axios';
import { FileNode, QueryRequest, QueryResponse } from './types';

const API_BASE = '/api';

export async function fetchFileTree(): Promise<FileNode[]> {
  const res = await axios.get(`${API_BASE}/files`);
  return res.data;
}

export async function runQuery(req: QueryRequest): Promise<QueryResponse> {
  const res = await axios.post(`${API_BASE}/query`, req);
  return res.data;
}