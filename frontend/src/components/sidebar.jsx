import { Link, useLocation } from "react-router-dom";
import { FiHome, FiRotateCcw, FiBookmark, FiUser } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();

  // NavItem Component
  const NavItem = ({ to, Icon }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg transition
          ${isActive ? "bg-purple-600 text-white" : "text-gray-800 hover:bg-gray-200"}
        `}
      >
        <Icon size={20} />
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex fixed left-0 top-0 h-screen w-20 bg-white flex-col items-center py-6 border-r border-black/10 z-50">
        {/* Center nav */}
        <div className="flex flex-col gap-6 flex-1 justify-center">
          <NavItem to="/home" Icon={FiHome} />
          <NavItem to="/history" Icon={FiRotateCcw} />
          <NavItem to="/saved" Icon={FiBookmark} />
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-black/20 my-6" />

        {/* Profile */}
        <NavItem to="/profile" Icon={FiUser} />
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex sm:hidden bg-white border-t border-black/10 justify-around py-2 z-50">
        <NavItem to="/home" Icon={FiHome} />
        <NavItem to="/history" Icon={FiRotateCcw} />
        <NavItem to="/saved" Icon={FiBookmark} />
        <NavItem to="/profile" Icon={FiUser} />
      </nav>
    </>
  );
};

export default Sidebar;