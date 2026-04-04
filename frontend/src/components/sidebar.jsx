import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiRotateCcw, FiBookmark, FiUser } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/home",    Icon: FiHome,      label: "Home" },
  { to: "/history", Icon: FiRotateCcw, label: "History" },
  { to: "/saved",   Icon: FiBookmark,  label: "Saved" },
];

const Sidebar = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const NavItem = ({ to, Icon, label, bottom = false }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        title={label}
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
        style={{
          background: isActive ? theme.accent : 'transparent',
          color: isActive ? '#fff' : theme.fgMuted,
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = theme.surface2;
            e.currentTarget.style.color = theme.fg;
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = theme.fgMuted;
          }
        }}
      >
        <Icon size={19} />
        {/* Tooltip */}
        <span
          className="absolute left-full ml-3 px-2 py-1 text-xs font-semibold rounded-lg opacity-0 pointer-events-none whitespace-nowrap
                     group-hover:opacity-100 transition-opacity"
          style={{ background: theme.fg, color: theme.bg }}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden sm:flex fixed left-0 top-0 h-screen w-[72px] flex-col items-center py-8 border-r z-50"
        style={{ background: theme.navBg, borderColor: theme.border }}
      >
        {/* Main nav - Centered */}
        <div className="flex flex-col gap-3 flex-1 items-center justify-center">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        {/* Divider */}
        <div className="w-8 h-px my-4" style={{ background: theme.border }} />

        {/* Profile at bottom */}
        <div className="flex-shrink-0">
          <NavItem to="/profile" Icon={FiUser} label="Profile" />
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex sm:hidden justify-around items-center border-t z-50 pb-safe"
        style={{
          background: theme.navBg,
          borderColor: theme.border,
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
              style={{ color: isActive ? theme.accent : theme.fgMuted }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
                style={{ background: isActive ? theme.accentSoft : 'transparent' }}
              >
                <Icon size={20} />
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