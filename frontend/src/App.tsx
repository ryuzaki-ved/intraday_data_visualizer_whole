import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App" style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Arial, sans-serif', background: '#f7f9fb' }}>
      {/* Sidebar: File Browser */}
      <aside style={{ width: 280, background: '#232946', color: '#fff', padding: 0, boxShadow: '2px 0 8px #0001', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700, fontSize: 22, padding: '24px 20px 12px 20px', letterSpacing: 1, borderBottom: '1px solid #2e3350' }}>
          Parquet Explorer
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {/* TODO: File tree component */}
          <div style={{ opacity: 0.5, fontStyle: 'italic' }}>File browser goes here</div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Query Editor */}
        <section style={{ background: '#fff', padding: '18px 24px', borderBottom: '1px solid #e0e3eb', display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* TODO: Query editor component */}
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Write your DuckDB SQL query here..."
              style={{ width: '100%', fontSize: 16, padding: 10, border: '1px solid #d1d5db', borderRadius: 6, background: '#f3f6fa' }}
              disabled
            />
          </div>
          <button style={{ background: '#0066ff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'not-allowed', opacity: 0.6 }} disabled>
            Run
          </button>
        </section>

        {/* Results and Chart */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Table */}
          <section style={{ flex: 1.2, background: '#fff', margin: 18, marginRight: 6, borderRadius: 10, boxShadow: '0 2px 8px #0001', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 18, padding: '16px 20px', borderBottom: '1px solid #f0f1f5', background: '#f7f9fb' }}>
              Query Results
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {/* TODO: Virtualized table component */}
              <div style={{ opacity: 0.5, fontStyle: 'italic' }}>Results table goes here</div>
            </div>
          </section>

          {/* Chart */}
          <section style={{ flex: 1, background: '#fff', margin: 18, marginLeft: 6, borderRadius: 10, boxShadow: '0 2px 8px #0001', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 18, padding: '16px 20px', borderBottom: '1px solid #f0f1f5', background: '#f7f9fb' }}>
              Visualization
            </div>
            <div style={{ flex: 1, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              {/* TODO: ECharts component */}
              <div style={{ opacity: 0.5, fontStyle: 'italic' }}>Chart goes here</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
