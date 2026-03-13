import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://192.168.10.35:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------- REQUEST INTERCEPTOR ---------------- */

API.interceptors.request.use(
  async (config) => {

    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

API.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (error.response?.status === 401) {

      await AsyncStorage.removeItem("token");

      console.log("Token expired → logged out");

    }

    return Promise.reject(error);
  }
);

export default API;