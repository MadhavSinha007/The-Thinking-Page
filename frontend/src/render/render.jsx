import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import { doSignOut } from "../pages/auth/auth";

const Render = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ttp-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Apply dark mode class to html element when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ttp-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const bgColor = darkMode ? '#111110' : '#efe5dc';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: bgColor }}>
      <Sidebar darkMode={darkMode} />
      <div className="flex flex-col flex-1 overflow-hidden sm:ml-[72px]">
        <Navbar 
          onLogout={handleLogout} 
          onSearch={handleSearch} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 overflow-y-auto pt-[60px]" style={{ background: bgColor }}>
          <div className="pb-24 sm:pb-8">
            <Outlet context={{ searchQuery, darkMode }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Render;