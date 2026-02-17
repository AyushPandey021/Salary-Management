import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function Dashboard() {
  const currentDate = new Date();
function generateMonths(year) {
  return Array.from({ length: 12 }, (_, i) =>
    new Date(year, i).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
  );
}
const [selectedMonth, setSelectedMonth] = useState(
  currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })
);
const currentYear = currentDate.getFullYear();


  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [investment, setInvestment] = useState(0);
   

  const [months, setMonths] = useState(generateMonths(currentYear));
  


const [selectedYear, setSelectedYear] = useState(currentYear);

  const balance = income - expense - investment;

  const userName = "Ayush";
  const firstLetter = userName.charAt(0);


  const getCurrentMonth = () => {
    const now = new Date();
    return now.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };


useEffect(() => {
  const newMonths = generateMonths(selectedYear);
  setMonths(newMonths);
  setSelectedMonth(newMonths[new Date().getMonth()]);
}, [selectedYear]);



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

    const data = await response.json();
    setTransactions(data);

    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;

data.forEach((item) => {

      if (item.type === "Income") totalIncome += item.amount;
      if (item.type === "Expense") totalExpense += item.amount;
      if (item.type === "Investment") totalInvestment += item.amount;
    });

    setIncome(totalIncome);
    setExpense(totalExpense);
    setInvestment(totalInvestment);
  };
  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>

      {/* 🔥 Top Gradient Header */}
      <LinearGradient
        colors={["#9C6CFB", "#6E8EFB"]}
        style={styles.header}
      >

        {/* Profile + Month Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => setShowProfile(true)}
          >
            <Text style={styles.profileText}>{firstLetter}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthContainer}
            onPress={() => setShowMonthDropdown(true)}
          >
<View style={styles.monthRow}>
  <Text style={styles.monthText}>{selectedMonth}</Text>

  <TouchableOpacity
    onPress={() => setShowMonthDropdown(true)}
    style={styles.calendarBtn}
  >
    <Ionicons name="calendar-outline" size={20} color="#fff" />
  </TouchableOpacity>
</View>
  </TouchableOpacity>


        </View>

        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balance}>₹ {balance}</Text>

        {/* <Text style={styles.profit}>+ $784 than last week</Text> */}
      </LinearGradient>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}

        ListHeaderComponent={
          <>
            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Your Money</Text>

              <View style={styles.fullCard}>
                <Text style={styles.cardLabel}>Income</Text>
                <Text style={styles.cardAmount}>₹ {income}</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.halfCard}>
                  <Text style={styles.cardLabel}>Expenses</Text>
                  <Text style={styles.expenseAmount}>₹ {expense}</Text>
                </View>

                <View style={styles.halfCard}>
                  <Text style={styles.cardLabel}>Investment</Text>
                  <Text style={styles.investAmount}>₹ {investment}</Text>
                </View>
              </View>

              <Text style={{ marginTop: 25, fontWeight: "bold", fontSize: 16 }}>
                Recent Transactions
              </Text>
            </View>
          </>
        }

        renderItem={({ item }) => {
          const isExpense = item.type === "Expense";

          const formattedDate =
            item.created_at && !isNaN(Date.parse(item.created_at))
              ? new Date(item.created_at).toLocaleString()
              : "";

          return (
            <View style={styles.transactionCard}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
                {formattedDate !== "" && (
                  <Text style={{ fontSize: 12, color: "#777" }}>
                    {formattedDate}
                  </Text>
                )}
              </View>

              <Text
                style={{
                  color: isExpense ? "#ff5c5c" : "#4CAF50",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                ₹ {item.amount}
              </Text>
            </View>
          );
        }}
      />

      {/* 🔥 Bottom Section */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Your Money</Text>

        {/* Income Full Width */}
        <View style={styles.fullCard}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.cardAmount}>₹ {income}</Text>

        </View>

        {/* Expense + Investment Row */}
        <View style={styles.row}>
          <View style={styles.halfCard}>
            <Text style={styles.cardLabel}>Expenses</Text>
            <Text style={styles.expenseAmount}>₹ {expense}</Text>

          </View>

          <View style={styles.halfCard}>
            <Text style={styles.cardLabel}>Investment</Text>
            <Text style={styles.investAmount}>₹ {investment}</Text>

          </View>
        </View>



      </View>
      {/* Recent Trasaction  */}





      {/* 🔥 Month Dropdown Modal */}
   <Modal visible={showMonthDropdown} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.dropdown}>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
        <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
          <Ionicons name="chevron-back" size={24} />
        </TouchableOpacity>

        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {selectedYear}
        </Text>

        <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
          <Ionicons name="chevron-forward" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={months}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.monthItem}
            onPress={() => {
              setSelectedMonth(item);
              setShowMonthDropdown(false);
            }}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
  <View style={{ alignItems: "center", marginTop: 40 }}>
    <Ionicons name="document-outline" size={40} color="#ccc" />
    <Text style={{ marginTop: 10, color: "#777" }}>
      No Data Available
    </Text>
  </View>
}

      />
    </View>
  </View>
</Modal>


      {/* 🔥 Profile Modal */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowProfile(false)}
            >
              <Ionicons name="close" size={24} />
            </TouchableOpacity>

            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>ayush@email.com</Text>

            <TouchableOpacity style={styles.logoutBtn}>
              <Text style={{ color: "#fff" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 250,
    padding: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontWeight: "bold",
    color: "#6E8EFB",
  },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthText: {
    color: "#fff",
    marginRight: 5,
  },
  balanceLabel: {
    alignItems:"center",
    marginTop: 40,
    color: "#fff",
    fontSize: 16,
  },
  balance: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
  },
  profit: {
    color: "#fff",
    opacity: 0.8,
  },
  body: {
    marginTop: -40,
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    width: "98%",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    borderRadius: 20,
    elevation: 5,
  },
  cardLabel: { color: "#777" },
  cardAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardAmountRed: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "red",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    maxHeight: 300,
  },
  monthItem: {
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  profileModal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileEmail: {
    color: "#777",
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: "#6E8EFB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  fullCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 5,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
monthRow: {
  flexDirection: "row",
  alignItems: "center",
},

calendarBtn: {
  marginLeft: 10,
},

  halfCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },

  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#ff5c5c",
  },

  investAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    color: "#4CAF50",
  },
  transactionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

});
