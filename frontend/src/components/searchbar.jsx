import React, { useState, useCallback, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

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
}) => {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef(null);
  const { theme } = useTheme();

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div
        className="flex items-center gap-2 px-4 py-2 w-full"
        style={{
          background: theme.surface,
          border: `1.5px solid ${hasFocus ? theme.accent : theme.border}`,
          borderRadius: '8px',
        }}
      >
        <FiSearch
          size={18}
          style={{ color: hasFocus ? theme.accent : theme.fgSubtle, flexShrink: 0 }}
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
          className="flex-1 bg-transparent text-sm font-medium placeholder:font-normal min-w-0"
          style={{ 
            color: theme.fg,
            outline: 'none',
            border: 'none',
          }}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:opacity-70"
            style={{ color: theme.fgSubtle }}
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;