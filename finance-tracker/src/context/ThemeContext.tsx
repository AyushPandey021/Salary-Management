import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
};

type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
};

const lightTheme: ThemeType = {
  background: "#f4f6fb",
  card: "#ffffff",
  text: "#111827",
  subText: "#6b7280",
  border: "#e5e7eb",
  primary: "#6366f1",
};

const darkTheme: ThemeType = {
  background: "#0f172a",
  card: "#1e293b",
  text: "#f8fafc",
  subText: "#94a3b8",
  border: "#334155",
  primary: "#6366f1",
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: any) => {

  const [isDark, setIsDark] = useState(false);

  const toggleTheme = async () => {

    const newTheme = !isDark;

    setIsDark(newTheme);

    await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");

  };

  useEffect(() => {

    const loadTheme = async () => {

      const saved = await AsyncStorage.getItem("theme");

      if (saved === "dark") setIsDark(true);

    };

    loadTheme();

  }, []);

  const theme = isDark ? darkTheme : lightTheme;

  return (

    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>

  );

};

export const useTheme = () => {

  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};