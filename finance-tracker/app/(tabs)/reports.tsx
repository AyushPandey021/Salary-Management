import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";

const screenWidth = Dimensions.get("window").width;

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  title: string;
  amount: number;
  category: string;
  createdAt: string;
};

export default function Reports() {
  const { theme, isDark } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeType, setActiveType] =
    useState<"All" | "Income" | "Expense" | "Investment">("All");
  const [chartType, setChartType] = useState<"pie" | "line" | "bar">("pie");
  const [period, setPeriod] = useState<"All" | "Month" | "Week" | "15days" | "Day">("Month");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  // ---------- MONTH GENERATOR ----------
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

  // ---------- FETCH TRANSACTIONS ----------
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions/month", {
        params: { month: selectedMonth },
      });
      setTransactions(res.data);
    } catch (err) {
      console.log("Report fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  // ---------- PERIOD FILTER ----------
const filterByPeriod = (data: Transaction[]) => {

  const now = new Date();

  if (period === "All") {
    return data;
  }

  if (period === "Day") {

    return data.filter(t => {
      const d = new Date(t.createdAt);
      return d.toDateString() === now.toDateString();
    });

  }

  if (period === "Week") {

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);

    return data.filter(t => {
      const d = new Date(t.createdAt);
      return d >= weekAgo;
    });

  }

  if (period === "15days") {

    const daysAgo = new Date();
    daysAgo.setDate(now.getDate() - 15);

    return data.filter(t => {
      const d = new Date(t.createdAt);
      return d >= daysAgo;
    });

  }

  if (period === "Month") {

    const [monthName, year] = selectedMonth.split(" ");

    return data.filter(t => {

      const d = new Date(t.createdAt);

      return (
        d.toLocaleString("default",{month:"short"}) === monthName &&
        d.getFullYear().toString() === year
      );

    });

  }

  return data;
};

  // ---------- CHART PREPARATION ----------
  useEffect(() => {
    let filtered = filterByPeriod(transactions);
    if (activeType !== "All") {
      filtered = filtered.filter((t) => t.type === activeType);
    }

    const grouped: any = {};
    let total = 0;
    filtered.forEach((item) => {
      total += item.amount;
      const key = item.category || "Other";
      grouped[key] = (grouped[key] || 0) + item.amount;
    });

    const colors = [
      "#7C5CFC", "#22c55e", "#ef4444", "#f59e0b",
      "#06b6d4", "#a855f7", "#3b82f6", "#f97316"
    ];

    const formatted = Object.keys(grouped).map((key, index) => {
      const amount = grouped[key];
      const percent = total ? ((amount / total) * 100).toFixed(1) : "0";
      return {
        name: `${key} ${percent}%`,
        amount,
        percentage: percent,
        color: colors[index % colors.length],
        legendFontColor: theme.text,
        legendFontSize: 12,
      };
    });

    setChartData(formatted);
  }, [transactions, activeType, period,selectedMonth]);

  // ---------- UI ----------
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#1a1f3c", "#232947"] : ["#836FFF", "#5A67F6"]}
        style={styles.headerContainer}
      >
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>{selectedMonth}</Text>
        {/* MONTH SELECTOR */}
        <FlatList
          horizontal
          data={months}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          style={{ marginTop: 18 }}
          renderItem={({ item }) => {
            const active = selectedMonth === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedMonth(item)}
                style={styles.monthItem}
              >
                <Text
                  style={[
                    styles.monthText,
                    { color: active ? "#fff" : "rgba(255,255,255,0.6)" },
                  ]}
                >
                  {item.split(" ")[0]}
                </Text>
                {active && <View style={styles.activeMonthIndicator} />}
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {/* TYPE FILTER */}
      <View style={styles.typeFilterRow}>
        {["All", "Income", "Expense", "Investment"].map((type) => {
          const active = activeType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setActiveType(type as any)}
              style={[
                styles.typeButton,
                {
                  backgroundColor: active
                    ? theme.primary
                    : theme.card,
                  shadowColor: active ? theme.primary : "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: active ? 6 : 2,
                },
              ]}
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

      {/* CHART CARD */}
      <View style={[
        styles.chartCard,
        {
          backgroundColor: isDark
            ? "rgba(36, 44, 73, 0.8)"
            : "rgba(255,255,255,0.95)",
          shadowColor: isDark ? "#000" : "#5F6BFF",
        }
      ]}>
        {/* HEADER ROW */}
        <View style={styles.chartHeaderRow}>
          <Text style={[styles.chartHeading, { color: theme.text }]}>
            Distribution
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* PERIOD FILTER */}
            <TouchableOpacity
              onPress={() => setShowPeriodMenu(!showPeriodMenu)}
              style={[
                styles.periodButton,
                { backgroundColor: theme.background },
              ]}
            >
              <Ionicons name="filter-outline" size={16} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 12, marginLeft: 4 }}>
                {period}
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.text} />
            </TouchableOpacity>

            {/* CHART SWITCH */}
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
                  style={{ marginLeft: 6 }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={active ? theme.primary : theme.text}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showPeriodMenu && (
          <View
            style={[
              styles.periodMenu,
              { backgroundColor: theme.card },
            ]}
          >
            {["All", "Day", "Week", "15days",].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  setPeriod(p as any);
                  setShowPeriodMenu(false);
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              >
                <Text
                  style={{
                    color: period === p ? theme.primary : theme.text,
                  }}
                >
                  {p === "15days" ? "Last 15 Days" : p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CHART DISPLAY */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          {chartData.length === 0 ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons
                name="analytics-outline"
                size={40}
                color={theme.subText}
              />
              <Text style={{ color: theme.subText, marginTop: 8 }}>
                No data available
              </Text>
            </View>
          ) : chartType === "pie" ? (
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={240}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="20"
              absolute
              hasLegend
              chartConfig={{
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                color: () => theme.text,
                labelColor: () => theme.text,
              }}
              style={{ marginVertical: 8 }}
            />
          ) : chartType === "line" ? (
            <LineChart
              data={{
                labels: chartData.map((d) => d.name.split(" ")[0]),
                datasets: [{ data: chartData.map((d) => d.amount) }],
              }}
              width={screenWidth - 60}
              height={230}
              chartConfig={{
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                color: () => theme.primary,
                labelColor: () => theme.text,
              }}
              bezier
            />
          ) : (
            <BarChart
              data={{
                labels: chartData.map((d) => d.name.split(" ")[0]),
                datasets: [{ data: chartData.map((d) => d.amount) }],
              }}
              width={screenWidth - 60}
              height={230}
              fromZero
              showValuesOnTopOfBars
              chartConfig={{
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                color: () => theme.primary,
                labelColor: () => theme.text,
              }}
            />
          )}
        </View>
      </View>

      {/* BREAKDOWN LIST */}
      <FlatList
        data={chartData}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.breakdownItem,
              {
                backgroundColor: isDark
                  ? "rgba(40, 48, 72, 0.9)"
                  : "rgba(255,255,255,0.85)",
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={[styles.colorDot, { backgroundColor: item.color }]}
              />
              <Text style={{ color: theme.text }}>{item.name}</Text>
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

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 28,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowRadius: 6,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
    fontWeight: "500",
  },
  monthItem: { marginRight: 18, alignItems: "center" },
  monthText: { fontWeight: "600", fontSize: 15 },
  activeMonthIndicator: {
    marginTop: 6,
    height: 4,
    width: 26,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  typeFilterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
    paddingHorizontal: 12,
  },
  typeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chartCard: {
    margin: 14,
    borderRadius: 24,
    padding: 14,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartHeading: { fontWeight: "600", fontSize: 16 },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
periodMenu: {
  position: "absolute",
  right: 10,
  top: 50,
  borderRadius: 12,
  paddingVertical: 6,

  elevation: 20,
  zIndex: 1000,

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 12
},
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 10,
  },
});
