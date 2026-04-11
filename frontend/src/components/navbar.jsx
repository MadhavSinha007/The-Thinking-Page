import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchbar";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ onLogout, onSearch, darkMode = false, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (query) => {
    onSearch?.(query);
    navigate(query.trim() ? `/home?search=${encodeURIComponent(query)}` : "/home");
  };

  const bgColor = darkMode ? '#111110' : '#f3ebe3';
  const borderColor = darkMode ? '#292524' : '#0000001a';
  const textColor = darkMode ? '#F5F0EB' : '#000000';

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: bgColor, borderColor: borderColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[60px] flex items-center gap-2">
          
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-sm font-semibold tracking-tight hover:scale-105 transition-transform ${
              darkMode ? 'border-[#F5F0EB] bg-[#1C1917] text-[#F5F0EB]' : 'border-black bg-white text-black'
            }`}>
              TP.
            </div>
            <span className="font-black text-sm sm:text-base hidden md:inline" style={{ color: textColor }}>
              TheThinkingPage
            </span>
          </button>

          <div className="flex-1 mx-2 sm:mx-4">
            <SearchBar onSearch={handleSearch} darkMode={darkMode} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border hover:scale-105"
                style={{ color: textColor, borderColor: borderColor }}
              >
                {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
                <span className="hidden lg:inline">{darkMode ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-black bg-[#f57c00] hover:scale-105 transition-transform"
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full"
              style={{ color: textColor }}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t" style={{ background: bgColor, borderColor: borderColor }}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
              <button
                onClick={toggleDarkMode}
                className="w-full flex justify-between items-center px-4 py-3 rounded-full text-sm font-semibold border"
                style={{ color: textColor, borderColor: borderColor }}
              >
                <span>Switch to {darkMode ? 'Light' : 'Dark'}</span>
                {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
              </button>

              <button
                onClick={onLogout}
                className="w-full px-4 py-3 rounded-full text-sm font-semibold text-black bg-[#f57c00]"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;