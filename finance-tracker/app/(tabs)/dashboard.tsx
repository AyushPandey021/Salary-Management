import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  StyleSheet
} from "react-native";
      import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";


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
  const styles = getStyles(theme);

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
    if (num >= 20000) return (num / 1000).toFixed(1) + "K";
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
  const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
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

     <View style={styles.headerRow}>

  {/* LEFT TEXT */}
  <View>
    <Text style={styles.greeting}>
      Welcome back 👋
    </Text>

    <Text style={styles.userName}>
      {user?.name ?? "User"}
    </Text>
  </View>

  {/* AVATAR */}
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => router.push("/profile")}
    style={styles.avatarWrapper}
  >
    <View style={styles.avatarGlow} />

    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {user?.name?.charAt(0)?.toUpperCase()}
      </Text>
    </View>
  </TouchableOpacity>

</View>
        {/* MONTH SELECTOR */}

    <Animated.View style={[styles.monthWrapper, animatedStyle]}>
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => setMonthModal(true)}
    onPressIn={() => (scale.value = withSpring(0.95))}
    onPressOut={() => (scale.value = withSpring(1))}
    style={styles.monthBtn}
  >
    {/* Glow */}
    <View style={styles.monthGlow} />

    {/* Icon */}
    <Ionicons name="calendar-outline" size={16} color="#fff" />

    {/* Text */}
    <Text style={styles.monthText}>
      {months[selectedMonth]} {selectedYear}
    </Text>

    {/* Arrow */}
    <Ionicons name="chevron-down" size={18} color="#fff" />
  </TouchableOpacity>
</Animated.View>

{/* BALANCE */}
<View style={styles.balanceBox}>

  <Text style={styles.balanceLabel}>
    CURRENT BALANCE
  </Text>

  <Text style={styles.balanceValue}>
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
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 6,
  }}
>
  {[
    {
      label: "Income",
      value: summary.income,
      icon: "wallet-outline",
      gradient: ["#22c55e", "#15803d"],
      glow: "#22c55e",
    },
    {
      label: "Expense",
      value: summary.expense,
      icon: "card-outline",
      gradient: ["#ef4444", "#b91c1c"],
      glow: "#ef4444",
    },
    {
      label: "Invest",
      value: summary.investment,
      icon: "stats-chart",
      gradient: ["#3b82f6", "#1d4ed8"],
      glow: "#3b82f6",
    },
  ].map((card) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View key={card.label} style={[{ flex: 1 }, animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => (scale.value = withSpring(0.95))}
          onPressOut={() => (scale.value = withSpring(1))}
        >
          <LinearGradient
            colors={card.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card3D}
          >

            {/* 🔥 Glow Light */}
            <View
              style={[
                styles.glow,
                { backgroundColor: card.glow },
              ]}
            />

            {/* TOP ROW */}
            <View style={styles.topRow}>

              <Text style={styles.label}>
                {card.label}
              </Text>

              {/* 3D ICON */}
              <View style={styles.iconWrapper}>
                <Ionicons name={card.icon} size={16} color="#fff" />
              </View>

            </View>

            {/* VALUE */}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.value}
            >
              ₹ {formatAmount(card.value)}
            </Text>

          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  })}
</View>
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

  const date = new Date(item.date);
  const day = date.toLocaleDateString("en-US", { weekday: "short" }); // Mon
  const shortDate = date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }); // 12 Sep

  return (
    <TouchableOpacity
      key={item._id}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/add",
          params: {
            transaction: JSON.stringify(item),
            mode: "edit",
          },
        })
      }
      style={styles.txCard}
    >
      {/* LEFT SIDE */}
      <View style={styles.txLeft}>

        {/* ICON */}
        <View
          style={[
            styles.txIconBox,
            { backgroundColor: color + "15" },
          ]}
        >
          <Ionicons name={getIcon(item.type)} size={18} color={color} />
        </View>

        {/* TEXT CONTENT */}
        <View style={{ flex: 1 }}>

          {/* DAY + TYPE */}
          <Text style={styles.txDay}>
            {day} • {item.type}
          </Text>

          {/* TITLE */}
          <Text style={[styles.txTitle, { color: theme.text }]}>
            {item.title}
          </Text>

          {/* CATEGORY TAG + DATE */}
          <View style={styles.metaRow}>

            <View style={[styles.tag, { backgroundColor: color + "15" }]}>
              <Text style={[styles.tagText, { color }]}>
                {item.category}
              </Text>
            </View>

            <Text style={[styles.txDate, { color: theme.subText }]}>
              {shortDate}
            </Text>

          </View>

        </View>
      </View>

      {/* AMOUNT */}
      <Text style={[styles.txAmount, { color }]}>
        ₹ {Number(item.amount).toLocaleString()}
      </Text>

    </TouchableOpacity>
  );
})}
      </ScrollView>
    </View>
  );
}
const getStyles = (theme: any) =>
  StyleSheet.create({
    monthWrapper: {
  alignSelf: "center",
  marginTop: 4,
},

monthBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  paddingHorizontal: 16,
  paddingVertical: 10,

  borderRadius: 30,
  overflow: "hidden",

  backgroundColor: "rgba(255,255,255,0.18)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
},

/* ✨ GLOW */
monthGlow: {
  position: "absolute",
  width: 120,
  height: 120,
  borderRadius: 100,
  backgroundColor: "#6366f1",
  opacity: 0.2,
  top: -40,
  left: -40,
},

monthText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 14,
  letterSpacing: 0.3,
},

/* 💰 BALANCE */

balanceBox: {
  alignItems: "center",
  marginTop: 14,
},

balanceLabel: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 11,
  letterSpacing: 1,
},

balanceValue: {
  color: "#fff",
  fontSize: 32,
  fontWeight: "800",
  marginTop: 6,

  textShadowColor: "rgba(0,0,0,0.3)",
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},
    headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

greeting: {
  color: "rgba(255,255,255,0.7)",
  fontSize: 13,
},

userName: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
  marginTop: 2,
},

/* 🔥 AVATAR WRAPPER (for glow) */
avatarWrapper: {
  width: 46,
  height: 46,
  justifyContent: "center",
  alignItems: "center",
},

/* ✨ GLOW EFFECT */
avatarGlow: {
  position: "absolute",
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#6366f1",
  opacity: 0.3,
},

/* 🧊 MAIN AVATAR */
avatar: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#ffffff",
  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,
},

avatarText: {
  fontWeight: "bold",
  color: "#6366f1",
  fontSize: 16,
},

  card3D: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: "hidden",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  glow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 100,
    opacity: 0.25,
    top: -30,
    right: -30,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },

  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  value: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    marginTop: 8,
  },

    txCard: {
      backgroundColor: theme.card,
      padding: 14,
      borderRadius: 18,
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },

    txLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    txIconBox: {
      padding: 10,
     
      borderRadius: 12,
      marginRight: 12,
    },

txDay: {
  fontSize: 13,

  color: theme.primary,

  paddingHorizontal: 8,
  paddingVertical: 3,

  borderRadius: 10,
  alignSelf: "flex-start",

  backgroundColor: theme.primary + "15", // soft tint

  fontWeight: "700",
  overflow: "hidden",
},

    txTitle: {
      fontWeight: "600",
      fontSize: 14,
      color: theme.text,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },

    tag: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      marginRight: 8,
    },

    tagText: {
      fontSize: 11,
      fontWeight: "600",
    },

    txDate: {
      fontSize: 11,
      color: theme.subText,
    },

    txAmount: {
      fontWeight: "700",
      fontSize: 15,
    },

  });