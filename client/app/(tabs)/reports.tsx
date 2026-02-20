import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
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

  // Generate last 12 months
  const generateMonths = () => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i);
      return date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }).reverse();
  };

  const [months] = useState(generateMonths());
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);

  // Fetch Transactions
  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `http://192.168.10.35:8081/transactions?month=${selectedMonth}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setTransactions(data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth]);

  // Prepare Chart
  useEffect(() => {
    const filtered = transactions.filter(t => t.type === activeType);

    const grouped: any = {};
    let total = 0;

    filtered.forEach(item => {
      total += item.amount;
      grouped[item.tag] = (grouped[item.tag] || 0) + item.amount;
    });

    const colors = ["#7C5CFC", "#4CAF50", "#FF5C5C", "#FFC107", "#00BCD4", "#9C27B0"];

    const formatted = Object.keys(grouped).map((key, index) => {
      const amount = grouped[key];
      const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : "0";

      return {
        name: key,
        amount,
        percentage,
        color: colors[index % colors.length],
        legendFontColor: "#333",
        legendFontSize: 13,
      };
    });

    setChartData(formatted);

  }, [activeType, transactions]);

  return (
    <ScrollView className="flex-1 bg-[#F3F4F8]" showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <LinearGradient
        colors={["#8E67FF", "#5F6BFF"]}
        className="pt-14 pb-6 px-5 rounded-b-[35px]"
      >

        <View className="flex-row justify-between items-center">
          <Text className="text-white text-2xl font-bold">
            Reports
          </Text>

          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={18} color="white" />
            <Text className="text-white ml-2">Analytics</Text>
          </View>
        </View>

        {/* Month Scroll */}
        <FlatList
          data={months}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = selectedMonth === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedMonth(item)}
                className={`px-4 py-2 rounded-full mr-3 ${active ? "bg-white" : "bg-white/20"
                  }`}
              >
                <Text className={`${active ? "text-indigo-600 font-bold" : "text-white"}`}>
                  {item.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {/* TYPE SWITCH */}
      <View className="flex-row justify-around mt-5">
        {["Income", "Expense", "Investment"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveType(type as any)}
            className={`px-5 py-2.5 rounded-full ${activeType === type ? "bg-indigo-500" : "bg-white"
              } shadow`}
          >
            <Text className={`${activeType === type ? "text-white" : "text-gray-600"} font-semibold`}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CHART */}
      <View className="bg-white mx-5 mt-6 p-5 rounded-3xl shadow">

        <Text className="font-bold text-lg mb-4">
          {activeType} Distribution
        </Text>

        {chartData.length > 0 ? (
          <>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={220}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="20"
              absolute
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: () => `rgba(0,0,0,1)`,
              }}
            />

            {/* Legend */}
            <View className="mt-6">
              {chartData.map((item, index) => (
                <View key={index} className="flex-row justify-between items-center mb-3">

                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-gray-700">{item.name}</Text>
                  </View>

                  <Text className="font-bold">{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text className="text-center mt-10 text-gray-500">
            No Data Available
          </Text>
        )}

      </View>

    </ScrollView>
  );
}
