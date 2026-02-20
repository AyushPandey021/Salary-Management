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
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { router } from "expo-router";

export default function Settings() {

  const { theme, isDark, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [reminder, setReminder] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalTransactions: 0,
    income: 0,
    expense: 0,
    investment: 0,
  });

  /* ---------------- USER + STATS ---------------- */
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const userRes = await fetch("http://192.168.10.35:8081/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await userRes.json();
      setUser(userData);

      const transRes = await fetch("http://192.168.10.35:8081/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const transactions = await transRes.json();

      let income = 0;
      let expense = 0;
      let investment = 0;

      transactions.forEach((item: any) => {
        if (item.type === "Income") income += item.amount;
        if (item.type === "Expense") expense += item.amount;
        if (item.type === "Investment") investment += item.amount;
      });

      setStats({
        totalTransactions: transactions.length,
        income,
        expense,
        investment,
      });

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  };

  /* ---------------- CLEAR DATA ---------------- */
  const clearData = () => {
    Alert.alert(
      "Clear All Data?",
      "This action cannot be undone.",
      [
        { text: "Cancel" },
        { text: "Confirm", onPress: () => console.log("delete backend") },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>

      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#1e293b", "#0f172a"] : ["#7C5CFC", "#5F2EEA"]}
        className="pt-14 pb-10 px-6 rounded-b-[35px]"
      >
        <Text className="text-white text-2xl font-bold">
          Profile & Settings
        </Text>
      </LinearGradient>

      {/* PROFILE CARD */}
      <View
        className="mx-5 -mt-10 rounded-3xl p-5 shadow-xl"
        style={{ backgroundColor: theme.card }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <View className="flex-row items-center">

            {/* Avatar */}
            <View className="w-16 h-16 rounded-full bg-indigo-100 items-center justify-center">
              <Text className="text-indigo-600 text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Name + Email */}
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold" style={{ color: theme.text }}>
                {user?.name}
              </Text>
              <Text style={{ color: theme.subText }}>
                {user?.email}
              </Text>
            </View>

            {/* LOGOUT BUTTON CORNER */}
            <TouchableOpacity
              onPress={logout}
              className="bg-red-100 p-2 rounded-full"
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            </TouchableOpacity>

          </View>
        )}
      </View>

      {/* STATS */}
      <View
        className="mx-5 mt-5 p-5 rounded-3xl shadow"
        style={{ backgroundColor: theme.card }}
      >
        <Text className="font-semibold mb-3" style={{ color: theme.text }}>
          Account Activity
        </Text>

        <View className="flex-row justify-between">
          <Text style={{ color: theme.subText }}>Transactions</Text>
          <Text style={{ color: theme.text }}>{stats.totalTransactions}</Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-green-500">Income</Text>
          <Text className="text-green-500">₹ {stats.income}</Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-red-500">Expense</Text>
          <Text className="text-red-500">₹ {stats.expense}</Text>
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-blue-500">Investment</Text>
          <Text className="text-blue-500">₹ {stats.investment}</Text>
        </View>
      </View>

      {/* DARK MODE */}
      <View
        className="mx-5 mt-5 p-5 rounded-3xl shadow"
        style={{ backgroundColor: theme.card }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={22}
              color={theme.primary}
            />
            <Text className="ml-3 font-medium" style={{ color: theme.text }}>
              Dark Mode
            </Text>
          </View>

          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>
      </View>

      {/* PREFERENCES */}
      <View
        className="mx-5 mt-5 p-5 rounded-3xl shadow"
        style={{ backgroundColor: theme.card }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text style={{ color: theme.text }}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>

        <View className="flex-row justify-between items-center">
          <Text style={{ color: theme.text }}>Monthly Reminder</Text>
          <Switch value={reminder} onValueChange={setReminder} />
        </View>
      </View>

      {/* SECURITY */}
      <View
        className="mx-5 mt-5 p-5 rounded-3xl shadow"
        style={{ backgroundColor: theme.card }}
      >
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
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
          <Text className="ml-3 text-red-500">
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
