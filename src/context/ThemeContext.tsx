import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nova_notes_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light'; // Sensible default
  });

  const [isDark, setIsDark] = useState<boolean>(theme === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const darkActive = theme === 'dark';

    setIsDark(darkActive);
    if (darkActive) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('nova_notes_theme', theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('nova_notes_theme', mode);
    // Also save in user profile if available
    try {
      const stored = localStorage.getItem('nova_notes_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.themePreference = mode;
        localStorage.setItem('nova_notes_profile', JSON.stringify(parsed));
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
