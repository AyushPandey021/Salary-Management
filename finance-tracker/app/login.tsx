import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../src/services/api";
import Toast from "react-native-toast-message";

export default function AuthScreen() {

  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validate = () => {

    if (mode === "signup" && !name.trim()) {
      Toast.show({
        type: "error",
        text1: "Name required"
      });
      return false;
    }

    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email required"
      });
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email format"
      });
      return false;
    }

    if (!password) {
      Toast.show({
        type: "error",
        text1: "Password required"
      });
      return false;
    }

    if (password.length < 3) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 6 characters"
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
        password
      });

      Toast.show({
        type: "success",
        text1: "Account created successfully 🎉"
      });

    } else {

      res = await API.post("/auth/login", {
        email,
        password
      });

      Toast.show({
        type: "success",
        text1: "Login successful ✅"
      });
    }

    const token = res.data.token || res.data.access_token;

    if (token) {
      await AsyncStorage.setItem("token", token);
    }

    setTimeout(() => {
      router.replace("/(tabs)/dashboard");
    }, 1200);

  } catch (error: any) {

    console.log("AUTH ERROR:", error?.response?.data);

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      "Authentication failed";

    Toast.show({
      type: "error",
      text1: message
    });
  }
};

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Finance Tracker</Text>

      <View style={styles.switchContainer}>

        <TouchableOpacity
          style={[styles.switchBtn, mode === "login" && styles.active]}
          onPress={() => setMode("login")}
        >
          <Text style={styles.switchText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, mode === "signup" && styles.active]}
          onPress={() => setMode("signup")}
        >
          <Text style={styles.switchText}>Signup</Text>
        </TouchableOpacity>

      </View>

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
        placeholderTextColor="#94a3b8"
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#94a3b8"
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {mode === "login" ? "Login" : "Create Account"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    padding:25,
    backgroundColor:"#0f172a"
  },

  title:{
    fontSize:28,
    fontWeight:"bold",
    color:"white",
    marginBottom:30,
    textAlign:"center"
  },

  switchContainer:{
    flexDirection:"row",
    backgroundColor:"#1e293b",
    borderRadius:12,
    marginBottom:25
  },

  switchBtn:{
    flex:1,
    padding:12,
    alignItems:"center"
  },

  active:{
    backgroundColor:"#22c55e",
    borderRadius:12
  },

  switchText:{
    color:"white",
    fontWeight:"600"
  },

  input:{
    backgroundColor:"#1e293b",
    padding:15,
    borderRadius:10,
    marginBottom:15,
    color:"white"
  },

  button:{
    backgroundColor:"#22c55e",
    padding:16,
    borderRadius:10,
    alignItems:"center"
  },

  buttonText:{
    color:"white",
    fontWeight:"bold"
  }

});