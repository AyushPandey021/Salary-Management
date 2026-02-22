import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { formatAmount } from "../../src/utils/formatAmount";
import { router, useFocusEffect } from "expo-router";


type Transaction = {
  _id: string;
  title: string;
  description?: string;
  tag?: string;
  amount: number;
  type: "Income" | "Expense" | "Investment";
  created_at: string;
};

export default function Transactions() {
  const BASE_URL = "http://192.168.10.48:8000";
 
  const { theme, isDark } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);

  const [periodFilter, setPeriodFilter] = useState("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [investment, setInvestment] = useState(0);

const [lastTap, setLastTap] = useState(0);

  /* ---------------- FETCH ---------------- */

  const fetchTransactions = async (): Promise<void> => {

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch("http://localhost:8000/transactions/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        setTransactions([]);
        return;
      }

      setTransactions(data);

      let inc = 0,
        exp = 0,
        inv = 0;

      data.forEach((t: Transaction) => {
        if (t.type === "Income") inc += t.amount;
        if (t.type === "Expense") exp += t.amount;
        if (t.type === "Investment") inv += t.amount;
      });

      setIncome(inc);
      setExpense(exp);
      setInvestment(inv);
    } catch (e) {
      console.log("Fetch error", e);
    }
  };

useFocusEffect(
  React.useCallback(() => {
    fetchTransactions();
  }, [])
);



  /* ---------------- FILTER ---------------- */

  useEffect(() => {
    let data = [...transactions];
    const now = new Date();

    if (periodFilter === "day") {
      data = data.filter(
        (t) => new Date(t.created_at).toDateString() === now.toDateString()
      );
    }

    if (periodFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      data = data.filter((t) => new Date(t.created_at) >= weekAgo);
    }

    if (typeFilter !== "all") {
      data = data.filter((t) => t.type === typeFilter);
    }

    setFiltered(data);
  }, [transactions, periodFilter, typeFilter]);

  /* ---------------- DELETE ---------------- */

const deleteTransaction = async () => {
  if (!selectedId) return;

  Alert.alert("Delete Transaction?", "This cannot be undone", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          const token = await AsyncStorage.getItem("token");

          const res = await fetch(
            `http://localhost:8000/transactions/${selectedId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            Alert.alert("Delete Failed");
            return;
          }

          // instant UI update
          setTransactions(prev =>
            prev.filter(t => t._id !== selectedId)
          );

          setSelectMode(false);
          setSelectedId(null);

        } catch (e) {
          Alert.alert("Server not reachable");
        }
      },
    },
  ]);
};


  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* HEADER */}
      <View className="pt-14 pb-4 px-4 flex-row justify-between items-center">
        {selectMode ? (
          <>
            <TouchableOpacity onPress={() => setSelectMode(false)}>
              <Ionicons name="close" size={26} color={theme.text} />
            </TouchableOpacity>

            <Text style={{ color: theme.text }} className="text-lg font-semibold">
              Selected
            </Text>

            <TouchableOpacity onPress={deleteTransaction}>
              <Ionicons name="trash-outline" size={26} color="#ef4444" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ color: theme.text }} className="text-xl font-semibold">
              Transactions
            </Text>

            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              className="p-2 rounded-full"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="options-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* SUMMARY CARDS */}
     <View className="px-4 mb-2 flex-row justify-between">

  {/* INCOME */}
  <TouchableOpacity
    onPress={() => setTypeFilter("Income")}
    className="flex-1 mr-2 rounded-2xl px-3 py-3 flex-row items-center"
    style={{
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
    }}
  >
    {/* 3D ICON */}
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
      style={{
        backgroundColor: "rgba(34,197,94,0.12)",
        shadowColor: "#22c55e",
        shadowOpacity: 0.6,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      <Ionicons name="arrow-down" size={18} color="#22c55e" />
    </View>

    <View>
      <Text className="text-[11px]" style={{ color: theme.subText }}>
        Income
      </Text>

      <Text className="text-[14px] font-semibold" style={{ color: "#22c55e" }}>
        ₹{formatAmount(income)}

      </Text>
    </View>
  </TouchableOpacity>

  {/* EXPENSE */}
  <TouchableOpacity
    onPress={() => setTypeFilter("Expense")}
    className="flex-1 mx-1 rounded-2xl px-3 py-3 flex-row items-center"
    style={{
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
    }}
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
      style={{
        backgroundColor: "rgba(239,68,68,0.12)",
        shadowColor: "#ef4444",
        shadowOpacity: 0.6,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      <Ionicons name="arrow-up" size={18} color="#ef4444" />
    </View>

    <View>
      <Text className="text-[11px]" style={{ color: theme.subText }}>
        Expense
      </Text>

      <Text className="text-[14px] font-semibold" style={{ color: "#ef4444" }}>
        ₹ {formatAmount(expense)}
        {/* {expense} */}
      </Text>
    </View>
  </TouchableOpacity>

  {/* INVESTMENT */}
  <TouchableOpacity
    onPress={() => setTypeFilter("Investment")}
    className="flex-1 ml-2 rounded-2xl px-3 py-3 flex-row items-center"
    style={{
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 5 },
      elevation: 6,
    }}
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
      style={{
        backgroundColor: "rgba(59,130,246,0.12)",
        shadowColor: "#3b82f6",
        shadowOpacity: 0.6,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
      }}
    >
      <Ionicons name="trending-up" size={18} color="#3b82f6" />
    </View>

    <View>
      <Text className="text-[11px]" style={{ color: theme.subText }}>
        Invest
      </Text>

      <Text className="text-[14px] font-semibold" style={{ color: "#3b82f6" }}>
        ₹ {formatAmount(investment)}
      </Text>
    </View>
  </TouchableOpacity>

</View>


      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        renderItem={({ item }) => {
          const isSelected = selectedId === item._id;

          const icon =
            item.type === "Income"
              ? "arrow-down-circle"
              : item.type === "Expense"
                ? "arrow-up-circle"
                : "trending-up";

          const iconColor =
            item.type === "Income"
              ? "#22c55e"
              : item.type === "Expense"
                ? "#ef4444"
                : "#3b82f6";

          return (
            <TouchableOpacity
              onLongPress={() => {
                setSelectedId(item._id);
                setSelectMode(true);
              }}
             onPress={() => {
  const now = Date.now();

  if (now - lastTap < 300) {
    // DOUBLE TAP → EDIT
    router.push({
      pathname: "/(tabs)/add",
      params: { edit: JSON.stringify(item) },
    });
    return;
  }

  setLastTap(now);

  if (selectMode) setSelectedId(item._id);
}}

              className="p-3 rounded-2xl mb-2 flex-row items-center"
              style={{
                backgroundColor: isSelected
                  ? "rgba(99,102,241,0.15)"
                  : theme.card,
              }}
            >
              <View className="mr-3">
                <Ionicons name={icon} size={26} color={iconColor} />
              </View>

              <View className="flex-1">
                <Text numberOfLines={1} className="text-[14px] font-semibold" style={{ color: theme.text }}>
                  {item.title}
                </Text>

                {item.description && (
                  <Text numberOfLines={1} className="text-xs mt-1" style={{ color: theme.subText }}>
                    {item.description}
                  </Text>
                )}

                <View className="flex-row items-center mt-1">
                  {item.tag && (
                    <View
                      className="px-2 py-[2px] rounded-full mr-2"
                      style={{ backgroundColor: isDark ? "#2a2a2a" : "#eef2ff" }}
                    >
                      <Text className="text-[10px]" style={{ color: "#6366f1" }}>
                        {item.tag}
                      </Text>
                    </View>
                  )}

                  <Text className="text-[11px]" style={{ color: theme.subText }}>
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <Text className="font-semibold text-[14px]" style={{ color: iconColor }}>
                ₹ {item.amount}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* FILTER MODAL */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-3xl p-5" style={{ backgroundColor: theme.card }}>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semibold text-base" style={{ color: theme.text }}>
                Filters
              </Text>

              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close-circle" size={26} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* TIME FILTER */}
            <Text className="text-xs mb-2" style={{ color: theme.subText }}>
              Time
            </Text>

            <View className="flex-row justify-between mb-5">
              {["day", "week", "month"].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPeriodFilter(p)}
                  className="px-4 py-2 rounded-xl"
                  style={{
                    backgroundColor:
                      periodFilter === p ? theme.primary : theme.background,
                  }}
                >
                  <Text
                    style={{
                      color: periodFilter === p ? "#fff" : theme.text,
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* RESET */}
            <TouchableOpacity
              onPress={() => {
                setPeriodFilter("month");
                setTypeFilter("all");
              }}
              className="mt-2 p-3 rounded-xl items-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white font-semibold">Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

