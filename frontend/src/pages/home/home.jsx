import React, { useState, useCallback, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

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

  // Custom debounce implementation (if you don't want to use lodash)
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
      // If search is cleared, reset results immediately
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
    // Blur the input on submit for mobile keyboards
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    // Submit on Enter key
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    // Clear on Escape key
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full max-w-md mx-auto sm:mx-0 ${className}`}>
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
        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200 hover:border-gray-400"
        autoComplete="off"
        aria-label="Search books"
      />

      {/* Clear Button */}
      {showClearButton && query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r-lg transition-colors"
          aria-label="Clear search"
        >
          <FiX className="text-gray-500 hover:text-gray-700" size={18} />
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-500 z-10">
          <div className="font-medium mb-1 text-gray-700">Search tips:</div>
          <div className="grid grid-cols-2 gap-2">
            <span className="flex items-center">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">Title</span>
              Harry Potter
            </span>
            <span className="flex items-center">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">Author</span>
              J.K. Rowling
            </span>
            <span className="flex items-center">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">Genre</span>
              Fantasy
            </span>
            <span className="flex items-center">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded mr-1">ISBN</span>
              978-0-12345
            </span>
          </div>
        </div>
      )}
    </form>
  );
};

// Optional: With search suggestions variant
const SearchBarWithSuggestions = ({ 
  onSearch, 
  onSuggestionSelect,
  suggestions = [],
  placeholder = "Search books, authors, or genres...",
  isLoading = false
}) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    
    if (value.trim() === "") {
      if (onSearch) onSearch("");
    } else {
      if (onSearch) onSearch(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSuggestionSelect) onSuggestionSelect(suggestion);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
    if (onSearch) onSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto sm:mx-0">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="text-gray-400" size={18} />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          autoComplete="off"
          onFocus={() => setShowSuggestions(true)}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
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
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center">
                <FiSearch className="text-gray-400 mr-3" size={16} />
                <span className="text-gray-700">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Recent Searches */}
      {showSuggestions && query === "" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 p-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Recent searches</div>
          <div className="space-y-1">
            {/* You can store recent searches in localStorage */}
            {['Harry Potter', 'Stephen King', 'Science Fiction'].map((term, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(term)}
                className="text-sm text-gray-700 hover:text-purple-600 hover:bg-gray-50 w-full text-left px-2 py-1.5 rounded"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
export { SearchBarWithSuggestions };