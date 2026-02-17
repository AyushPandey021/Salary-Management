import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  amount: number;
  month: string;
};

export default function Planner() {
  const [activeType, setActiveType] = useState<
    "Income" | "Expense" | "Investment"
  >("Expense");

  const [budget, setBudget] = useState("");
  const [usedAmount, setUsedAmount] = useState(0);

  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  const selectedMonth = getCurrentMonth();

  // 🔥 Fetch Real Data
  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/transactions?month=${selectedMonth}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: Transaction[] = await response.json();

    const filtered = data.filter(
      (item) => item.type === activeType
    );

    let total = 0;
    filtered.forEach((item) => {
      total += item.amount;
    });

    setUsedAmount(total);
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeType]);

  const numericBudget = Number(budget);
  const remaining = numericBudget - usedAmount;
  const percentage =
    numericBudget > 0
      ? Math.min((usedAmount / numericBudget) * 100, 100)
      : 0;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        style={styles.header}
      >
        <Text style={styles.title}>Monthly Planner</Text>
        <Text style={styles.month}>{selectedMonth}</Text>
      </LinearGradient>

      {/* 🔥 Type Switch */}
      <View style={styles.switchContainer}>
        {["Income", "Expense", "Investment"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.switchBtn,
              activeType === type && styles.activeSwitch,
            ]}
            onPress={() => setActiveType(type as any)}
          >
            <Text
              style={[
                styles.switchText,
                activeType === type && { color: "#fff" },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 Budget Card */}
      <View style={styles.card}>
        <Text style={styles.label}>
          Set Monthly {activeType} Budget
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Budget Amount"
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
        />

        <View style={styles.stats}>
          <Text>Used: ₹ {usedAmount}</Text>
          <Text>
            Remaining: ₹{" "}
            {remaining >= 0 ? remaining : 0}
          </Text>
        </View>

        {/* 🔥 Progress Bar */}
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor:
                  percentage > 100
                    ? "#ff5c5c"
                    : percentage > 80
                      ? "#FFC107"
                      : "#4CAF50",
              },
            ]}
          />
        </View>

        <Text style={styles.percentage}>
          {percentage.toFixed(1)}%
        </Text>

        {/* 🔥 Exceeded Warning */}
        {remaining < 0 && (
          <Text style={styles.warning}>
            ⚠ Budget Exceeded by ₹{" "}
            {Math.abs(remaining)}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },
  header: {
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  month: {
    color: "#fff",
    marginTop: 5,
    opacity: 0.9,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  switchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  activeSwitch: {
    backgroundColor: "#7C5CFC",
  },
  switchText: {
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  label: {
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f2f3f7",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  progressBackground: {
    height: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: 12,
    borderRadius: 10,
  },
  percentage: {
    marginTop: 10,
    fontWeight: "bold",
  },
  warning: {
    marginTop: 10,
    color: "#ff5c5c",
    fontWeight: "bold",
  },
});
