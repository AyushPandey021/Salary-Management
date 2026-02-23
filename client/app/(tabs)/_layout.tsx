import { Tabs } from "expo-router";
import { TouchableOpacity, View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useRef } from "react";
import { useTheme } from "../../src/context/ThemeContext";

/* Glass Floating Background */
function TabBarBackground({ bottom, isDark }) {
  return (
    <View
     style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 8,
        height: 68,
        borderRadius: 999,
        overflow: "hidden",}}
      // className="absolute left-5 right-5 h-[68px] rounded-full overflow-hidden"
    >
      {/* IMPORTANT — tint changes */}
      <BlurView
        intensity={90}
        tint={isDark ? "dark" : "light"}
        className="flex-1 rounded-full"
      />

      {/* border glow */}
      <View
        className="absolute inset-0 rounded-full"
        style={{
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.6)",
        }}
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isDark, theme } = useTheme();

  /* FAB Animation */
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        /* icon colors adapt */
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280",

       tabBarStyle: {
  position: "absolute",
  backgroundColor: "transparent",
  borderTopWidth: 0,
  elevation: 0,
  height: 70,
},


        tabBarBackground: () => (
          <TabBarBackground bottom={insets.bottom} isDark={isDark} />
        ),
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
<Tabs.Screen
  name="transactions"
  options={{
    href: null,
    // tabBarButton: () => null,
  }}
/>


      {/* Report */}
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* CENTER FAB */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <Animated.View
              style={{
                transform: [{ scale }],
                top: -15,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/add")}
                onPressIn={pressIn}
                onPressOut={pressOut}
                className="w-14 h-14 rounded-full justify-center items-center"
                style={{
                  backgroundColor: theme.primary,

                  /* glow adaptive */
                  shadowColor: theme.primary,
                  shadowOpacity: isDark ? 0.7 : 0.4,
                  shadowRadius: isDark ? 18 : 12,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 18,
                }}
              >
                <Ionicons name="add" size={30} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          ),
        }}
      />

      {/* Planner */}
      <Tabs.Screen
        name="planner"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
             name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
  name="createplanner"
  options={{
    href: null,

  }}
/>
      <Tabs.Screen
  name="status"
  options={{
    href: null,

  }}
/>

      
    </Tabs>
  );
}

