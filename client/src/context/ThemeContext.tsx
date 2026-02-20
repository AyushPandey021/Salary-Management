import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = {
  isDark: boolean;
  toggleTheme: () => void;
  theme: {
    background: string;
    card: string;
    text: string;
    subText: string;
    primary: string;
  };
};

export const ThemeContext = createContext<ThemeType>({
  isDark: false,
  toggleTheme: () => {},
  theme: {
    background: "#fff",
    card: "#fff",
    text: "#000",
    subText: "#777",
    primary: "#7C5CFC",
  },
});

export const ThemeProvider = ({ children }: any) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem("appTheme");
    if (saved === "dark") {
      setIsDark(true);
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem(
      "appTheme",
      newValue ? "dark" : "light"
    );
  };

  const theme = {
    background: isDark ? "#121212" : "#f4f6fb",
    card: isDark ? "#1E1E1E" : "#ffffff",
    text: isDark ? "#ffffff" : "#333333",
    subText: isDark ? "#aaaaaa" : "#777777",
    primary: "#7C5CFC",
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, theme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
