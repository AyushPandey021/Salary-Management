import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

function AppNavigation() {
  const { isDark } = useTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal" }}
        />
      </Stack>

      <Toast />

      <StatusBar style={isDark ? "light" : "dark"} />

    </NavigationThemeProvider>
  );
}

export default function RootLayout() {

  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );

}