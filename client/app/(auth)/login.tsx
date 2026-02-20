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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import logo from "MyFirstApp\assets\images\trackpay.png";

const BASE_URL = "http://localhost:8000";

export default function AuthScreen() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 140],
  });

  const switchTab = (login) => {
    setIsLogin(login);
    Animated.timing(slideAnim, {
      toValue: login ? 0 : 1,
      duration: 350,
      useNativeDriver: false,
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
          Alert.alert("Signup Successful 🎉", "Now login to continue");
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
      className="flex-1 justify-center items-center px-6"
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="w-full items-center"
      >
      {/* Logo   */}
        <Image
          source={logo}
        
          className="w-20 h-20 mb-6"
          resizeMode="contain"
        />
      

  
        {/* Card */}
        <View className="w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl">

          <Text className="text-white text-2xl font-bold text-center mb-5">
            {isLogin ? "Welcome Back " : "Create Account "}
          </Text>

          {/* Switch */}
          <View className="flex-row bg-white/20 rounded-full mb-6 relative overflow-hidden">

            <Animated.View
              style={{ transform: [{ translateX: slideInterpolate }] }}
              className="absolute w-1/2 h-full bg-white rounded-full"
            />

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

          {/* Inputs */}
          {!isLogin && (
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#ddd"
              className="bg-white/20 text-white p-4 rounded-xl mb-4"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#ddd"
            className="bg-white/20 text-white p-4 rounded-xl mb-4"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#ddd"
            secureTextEntry
            className="bg-white/20 text-white p-4 rounded-xl mb-2"
            value={password}
            onChangeText={setPassword}
          />

          {/* Button */}
          <TouchableOpacity
            onPress={handleAuth}
            className="bg-white py-4 rounded-xl items-center mt-4"
          >
            <Text className="text-indigo-600 font-bold text-lg">
              {isLogin ? "Login" : "Signup"}
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
