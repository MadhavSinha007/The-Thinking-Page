import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiRotateCcw, FiBookmark, FiUser } from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/home", Icon: FiHome, label: "Home" },
  { to: "/history", Icon: FiRotateCcw, label: "History" },
  { to: "/saved", Icon: FiBookmark, label: "Saved" },
];

const Sidebar = ({ darkMode = false }) => {
  const location = useLocation();

  const NavItem = ({ to, Icon, label }) => {
    const isActive = location.pathname === to;
    
    const surfaceColor = darkMode ? '#292524' : '#f3ebe3';
    const textColor = darkMode ? '#F5F0EB' : '#000000';
    const textMuted = darkMode ? '#A8A29E' : '#00000099';
    
    return (
      <Link
        to={to}
        title={label}
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 group"
        style={{
          background: isActive ? '#f57c00' : 'transparent',
          color: isActive ? '#000000' : textMuted,
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = surfaceColor;
            e.currentTarget.style.color = textColor;
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = textMuted;
          }
        }}
      >
        <Icon size={19} />
        <span
          className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold rounded-lg opacity-0 pointer-events-none whitespace-nowrap group-hover:opacity-100 transition-opacity"
          style={{ 
            background: darkMode ? '#F5F0EB' : '#000000', 
            color: darkMode ? '#111110' : '#efe5dc' 
          }}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <aside 
        className="hidden sm:flex fixed left-0 top-0 h-screen w-[72px] flex-col items-center py-8 border-r z-50"
        style={{ 
          background: darkMode ? '#111110' : '#efe5dc',
          borderColor: darkMode ? '#292524' : '#0000001a'
        }}
      >
        <div className="flex flex-col gap-3 flex-1 items-center justify-center">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <div 
          className="w-8 h-px my-4" 
          style={{ background: darkMode ? '#292524' : '#00000033' }}
        />

        <div className="flex-shrink-0">
          <NavItem to="/profile" Icon={FiUser} label="Profile" />
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 flex sm:hidden justify-around items-center border-t z-50 pb-safe"
        style={{
          background: darkMode ? '#111110' : '#efe5dc',
          borderColor: darkMode ? '#292524' : '#0000001a',
          paddingTop: '10px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        }}
      >
        {[...NAV_ITEMS, { to: "/profile", Icon: FiUser, label: "Profile" }].map(({ to, Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200"
              style={{ color: isActive ? '#f57c00' : (darkMode ? '#A8A29E' : '#00000099') }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
                style={{ background: isActive ? '#f57c00' : 'transparent' }}
              >
                <Icon size={20} color={isActive ? '#000000' : undefined} />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;