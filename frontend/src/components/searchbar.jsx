import React, { useState, useCallback, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const SearchBar = ({
  onSearch,
  placeholder = "Search books, authors…",
  debounceDelay = 400,
  className = "",
  darkMode = false,
}) => {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef(null);

  const debouncedSearch = useCallback(
    debounce((q) => { onSearch?.(q); }, debounceDelay),
    [onSearch, debounceDelay]
  );

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { onSearch?.(""); return; }
    debouncedSearch(val);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch?.(query);
    inputRef.current?.blur();
  };

  const bgColor = darkMode ? '#1C1917' : '#FFFFFF';
  const textColor = darkMode ? '#F5F0EB' : '#000000';
  const placeholderColor = darkMode ? '#A8A29E' : '#00000066';
  const borderColor = hasFocus ? '#f57c00' : (darkMode ? '#292524' : '#0000001a');

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div
        className="flex items-center gap-2 px-4 py-2 w-full rounded-full transition-all"
        style={{ background: bgColor, border: `1.5px solid ${borderColor}` }}
      >
        <FiSearch
          size={18}
          style={{ color: hasFocus ? '#f57c00' : placeholderColor, flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          onKeyDown={e => { if (e.key === 'Escape') handleClear(); }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-medium placeholder:font-normal min-w-0 outline-none border-none"
          style={{ color: textColor }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:opacity-70"
            style={{ color: darkMode ? '#A8A29E' : '#00000066' }}
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;