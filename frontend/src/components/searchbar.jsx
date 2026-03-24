import React, { useState, useCallback, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search books, authors, or genres...",
  debounceDelay = 500,
  showClearButton = true,
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef(null);
  const { darkMode } = useTheme();

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (onSearch && searchQuery.trim() !== "") {
        onSearch(searchQuery);
      }
      setIsLoading(false);
    }, debounceDelay),
    [onSearch, debounceDelay]
  );

  // Custom debounce implementation
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim() === "") {
      if (onSearch) onSearch("");
      setIsLoading(false);
    } else {
      setIsLoading(true);
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
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full max-w-md mx-auto sm:mx-0 ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <FiSearch className={`transition-colors ${hasFocus ? "text-purple-600" : "text-gray-500"}`} size={18} />
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
        className={`w-full rounded-lg border pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200 ${
          darkMode
            ? 'bg-[#1a1a1a] border-gray-800 text-white placeholder-gray-600 hover:border-gray-700'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-gray-400'
        }`}
        autoComplete="off"
        aria-label="Search books"
      />

      {/* Clear Button */}
      {showClearButton && query && (
        <button
          type="button"
          onClick={handleClear}
          className={`absolute inset-y-0 right-0 flex items-center pr-3 rounded-r-lg transition-colors ${
            darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
          aria-label="Clear search"
        >
          <FiX className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`} size={18} />
        </button>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Search Tips */}
      {!query && hasFocus && (
        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg p-3 text-xs z-10 ${
          darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className={`font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search tips:</div>
          <div className="grid grid-cols-2 gap-2">
            <span className={`flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <span className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-1.5 py-0.5 rounded mr-1`}>Title</span>
              Harry Potter
            </span>
            <span className={`flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <span className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-1.5 py-0.5 rounded mr-1`}>Author</span>
              J.K. Rowling
            </span>
            <span className={`flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <span className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-1.5 py-0.5 rounded mr-1`}>Genre</span>
              Fantasy
            </span>
            <span className={`flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              <span className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} px-1.5 py-0.5 rounded mr-1`}>ISBN</span>
              978-0-12345
            </span>
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;