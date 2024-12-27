import React from 'react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }
  
  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  }

  return (
    <svg
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Loading overlay component
interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  message = 'Loading...',
  className
}) => {
  if (!loading) {
    return <>{children}</>
  }

  return (
    <div className={clsx('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          {message && (
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading skeleton component
interface LoadingSkeletonProps {
  className?: string
  lines?: number
  height?: string
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 1,
  height = 'h-4'
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'bg-gray-200 rounded animate-pulse',
            height
          )}
        />
      ))}
    </div>
  )
}

export { LoadingSpinner, LoadingOverlay, LoadingSkeleton }
export default LoadingSpinner 