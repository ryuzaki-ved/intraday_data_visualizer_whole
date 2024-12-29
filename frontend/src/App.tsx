import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { FileTree } from './components/FileTree';
import { QueryEditor } from './components/QueryEditor';
import { ResultsTable } from './components/ResultsTable';
import { ChartPanel } from './components/ChartPanel';
import { fetchFileTree, runQuery } from './api';
import { FileNode, QueryResponse } from './types';

const DEFAULT_MAX_ROWS = 10000;

function App() {
  // File tree state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  // Query state
  const [query, setQuery] = useState<string>('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResponse | null>(null);
  // File tree loading
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Fetch file tree on mount
  useEffect(() => {
    setTreeLoading(true);
    fetchFileTree()
      .then(setFileTree)
      .catch(e => setTreeError('Failed to load file tree'))
      .finally(() => setTreeLoading(false));
  }, []);

  // When file is selected, set default query
  useEffect(() => {
    if (selectedFile) {
      setQuery(`SELECT * FROM '{file}' LIMIT ${DEFAULT_MAX_ROWS}`);
      setQueryResult(null);
      setQueryError(null);
    }
  }, [selectedFile]);

  // Run query handler
  const handleRunQuery = useCallback((q: string) => {
    if (!selectedFile) return;
    setQuery(q);
    setQueryLoading(true);
    setQueryError(null);
    setQueryResult(null);
    runQuery({ file_path: selectedFile, query: q })
      .then(res => setQueryResult(res))
      .catch(e => setQueryError(e?.response?.data?.detail || 'Query failed'))
      .finally(() => setQueryLoading(false));
  }, [selectedFile]);

  return (
    <div className="App" style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Arial, sans-serif', background: '#f7f9fb' }}>
      {/* Sidebar: File Browser */}
      <aside style={{ width: 280, background: '#232946', color: '#fff', padding: 0, boxShadow: '2px 0 8px #0001', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700, fontSize: 22, padding: '24px 20px 12px 20px', letterSpacing: 1, borderBottom: '1px solid #2e3350' }}>
          Parquet Explorer
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {treeLoading ? (
            <div style={{ color: '#aaa', padding: 16 }}>Loading...</div>
          ) : treeError ? (
            <div style={{ color: '#d32f2f', padding: 16 }}>{treeError}</div>
          ) : (
            <FileTree tree={fileTree} selected={selectedFile} onSelect={setSelectedFile} />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Query Editor */}
        <section style={{ background: '#fff', padding: '18px 24px', borderBottom: '1px solid #e0e3eb', display: 'flex', alignItems: 'center', gap: 16 }}>
          <QueryEditor
            file={selectedFile}
            defaultQuery={query}
            onRun={handleRunQuery}
            loading={queryLoading}
            error={queryError}
          />
        </section>

        {/* Results and Chart */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Table */}
          <section style={{ flex: 1.2, background: '#fff', margin: 18, marginRight: 6, borderRadius: 10, boxShadow: '0 2px 8px #0001', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 18, padding: '16px 20px', borderBottom: '1px solid #f0f1f5', background: '#f7f9fb' }}>
              Query Results
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 0 }}>
              <ResultsTable
                columns={queryResult?.columns || []}
                rows={queryResult?.rows || []}
                loading={queryLoading}
                maxRows={DEFAULT_MAX_ROWS}
              />
            </div>
          </section>

          {/* Chart */}
          <section style={{ flex: 1, background: '#fff', margin: 18, marginLeft: 6, borderRadius: 10, boxShadow: '0 2px 8px #0001', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 18, padding: '16px 20px', borderBottom: '1px solid #f0f1f5', background: '#f7f9fb' }}>
              Visualization
            </div>
            <div style={{ flex: 1, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <ChartPanel
                columns={queryResult?.columns || []}
                rows={queryResult?.rows || []}
                loading={queryLoading}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
