import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ThemeContext } from "../../src/context/ThemeContext";

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  amount: number;
  month: string;
};

export default function Planner() {
//   const { theme, isDark } = useContext(ThemeContext);

  const [activeType, setActiveType] = useState<
    "Income" | "Expense" | "Investment"
  >("Expense");

  const [budget, setBudget] = useState("");
  const [usedAmount, setUsedAmount] = useState(0);

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const selectedMonth = getCurrentMonth();

  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/transactions?month=${selectedMonth}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data: Transaction[] = await response.json();

    const filtered = data.filter(
      (item) => item.type === activeType
    );

    let total = 0;
    filtered.forEach((item) => (total += item.amount));

    setUsedAmount(total);
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeType]);

  const numericBudget = Number(budget);
  const remaining = numericBudget - usedAmount;

  const percentage =
    numericBudget > 0
      ? Math.min((usedAmount / numericBudget) * 100, 100)
      : 0;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >

      {/* Header */}
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        className="px-6 pt-16 pb-8 rounded-b-[40px]"
      >
        <Text className="text-white text-2xl font-bold">
          Monthly Planner
        </Text>
        <Text className="text-white/90 mt-1">
          {selectedMonth}
        </Text>
      </LinearGradient>

      {/* Switch */}
      <View className="flex-row justify-around mt-5">
        {["Income", "Expense", "Investment"].map((type) => (
          <TouchableOpacity
            key={type}
            className="py-2.5 px-5 rounded-full"
            style={{
              backgroundColor:
                activeType === type
                  ? theme.primary
                  : theme.card,
            }}
            onPress={() => setActiveType(type as any)}
          >
            <Text
              className="font-semibold"
              style={{
                color:
                  activeType === type
                    ? "#fff"
                    : theme.text,
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Budget Card */}
      <View
        className="mx-5 mt-5 p-5 rounded-2xl shadow"
        style={{ backgroundColor: theme.card }}
      >
        <Text
          className="font-semibold mb-3"
          style={{ color: theme.text }}
        >
          Set Monthly {activeType} Budget
        </Text>

        <TextInput
          className="p-3 rounded-xl mb-4"
          style={{
            backgroundColor: isDark ? "#2A2A2A" : "#f2f3f7",
            color: theme.text,
          }}
          placeholder="Enter Budget Amount"
          placeholderTextColor={theme.subText}
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />

        {/* Stats */}
        <View className="flex-row justify-between mb-4">
          <Text style={{ color: theme.text }}>
            Used: ₹ {usedAmount}
          </Text>
          <Text style={{ color: theme.text }}>
            Remaining: ₹ {remaining >= 0 ? remaining : 0}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-3 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor:
                percentage >= 100
                  ? "#ff5c5c"
                  : percentage >= 80
                  ? "#FFC107"
                  : "#4CAF50",
            }}
          />
        </View>

        <Text
          className="mt-3 font-bold"
          style={{ color: theme.text }}
        >
          {percentage.toFixed(1)}%
        </Text>

        {remaining < 0 && (
          <Text className="mt-3 font-bold text-red-500">
            ⚠ Budget Exceeded by ₹ {Math.abs(remaining)}
          </Text>
        )}
      </View>

    </ScrollView>
  );
}
