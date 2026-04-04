import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export const THEMES = {
  light: {
    key: 'light',
    label: 'Light',
    bg: '#F2EFE9',           // warm cream — matches Figma
    surface: '#FFFFFF',
    surface2: '#E8E4DC',
    card: '#FFFFFF',
    border: '#DDD9D0',
    fg: '#1C1917',
    fgMuted: '#78716C',
    fgSubtle: '#A8A29E',
    accent: '#E8341C',       // warm red — Figma "See all" color
    accentHover: '#C62A15',
    accentSoft: '#FDE8E4',
    navBg: '#F2EFE9',
    metaColor: '#F2EFE9',
    isDark: false,
    // Category pill
    pillActive: '#1C1917',
    pillActiveFg: '#F2EFE9',
    pillInactive: 'transparent',
    pillInactiveFg: '#78716C',
    pillInactiveBorder: '#DDD9D0',
  },
  dark: {
    key: 'dark',
    label: 'Dark',
    bg: '#111110',
    surface: '#1C1917',
    surface2: '#292524',
    card: '#1C1917',
    border: '#292524',
    fg: '#F5F0EB',
    fgMuted: '#A8A29E',
    fgSubtle: '#57534E',
    accent: '#E8341C',
    accentHover: '#FF4D30',
    accentSoft: '#3D1410',
    navBg: '#111110',
    metaColor: '#111110',
    isDark: true,
    pillActive: '#F5F0EB',
    pillActiveFg: '#111110',
    pillInactive: 'transparent',
    pillInactiveFg: '#78716C',
    pillInactiveBorder: '#292524',
  },
  sepia: {
    key: 'sepia',
    label: 'Sepia',
    bg: '#F5EDD8',
    surface: '#EDE0C4',
    surface2: '#E5D4B0',
    card: '#EDE0C4',
    border: '#D4C5A0',
    fg: '#3C2A1A',
    fgMuted: '#7A6248',
    fgSubtle: '#A8916A',
    accent: '#C0522A',
    accentHover: '#A8431F',
    accentSoft: '#F5E4D5',
    navBg: '#F0E4C8',
    metaColor: '#F5EDD8',
    isDark: false,
    pillActive: '#3C2A1A',
    pillActiveFg: '#F5EDD8',
    pillInactive: 'transparent',
    pillInactiveFg: '#7A6248',
    pillInactiveBorder: '#D4C5A0',
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem('ttp-theme');
    if (saved && THEMES[saved]) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const theme = THEMES[themeKey];
  const darkMode = theme.isDark;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia', 'light');
    root.classList.add(themeKey);
    if (theme.isDark) root.classList.add('dark');
    localStorage.setItem('ttp-theme', themeKey);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.metaColor);

    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--surface2', theme.surface2);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--fg', theme.fg);
    root.style.setProperty('--fg-muted', theme.fgMuted);
    root.style.setProperty('--fg-subtle', theme.fgSubtle);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--nav-bg', theme.navBg);
  }, [themeKey, theme]);

  const setTheme = (key) => { if (THEMES[key]) setThemeKey(key); };

  const cycleTheme = () => {
    const order = ['light', 'dark', 'sepia'];
    setThemeKey(prev => order[(order.indexOf(prev) + 1) % order.length]);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, themeKey, theme, setTheme, cycleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};