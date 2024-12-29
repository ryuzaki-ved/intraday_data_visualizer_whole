import React, { useState } from 'react';

interface QueryEditorProps {
  file: string | null;
  defaultQuery: string;
  onRun: (query: string) => void;
  loading: boolean;
  error: string | null;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({ file, defaultQuery, onRun, loading, error }) => {
  const [query, setQuery] = useState(defaultQuery);

  React.useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ minWidth: 120, color: '#232946', fontWeight: 600 }}>
        {file ? file.split('/').slice(-1)[0] : 'No file selected'}
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Write your DuckDB SQL query here..."
        style={{ width: '100%', fontSize: 16, padding: 10, border: '1px solid #d1d5db', borderRadius: 6, background: '#f3f6fa' }}
        disabled={!file || loading}
      />
      <button
        style={{ background: '#0066ff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: file && !loading ? 'pointer' : 'not-allowed', opacity: file && !loading ? 1 : 0.6 }}
        disabled={!file || loading}
        onClick={() => onRun(query)}
      >
        {loading ? 'Running...' : 'Run'}
      </button>
      {error && <span style={{ color: '#d32f2f', marginLeft: 12 }}>{error}</span>}
    </div>
  );
};