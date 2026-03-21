import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "../../src/context/ThemeContext";

export default function TabsLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        // ✅ FIXED BACKGROUND
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.card + "CC", // 👈 KEY FIX
            borderColor: theme.border,
          },
        ],

        // ✅ FIXED BLUR
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="bar-chart" focused={focused} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <FloatingButton {...props} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="wallet" focused={focused} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} theme={theme} />
          ),
        }}
      />

      <Tabs.Screen name="transactions" options={{ href: null }} />
    </Tabs>
  );
}



function TabIcon({ name, focused, theme }: any) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.25 : 1) }],
  }));

  return (
    <Animated.View
      style={[
        styles.iconWrapper,
        focused && {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
          shadowOpacity: 0.6,
          shadowRadius: 10,
        },
        style,
      ]}
    >
      <Ionicons
        name={`${name}${focused ? "" : "-outline"}`}
        size={22}
        color={focused ? "#fff" : theme.subText}
      />
    </Animated.View>
  );
}



function FloatingButton({ theme, ...props }: any) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.fabWrapper, style]}>
     <TouchableOpacity
  onPress={() => {
    router.replace({
      pathname: "/add",
      params: {}, // 🔥 FORCE CLEAR PARAMS
    });
  }}
  onPressIn={() => (scale.value = withSpring(0.9))}
  onPressOut={() => (scale.value = withSpring(1))}
>
        <LinearGradient
          colors={[theme.primary, "#06b6d4"]}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}



const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 5 ,
    left: 5,
    right: 5,
    height: 60,
    borderRadius: 25,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  fabWrapper: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },

  fab: {
    width: 55,
    height: 55,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#6366f1",
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
});