import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";
const TransactionItem = ({ item, theme, router, openMenu }: any) => {
  const color =
    item.type === "Income"
      ? "#22c55e"
      : item.type === "Expense"
      ? "#ef4444"
      : "#3b82f6";

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 📅 Date helpers
  const dateObj = new Date(item.date);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const fullDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

  // const halfMonth = dateObj.getDate() <= 15 ? "1–15" : "16–End";

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => (scale.value = withSpring(0.97))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={() =>
          router.push({
            pathname: "/add",
            params: {
              transaction: JSON.stringify(item),
              mode: "edit",
            },
          })
        }
        onLongPress={() => openMenu(item)}
        style={{
          marginBottom: 10,
          borderRadius: 18,
          overflow: "hidden",
          shadowColor: color,
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={[theme.card, theme.card + "F5"]}
          style={{
            padding: 12,
            borderRadius: 18,
          }}
        >
          {/* 🔹 TOP ROW */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* LEFT */}
            <View style={{ flex: 1 }}>
              {/* DATE TAG */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.primary + "15",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={10}
                    color={theme.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: theme.primary,
                    }}
                  >
                    {dayName}, {fullDate}
                  </Text>
                </View>

                {/* HALF MONTH */}
               
              </View>

              {/* TITLE */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
  <Text
    numberOfLines={1}
    style={{
      color: theme.text,
      fontWeight: "700",
      fontSize: 13,
      flexShrink: 1,
    }}
  >
    {item.title}
  </Text>

  {item.description ? (
    <Text
      numberOfLines={1}
      style={{
        marginLeft: 6, // 👉 GAP
        fontSize: 11,
        color: theme.subText,
        flexShrink: 1,
      }}
    >
      • {item.description}
    </Text>
  ) : null}
</View>

              {/* CATEGORY + TYPE */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 3,
                }}
              >
                <View
                  style={{
                    backgroundColor: color + "20",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "600",
                      color: color,
                    }}
                  >
                    {item.category}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 9,
                    color: theme.subText,
                  }}
                >
                  {item.type}
                </Text>
              </View>
            </View>

            {/* AMOUNT */}
            <Text
              style={{
                color: color,
                fontWeight: "800",
                fontSize: 15,
              }}
            >
              ₹ {Number(item.amount).toLocaleString()}
            </Text>
          </View>

          {/* 🔹 DESCRIPTION */}

        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
export default function Transactions() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState<
    "All" | "Income" | "Expense" | "Investment"
  >("All");

  const [timeFilter, setTimeFilter] = useState<
    "All" | "Day" | "Week" | "Month"
  >("All");

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showActions, setShowActions] = useState(false);

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.log("Transactions error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, []),
  );

  /* ================= FILTER ================= */

  const filterByDate = (list: any[]) => {
    if (timeFilter === "All") return list;

    const now = new Date();

    return list.filter((t) => {
      const d = new Date(t.date);

      if (timeFilter === "Day") {
        return d.toDateString() === now.toDateString();
      }

      if (timeFilter === "Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }

      if (timeFilter === "Month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  let filtered =
    typeFilter === "All"
      ? transactions
      : transactions.filter((t: any) => t.type === typeFilter);

      filtered = filterByDate(filtered);

  /* ================= ACTIONS ================= */

  const openMenu = (item: any) => {
    setSelectedTransaction(item);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit", "Delete"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (i) => {
          if (i === 1) handleEdit(item);
          if (i === 2) handleDelete(item);
        },
      );
    } else {
      setShowActions(true);
    }
  };

  const handleEdit = (item?: any) => {
    const data = item || selectedTransaction;
    if (!data) return;

    setShowActions(false);

    router.push({
      pathname: "/add",
      params: {
        transaction: JSON.stringify(data),
        mode: "edit",
      },
    });
  };

  const handleDelete = (item?: any) => {
    const data = item || selectedTransaction;
    if (!data?._id) return;

    Alert.alert("Delete", "Delete this transaction?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await API.delete(`/transactions/${data._id}`);
          fetchTransactions();
          setShowActions(false);
        },
      },
    ]);
  };

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#1f2a44", "#1a1f33"] : ["#8E67FF", "#5F6BFF"]}
        style={{
          paddingTop: 40,
          paddingBottom: 25,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
          Transactions
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
          Manage your financial activity
        </Text>
      </LinearGradient>

      {/* TYPE FILTER */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          paddingHorizontal: 10,
          gap: 8,
        }}
      >
        {["All", "Income", "Expense", "Investment"].map((type) => {
          const active = typeFilter === type;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => setTypeFilter(type as any)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? theme.primary : theme.card,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : theme.text,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TIME FILTER */}
      <View style={{ padding: 12 }}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          style={{
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: theme.text }}>Filter: {timeFilter}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.text} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View
            style={{
              backgroundColor: theme.card,
              marginTop: 6,
              borderRadius: 12,
            }}
          >
            {["All", "Day", "Week", "Month"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setTimeFilter(item as any);
                  setDropdownVisible(false);
                }}
                style={{ padding: 12 }}
              >
                <Text style={{ color: theme.text }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: 12 }}
     renderItem={({ item }) => (
  <TransactionItem
    item={item}
    theme={theme}
    router={router}
    openMenu={openMenu}
  />
)}  
      />

      {/* ANDROID ACTION MODAL */}
      <Modal visible={showActions} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <TouchableOpacity onPress={() => handleEdit()}>
              <Text style={{ padding: 12, color: theme.text }}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete()}>
              <Text style={{ padding: 12, color: "#ef4444" }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowActions(false)}>
              <Text style={{ padding: 12, textAlign: "center" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
