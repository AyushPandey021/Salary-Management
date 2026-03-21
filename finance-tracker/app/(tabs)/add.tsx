import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import API from "../../src/services/api";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
type TabType = "Income" | "Expense" | "Investment";

export default function AddTransaction() {
  const [activeTab, setActiveTab] = useState<TabType>("Expense");
  const params = useLocalSearchParams();

  const hasParams = params?.mode === "edit";

  const transaction = hasParams ? params.transaction : null;

  const mode = hasParams ? "edit" : "create";

  // const editData = transaction ? JSON.parse(transaction as string) : null;
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");

  const { theme, isDark } = useTheme();
  const styles = getStyles(theme);

  const [showCategory, setShowCategory] = useState(false);
  const [saving, setSaving] = useState(false);

  /* CATEGORY STATES */

  const [categories, setCategories] = useState<any[]>([]);

  const [showAdd, setShowAdd] = useState(false);

  const [emoji, setEmoji] = useState("😀");
  const [catTitle, setCatTitle] = useState("");

  const [editing, setEditing] = useState<any>(null);
  const parsedTransaction =
    transaction && transaction !== "null"
      ? JSON.parse(transaction as string)
      : null;

  const isEditing = mode === "edit" && !!parsedTransaction;

  /* LOAD CATEGORY */

  const loadCategories = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await API.get(`/categories/${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(res.data);
    } catch {
      Toast.show({ type: "error", text1: "Failed loading categories" });
    }
  };

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  /* CREATE CATEGORY */

  const createCategory = async () => {
    if (!catTitle.trim()) {
      Toast.show({ type: "error", text1: "Category title required" });
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await API.post(
        "/categories",
        {
          title: catTitle,
          emoji,
          type: activeTab,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCategories([res.data, ...categories]);

      setCatTitle("");
      setEmoji("😀");
      setShowAdd(false);

      Toast.show({ type: "success", text1: "Category created" });
    } catch {
      Toast.show({ type: "error", text1: "Create failed" });
    }
  };

  /* UPDATE CATEGORY */

  const updateCategory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await API.put(
        `/categories/${editing._id}`,
        {
          title: catTitle,
          emoji,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCategories(
        categories.map((c) => (c._id === editing._id ? res.data : c)),
      );

      setEditing(null);
      setCatTitle("");
      setEmoji("😀");
      setShowAdd(false);

      Toast.show({ type: "success", text1: "Category updated" });
    } catch {
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  /* DELETE CATEGORY */

  const deleteCategory = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await API.delete(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(categories.filter((c) => c._id !== id));

      Toast.show({ type: "success", text1: "Category deleted" });
    } catch {
      Toast.show({ type: "error", text1: "Delete failed" });
    }
  };

  /* VALIDATE */

  const validate = () => {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title required" });
      return false;
    }

    if (!amount) {
      Toast.show({ type: "error", text1: "Amount required" });
      return false;
    }

    if (isNaN(Number(amount))) {
      Toast.show({ type: "error", text1: "Amount must be number" });
      return false;
    }

    if (!category) {
      Toast.show({ type: "error", text1: "Select category" });
      return false;
    }

    return true;
  };

  const initializedRef = React.useRef(false);

  useEffect(() => {
    // prevent resetting while typing
    if (initializedRef.current) return;

    if (params?.mode === "edit" && params?.transaction) {
      try {
        const parsed = JSON.parse(params.transaction as string);

        setTitle(parsed.title || "");
        setAmount(String(parsed.amount || ""));
        setCategory(parsed.category || "");
        setDescription(parsed.description || "");
        setPaymentMode(parsed.paymentMode || "Cash");
        setActiveTab(parsed.type || "Expense");
      } catch (e) {
        console.log("Parse error", e);
      }
    } else {
      setTitle("");
      setAmount("");
      setCategory("");
      setDescription("");
      setPaymentMode("Cash");
      setActiveTab("Expense");
    }

    initializedRef.current = true;
  }, []);

  /* SAVE TRANSACTION */

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem("token");

      const payload = {
        type: activeTab,
        title,
        amount: Number(amount),
        category,
        paymentMode,
        description,
        date: new Date(),
      };

      // if (transaction && mode !== "create") {
      if (isEditing) {
        // const parsed = JSON.parse(transaction as string);
        const parsed = parsedTransaction;

        await API.put(`/transactions/${parsed._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await API.post("/transactions", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Toast.show({
          type: "success",
          text1: "Transaction added",
        });
      }

      router.replace("/(tabs)/dashboard");
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to save transaction",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}

      <LinearGradient colors={["#7C5CFC", "#5F2EEA"]} style={styles.header}>
        <Text style={styles.headerText}>Add Transaction</Text>
      </LinearGradient>

      <ScrollView style={{ padding: 20 }}>
        {/* TABS */}

        <View style={styles.tabs}>
          {(["Income", "Expense", "Investment"] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={{ color: activeTab === tab ? "#fff" : theme.text }}>
                {tab === "Income" && " Income"}
                {tab === "Expense" && " Expense"}
                {tab === "Investment" && " Invest"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Amount"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />

          {/* CATEGORY */}

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowCategory(true)}
          >
            <Text style={{ color: category ? "white" : "#94a3b8" }}>
              {category || "Select Category"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Payment Mode</Text>

          <View style={styles.paymentRow}>
            {["UPI", "Account", "Cash", "Card"].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setPaymentMode(mode)}
                style={[
                  styles.paymentBtn,
                  paymentMode === mode && styles.paymentActive,
                ]}
              >
                <Text
                  style={{
                    color: paymentMode === mode ? "white" : "#cbd5f5",
                  }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            placeholder="Description"
            placeholderTextColor="#94a3b8"
            style={[styles.input, { height: 80 }]}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Transaction"
                  : "Save Transaction"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CATEGORY MODAL */}

      <Modal visible={showCategory} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categories</Text>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setEditing(null);
                  setCatTitle("");
                  setEmoji("😀");
                  setShowAdd(true);
                }}
              >
                <Text style={styles.addText}>＋</Text>
              </TouchableOpacity>
            </View>

            {/* Add / Edit Box */}
            {showAdd && (
              <View style={styles.addBox}>
                <TextInput
                  placeholder="😀 Emoji"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={emoji}
                  onChangeText={setEmoji}
                />

                <TextInput
                  placeholder="Category name"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  value={catTitle}
                  onChangeText={setCatTitle}
                />

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={editing ? updateCategory : createCategory}
                >
                  <Text style={styles.saveText}>
                    {editing ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Category Grid */}
            <FlatList
              data={categories}
              numColumns={4}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryBox}
                  onPress={() => {
                    setCategory(item.title);
                    setShowCategory(false);
                  }}
                  onLongPress={() => {
                    if (item.isDefault) return;

                    setEditing(item);
                    setCatTitle(item.title);
                    setEmoji(item.emoji);

                    Alert.alert("Category", "Choose action", [
                      { text: "Edit", onPress: () => setShowAdd(true) },
                      {
                        text: "Delete",
                        onPress: () => deleteCategory(item._id),
                        style: "destructive",
                      },
                      { text: "Cancel", style: "cancel" },
                    ]);
                  }}
                >
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <Text style={styles.categoryText}>{item.title}</Text>
                </TouchableOpacity>
              )}
            />

            {/* Close */}
            <TouchableOpacity
              onPress={() => setShowCategory(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      height: 120,
      justifyContent: "center",
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },

    headerText: {
      color: "#ffffff",
      fontSize: 20,
      fontWeight: "600",
    },

    /* ---------------- TABS ---------------- */

    tabs: {
      flexDirection: "row",
      marginVertical: 20,
      paddingHorizontal: 10,
    },

    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 18,
      backgroundColor: theme.card,
      alignItems: "center",
    },

    activeTab: {
      backgroundColor: theme.primary,
    },

    tabText: {
      color: theme.subText,
      fontWeight: "500",
    },

    activeTabText: {
      color: "#ffffff",
      fontWeight: "600",
    },

    /* ---------------- CARD ---------------- */

    card: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 20,
      marginHorizontal: 15,

      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },

    label: {
      color: theme.subText,
      marginBottom: 6,
      fontSize: 13,
    },

    input: {
      backgroundColor: theme.background,
      padding: 14,
      borderRadius: 12,
      color: theme.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },

    /* ---------------- PAYMENT ---------------- */

    paymentRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },

    paymentBtn: {
      backgroundColor: theme.card,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 10,
    },

    paymentActive: {
      backgroundColor: theme.primary,
    },

    paymentText: {
      color: theme.subText,
    },

    paymentActiveText: {
      color: "#ffffff",
      fontWeight: "600",
    },

    /* ---------------- BUTTON ---------------- */

    saveBtn: {
      backgroundColor: theme.primary,
      padding: 14,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 10,

      shadowColor: theme.primary,
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },

    saveText: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: 15,
    },

    /* ---------------- MODAL ---------------- */

    modalBg: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      padding: 20,
    },

    modalCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 18,
      maxHeight: "80%",

      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    },

    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },

    /* ---------------- ADD BUTTON ---------------- */

    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",

      shadowColor: theme.primary,
      shadowOpacity: 0.5,
      shadowRadius: 8,
    },

    addText: {
      color: "#ffffff",
      fontSize: 20,
      fontWeight: "bold",
    },

    /* ---------------- ADD BOX ---------------- */

    addBox: {
      marginBottom: 15,
      gap: 10,
    },

    /* ---------------- CATEGORY GRID ---------------- */

    categoryBox: {
      flex: 1,
      alignItems: "center",
      margin: 6,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: theme.background,

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },

    categoryEmoji: {
      fontSize: 22,
      marginBottom: 4,
    },

    categoryText: {
      fontSize: 11,
      color: theme.subText,
      textAlign: "center",
    },

    /* ---------------- CLOSE ---------------- */

    closeBtn: {
      marginTop: 12,
      alignItems: "center",
    },

    closeText: {
      color: theme.primary,
      fontWeight: "600",
    },
  });
