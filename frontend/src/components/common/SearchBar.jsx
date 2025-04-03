"use client"
import { Search } from "lucide-react"

const SearchBar = ({ value, onChange, onClear, placeholder = "Search...", disabled = false }) => {
  return (
    <div className="search-input-wrapper">
      <Search className="search-icon" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="search-input"
        aria-label={placeholder}
      />
      {value && (
        <button className="clear-search-btn" onClick={onClear} aria-label="Clear search">
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  )
}

export default SearchBar

