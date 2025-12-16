// SearchBar.jsx (simplified)
import React, { useState, useCallback, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search books, authors, or genres...",
  debounceDelay = 500,
  showClearButton = true,
  className = "",
  isLoading = false
}) => {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef(null);

  // Custom debounce implementation
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (onSearch && searchQuery.trim() !== "") {
        onSearch(searchQuery);
      }
    }, debounceDelay),
    [onSearch, debounceDelay]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim() === "") {
      if (onSearch) onSearch("");
    } else {
      debouncedSearch(value);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() !== "" && onSearch) {
      onSearch(query);
    }
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
    if (e.key === 'Escape') handleClear();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FiSearch className={`transition-colors ${hasFocus ? "text-purple-600" : "text-gray-400"}`} size={18} />
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
        autoComplete="off"
        aria-label="Search books"
      />

      {/* Clear Button */}
      {showClearButton && query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          aria-label="Clear search"
        >
          <FiX className="text-gray-400 hover:text-gray-600" size={18} />
        </button>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;