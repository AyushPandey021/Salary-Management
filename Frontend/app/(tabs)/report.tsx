import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  title: string;
  amount: number;
  tag: string;
  created_at: string;
};


export default function Reports() {

  const [activeType, setActiveType] = useState<
    "Income" | "Expense" | "Investment"
  >("Expense");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 🔥 Generate last 12 months
  const generateMonths = () => {
    const now = new Date();

    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i
      );

      return date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }).reverse();
  };

  // 🔥 Months state (only once)
  const [months] = useState(generateMonths());

  // 🔥 Selected Month (only once)
  const [selectedMonth, setSelectedMonth] = useState(
    months[months.length - 1] // current month
  );

  // 🔥 Fetch Transactions
  const fetchTransactions = async () => {
    try {
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

    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  // 🔥 Prepare Chart Data
  useEffect(() => {
    const filtered = transactions.filter(
      (t) => t.type === activeType
    );

    const grouped: any = {};
    let total = 0;

    filtered.forEach((item) => {
      total += item.amount;

      if (grouped[item.tag]) {
        grouped[item.tag] += item.amount;
      } else {
        grouped[item.tag] = item.amount;
      }
    });

    const colors = [
      "#7C5CFC",
      "#4CAF50",
      "#FF5C5C",
      "#FFC107",
      "#00BCD4",
      "#9C27B0",
    ];

    const formatted = Object.keys(grouped).map((key, index) => {
      const amount = grouped[key];
      const percentage =
        total > 0
          ? ((amount / total) * 100).toFixed(1)
          : "0";

      return {
        name: key,
        amount: amount,
        percentage: percentage,
        color: colors[index % colors.length],
        legendFontColor: "#333",
        legendFontSize: 13,
      };
    });

    setChartData(formatted);

  }, [activeType, transactions]);







  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* 🔥 Header */}
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Reports</Text>

          {/* Calendar Button */}
          <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.calendarText}>Select Date</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Months Scroll */}
        <FlatList
          data={months}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingTop: 15 }}
          renderItem={({ item }) => {
            const isActive = selectedMonth === item;

            return (
              <TouchableOpacity
                style={[
                  styles.monthChip,
                  isActive && styles.activeMonthChip,
                ]}
                onPress={() => setSelectedMonth(item)}
              >
                <Text
                  style={[
                    styles.monthText,
                    isActive && styles.activeMonthText,
                  ]}
                >
                  {item.split(" ")[0]} {/* Only month name */}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>


      {/* 🔥 Switch Buttons */}
      <View style={styles.switchContainer}>
        {["Income", "Expense", "Investment"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.switchBtn,
              activeType === type && styles.activeSwitch,
            ]}
            onPress={() =>
              setActiveType(type as "Income" | "Expense" | "Investment")
            }
          >
            <Text
              style={[
                styles.switchText,
                activeType === type && styles.activeSwitchText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>
          {activeType} Distribution
        </Text>

        {chartData.length > 0 ? (
          <>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) =>
                  `rgba(0,0,0, ${opacity})`,
              }}
            />

            {/* 🔥 Percentage Legend */}
            <View style={{ marginTop: 20 }}>
              {chartData.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: 6,
                        marginRight: 8,
                      }}
                    />
                    <Text>{item.name}</Text>
                  </View>

                  <Text style={{ fontWeight: "bold" }}>
                    {item.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            No Data Available
          </Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6fb",
    flex: 1,
  },
  header: {
    padding: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  month: {
    color: "#fff",
    marginTop: 5,
    opacity: 0.8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  switchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#fff",
    elevation: 3,
  },
  activeSwitch: {
    backgroundColor: "#7C5CFC",
  },
  switchText: {
    fontWeight: "600",
    color: "#555",
  },
  activeSwitchText: {
    color: "#fff",
  },
  chartContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 15,
    borderRadius: 25,
    elevation: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  //  

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // title: {
  //   fontSize: 22,
  //   fontWeight: "bold",
  //   color: "#fff",
  // },

  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  calendarText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
  },

  monthChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 10,
  },

  activeMonthChip: {
    backgroundColor: "#fff",
  },

  monthText: {
    color: "#fff",
    fontWeight: "500",
  },

  activeMonthText: {
    color: "#7C5CFC",
    fontWeight: "bold",
  },

});
