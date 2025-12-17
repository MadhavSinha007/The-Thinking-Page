import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import Navbar from "../components/navbar.jsx";
import { doSignOut } from "../pages/auth/auth.js";

const Render = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFFFF]">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Content wrapper - Add left margin for sidebar */}
      <div className="flex flex-col flex-1 overflow-hidden ml-0 sm:ml-20">
        {/* Fixed Navbar */}
        <Navbar 
          onLogout={handleLogout} 
          onSearch={handleSearch}
        />
        
        {/* Scrollable Page Content with top padding for navbar */}
        <main className="flex-1 overflow-y-auto pt-20">
          <div className="p-4 sm:p-8">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Render;