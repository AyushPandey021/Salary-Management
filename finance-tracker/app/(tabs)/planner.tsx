import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useTheme } from "../../src/context/ThemeContext";

export default function Planner() {
  const { theme, isDark } = useTheme();

  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * -15 },
      { scale: 1 + float.value * 0.03 },
    ],
  }));

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#0f172a", "#020617", "#0f172a"]
          : ["#f3f5fa", "#eaeaf3", "#f3f5f9"]
      }
      style={styles.container}
    >
      {/* Glow Effects */}
      <View
        style={[
          styles.glow1,
          { backgroundColor: theme.primary + "40" },
        ]}
      />
      <View
        style={[
          styles.glow2,
          { backgroundColor: "#06b6d440" },
        ]}
      />

      {/* Floating Card */}
      <Animated.View style={[styles.cardWrapper, floatingStyle]}>
        <BlurView
          intensity={60}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.card,
            {
              backgroundColor: theme.card + "CC",
              borderColor: theme.border,
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Ionicons name="rocket-outline" size={40} color={theme.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>
            Planner
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: theme.subText }]}>
            This feature is currently in progress 🚧
          </Text>

          {/* Gradient Line */}
          <LinearGradient
            colors={[theme.primary, "#06b6d4"]}
            style={styles.line}
          />

          {/* Description */}
          <Text style={[styles.desc, { color: theme.subText }]}>
            We're building something powerful for your financial planning.
          </Text>
        </BlurView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  glow1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.25,
    top: -60,
    left: -60,
  },

  glow2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 150,
    opacity: 0.25,
    bottom: -60,
    right: -60,
  },

  cardWrapper: {
    width: "85%",
  },

  card: {
    padding: 25,
    borderRadius: 24,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  iconContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },

  line: {
    width: 80,
    height: 3,
    borderRadius: 2,
    marginBottom: 15,
  },

  desc: {
    textAlign: "center",
    fontSize: 13,
  },
});