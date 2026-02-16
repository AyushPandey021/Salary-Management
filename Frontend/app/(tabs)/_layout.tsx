import { Tabs } from "expo-router";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Report */}
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />

      {/* CENTER PLUS BUTTON */}
      <Tabs.Screen
        name="add"
        options={{
          title: "",
          tabBarIcon: () => (
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => router.push("/add")}
            >
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Plan */}
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 10,
    backgroundColor: "#fff",
    borderRadius: 30,
    height: 65,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },

  plusButton: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#7C5CFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,   // 👈 makes it float
    shadowColor: "#7C5CFC",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 10,
  },
});
