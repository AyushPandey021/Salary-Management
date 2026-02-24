import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { router } from "expo-router";

const BASE_URL = "http://192.168.10.48:8000";

export default function CreateTarget() {
  const { theme } = useTheme();

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedMonth = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState("#7C5CFC");

  const createTarget = async () => {
    if (!title || !amount) return;

    const token = await AsyncStorage.getItem("token");

    await fetch(`${BASE_URL}/targets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        category,
        targetAmount: Number(amount),
        month,
        year,
        color,
      }),
    });

    router.replace("/planner");
  };

  const colors = ["#7C5CFC", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background, padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 6 }}>
        Create Planner
      </Text>

      <Text style={{ color: theme.subText, marginBottom: 20 }}>
        {formattedMonth}
      </Text>

      {/* DATE CARD */}
      <View
        style={{
          backgroundColor: theme.card,
          padding: 15,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: theme.subText }}>Today's Date</Text>
        <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text }}>
          {formattedDate}
        </Text>
      </View>

      {/* TARGET NAME */}
      <TextInput
        placeholder="Target Name"
        value={title}
        onChangeText={setTitle}
        style={{
          backgroundColor: theme.card,
          padding: 15,
          borderRadius: 12,
          marginBottom: 15,
        }}
      />

      {/* TARGET AMOUNT */}
      <TextInput
        placeholder="Target Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={{
          backgroundColor: theme.card,
          padding: 15,
          borderRadius: 12,
          marginBottom: 20,
        }}
      />

      {/* CATEGORY SELECTOR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {["Income", "Expense", "Investment"].map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setCategory(c)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor:
                category === c ? theme.primary : "#e5e7eb",
            }}
          >
            <Text
              style={{
                color: category === c ? "#fff" : "#000",
                fontWeight: "500",
              }}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* COLOR PICKER */}
      <Text style={{ marginBottom: 10 }}>Progress Color</Text>
      <View style={{ flexDirection: "row", marginBottom: 30 }}>
        {colors.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={{
              width: 35,
              height: 35,
              borderRadius: 20,
              backgroundColor: c,
              marginRight: 12,
              borderWidth: color === c ? 3 : 0,
              borderColor: "#000",
            }}
          />
        ))}
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={createTarget}
        style={{
          backgroundColor: theme.primary,
          padding: 16,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Save Target
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}