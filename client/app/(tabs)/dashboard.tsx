import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  function generateMonths(year) {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(year, i).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })
    );
  }

  const [months, setMonths] = useState(generateMonths(currentYear));
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [investment, setInvestment] = useState(0);
  const [periodFilter, setPeriodFilter] = useState("month"); // day | week | month
  const [typeFilter, setTypeFilter] = useState("all"); // all | Income | Expense | Investment
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch("http://192.168.10.35:8081/auth/me", {
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
  useEffect(() => {
    let data = [...transactions];
    const now = new Date();

    // TIME FILTER
    if (periodFilter === "day") {
      data = data.filter(t => {
        if (!t.created_at) return false;
        const d = new Date(t.created_at);
        return d.toDateString() === now.toDateString();
      });
    }

    if (periodFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);

      data = data.filter(t => {
        if (!t.created_at) return false;
        return new Date(t.created_at) >= weekAgo;
      });
    }

    // TYPE FILTER
    if (typeFilter !== "all") {
      data = data.filter(t => t.type === typeFilter);
    }


    setFilteredTransactions(data);

  }, [transactions, periodFilter, typeFilter]);

  const balance = income - expense - investment;

  useEffect(() => {
    setMonths(generateMonths(selectedYear));
  }, [selectedYear]);



  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://192.168.10.35:8081/transactions?month=${selectedMonth}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    setTransactions(data);

    let inc = 0, exp = 0, inv = 0;
    data.forEach((item) => {
      if (item.type === "Income") inc += item.amount;
      if (item.type === "Expense") exp += item.amount;
      if (item.type === "Investment") inv += item.amount;
    });

    setIncome(inc);
    setExpense(exp);
    setInvestment(inv);
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  return (
    <View className="flex-1 bg-[#F3F4F8]">

      {/* Header */}
      <LinearGradient
        colors={["#8E67FF", "#5F6BFF"]}
        className="pt-4 pb-8 px-2 rounded-b-[35px]"
      >

        {/* Top row */}
        <View className="flex-row justify-between items-center">




          {/* Month selector */}
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
            className="w-11 h-11 bg-white rounded-full items-center justify-center"
          >
            <Text className="font-bold text-indigo-500 text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </TouchableOpacity>



        </View>

        {/* Balance */}
        <View className="items-center mt-6">
          <Text className="text-white/80 text-sm">
            Current Balance
          </Text>
          <Text className="text-white text-4xl font-bold mt-1">
            ₹ {balance}
          </Text>
        </View>

      </LinearGradient>

      {/* Body */}
      <FlatList
        data={filteredTransactions}

        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}

        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 14, paddingBottom: 150 }}

        ListHeaderComponent={
          <>
            <Text className="text-sm font-semibold mb-1">
              Overview
            </Text>

            {/* Cards */}
            {/* STATS CARDS */}

            {/* Row 1 */}
            <View className="flex-row gap-3 px-1 mt-1">

              {/* Income */}
              <View className="flex-1 bg-white rounded-2xl py-1 px-3 shadow-sm">
                <View className="items-center">

                  <View className="bg-green-100 p-2 rounded-full mb-1">
                    <Ionicons name="arrow-down" size={16} color="#16a34a" />
                  </View>

                  <Text className="text-[11px] text-gray-500">Income</Text>

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    className="text-green-600  text-[15px] font-semibold mt-1">
                    ₹ {income}
                  </Text>

                </View>
              </View>

              {/* Expense */}
              <View className="flex-1 bg-white rounded-2xl py-1 px-2 shadow-sm">
                <View className="items-center">

                  <View className="bg-red-100 p-2 rounded-full mb-1">
                    <Ionicons name="arrow-up" size={16} color="#ef4444" />
                  </View>

                  <Text className="text-[11px] text-gray-500">Expense</Text>

                  <Text numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6} className="text-red-500 text-[15px] font-semibold mt-1">
                    ₹ {expense}
                  </Text>

                </View>
              </View>

              {/* Investment */}
              <View numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6} className="flex-1 bg-white rounded-2xl py-1 px-2 shadow-sm">
                <View className="items-center">

                  <View className="bg-blue-100 p-2 rounded-full mb-1">
                    <Ionicons name="trending-up" size={16} color="#2563eb" />
                  </View>

                  <Text className="text-[11px] text-gray-500">Invest</Text>

                  <Text className="text-blue-600 text-[15px] font-semibold mt-1">
                    ₹ {investment}
                  </Text>

                </View>
              </View>

            </View>





            <View className="flex-row justify-between items-center mt-2 mb-2 px-1">

              <Text className="text-sm font-semibold">
                Recent Transactions
              </Text>

              {/* FILTER BUTTON */}
              <TouchableOpacity
                onPress={() => setShowFilter(true)}
                className="bg-white p-2 rounded-full shadow-sm border border-gray-200"
              >
                <Ionicons name="options-outline" size={16} color="#555" />
              </TouchableOpacity>

            </View>

            {/* FILTER DROPDOWN */}
            <Modal visible={showFilter} transparent animationType="fade">
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowFilter(false)}
                className="flex-1 bg-black/20 justify-start items-end pt-40 pr-2"
              >
                <Modal visible={showFilter} transparent animationType="slide">
                  <View className="flex-1 justify-end bg-black/30">

                    {/* Bottom Sheet */}
                    <View className="bg-white rounded-t-3xl px-5 pt-3 pb-5">

                      {/* drag handle */}
                      <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center mb-3" />

                      {/* TITLE */}
                      <Text className="text-base font-semibold text-center mb-4">
                        Filters
                      </Text>

                      {/* ---------- TIME FILTER ---------- */}
                      <Text className="text-[11px] text-gray-400 mb-2 font-semibold">
                        Time Period
                      </Text>

                      <View className="flex-row justify-between mb-5">

                        {["day", "week", "month"].map(p => (
                          <TouchableOpacity
                            key={p}
                            onPress={() => setPeriodFilter(p)}
                            className={`flex-1 mx-1 py-2 rounded-xl items-center ${periodFilter === p
                                ? "bg-indigo-500"
                                : "bg-gray-100"
                              }`}
                          >
                            <Text className={`text-xs font-semibold ${periodFilter === p ? "text-white" : "text-gray-600"
                              }`}>
                              {p.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}

                      </View>

                      {/* ---------- TYPE FILTER ---------- */}
                      <Text className="text-[11px] text-gray-400 mb-2 font-semibold">
                        Transaction Type
                      </Text>

                      <View className="gap-2 mb-6">

                        {["all", "Income", "Expense", "Investment"].map(type => (
                          <TouchableOpacity
                            key={type}
                            onPress={() => setTypeFilter(type)}
                            className={`py-3 px-3 rounded-xl flex-row justify-between items-center ${typeFilter === type ? "bg-indigo-50" : "bg-gray-50"
                              }`}
                          >
                            <Text className={`text-sm ${typeFilter === type
                                ? "text-indigo-600 font-semibold"
                                : "text-gray-700"
                              }`}>
                              {type}
                            </Text>

                            {typeFilter === type && (
                              <Ionicons name="checkmark-circle" size={18} color="#6366f1" />
                            )}
                          </TouchableOpacity>
                        ))}

                      </View>

                      {/* ---------- BUTTONS ---------- */}
                      <View className="flex-row gap-3">

                        {/* CLEAR */}
                        <TouchableOpacity
                          onPress={() => {
                            setPeriodFilter("month");
                            setTypeFilter("all");
                          }}
                          className="flex-1 py-3 rounded-xl bg-gray-100 items-center"
                        >
                          <Text className="text-gray-700 font-semibold text-sm">
                            Reset
                          </Text>
                        </TouchableOpacity>

                        {/* CLOSE */}
                        <TouchableOpacity
                          onPress={() => setShowFilter(false)}
                          className="flex-1 py-3 rounded-xl bg-indigo-500 items-center"
                        >
                          <Text className="text-white font-semibold text-sm">
                            Apply
                          </Text>
                        </TouchableOpacity>

                      </View>

                      {/* X button (bottom small) */}
                      <TouchableOpacity
                        onPress={() => setShowFilter(false)}
                        className="items-center mt-4"
                      >
                        <Ionicons name="close-circle" size={26} color="#9ca3af" />
                      </TouchableOpacity>

                    </View>
                  </View>
                </Modal>

              </TouchableOpacity>
            </Modal>


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
            <View className="bg-white rounded-2xl px-2 py-2 mb-1 border border-gray-100 shadow-sm">

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
                    className="font-semibold text-gray-800 text-[12px]"
                  >
                    {item.title}
                  </Text>

                  {/* TAG + DATE (same line) */}
                  <View className="flex-row items-center mt-1 flex-wrap">

                    {item.tag && (
                      <View className={`px-2 py-[2px] rounded-full mr-2 ${tagColor}`}>
                        <Text className="text-[10px] font-semibold">
                          {item.tag}
                        </Text>
                      </View>
                    )}

                    {formattedDate !== "" && (
                      <Text className="text-[11px] text-gray-600">
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
            </View>
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
