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

  const theme = {
    bg: darkMode ? "#111110" : "#efe5dc",
    surface: darkMode ? "#1C1917" : "#f3ebe3",
    text: darkMode ? "#F5F0EB" : "#000000",
    textMuted: darkMode ? "#A8A29E" : "#00000099",
    border: darkMode ? "#292524" : "#0000001a",
    accent: "#f57c00",
  };

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-50 border-b"
        style={{
          background: theme.bg,
          borderColor: theme.border,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-shrink-0 items-center gap-2"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold tracking-tight transition-transform hover:scale-105"
              style={{
                background: darkMode ? "#1C1917" : "#ffffff",
                color: theme.text,
                borderColor: darkMode ? "#F5F0EB" : "#000000",
              }}
            >
              TP.
            </div>

            <span
              className="hidden text-sm font-black sm:inline md:text-base"
              style={{ color: theme.text }}
            >
              TheThinkingPage
            </span>
          </button>

          <div className="mx-2 flex-1 sm:mx-4">
            <SearchBar onSearch={handleSearch} darkMode={darkMode} />
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                style={{
                  color: theme.text,
                  borderColor: theme.border,
                  background: theme.surface,
                }}
              >
                {darkMode ? <FiSun size={15} /> : <FiMoon size={15} />}
                <span className="hidden lg:inline">
                  {darkMode ? "Light" : "Dark"}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-black transition-transform hover:scale-105"
                style={{ background: theme.accent }}
              >
                Logout
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full sm:hidden"
              style={{
                color: theme.text,
                background: mobileMenuOpen ? theme.surface : "transparent",
              }}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="border-t sm:hidden"
            style={{
              background: theme.bg,
              borderColor: theme.border,
            }}
          >
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
              <button
                onClick={() => {
                  toggleDarkMode?.();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-full border px-4 py-3 text-sm font-semibold"
                style={{
                  color: theme.text,
                  borderColor: theme.border,
                  background: theme.surface,
                }}
              >
                <span>Switch to {darkMode ? "Light" : "Dark"}</span>
                {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
              </button>

              <button
                onClick={() => {
                  onLogout?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-full px-4 py-3 text-sm font-semibold text-black"
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