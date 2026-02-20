import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {

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

  const balance = income - expense - investment;

  useEffect(() => {
    setMonths(generateMonths(selectedYear));
  }, [selectedYear]);

  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/transactions?month=${selectedMonth}`,
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
        className="pt-14 pb-8 px-5 rounded-b-[35px]"
      >

        {/* Top row */}
        <View className="flex-row justify-between items-center">

          {/* Profile */}
          <View className="w-11 h-11 bg-white rounded-full items-center justify-center">
            <Text className="font-bold text-indigo-500 text-lg">
              A
            </Text>
          </View>

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
        data={transactions}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 150 }}

        ListHeaderComponent={
          <>
            <Text className="text-lg font-bold mb-4">
              Overview
            </Text>

            {/* Cards */}
            <View className="flex-row justify-between">

              <View className="bg-white p-4 rounded-2xl w-[48%] shadow">
                <Text className="text-gray-500">Income</Text>
                <Text className="text-green-500 text-xl font-bold mt-1">
                  ₹ {income}
                </Text>
              </View>

              <View className="bg-white p-4 rounded-2xl w-[48%] shadow">
                <Text className="text-gray-500">Expense</Text>
                <Text className="text-red-500 text-xl font-bold mt-1">
                  ₹ {expense}
                </Text>
              </View>
            </View>

            <View className="bg-white p-4 rounded-2xl mt-4 shadow">
              <Text className="text-gray-500">Investment</Text>
              <Text className="text-blue-500 text-xl font-bold mt-1">
                ₹ {investment}
              </Text>
            </View>

            <Text className="mt-6 mb-2 text-lg font-bold">
              Recent Transactions
            </Text>
          </>
        }

        renderItem={({ item }) => {

          const color =
            item.type === "Income"
              ? "text-green-500"
              : item.type === "Expense"
              ? "text-red-500"
              : "text-blue-500";

          const badge =
            item.type === "Income"
              ? "bg-green-100 text-green-600"
              : item.type === "Expense"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600";

          return (
            <View className="bg-white p-4 rounded-2xl mb-3 flex-row justify-between items-center shadow-sm">

              <View>
                <Text className="font-semibold text-gray-800">
                  {item.title}
                </Text>

                <View className={`self-start px-3 py-1 rounded-full mt-1 ${badge}`}>
                  <Text className="text-xs font-semibold">
                    {item.type}
                  </Text>
                </View>
              </View>

              <Text className={`text-lg font-bold ${color}`}>
                ₹ {item.amount}
              </Text>

            </View>
          );
        }}
      />

      {/* Month Modal */}
      <Modal visible={showMonthDropdown} transparent animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center">

          <View className="bg-white w-[85%] rounded-3xl p-5">

            {/* Year Selector */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
                <Ionicons name="chevron-back" size={22} />
              </TouchableOpacity>

              <Text className="font-bold text-lg">
                {selectedYear}
              </Text>

              <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
                <Ionicons name="chevron-forward" size={22} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={months}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    setSelectedMonth(item);
                    setShowMonthDropdown(false);
                  }}
                >
                  <Text className="text-center">
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

          </View>
        </View>
      </Modal>

    </View>
  );
}
