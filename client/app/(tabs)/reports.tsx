import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";

const screenWidth = Dimensions.get("window").width;

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  title: string;
  amount: number;
  tag: string;
  created_at: string;
};

export default function Reports() {
  const { theme, isDark } = useTheme();

  const [activeType, setActiveType] = useState<
    "All" | "Income" | "Expense" | "Investment"
  >("All");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [period, setPeriod] = useState("Monthly");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // ---------- MONTHS ----------
  const generateMonths = () => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i);
      return date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }).reverse();
  };

  const [months] = useState(generateMonths());
  const [selectedMonth, setSelectedMonth] = useState(
    months[months.length - 1]
  );

  // ---------- FETCH ----------
  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/transactions/month?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.log("Report fetch error:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  // ---------- PERIOD FILTER ----------
  const filterByPeriod = (data: Transaction[]) => {
    const now = new Date();

    if (period === "Daily") {
      return data.filter(
        t => new Date(t.created_at).toDateString() === now.toDateString()
      );
    }

    if (period === "Weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return data.filter(t => new Date(t.created_at) >= weekAgo);
    }

    if (period === "Monthly") {
      return data.filter(t => {
        const d = new Date(t.created_at);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    }

    return data;
  };

  // ---------- CHART PREP ----------
  useEffect(() => {
    let filtered = filterByPeriod(transactions);

    if (activeType !== "All") {
      filtered = filtered.filter(t => t.type === activeType);
    }

    const grouped: any = {};
    let total = 0;

    filtered.forEach(item => {
      total += item.amount;
      const key = item.tag || "Other";
      grouped[key] = (grouped[key] || 0) + item.amount;
    });

    const colors = [
      "#7C5CFC",
      "#22c55e",
      "#ef4444",
      "#f59e0b",
      "#06b6d4",
      "#a855f7",
      "#3b82f6",
      "#f97316",
    ];

 const formatted = Object.keys(grouped).map((key, index) => {
  const amount = grouped[key];

  const percent = total
    ? ((amount / total) * 100).toFixed(1)
    : "0";

  return {
    name: `${key}  ${percent}%`,   // 👈 THIS IS THE TRICK
    amount: amount,
    percentage: percent,
    color: colors[index % colors.length],
    legendFontColor: theme.text,
    legendFontSize: 12,
  };
});

    setChartData(formatted);
  }, [transactions, activeType, period]);

  // ---------- UI ----------
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>

      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#1a253f", "#232947"] : ["#8E67FF", "#5F6BFF"]}
        className="pt-14 pb-6 px-5 rounded-b-[35px]"
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">Reports</Text>

          <View className="flex-row items-center">
            <Ionicons name="analytics-outline" size={18} color="white" />
            <Text className="text-white ml-2">Analytics</Text>
          </View>
        </View>

        {/* MONTH SELECTOR */}
        <FlatList
          data={months}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = selectedMonth === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedMonth(item)}
                className="px-4 py-2 rounded-full mr-3"
                style={{
                  backgroundColor: active
                    ? "#fff"
                    : "rgba(255,255,255,0.25)",
                }}
              >
                <Text
                  style={{
                    color: active ? "#5F6BFF" : "#fff",
                    fontWeight: "600",
                  }}
                >
                  {item.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {/* TYPE SWITCH */}
      <View className="flex-row justify-around mt-1 px-3">
        {["All", "Income", "Expense", "Investment"].map(type => {
          const active = activeType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setActiveType(type as any)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: active ? theme.primary : theme.card,
                elevation: active ? 4 : 1,
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : theme.text,
                  fontWeight: "500",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* DISTRIBUTION CARD */}
      <View
        className="mx-2 mt-1  rounded-3xl"
        style={{
          backgroundColor: theme.card,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: 10,
        }}
      >
        {/* CARD HEADER */}
        <View className="flex-row justify-between items-center px-2 pt-1">
          <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>
            {activeType === "All"
              ? "Money Distribution"
              : `${activeType} Distribution`}
          </Text>

          <TouchableOpacity
            onPress={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex-row items-center px-4 py-1   rounded-xl"
            style={{ backgroundColor: isDark ? "#2b2b2b" : "#f1f5f9" }}
          >
            <Text style={{ color: theme.text, fontWeight: "600", marginRight: 6 }}>
              {period}
            </Text>
            <Ionicons
              name={showPeriodMenu ? "chevron-up" : "chevron-down"}
              size={16}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN */}
        {showPeriodMenu && (
          <View className="mx-2 mt-1 rounded-xl " style={{ backgroundColor: theme.background }}>
            {["All", "Monthly", "Weekly", "Daily"].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPeriod(p);
                  setShowPeriodMenu(false);
                }}
                className="px-2 py-1 "
              >
                <Text style={{ color: theme.text }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CHART */}
        <View className="items-center  py-0">
          {chartData.length > 0 ? (
          <PieChart
  data={chartData}
  width={screenWidth - 50}
  height={230}
  accessor="amount"
  backgroundColor="transparent"
  paddingLeft="15"
  // hasLegend={false}   // 👈 VERY IMPORTANT (warna duplicate text ayega)
  chartConfig={{
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: () => theme.text,
    labelColor: () => theme.text,
    propsForLabels: {
      fontSize: 11,
      fontWeight: "600",
    },
  }}
/>
          ) : (
            <View className="items-center py-12">
              <Ionicons name="analytics-outline" size={42} color={theme.subText} />
              <Text style={{ color: theme.subText, marginTop: 10 }}>
                No data available
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* BREAKDOWN LIST (ONLY SCROLLABLE PART) */}
      <FlatList
        data={chartData}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 15 }}
        renderItem={({ item }) => (
        
          <View
            className="flex-row justify-between items-center mx-2 mb-0.5 p-3 rounded-xl"
            style={{ backgroundColor: theme.card, elevation: 2 }}
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              />
              <Text style={{ color: theme.text }} numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            <Text style={{ color: theme.text, fontWeight: "600" }}>
              ₹ {item.amount} ({item.percentage}%)
            </Text>
          </View>
        )}
      />
    </View>
  );
}