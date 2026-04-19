import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiRotateCcw, FiBookmark, FiUser } from "react-icons/fi";

const NAV_ITEMS = [
  { to: "/home", Icon: FiHome, label: "Home" },
  { to: "/history", Icon: FiRotateCcw, label: "History" },
  { to: "/saved", Icon: FiBookmark, label: "Saved" },
  { to: "/profile", Icon: FiUser, label: "Profile" },
];

const Sidebar = ({ darkMode = false }) => {
  const location = useLocation();

  const theme = {
    bg: darkMode ? "#111110" : "#efe5dc",
    surface: darkMode ? "#1C1917" : "#f3ebe3",
    surfaceSoft: darkMode ? "#292524" : "#efe5dc",
    text: darkMode ? "#F5F0EB" : "#000000",
    textMuted: darkMode ? "#A8A29E" : "#00000099",
    border: darkMode ? "#292524" : "#0000001a",
    accent: "#f57c00",
  };

  const NavItem = ({ to, Icon, label, mobile = false }) => {
    const isActive = location.pathname === to;

    if (mobile) {
      return (
        <Link
          to={to}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all"
          style={{
            color: isActive ? theme.accent : theme.textMuted,
          }}
        >
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl transition-all"
            style={{
              background: isActive ? theme.accent : "transparent",
              color: isActive ? "#000000" : theme.textMuted,
            }}
          >
            <Icon size={20} />
          </div>
          <span className="truncate text-[10px] font-semibold tracking-[0.08em]">
            {label}
          </span>
        </Link>
      );
    }

    return (
      <Link
        to={to}
        title={label}
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-200 hover:scale-105"
        style={{
          background: isActive ? theme.accent : "transparent",
          color: isActive ? "#000000" : theme.textMuted,
          borderColor: isActive ? theme.accent : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = theme.surface;
            e.currentTarget.style.color = theme.text;
            e.currentTarget.style.borderColor = theme.border;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = theme.textMuted;
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        <Icon size={19} />

        <span
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: darkMode ? "#F5F0EB" : "#000000",
            color: darkMode ? "#111110" : "#efe5dc",
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
        className="fixed left-0 top-0 z-50 hidden h-screen w-[72px] border-r sm:flex sm:flex-col sm:items-center sm:py-8"
        style={{
          background: theme.bg,
          borderColor: theme.border,
        }}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          {NAV_ITEMS.slice(0, 3).map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>

        <div
          className="my-4 h-px w-8"
          style={{ background: theme.border }}
        />

        <div className="flex-shrink-0">
          <NavItem to="/profile" Icon={FiUser} label="Profile" />
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t sm:hidden"
        style={{
          background: theme.bg,
          borderColor: theme.border,
          paddingTop: "8px",
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto flex max-w-xl items-center justify-around px-1">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} mobile />
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;