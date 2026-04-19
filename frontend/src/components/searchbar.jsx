import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

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
  const timeoutRef = useRef(null);

  const theme = useMemo(
    () => ({
      bg: darkMode ? "#1C1917" : "#f3ebe3",
      text: darkMode ? "#F5F0EB" : "#000000",
      placeholder: darkMode ? "#A8A29E" : "#00000066",
      border: darkMode ? "#292524" : "#0000001a",
      accent: "#f57c00",
      soft: darkMode ? "#292524" : "#efe5dc",
    }),
    [darkMode]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const runSearch = (value) => {
    onSearch?.(value);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      runSearch("");
      return;
    }

    timeoutRef.current = setTimeout(() => {
      runSearch(value);
    }, debounceDelay);
  };

  const handleClear = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setQuery("");
    runSearch("");
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    runSearch(query.trim());
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div
        className="flex w-full items-center gap-2 rounded-full px-4 py-2.5 transition-all"
        style={{
          background: theme.bg,
          border: `1.5px solid ${hasFocus ? theme.accent : theme.border}`,
        }}
      >
        <FiSearch
          size={18}
          style={{
            color: hasFocus ? theme.accent : theme.placeholder,
            flexShrink: 0,
          }}
        />
<input
  ref={inputRef}
  type="text"
  value={query}
  onChange={handleChange}
  onFocus={() => setHasFocus(true)}
  onBlur={() => setHasFocus(false)}
  onKeyDown={(e) => {
    if (e.key === "Escape") handleClear();
  }}
  placeholder={placeholder}
  autoComplete="off"
  className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium outline-none focus:outline-none focus:ring-0 focus:border-none"
  style={{
    color: theme.text,
    outline: "none",
    boxShadow: "none",
    border: "none",
  }}
/>

        {query.trim().length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-all hover:scale-105"
            style={{
              background: theme.soft,
              color: theme.placeholder,
            }}
            aria-label="Clear search"
          >
            <FiX size={15} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;