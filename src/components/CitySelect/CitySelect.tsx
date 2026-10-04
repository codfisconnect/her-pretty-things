import React, { useState, useEffect, useRef, useId } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'
import './CitySelect.css'

interface CitySelectProps {
  value: string
  onChange: (city: string) => void
  cities: string[]
  disabled?: boolean
  loading?: boolean
  error?: string
  placeholder?: string
  id?: string
}

export const CitySelect: React.FC<CitySelectProps> = ({
  value,
  onChange,
  cities,
  disabled = false,
  loading = false,
  error,
  placeholder = 'Search or select city',
  id,
}) => {
  const generatedId = useId()
  const selectId = id || generatedId
  const listboxId = `${selectId}-listbox`

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filter cities by search term
  const filteredCities = React.useMemo(() => {
    if (!searchTerm.trim()) return cities
    const cleanSearch = searchTerm.trim().toLowerCase()
    return cities.filter((c) => c.toLowerCase().includes(cleanSearch))
  }, [cities, searchTerm])

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li')
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleSelectCity = (city: string) => {
    onChange(city)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredCities.length - 1 ? prev + 1 : 0,
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCities.length - 1,
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          handleSelectCity(filteredCities[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
      default:
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={`city-select-wrapper ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''} ${isOpen ? 'open' : ''}`}
      onKeyDown={handleKeyDown}
    >
      <div
        id={selectId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className="city-select-trigger"
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev)
        }}
      >
        <span className={`city-select-value ${!value ? 'placeholder' : ''}`}>
          {loading
            ? 'Loading cities...'
            : disabled
              ? 'Select State / UT first'
              : value || placeholder}
        </span>

        <div className="city-select-icons">
          {value && !disabled && (
            <button
              type="button"
              className="city-clear-btn"
              onClick={handleClear}
              aria-label="Clear city"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`city-select-arrow ${isOpen ? 'rotated' : ''}`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="city-select-dropdown">
          <div className="city-search-box">
            <Search size={14} className="city-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="city-search-input"
              placeholder="Type to filter cities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setHighlightedIndex(0)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <ul
            id={listboxId}
            ref={listRef}
            role="listbox"
            className="city-options-list"
          >
            {filteredCities.length === 0 ? (
              <li className="city-option no-results" role="status">
                No cities found matching "{searchTerm}"
              </li>
            ) : (
              filteredCities.map((city, idx) => {
                const isSelected = city.toLowerCase() === value.toLowerCase()
                const isHighlighted = idx === highlightedIndex
                return (
                  <li
                    key={city}
                    role="option"
                    aria-selected={isSelected}
                    className={`city-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                    onClick={() => handleSelectCity(city)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span>{city}</span>
                    {isSelected && <Check size={14} className="city-check-icon" />}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
export default CitySelect
