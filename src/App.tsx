import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Intraday History Data Analyzer
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Data Analysis Dashboard
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome to Intraday History Data Analyzer
          </h2>
          <p className="text-gray-600">
            This application will provide interactive visualizations for your intraday market data.
            The dashboard is currently being set up.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App 