import React from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchbar";
import Logo from "../assets/logo.png";
import { useTheme } from "../context/ThemeContext.jsx";

const Navbar = ({ onLogout, onSearch, isSearching = false }) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleSearch = (query) => {
    if (query.trim()) {
      onSearch && onSearch(query);
      navigate(`/home?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b ${
      darkMode ? 'bg-[#0a0a0a] border-gray-800' : 'bg-[#faf9f8] border-black/10'
    }`}>
      <div
        className="
          flex items-center justify-between h-16 sm:h-20
          px-4 sm:px-6 lg:px-8
          w-full sm:w-[calc(100%-80px)] sm:ml-20
        "
      >
        {/* Left side: Logo + Text */}
        <div className="flex items-center gap-3">
          <img 
            src={Logo} 
            alt="Logo" 
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/home')}
          />
          <span 
            className={`hidden sm:inline text-xl font-semibold cursor-pointer ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}
            onClick={() => navigate('/home')}
          >
            TheThinkingPage
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 sm:mx-6">
          <SearchBar 
            onSearch={handleSearch}
            isLoading={isSearching}
            placeholder="Search books, authors, or genres..."
            className="max-w-none"
          />
        </div>

        {/* Right side: Theme toggle + Logout button */}
        <div className="flex items-center gap-4">
          {/* Dark/Light toggle button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              // Sun icon for light mode (when dark mode is on, clicking goes to light)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
                />
              </svg>
            ) : (
              // Moon icon for dark mode (when light mode is on, clicking goes to dark)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
                />
              </svg>
            )}
          </button>

          <button
            onClick={onLogout}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;