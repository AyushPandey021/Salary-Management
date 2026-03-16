import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";

import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";
export default function Dashboard() {
  const { theme, isDark } = useTheme();

  const [user, setUser] = useState(null);
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [monthModal, setMonthModal] = useState(false);

  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    investment: 0,
    balance: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchUser = async () => {
    try {
      const res = await API.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      console.log("User fetch error:", err);
    }
  };
  /* ---------------- FETCH DASHBOARD ---------------- */

  const fetchDashboard = async () => {
    try {
      const summaryRes = await API.get(
        `/transactions/summary?month=${selectedMonth + 1}&year=${selectedYear}`,
      );

      setSummary(summaryRes.data);

      const recentRes = await API.get(
        `/transactions/recent?month=${selectedMonth + 1}&year=${selectedYear}`,
      );

      setRecentTransactions(recentRes.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    }
  };

  /* ---------------- FETCH ALL ---------------- */

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.log("Transactions error:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
      fetchDashboard();
      fetchTransactions();
    }, [selectedMonth, selectedYear]),
  );

  /* ---------------- CATEGORY ANALYTICS ---------------- */

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const categoryMap = {};

  filteredTransactions.forEach((t) => {
    if (!categoryMap[t.category]) categoryMap[t.category] = 0;
    categoryMap[t.category] += Number(t.amount);
  });

  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  /* ---------------- UI ---------------- */
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateMonthOptions = () => {
    const list = [];

    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
      for (let m = 11; m >= 0; m--) {
        list.push({
          month: m,
          year: y,
          label: `${months[m]} ${y}`,
        });
      }
    }

    return list;
  };

  const monthOptions = generateMonthOptions();

  const formatAmount = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
    if (num >= 100000) return (num / 100000).toFixed(1) + "L";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const getIcon = (type: string) => {
    if (type === "Income") return "arrow-down-circle";
    if (type === "Expense") return "arrow-up-circle";
    return "trending-up";
  };

  const getColor = (type: string) => {
    if (type === "Income") return "#16a34a";
    if (type === "Expense") return "#ef4444";
    return "#2563eb";
  };
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <Modal visible={monthModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              margin: 20,
              borderRadius: 20,
              maxHeight: "70%",
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                Select Month
              </Text>

              <TouchableOpacity onPress={() => setMonthModal(false)}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* MONTH LIST */}
            <FlatList
              data={monthOptions}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected =
                  item.month === selectedMonth && item.year === selectedYear;

                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMonth(item.month);
                      setSelectedYear(item.year);
                      setMonthModal(false);
                    }}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 22,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: isSelected
                        ? theme.primary + "15"
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? "700" : "500",
                        fontSize: 15,
                      }}
                    >
                      {item.label}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      <LinearGradient
        colors={isDark ? ["#1f2a44", "#1a1f33"] : ["#8E67FF", "#5F6BFF"]}
        style={{
          paddingTop: 40,
          paddingBottom: 30,
          borderBottomLeftRadius: 35,
          borderBottomRightRadius: 35,
          paddingHorizontal: 20,
        }}
      >
        {/* TOP ROW */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            Hello {user?.name ?? ""}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#6366f1" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        {/* MONTH SELECTOR */}

        <TouchableOpacity
          onPress={() => setMonthModal(true)}
          activeOpacity={0.8}
          style={{
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 25,
            marginTop: 12,

            backgroundColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",

            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#fff"
            style={{ marginRight: 6 }}
          />

          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 14,
              letterSpacing: 0.3,
            }}
          >
            {months[selectedMonth]} {selectedYear}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#fff"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>

        {/* BALANCE */}

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
            CURRENT BALANCE
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 36,
              fontWeight: "bold",
              marginTop: 5,
            }}
          >
            ₹ {summary.balance.toLocaleString()}
          </Text>
        </View>

        {/* QUICK ACTIONS */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 10,
          }}
        ></View>
      </LinearGradient>

      {/* BODY */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 6, paddingBottom: 80 }}
      >
        {/* SUMMARY CARDS */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 12,
          }}
        >
          {[
            {
              label: "Income",
              value: summary.income,
              color: "#16a34a",
              icon: "arrow-down",
              gradient: ["#22c55e", "#15803d"],
            },
            {
              label: "Expense",
              value: summary.expense,
              color: "#ef4444",
              icon: "arrow-up",
              gradient: ["#ef4444", "#b91c1c"],
            },
            {
              label: "Invest",
              value: summary.investment,
              color: "#2563eb",
              icon: "trending-up",
              gradient: ["#3b82f6", "#1d4ed8"],
            },
          ].map((card) => (
            <TouchableOpacity
              key={card.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                marginHorizontal: 6,
              }}
            >
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  paddingVertical: 18,
                  paddingHorizontal: 12,
                  alignItems: "center",

                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 10,
                }}
              >
                {/* Icon bubble */}
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    padding: 10,
                    borderRadius: 50,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name={card.icon} size={20} color="#fff" />
                </View>

                {/* Label */}
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {card.label}
                </Text>

                {/* Value */}
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 18,
                    marginTop: 2,
                  }}
                >
                  ₹ {formatAmount(card.value)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        {/* CATEGORY INSIGHTS */}

        <Text
          style={{
            color: theme.text,
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Top Spending
        </Text>

        {topCategories.map(([cat, val]) => (
          <View
            key={cat}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: theme.text }}>{cat}</Text>

            <Text style={{ color: theme.primary }}>₹ {val}</Text>
          </View>
        ))}

        {/* RECENT TRANSACTIONS */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            Recent Transactions
          </Text>

          <TouchableOpacity onPress={() => router.push("/transactions")}>
            <Text style={{ color: "#6366f1", fontWeight: "600" }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((item) => {
          const color = getColor(item.type);

          return (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.85}
              onLongPress={() =>
                Alert.alert("Transaction", "Choose action", [
                  {
                    text: "Edit",
                    onPress: () => router.push(`/edit/${item._id}`),
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTransaction(item._id),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ])
              }
              style={{
                backgroundColor: theme.card,
                padding: 16,
                borderRadius: 18,
                marginTop: 12,

                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",

                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              {/* LEFT SECTION */}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* ICON */}
                <View
                  style={{
                    backgroundColor: color + "20",
                    padding: 10,
                    borderRadius: 12,
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={getIcon(item.type)} size={20} color={color} />
                </View>

                {/* TEXT */}

                <View>
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    {/* CATEGORY TAG */}
                    <View
                      style={{
                        backgroundColor: theme.primary + "20",
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 12,
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: 11,
                          fontWeight: "600",
                        }}
                      >
                        {item.category}
                      </Text>
                    </View>

                    {/* DATE */}
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 12,
                      }}
                    >
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AMOUNT */}

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  color: color,
                }}
              >
                ₹ {Number(item.amount).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
