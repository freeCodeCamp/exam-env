import { createContext, useContext, useEffect, useState } from "react";
import { useColorMode } from "@chakra-ui/react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorMode, setColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme-mode");
    if (saved === "dark" || saved === "light") {
      setColorMode(saved);
    } else if (!saved) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setColorMode(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, [setColorMode]);

  const toggleTheme = () => {
    const newMode = colorMode === "dark" ? "light" : "dark";
    setColorMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ isDark: colorMode === "dark", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
