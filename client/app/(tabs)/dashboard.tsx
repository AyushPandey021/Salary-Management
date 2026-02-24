import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
export default function Dashboard() {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, isDark } = useTheme();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const [lastTap, setLastTap] = useState(0);


  function generateMonths(year) {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(year, i).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    );
  }
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    investment: 0,
    balance: 0,
  });

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch("http://192.168.10.48:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUser(data);

    } catch (error) {
      console.log("User fetch error", error);
    }
  };

  const [months, setMonths] = useState(generateMonths(currentYear));
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  // useEffect(() => {
  //   const newMonths = generateMonths(selectedYear);
  //   setMonths(newMonths);

  //   // Auto-select same month index when year changes
  //   const monthIndex = new Date().getMonth();
  //   setSelectedMonth(newMonths[monthIndex]);
  // }, [selectedYear]);
useEffect(() => {
  const newMonths = generateMonths(selectedYear);
  setMonths(newMonths);

  // Preserve same month name when year changes
  const currentMonthName = selectedMonth.split(" ")[0];

  const matchedMonth = newMonths.find((m) =>
    m.startsWith(currentMonthName)
  );

  if (matchedMonth) {
    setSelectedMonth(matchedMonth);
  } else {
    setSelectedMonth(newMonths[0]);
  }

}, [selectedYear]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [investment, setInvestment] = useState(0);

  const [transactions, setTransactions] = useState([]);





  const balance = income - expense - investment;
  const BASE_URL = "http://192.168.10.48:8000"; // CHANGE IP
const filteredTransactions = Array.isArray(transactions)
  ? transactions.filter((t) => {
      const d = new Date(t.created_at);

      const monthLabel = d.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      return monthLabel === selectedMonth;
    })
  : [];
  useEffect(() => {
    let income = 0;
    let expense = 0;
    let investment = 0;

    filteredTransactions.forEach((t) => {
      if (t.type === "Income") income += Number(t.amount);
      if (t.type === "Expense") expense += Number(t.amount);
      if (t.type === "Investment") investment += Number(t.amount);
    });

    setSummary({
      income,
      expense,
      investment,
      balance: income - expense - investment,
    });

  }, [selectedMonth, transactions]);
  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      // 🔹 summary (cards + balance)
      const summaryRes = await fetch(`${BASE_URL}/transactions/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      // 🔹 recent 4 transactions
      const recentRes = await fetch(`${BASE_URL}/transactions/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const recentData = await recentRes.json();
      setRecentTransactions(recentData);

    } catch (e) {
      console.log("Dashboard error:", e);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/transactions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTransactions(data);

    } catch (e) {
      console.log("Transaction fetch error:", e);
    }
  };




  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
      fetchUser();
      fetchTransactions();
    }, [])
  );


  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>

      {/* Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#1a253f", "#232947"]   // dark gradient
            : ["#8E67FF", "#5F6BFF"]   // light gradient
        }
        className="pt-4 pb-8 px-2 rounded-b-[35px]"
      >

        {/* Top row */}
        <View className="flex-row justify-between items-center">





          <TouchableOpacity
            onPress={() => setShowMonthDropdown(true)}
            className="flex-row items-center bg-white/20 px-4 py-2 rounded-full"
          >
            <Ionicons name="calendar-outline" size={18} color="white" />
            <Text className="text-white ml-2 font-semibold">
              {selectedMonth}
            </Text>
          </TouchableOpacity>
          {/* Profile */}
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            className="w-11 h-11 bg-white rounded-full items-center justify-center" style={{ backgroundColor: theme.card }}
          >
            <Text className="font-bold text-indigo-500 text-lg" style={{ color: theme.primary }} >
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </TouchableOpacity>



        </View>

        {/* Balance */}
    <View style={{ alignItems: "center", marginTop: 15 }}>

  {/* Label */}
  <Text
    style={{
      color: "rgba(255,255,255,0.75)",
      fontSize: 11,
      letterSpacing: 1,
      fontWeight: "500",
      textTransform: "uppercase",
    }}
  >
    Current Balance
  </Text>

  {/* Amount */}
  <Text
    style={{
      color: "#fff",
      fontSize: 32,
      fontWeight: "800",
      marginTop: 6,
      letterSpacing: 1,
    }}
  >
    {/* ₹ {summary.balance.toLocaleString()} */}
  </Text>

  {/* Sub Info Row */}
  <View
    style={{
      flexDirection: "row",
      marginTop: 5,
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.15)",
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    }}
  >
    <Ionicons
      name="wallet-outline"
      size={14}
      color="#fff"
      style={{ marginRight: 6 }}
    />
    <Text
      style={{
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
      }}
    >
      Updated this month
    </Text>
  </View>

</View>

      </LinearGradient>


      {/* Body */}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item._id}
        style={{ flex: 1 }}   // ⭐ IMPORTANT
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}


        ListHeaderComponent={
          <>
            <Text className="text-sm font-semibold mb-1" style={{ color: theme.text }}>
              Overview
            </Text>

            {/* Cards */}
            {/* STATS CARDS */}

            {/* Row 1 */}
            <View className="flex-row gap-3 px-1 mt-1">

              {/* Income */}
              <View className="flex-1 bg-white rounded-2xl py-1 px-3 shadow-sm" style={{
                backgroundColor: theme.card,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}>
                <View className="items-center">

                 <View
  className="rounded-2xl mb-2"
  style={{
    shadowColor: "#22c55e",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }}
>
  <LinearGradient
    colors={["#4ade80", "#16a34a"]}
    className="p-2 rounded-2xl items-center justify-center"
  >
    <Ionicons name="arrow-down" size={18} color="#fff" />
  </LinearGradient>
</View>

                  <Text className="text-[11px] text-gray-500">Income</Text>

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    className="text-green-600  text-[15px] font-semibold mt-1">
                    ₹ {summary.income}
                  </Text>

                </View>
              </View>

              {/* Expense */}
              <View className="flex-1 bg-white rounded-2xl py-1 px-2 shadow-sm" style={{
                backgroundColor: theme.card,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}>
                <View className="items-center">

                <View
  className="rounded-2xl mb-2"
  style={{
    shadowColor: "#ef4444",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }}
>
  <LinearGradient
    colors={["#f87171", "#dc2626"]}
    className="p-2 rounded-2xl items-center justify-center"
  >
    <Ionicons name="arrow-up" size={18} color="#fff" />
  </LinearGradient>
</View>

                  <Text className="text-[11px] text-gray-500">Expense</Text>

                  <Text numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6} className="text-red-500 text-[15px] font-semibold mt-1">
                    ₹ {summary.expense}
                  </Text>

                </View>
              </View>

              {/* Investment */}
              <View numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6} className="flex-1 bg-white rounded-2xl py-1 px-2 shadow-sm" style={{
                  backgroundColor: theme.card,
                  shadowColor: "#000",
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}>
                <View className="items-center">

                  <View
  className="rounded-2xl mb-2"
  style={{
    shadowColor: "#3b82f6",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  }}
>
  <LinearGradient
    colors={["#60a5fa", "#2563eb"]}
    className="p-2 rounded-2xl items-center justify-center"
  >
    <Ionicons name="trending-up" size={18} color="#fff" />
  </LinearGradient>
</View>

                  <Text className="text-[11px] text-gray-500">Invest</Text>

                  <Text className="text-blue-600 text-[15px] font-semibold mt-1">
                    ₹ {summary.investment}
                  </Text>

                </View>
              </View>

            </View>





            <View className="flex-row justify-between items-center mt-2 mb-2 px-1">

              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Recent Transactions
              </Text>

              <View className="flex-row justify-between items-center mt-3 mb-2 px-1">



                <TouchableOpacity
                  onPress={() => router.push("/transactions")} className="flex-row items-center"
                >
                  <Text className="text-indigo-600 font-semibold   mr-1" style={{ color: theme.text, color: "#6366f1" }}>
                    View All
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#6366f1" />
                </TouchableOpacity>

              </View>



            </View>





          </>
        }

        renderItem={({ item }) => {

          const isIncome = item.type === "Income";
          const isExpense = item.type === "Expense";
          const isInvestment = item.type === "Investment";

          const amountColor =
            isIncome ? "text-green-500" :
              isExpense ? "text-red-500" :
                "text-blue-500";

          const iconName =
            isIncome ? "arrow-down-circle" :
              isExpense ? "arrow-up-circle" :
                "trending-up";

          const iconBg =
            isIncome ? "bg-green-100" :
              isExpense ? "bg-red-100" :
                "bg-blue-100";

          const iconColor =
            isIncome ? "#16a34a" :
              isExpense ? "#ef4444" :
                "#2563eb";

          const tagColor =
            isIncome ? "bg-green-50 text-green-600" :
              isExpense ? "bg-red-50 text-red-600" :
                "bg-blue-50 text-blue-600";

          const formattedDate = item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "";

          return (
            <TouchableOpacity
              onPress={() => {
                const now = Date.now();
                if (lastTap && now - lastTap < 300) {
                  router.push({
                    pathname: "/(tabs)/add",
                    params: { edit: JSON.stringify(item) },
                  });
                }
                setLastTap(now);
              }}
              className="rounded-2xl px-2 py-2 mb-2"
              style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }}
            >


              <View className="flex-row items-center justify-between">

                {/* LEFT ICON */}
                <View className={`w-9 h-9 rounded-full items-center justify-center mr-2 ${iconBg}`}>
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>

                {/* CENTER CONTENT */}
                <View className="flex-1">

                  {/* TITLE */}
                  <Text
                    numberOfLines={1}
                    className="font-semibold text-gray-800 text-[12px]" style={{ color: theme.text }}
                  >
                    {item.title}
                  </Text>

                  {/* TAG + DATE (same line) */}
                  <View className="flex-row items-center mt-1 flex-wrap" >

                    {item.tag && (
                      <View className={`px-2 py-[2px] rounded-full mr-2 ${tagColor}`}>
                        <Text className="text-[10px] font-semibold" >
                          {item.tag}
                        </Text>
                      </View>
                    )}

                    {formattedDate !== "" && (
                      <Text className="text-[11px] " style={{ color: theme.subText }}
                      >
                        {formattedDate}
                      </Text>
                    )}

                  </View>
                </View>

                {/* AMOUNT RIGHT */}
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                  className={`text-[15px] font-semibold ml-2 ${amountColor}`}
                >
                  ₹ {item.amount}
                </Text>

              </View>
            </TouchableOpacity>
          );
        }}


      />

      {/* Month & Year Selector */}
      <Modal visible={showMonthDropdown} transparent animationType="slide">

        <View className="flex-1 justify-end bg-black/30">

          {/* Bottom Sheet */}
          <View className="bg-white rounded-t-3xl pt-3 pb-6 px-5 max-h-[70%]">

            {/* drag handle */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

            {/* HEADER */}
            <View className="flex-row items-center justify-between mb-4">

              {/* close */}
              <TouchableOpacity onPress={() => setShowMonthDropdown(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>

              {/* year */}
              <View className="flex-row items-center">

                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear - 1)}
                  className="p-2"
                >
                  <Ionicons name="chevron-back" size={20} color="#555" />
                </TouchableOpacity>

                <Text className="font-semibold text-base mx-2">
                  {selectedYear}
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedYear(selectedYear + 1)}
                  className="p-2"
                >
                  <Ionicons name="chevron-forward" size={20} color="#555" />
                </TouchableOpacity>

              </View>

              {/* spacer for balance */}
              <View className="w-6" />

            </View>

            {/* MONTH LIST */}
            <FlatList
              data={months}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {

                const isSelected = item === selectedMonth;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMonth(item);
                      setShowMonthDropdown(false);
                    }}
                    className={`py-3 px-4 mb-2 rounded-xl ${isSelected
                      ? "bg-indigo-500"
                      : "bg-gray-50"
                      }`}
                  >
                    <Text
                      className={`text-center font-medium ${isSelected
                        ? "text-white"
                        : "text-gray-700"
                        }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

          </View>
        </View>
      </Modal>


    </View>
  );
}
