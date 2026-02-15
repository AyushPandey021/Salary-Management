import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const BASE_URL = "http://localhost:8000";
export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const salary = 50000;
  const expenses = 25000;
  const investments = 10000;
  const balance = salary - expenses - investments;

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setUserName(data.name || "User");
    } catch (error) {
      console.log("Error fetching user");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {userName} 👋
        </Text>

        <TouchableOpacity
          style={styles.profileCircle}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.profileText}>{firstLetter}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Salary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Salary</Text>
          <Text style={styles.amount}>₹ {salary}</Text>
        </View>

        {/* Expenses Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Expenses</Text>
          <Text style={[styles.amount, { color: "#ff6b6b" }]}>
            ₹ {expenses}
          </Text>
        </View>

        {/* Investments Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Investments</Text>
          <Text style={[styles.amount, { color: "#4cd137" }]}>
            ₹ {investments}
          </Text>
        </View>

        {/* Balance Card */}
        <View style={[styles.card, styles.balanceCard]}>
          <Text style={styles.cardTitle}>Remaining asdadsg Balance</Text>
          <Text style={styles.balanceAmount}>₹ {balance}</Text>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        transparent
        visible={showMenu}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  content: {
    padding: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },

  cardTitle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 5,
  },

  amount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  balanceCard: {
    backgroundColor: "#4facfe",
  },

  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },

  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});
