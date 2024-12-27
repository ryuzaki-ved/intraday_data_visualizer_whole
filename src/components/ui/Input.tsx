import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled'
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    default: 'border-gray-300 bg-white focus:border-primary-500 focus:ring-primary-500',
    filled: 'border-gray-300 bg-gray-50 focus:border-primary-500 focus:ring-primary-500 focus:bg-white'
  }
  
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500'
  
  const iconClasses = 'absolute inset-y-0 flex items-center pointer-events-none'
  const leftIconClasses = 'left-0 pl-3'
  const rightIconClasses = 'right-0 pr-3'

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={clsx(iconClasses, leftIconClasses)}>
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          id={inputId}
          className={clsx(
            baseClasses,
            variantClasses[variant],
            error && errorClasses,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className={clsx(iconClasses, rightIconClasses)}>
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p
          className={clsx(
            'mt-1 text-sm',
            error ? 'text-red-600' : 'text-gray-500'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}

export default Input 