import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  return (
    <div
      className={clsx(
        'bg-white rounded-lg',
        border && 'border border-gray-200',
        shadowClasses[shadow],
        paddingClasses[padding],
        hover && 'transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}

// Card Header component
interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  actions
}) => {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div className="flex-1">
        {children}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Card Title component
interface CardTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
  as: Component = 'h3'
}) => {
  return (
    <Component className={clsx('text-lg font-semibold text-gray-900', className)}>
      {children}
    </Component>
  )
}

// Card Subtitle component
interface CardSubtitleProps {
  children: React.ReactNode
  className?: string
}

const CardSubtitle: React.FC<CardSubtitleProps> = ({
  children,
  className
}) => {
  return (
    <p className={clsx('text-sm text-gray-600 mt-1', className)}>
      {children}
    </p>
  )
}

// Card Content component
interface CardContentProps {
  children: React.ReactNode
  className?: string
}

const CardContent: React.FC<CardContentProps> = ({
  children,
  className
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

// Card Footer component
interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={clsx('flex items-center justify-between pt-4 mt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}

// Export components
export { Card, CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter }
export default Card 