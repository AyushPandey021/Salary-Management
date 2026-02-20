import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

type ThemeColors = {
  background: string;
  card: string;
  text: string;
  subText: string;
  primary: string;
  border: string;
  input: string;
  danger: string;
};

type ThemeType = {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  loaded: boolean;
};

const STORAGE_KEY = "APP_THEME";

const lightTheme: ThemeColors = {
  background: "#F3F4F8",
  card: "#FFFFFF",
  text: "#1f2937",
  subText: "#6b7280",
  primary: "#7C5CFC",
  border: "#e5e7eb",
  input: "#f1f5f9",
  danger: "#ef4444",
};

const darkTheme: ThemeColors = {
  background: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  subText: "#94a3b8",
  primary: "#8b7dff",
  border: "#334155",
  input: "#020617",
  danger: "#f87171",
};

export const ThemeContext = createContext<ThemeType>({} as ThemeType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(systemTheme === "dark");
  const [loaded, setLoaded] = useState(false);

  // Load saved theme
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setIsDark(saved === "dark");
        } else {
          setIsDark(systemTheme === "dark");
        }
      } catch {}
      setLoaded(true);
    };
    load();
  }, []);

  // Save theme
  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem(STORAGE_KEY, newValue ? "dark" : "light");
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

// easy hook
export const useTheme = () => useContext(ThemeContext);
