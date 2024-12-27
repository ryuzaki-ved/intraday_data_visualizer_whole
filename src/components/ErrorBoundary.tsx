import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-700 font-medium">
                      Error Details (Development)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
                      <div className="text-red-600 font-bold">Error:</div>
                      <div className="whitespace-pre-wrap">{this.state.error.toString()}</div>
                      
                      {this.state.errorInfo && (
                        <>
                          <div className="text-red-600 font-bold mt-2">Stack Trace:</div>
                          <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                        </>
                      )}
                    </div>
                  </details>
                )}
                
                <div className="flex space-x-3">
                  <Button onClick={this.handleReset} variant="outline">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 