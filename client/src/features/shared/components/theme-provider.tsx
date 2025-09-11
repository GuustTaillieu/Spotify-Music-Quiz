import { createContext, useContext, useEffect, useState } from "react";

import { getItem, setItem } from "@/lib/utils/localstorage";

type Theme = "light" | "dark" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => {},
});

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export const ThemeProvider = ({
  children,
  defaultTheme,
  storageKey = "advanced-patterns-react-theme",
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    getItem<Theme>(storageKey) ?? defaultTheme ?? "system",
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "system");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      setItem(storageKey, systemTheme);
      return;
    }
    root.classList.add(theme);
    setItem(storageKey, theme);
  }, [theme, storageKey]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
