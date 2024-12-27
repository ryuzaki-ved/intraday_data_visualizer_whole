import React, { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  searchable = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)
  
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !option.disabled
      )
    : options.filter(option => !option.disabled)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        event.preventDefault()
        if (highlightedIndex >= 0) {
          const option = filteredOptions[highlightedIndex]
          onChange(option.value)
          setIsOpen(false)
          setSearchTerm('')
          setHighlightedIndex(-1)
        }
        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
    }
  }

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      setSearchTerm('')
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          className={clsx(
            'w-full px-3 py-2 border rounded-lg cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            'bg-white border-gray-300 hover:border-gray-400',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            !error && 'focus:border-primary-500 focus:ring-primary-500',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            <span className={clsx(
              'truncate',
              !selectedOption && 'text-gray-500'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={clsx(
                'w-4 h-4 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            )}
            
            <div role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={clsx(
                      'px-3 py-2 text-sm cursor-pointer transition-colors duration-150',
                      index === highlightedIndex && 'bg-primary-50 text-primary-700',
                      !index === highlightedIndex && 'hover:bg-gray-50',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => handleOptionClick(option)}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default Select 