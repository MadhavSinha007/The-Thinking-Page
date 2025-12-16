// Navbar.jsx
import React from "react";
import SearchBar from "./searchbar";
import Logo from "../assets/logo.png";

const Navbar = ({ onLogout, onSearch, isSearching = false }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-black/10 z-50">
      <div
        className="
          flex items-center justify-between h-16 sm:h-20
          px-4 sm:px-6 lg:px-8
          w-full sm:w-[calc(100%-80px)] sm:ml-20
        "
      >
        {/* Left side: Logo + Text */}
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="h-8 w-8 object-contain" />
          <span className="hidden sm:inline text-xl font-semibold text-purple-600">
            TheThinkingPage
          </span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 sm:mx-6">
          <SearchBar 
            onSearch={onSearch}
            isLoading={isSearching}
            placeholder="Search books, authors, or genres..."
            className="max-w-none"
          />
        </div>

        {/* Right side: Logout button */}
        <div className="flex items-center gap-4">
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