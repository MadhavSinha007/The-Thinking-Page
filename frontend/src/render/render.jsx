import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar.jsx";
import Navbar from "../components/navbar.jsx";
import { doSignOut } from "../pages/auth/auth.js";

const Render = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar />

      {/* Content wrapper */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar onLogout={handleLogout} />

        {/* Page Content */}
        <main className="flex-1 p-8 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Render;
