import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width } = Dimensions.get("window");
const BASE_URL = "http://localhost:8000"; // ⚠ change to your IP

export default function AuthScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width * 0.9 - 60) / 2],
  });

const handleAuth = async () => {
  try {
    const endpoint = isLogin ? "login" : "signup";

    const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isLogin
          ? { email, password }
          : { name, email, password }
      ),
    });

    const data = await response.json();

    if (response.ok) {
      if (isLogin) {
        // 🔥 STORE TOKEN
        await AsyncStorage.setItem("token", data.access_token);

        Alert.alert("Success 🎉", "Login Successfully!");

        router.replace("/dashboard");
      } else {
        Alert.alert("Success 🎉", "Signup Successfully! Please Login.");
        setIsLogin(true);
      }
    } else {
      Alert.alert("Error ❌", data.detail || "Something went wrong");
    }
  } catch (error) {
    Alert.alert("Network Error ❌", "Check your backend server");
  }
};

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </Text>

        {/* Switch Tabs */}
        <View style={styles.switchContainer}>
          <Animated.View
            style={[
              styles.slider,
              { transform: [{ translateX: slideInterpolate }] },
            ]}
          />

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsLogin(true);
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
              }).start();
            }}
          >
            <Text style={styles.switchText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsLogin(false);
              Animated.timing(slideAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: false,
              }).start();
            }}
          >
            <Text style={styles.switchText}>Signup</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        {!isLogin && (
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isLogin ? "Login" : "Signup"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: width * 0.9,
    padding: 30,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
    marginBottom: 25,
    overflow: "hidden",
    position: "relative",
  },
  switchBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  switchText: { color: "#fff", fontWeight: "600" },
  slider: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#4facfe",
    borderRadius: 50,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    color: "#fff",
  },
  button: {
    backgroundColor: "#4facfe",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
