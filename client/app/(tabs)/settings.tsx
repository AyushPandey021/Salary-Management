import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { router, useFocusEffect } from "expo-router";

export default function Settings() {

  const { theme, isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalTransactions: 0,
    income: 0,
    expense: 0,
    investment: 0,
  });

  const [period, setPeriod] = useState("Monthly");
  const [transactionsCache, setTransactionsCache] = useState([]);

  /* ---------------- LOAD CACHE FIRST ---------------- */

  const loadCache = async () => {
    const cachedUser = await AsyncStorage.getItem("cached_user");
    const cachedTransactions = await AsyncStorage.getItem("cached_transactions");


    if (cachedUser) setUser(JSON.parse(cachedUser));
    if (cachedTransactions) setTransactionsCache(JSON.parse(cachedTransactions));


  };

  /* ---------------- FETCH DATA ONCE ---------------- */

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;


      // USER
      const userRes = await fetch("http://192.168.10.48:8000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);
      await AsyncStorage.setItem("cached_user", JSON.stringify(userData));

      // TRANSACTIONS
      const transRes = await fetch("http://192.168.10.48:8000/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allTransactions = await transRes.json();

      setTransactionsCache(allTransactions);
      await AsyncStorage.setItem("cached_transactions", JSON.stringify(allTransactions));

    } catch (e) {
      console.log("Fetch error", e);
    } finally {
      setLoading(false);
    }


  };

  /* ---------------- CALCULATE STATS ---------------- */

  const calculateStats = useCallback(() => {


    if (!transactionsCache.length) return;

    const now = new Date();
    let filtered = [...transactionsCache];

    if (period === "Today") {
      filtered = filtered.filter(t =>
        new Date(t.created_at).toDateString() === now.toDateString()
      );
    }

    if (period === "Weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(t => new Date(t.created_at) >= weekAgo);
    }

    if (period === "Monthly") {
      filtered = filtered.filter(t =>
        new Date(t.created_at).getMonth() === now.getMonth() &&
        new Date(t.created_at).getFullYear() === now.getFullYear()
      );
    }

    let income = 0, expense = 0, investment = 0;

    filtered.forEach(item => {
      if (item.type === "Income") income += item.amount;
      if (item.type === "Expense") expense += item.amount;
      if (item.type === "Investment") investment += item.amount;
    });

    setStats({
      totalTransactions: filtered.length,
      income,
      expense,
      investment,
    });


  }, [transactionsCache, period]);

  /* ---------------- LIFE CYCLE ---------------- */

  useEffect(() => {
    loadCache();
    fetchData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  /* ---------------- LOGOUT ---------------- */

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "token",
      "cached_user",
      "cached_transactions",
    ]);
    router.replace("/(auth)/login");
  };

  /* ---------------- CLEAR DATA ---------------- */

  const clearData = () => {
    Alert.alert("Clear All Data?", "This action cannot be undone.", [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          const token = await AsyncStorage.getItem("token");
          await fetch("http://192.168.10.48:8000/transactions/clear", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });


          await AsyncStorage.removeItem("cached_transactions");
          setTransactionsCache([]);
        },
      },
    ]);


  };

  /* ---------------- UI ---------------- */

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>


      <LinearGradient
        colors={isDark ? ["#1a253f", "#232947"] : ["#7C5CFC", "#5F2EEA"]}
        className="pt-16 pb-12 px-6 rounded-b-[40px]"
      >
        <Text className="text-white text-3xl font-bold">My Profile</Text>
        <Text className="text-white/80 mt-1">Manage your account & analytics</Text>
      </LinearGradient>

      <View className="mx-5 -mt-12 rounded-3xl p-5" style={{ backgroundColor: theme.card, elevation: 8 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <View className="flex-row items-center">
            <LinearGradient colors={["#7C5CFC", "#5F2EEA"]} className="w-20 h-20 rounded-full items-center justify-center">
              <Text className="text-white text-3xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </LinearGradient>

            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold" style={{ color: theme.text }}>
                {user?.name}
              </Text>
              <Text style={{ color: theme.subText }}>{user?.email}</Text>
            </View>

            <TouchableOpacity onPress={logout} className="p-3 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* ---------------- PERIOD FILTER ---------------- */} <View className="mx-5 mt-6">
        <Text className="mb-2 font-semibold" style={{ color: theme.text }}>
          Filter Analytics </Text>

        <View className="flex-row justify-between">
          {["All", "Monthly", "Weekly", "Today"].map(p => {
            const active = period === p;

           
  return (
    <TouchableOpacity
      key={p}
      onPress={() => setPeriod(p)}
      className="px-4 py-2 rounded-full"
      style={{
        backgroundColor: active ? theme.primary : theme.card,
        elevation: active ? 5 : 2,
      }}
    >
      <Text
        style={{
          color: active ? "#fff" : theme.text,
          fontWeight: "600"
        }}
      >
        {p}
      </Text>
    </TouchableOpacity>
  );
})}


  </View>
      </View>

      {/* ---------------- TRANSACTION COUNT ---------------- */}
      <View className="mx-5 mt-5 p-4 rounded-2xl" style={{ backgroundColor: theme.card }}>
        <Text style={{ color: theme.subText }}>
          Transactions ({period}) </Text>

        <Text className="text-2xl font-bold" style={{ color: theme.primary }}>
          {stats.totalTransactions} </Text> </View>

      {/* ---------------- MONEY STATS ---------------- */} <View className="mx-5 mt-5 flex-row justify-between">

        <View className="flex-1 mr-2 p-4 rounded-2xl" style={{ backgroundColor: theme.card }}>
          <Text style={{ color: theme.subText }}>Income</Text> <Text className="text-green-500 text-lg font-bold">₹ {stats.income}</Text> </View>

        <View className="flex-1 mx-2 p-4 rounded-2xl" style={{ backgroundColor: theme.card }}>
          <Text style={{ color: theme.subText }}>Expense</Text> <Text className="text-red-500 text-lg font-bold">₹ {stats.expense}</Text> </View>

        <View className="flex-1 ml-2 p-4 rounded-2xl" style={{ backgroundColor: theme.card }}>
          <Text style={{ color: theme.subText }}>Invest</Text> <Text className="text-blue-500 text-lg font-bold">₹ {stats.investment}</Text> </View>

      </View>

      {/* ---------------- DARK MODE ---------------- */}
      <View className="mx-5 mt-6 p-5 rounded-3xl" style={{ backgroundColor: theme.card }}> <View className="flex-row justify-between items-center"> <View className="flex-row items-center">
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={22}
          color={theme.primary}
        />
        <Text className="ml-3 font-semibold" style={{ color: theme.text }}>
          Dark Mode </Text> </View>


        <Switch value={isDark} onValueChange={toggleTheme} />


      </View>
      </View>

      {/* ---------------- SECURITY ---------------- */}
      <View className="mx-5 mt-6 p-5 rounded-3xl" style={{ backgroundColor: theme.card }}>

        <TouchableOpacity className="flex-row items-center py-3">
          <Ionicons name="key-outline" size={20} color={theme.primary} />
          <Text className="ml-3" style={{ color: theme.text }}>
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center py-3"
          onPress={clearData}

        >

          <Ionicons name="trash-outline" size={20} color="#ef4444" />

          <Text className="ml-3 text-red-500">
            Clear All Data
          </Text>


        </TouchableOpacity>

      </View>

      <View className="h-24" />

    </ScrollView>


  );
}
