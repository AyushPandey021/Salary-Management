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

export default function Settings() {
  const [isDark, setIsDark] = useState(false);
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

  const theme = {
    background: isDark ? "#121212" : "#f4f6fb",
    card: isDark ? "#1E1E1E" : "#ffffff",
    text: isDark ? "#ffffff" : "#333333",
    subText: isDark ? "#aaaaaa" : "#777777",
  };

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("token");

    try {
      const userRes = await fetch(
        "http://localhost:8000/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const userData = await userRes.json();
      setUser(userData);

      const transRes = await fetch(
        "http://localhost:8000/transactions/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    Alert.alert("Logged Out");
  };

  const clearData = async () => {
    Alert.alert(
      "Clear All Data?",
      "This action cannot be undone.",
      [
        { text: "Cancel" },
        {
          text: "Confirm",
          onPress: () => console.log("Call backend delete"),
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.background }}>

      {/* Header */}
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        className="pt-14 pb-7 px-5 rounded-b-3xl"
      >
        <Text className="text-white text-2xl font-bold">
          Settings
        </Text>
      </LinearGradient>

      {/* Profile */}
      <View className="mx-5 mt-5 p-5 rounded-2xl shadow" style={{ backgroundColor: theme.card }}>
        {loading ? (
          <ActivityIndicator size="large" color="#7C5CFC" />
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="person-circle-outline" size={60} color="#7C5CFC" />
            <View className="ml-4">
              <Text className="text-lg font-bold" style={{ color: theme.text }}>
                {user?.name}
              </Text>
              <Text style={{ color: theme.subText }}>
                {user?.email}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats */}
      <View className="mx-5 mt-5 p-5 rounded-2xl shadow" style={{ backgroundColor: theme.card }}>
        <Text className="font-bold mb-2" style={{ color: theme.text }}>
          Account History
        </Text>

        <Text style={{ color: theme.subText }}>
          Total Transactions: {stats.totalTransactions}
        </Text>
        <Text className="text-green-500">
          Total Income: ₹ {stats.income}
        </Text>
        <Text className="text-red-500">
          Total Expense: ₹ {stats.expense}
        </Text>
        <Text className="text-purple-600">
          Total Investment: ₹ {stats.investment}
        </Text>
      </View>

      {/* Dark Mode */}
      <View className="mx-5 mt-5 p-5 rounded-2xl shadow" style={{ backgroundColor: theme.card }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Ionicons name="moon-outline" size={22} color="#7C5CFC" />
            <Text className="ml-3" style={{ color: theme.text }}>
              Dark Mode
            </Text>
          </View>
          <Switch value={isDark} onValueChange={() => setIsDark(!isDark)} />
        </View>
      </View>

      {/* Preferences */}
      <View className="mx-5 mt-5 p-5 rounded-2xl shadow" style={{ backgroundColor: theme.card }}>
        <View className="flex-row justify-between items-center mb-3">
          <Text style={{ color: theme.text }}>Notifications</Text>
          <Switch value={notifications} onValueChange={() => setNotifications(!notifications)} />
        </View>

        <View className="flex-row justify-between items-center">
          <Text style={{ color: theme.text }}>Monthly Reminder</Text>
          <Switch value={reminder} onValueChange={() => setReminder(!reminder)} />
        </View>
      </View>

      {/* Security */}
      <View className="mx-5 mt-5 p-5 rounded-2xl shadow" style={{ backgroundColor: theme.card }}>
        <TouchableOpacity className="flex-row items-center py-2.5">
          <Ionicons name="key-outline" size={20} color="#7C5CFC" />
          <Text className="ml-3" style={{ color: theme.text }}>
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-2.5" onPress={clearData}>
          <Ionicons name="trash-outline" size={20} color="#FF5C5C" />
          <Text className="ml-3 text-red-500">
            Clear All Data
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="bg-red-500 mx-5 mt-6 mb-10 p-4 rounded-2xl items-center"
        onPress={logout}
      >
        <Text className="text-white font-bold">
          Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
