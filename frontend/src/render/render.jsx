import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { doSignOut } from "../pages/auth/auth";
import { useTheme } from "../context/ThemeContext";

const Render = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/home?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: theme.bg }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 overflow-hidden sm:ml-[72px]">
        {/* Navbar */}
        <Navbar onLogout={handleLogout} onSearch={handleSearch} />

        {/* Page content */}
        <main
          className="flex-1 overflow-y-auto pt-[60px]"
          style={{ background: theme.bg }}
          // Extra bottom padding on mobile for the bottom nav
        >
          <div className="pb-24 sm:pb-8">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Render;