"use client";

import {
  ReactNode,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { THEME_STORAGE_KEY, Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDarkTheme() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("dark");
  root.dataset.theme = "dark";
  root.style.colorScheme = "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyDarkTheme();
    setMounted(true);
  }, []);

  const setTheme = useCallback(() => {
    applyDarkTheme();
  }, []);

  const toggleTheme = useCallback(() => {
    applyDarkTheme();
  }, []);

  const value = useMemo(
    () => ({
      theme: "dark" as Theme,
      mounted,
      setTheme,
      toggleTheme
    }),
    [mounted, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
