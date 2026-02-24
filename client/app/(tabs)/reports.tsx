import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, LineChart , BarChart } from "react-native-chart-kit";
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
  const [chartType, setChartType] = useState<"pie" | "line"| "bar">("pie");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [period, setPeriod] = useState("Monthly");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // ---------- MONTHS ----------
const generateMonths = () => {
  const now = new Date();
  const year = now.getFullYear();

  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, i);
    return date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  });
};

const months = generateMonths();

const now = new Date();
const currentMonth = now.toLocaleString("default", {
  month: "short",
  year: "numeric",
});

const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // ---------- FETCH ----------
  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.10.48:8000/transactions/month?month=${selectedMonth}`,
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
  const [selectedMonthName, selectedYear] = selectedMonth.split(" ");
console.log("Selected:", selectedMonth);

  return data.filter(t => {
    const d = new Date(t.created_at);

    const transactionMonth = d.toLocaleString("default", {
      month: "short",
    });

    return (
      transactionMonth === selectedMonthName &&
      d.getFullYear().toString() === selectedYear
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
    {/* HEADER */}
<LinearGradient
  colors={isDark ? ["#1a253f", "#232947"] : ["#8E67FF", "#5F6BFF"]}
  style={{
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  }}
>
  {/* TITLE + SELECTED MONTH */}
  <View style={{ marginBottom: 18 }}>
    <Text
      style={{
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
      }}
    >
      Reports
    </Text>

    <Text
      style={{
        color: "rgba(255,255,255,0.85)",
        marginTop: 4,
        fontSize: 14,
        fontWeight: "500",
      }}
    >
      {selectedMonth}
    </Text>
  </View>

  {/* MONTH SELECTOR */}
  <FlatList
    data={months}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item}
    contentContainerStyle={{ paddingRight: 20 }}
    renderItem={({ item }) => {
      const active = selectedMonth === item;

      return (
        <TouchableOpacity
          onPress={() => setSelectedMonth(item)}
          style={{
            marginRight: 18,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: active
                ? "#fff"
                : "rgba(255,255,255,0.6)",
              fontWeight: active ? "700" : "500",
              fontSize: 15,
              letterSpacing: 0.5,
            }}
          >
            {item.split(" ")[0]}
          </Text>

          {/* ACTIVE UNDERLINE */}
          {active && (
            <View
              style={{
                marginTop: 6,
                height: 3,
                width: 26,
                borderRadius: 20,
                backgroundColor: "#fff",
              }}
            />
          )}
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
<View style={{ flexDirection: "row", alignItems: "center" }}>
  {[
    { type: "pie", icon: "pie-chart" },
    { type: "line", icon: "stats-chart" },
    { type: "bar", icon: "bar-chart" },
  ].map((item) => {
    const active = chartType === item.type;

    return (
      <TouchableOpacity
        key={item.type}
        onPress={() => setChartType(item.type as any)}
        style={{
          marginHorizontal: 4,
          borderRadius: 14,
          overflow: "hidden",
          elevation: active ? 8 : 2,
          shadowColor: "#000",
          shadowOpacity: active ? 0.4 : 0.1,
          shadowRadius: 6,
        }}
      >
        <LinearGradient
          colors={
            active
              ? ["#8E67FF", "#5F6BFF"]
              : [isDark ? "#2b2b2b" : "#f1f5f9", isDark ? "#232323" : "#ffffff"]
          }
          style={{
            padding: 6,
            borderRadius: 12,
          }}
        >
          <Ionicons
            name={item.icon as any}
            size={18}
            color={active ? "#fff" : theme.text}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  })}
</View>
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
  <View
    style={{
      position: "absolute",
      top: 50,
      right: 20,
      backgroundColor: theme.card,
      borderRadius: 12,
      elevation: 6,
      paddingVertical: 8,
      zIndex: 999,
    }}
  >
    {["Monthly", "Weekly", "Daily"].map(p => (
      <TouchableOpacity
        key={p}
        onPress={() => {
          setPeriod(p);
          setShowPeriodMenu(false);
        }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <Text style={{ color: theme.text }}>{p}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}

        {/* CHART */}
<View className="items-center py-0">
  {chartData.length > 0 ? (
    chartType === "pie" ? (
      <PieChart
        data={chartData}
        width={screenWidth - 50}
        height={230}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        chartConfig={{
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 0,
          color: () => theme.text,
          labelColor: () => theme.text,
        }}
      />
    ) : chartType === "line" ? (
      <LineChart
        data={{
          labels: chartData.map(d => d.name.split(" ")[0]),
          datasets: [
            {
              data: chartData.map(d => d.amount),
            },
          ],
        }}
        width={screenWidth - 50}
        height={230}
        chartConfig={{
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 0,
          color: () => theme.primary,
          labelColor: () => theme.text,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    ) : (
      <BarChart
        data={{
          labels: chartData.map(d => d.name.split(" ")[0]),
          datasets: [
            {
              data: chartData.map(d => d.amount),
            },
          ],
        }}
        width={screenWidth - 50}
        height={230}
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: theme.card,
          backgroundGradientTo: theme.card,
          decimalPlaces: 0,
          color: () => theme.primary,
          labelColor: () => theme.text,
        }}
        style={{ borderRadius: 16 }}
      />
    )
  ) : (
    <View className="items-center py-12">
      <Ionicons
        name="analytics-outline"
        size={42}
        color={theme.subText}
      />
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