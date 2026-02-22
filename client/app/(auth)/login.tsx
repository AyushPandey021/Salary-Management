import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Animated,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "../../assets/t.jpg";

const { width } = Dimensions.get("window");
const BASE_URL = "http://localhost:8000"; // change IP if needed

export default function AuthScreen() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  /* dynamic slider width */
  const TAB_WIDTH = width * 0.7 / 2;

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (login:boolean) => {
    setIsLogin(login);
    Animated.spring(slideAnim, {
      toValue: login ? 0 : TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  };

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? "login" : "signup";

      const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email, password }
            : { name, email, password }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          await AsyncStorage.setItem("token", data.access_token);
          router.replace("/dashboard");
        } else {
          Alert.alert("Signup Successful 🎉", "Please Login");
          switchTab(true);
        }
      } else {
        Alert.alert("Error ❌", data.detail || "Invalid credentials");
      }

    } catch {
      Alert.alert("Server Error ❌", "Check backend connection");
    }
  };

  return (
    <LinearGradient
      colors={["#5F6BFF", "#8E67FF"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6"
      >

        {/* LOGO */}
        <View className="items-center mb-2">
          <View className="w-26 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <Image
              source={logo}
              style={{ width: 62, height: 42 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-white text-2xl font-bold mt-3">
            TrackPa<span className="text-purple-500">Y</span>
          </Text>

          <Text className="text-white/80 text-sm mt-1">
            Manage your money smartly
          </Text>
        </View>

        {/* CARD */}
        <View className="bg-white/15 rounded-3xl p-6">

          {/* SWITCH */}
          <View
            style={{ width: width * 0.7 }}
            className="self-center bg-white/20 rounded-full mb-6 overflow-hidden"
          >
            <Animated.View
              style={{
                width: TAB_WIDTH,
                transform: [{ translateX: slideAnim }],
              }}
              className="absolute h-full bg-white rounded-full"
            />

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 py-3 items-center"
                onPress={() => switchTab(true)}
              >
                <Text className={`font-semibold ${isLogin ? "text-indigo-600" : "text-white"}`}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 items-center"
                onPress={() => switchTab(false)}
              >
                <Text className={`font-semibold ${!isLogin ? "text-indigo-600" : "text-white"}`}>
                  Signup
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* INPUTS */}
          {!isLogin && (
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#e5e7eb"
              className="bg-white/20 text-white p-4 rounded-xl mb-4"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#e5e7eb"
            className="bg-white/20 text-white p-4 rounded-xl mb-4"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#e5e7eb"
            secureTextEntry
            className="bg-white/20 text-white p-4 rounded-xl"
            value={password}
            onChangeText={setPassword}
          />

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleAuth}
            className="bg-white py-4 rounded-xl items-center mt-5"
          >
            <Text className="text-indigo-600 font-bold text-lg">
              {isLogin ? "Login" : "Create Account"}
            </Text>
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
