import { Link, useLocation } from "react-router-dom";
import { FiHome, FiRotateCcw, FiBookmark, FiUser } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Sidebar = () => {
  const location = useLocation();
  const { darkMode } = useTheme();

  // NavItem Component
  const NavItem = ({ to, Icon }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition
          ${isActive 
            ? "bg-purple-600 text-white" 
            : darkMode 
              ? "text-gray-400 hover:bg-gray-800 hover:text-white" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }
        `}
      >
        <Icon size={20} />
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden sm:flex fixed left-0 top-0 h-screen w-20 flex-col items-center py-6 border-r z-50 ${
        darkMode ? "bg-[#0a0a0a] border-gray-800" : "bg-[#faf9f8] border-gray-200"
      }`}>
        {/* Center nav */}
        <div className="flex flex-col gap-6 flex-1 justify-center">
          <NavItem to="/home" Icon={FiHome} />
          <NavItem to="/history" Icon={FiRotateCcw} />
          <NavItem to="/saved" Icon={FiBookmark} />
        </div>

        {/* Divider */}
        <div className={`w-6 h-px my-6 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`} />

        {/* Profile */}
        <NavItem to="/profile" Icon={FiUser} />
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className={`fixed bottom-0 left-0 right-0 flex sm:hidden border-t justify-around py-2 z-50 ${
        darkMode ? "bg-[#0a0a0a] border-gray-800" : "bg-[#faf9f8] border-gray-200"
      }`}>
        <NavItem to="/home" Icon={FiHome} />
        <NavItem to="/history" Icon={FiRotateCcw} />
        <NavItem to="/saved" Icon={FiBookmark} />
        <NavItem to="/profile" Icon={FiUser} />
      </nav>
    </>
  );
};

export default Sidebar;