import {
View,
Text,
TouchableOpacity,
TextInput,
ScrollView,
Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";

type Transaction = {
_id: string;
type: "Income" | "Expense" | "Investment";
amount: number;
month: string;
};

const BASE_URL = "http://192.168.10.35:8081"; // ← CHANGE TO YOUR PC IP

export default function Planner() {

const { theme, isDark } = useTheme();

const [activeType, setActiveType] = useState<
"Income" | "Expense" | "Investment"

> ("Expense");

const [budget, setBudget] = useState("");
const [usedAmount, setUsedAmount] = useState(0);
const [loading, setLoading] = useState(false);

const getCurrentMonth = () => {
const now = new Date();
return now.toLocaleString("default", {
month: "long",
year: "numeric",
});
};

const selectedMonth = getCurrentMonth();

const fetchTransactions = async () => {
try {
setLoading(true);


  const token = await AsyncStorage.getItem("token");

  const response = await fetch(
    `${BASE_URL}/transactions?month=${selectedMonth}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) throw new Error("Server error");

  const data: Transaction[] = await response.json();

  const filtered = data.filter(
    (item) => item.type === activeType
  );

  let total = 0;
  filtered.forEach((item) => {
    total += Number(item.amount) || 0;
  });

  setUsedAmount(total);

} catch (err) {
  console.log(err);
  Alert.alert("Server Error", "Cannot connect to backend");
} finally {
  setLoading(false);
}

};

/* IMPORTANT — runs when page opens */
useEffect(() => {
fetchTransactions();
}, [activeType]);

const numericBudget = Number(budget) || 0;
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
    colors={
      isDark
        ? ["#1f2937", "#020617"]
        : ["#7C5CFC", "#5F2EEA"]
    }
    className="px-6 pt-16 pb-8 rounded-b-[40px]"
  >
    <Text className="text-white text-2xl font-bold">
      Monthly Planner
    </Text>
    <Text className="text-white/80 mt-1">
      {selectedMonth}
    </Text>
  </LinearGradient>

  {/* Type Switch */}
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
    className="mx-5 mt-5 p-5 rounded-3xl shadow-lg"
    style={{ backgroundColor: theme.card }}
  >
    <Text
      className="font-semibold mb-3 text-base"
      style={{ color: theme.text }}
    >
      Set Monthly {activeType} Budget
    </Text>

    <TextInput
      className="p-4 rounded-xl mb-4"
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
    <View className="flex-row justify-between mb-3">
      <Text style={{ color: theme.text }}>
        Used: ₹ {usedAmount}
      </Text>
      <Text style={{ color: theme.text }}>
        Remaining: ₹ {remaining >= 0 ? remaining : 0}
      </Text>
    </View>

    {/* Progress */}
    <View className="h-3 rounded-full overflow-hidden bg-gray-200">
      <View
        className="h-3 rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor:
            percentage >= 100
              ? "#ef4444"
              : percentage >= 80
              ? "#f59e0b"
              : "#22c55e",
        }}
      />
    </View>

    <Text
      className="mt-3 font-bold text-sm"
      style={{ color: theme.text }}
    >
      {percentage.toFixed(1)}% used
    </Text>

    {remaining < 0 && (
      <Text className="mt-3 font-semibold text-red-500">
        ⚠ Budget exceeded by ₹ {Math.abs(remaining)}
      </Text>
    )}
  </View>

  <View className="h-16"/>
</ScrollView>


);
}
