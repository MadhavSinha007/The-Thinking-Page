import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./searchbar";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

// Theme icon
const ThemeIcon = ({ themeKey }) => {
  if (themeKey === "dark") return <FiSun size={15} />;
  if (themeKey === "sepia") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20" />
      </svg>
    );
  }
  return <FiMoon size={15} />;
};

const NEXT_LABEL = { light: "Dark", dark: "Sepia", sepia: "Light" };

const Navbar = ({ onLogout, onSearch }) => {
  const navigate = useNavigate();
  const { theme, themeKey, cycleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (query) => {
    onSearch?.(query);
    navigate(query.trim() ? `/home?search=${encodeURIComponent(query)}` : "/home");
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: theme.navBg, borderColor: theme.border }}
      >
        {/* Centered container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[60px] flex items-center gap-2">
          
          {/* Logo */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <img src={logo} alt="logo" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span
              className="font-bold text-sm sm:text-base hidden md:inline"
              style={{ color: theme.fg }}
            >
              TheThinkingPage
            </span>
          </button>

          {/* Search (VISIBLE ON ALL SCREENS) */}
          <div className="flex-1 mx-2 sm:mx-4">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Desktop controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: theme.surface2,
                  color: theme.fgMuted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <ThemeIcon themeKey={themeKey} />
                <span className="hidden lg:inline">{NEXT_LABEL[themeKey]}</span>
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: theme.accent }}
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl"
              style={{ color: theme.fg }}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden border-t"
            style={{ background: theme.navBg, borderColor: theme.border }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">

              <button
                onClick={cycleTheme}
                className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: theme.surface2,
                  color: theme.fgMuted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span>Switch to {NEXT_LABEL[themeKey]}</span>
                <ThemeIcon themeKey={themeKey} />
              </button>

              <button
                onClick={onLogout}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: theme.accent }}
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