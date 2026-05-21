import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';

function sanitizeTheme(raw: unknown): Theme {
  return raw === 'dark' ? 'dark' : 'light';
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage<Theme>(
    'meeting-bingo:theme',
    systemDark ? 'dark' : 'light',
    sanitizeTheme,
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
