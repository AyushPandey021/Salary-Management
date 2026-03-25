import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../src/services/api";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const scale = useSharedValue(1);
  const switchAnim = useSharedValue(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleMode = (m: string) => {
    setMode(m);
    switchAnim.value = withTiming(m === "login" ? 0 : 1, { duration: 400 });
  };

  const animatedSwitch = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(switchAnim.value, [0, 1], [0, 140]),
        },
      ],
    };
  });

  const pressIn = () => {
    scale.value = withSpring(0.95);
  };

  const pressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const validate = () => {
    if (mode === "signup" && !name.trim()) {
      Toast.show({ type: "error", text1: "Name required" });
      return false;
    }

    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Email required" });
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      Toast.show({ type: "error", text1: "Invalid email format" });
      return false;
    }

    if (!password) {
      Toast.show({ type: "error", text1: "Password required" });
      return false;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      let res;

      if (mode === "signup") {
        res = await API.post("/auth/register", {
          name,
          email,
          password,
        });

        Toast.show({
          type: "success",
          text1: "Account created 🎉",
        });
      } else {
        res = await API.post("/auth/login", {
          email,
          password,
        });

        Toast.show({
          type: "success",
          text1: "Login successful ✅",
        });
      }

      const token =
        res.data.token ||
        res.data.access_token ||
        res.data.jwt ||
        res.data.data?.token;

      if (token) {
        await AsyncStorage.setItem("token", token);
      }

      setTimeout(() => {
        router.replace("/(tabs)/dashboard");
      }, 1200);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Authentication failed";

      Toast.show({
        type: "error",
        text1: message,
      });
    }
  };

  return (
    <LinearGradient
      colors={["#ececec", "#f2ecec", "#f2ebeb"]}
      style={styles.container}
    >
      {/* Floating Glow */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      {/* Logo */}
      <Animated.View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/t.jpg")} // 👈 your logo
          style={styles.logo }
        />
     
      </Animated.View>

      {/* Glass Card */}
      <BlurView intensity={40} tint="dark" style={styles.card}>
        {/* Switch */}
        <View style={styles.switchContainer}>
          <Animated.View style={[styles.switchHighlight, animatedSwitch]} />

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => toggleMode("login")}
          >
            <Text style={styles.switchText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => toggleMode("signup")}
          >
            <Text style={styles.switchText}>Signup</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        {mode === "signup" && (
          <TextInput
            placeholder="Name"
            style={styles.input}
            placeholderTextColor="#94a3b8"
            onChangeText={setName}
          />
        )}

        <TextInput
          placeholder="Email"
          style={styles.input}
          placeholderTextColor="#adaeb0"
          onChangeText={setEmail}
        />

   
<View
  style={[
    styles.passwordContainer,
    isFocused && styles.passwordFocused
  ]}
>
  {/* Lock Icon */}
  <Ionicons name="lock-closed-outline" size={18} color="#64748b" />

  <TextInput
    placeholder="Password"
    secureTextEntry={!showPassword}
    style={styles.passwordInput}
    placeholderTextColor="#94a3b8"
    onChangeText={setPassword}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
  />

  {/* Eye Toggle */}
  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
    style={styles.eyeButton}
  >
    <Ionicons
      name={showPassword ? "eye-off" : "eye"}
      size={20}
      color={showPassword ? "#8a4bf6" : "#64748b"}
    />
  </TouchableOpacity>
</View>

        {/* Button */}
        <Animated.View style={animatedButton}>
          <TouchableOpacity
            style={styles.button}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={["#aa8ddd", "#8ee3f2"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {mode === "login" ? "Login" : "Create Account"}
              </Text>
            </LinearGradient>
           
          </TouchableOpacity>
        </Animated.View>
        
      </BlurView>
   <Text style={styles.tagline}>Created by ApDev • Track Smart. Pay Better.</Text>
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
    backgroundColor: "#8a4bf6",
    borderRadius: 150,
    opacity: 0.2,
    top: -50,
    left: -50,
  },

  glow2: {
    position: "absolute",
    width: 250,
    height: 250,
    backgroundColor: "#06b6d4",
    borderRadius: 150,
    opacity: 0.2,
    bottom: -50,
    right: -50,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 200 ,
    height:200,
    borderRadius: 20,
    marginBottom: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "gray",
  },
passwordContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#ffffff",
  borderRadius: 14,
  marginBottom: 15,
  paddingHorizontal: 12,
  borderWidth: 1.2,
  borderColor: "#e2e8f0",

  // depth
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 3,
},

passwordFocused: {
  borderColor: "#8a4bf6",

  shadowColor: "#8a4bf6",
  shadowOpacity: 0.3,
  shadowRadius: 10,
},

passwordInput: {
  flex: 1,
  padding: 14,
  color: "#0f172a",
  fontSize: 15,
},

eyeButton: {
  padding: 6,
  borderRadius: 10,
  backgroundColor: "#f1f5f9",
},
  card: {
    width: "90%",
    padding: 20,
    borderRadius: 20,
    overflow: "hidden",
  },

  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#ebeef2",
    borderRadius: 12,
    marginBottom: 20,
    position: "relative",
  },

  switchHighlight: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#995ffd",
    borderRadius: 12,
  },

  switchBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },

  switchText: {
    color: "black",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#f2f5fc",
    color:"black",
        padding: 15,
    borderRadius: 12,
    marginBottom: 15,

    borderWidth: 1,
    borderColor: "#dddfe2",
  },

  button: {
    borderRadius: 12,
    overflow: "hidden",
  },

  buttonGradient: {
    padding: 16,
    alignItems: "center",
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  tagline: {
  position: "absolute",
  bottom: 30,
  fontSize: 12,
  color: "#94a3b8",
  letterSpacing: 1,
  textAlign: "center"
}
});
