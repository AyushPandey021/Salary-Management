import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import { router } from "expo-router";

const BASE_URL = "http://localhost:8000";

export default function PlannerHome() {
  const { theme, isDark } = useTheme();
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fetchBalance = async () => {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/balance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBalance(data.balance || 0);
  };

const fetchTargets = async () => {
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/targets/?month=${month}&year=${year}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log("STATUS:", res.status);

  const data = await res.json();
  console.log("TARGET DATA:", data);

  setTargets(Array.isArray(data) ? data : []);
  setLoading(false);
};

  useEffect(() => {
    fetchBalance();
    fetchTargets();
  }, []);

  const progressColor = (t: any) => {
    if (t.progress > 100) return "#ef4444";
    if (t.progress === 100) return "#22c55e";
    if (t.progress >= 80) return "#f59e0b";
    return t.color || theme.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <LinearGradient
          colors={
            isDark
              ? ["#111827", "#020617"]
              : ["#7C5CFC", "#5F2EEA"]
          }
          style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 }}
        >
          <Text style={{ color: "white", opacity: 0.8 }}>
            Current Balance
          </Text>
          <Text style={{ color: "white", fontSize: 36, fontWeight: "bold" }}>
            ₹ {balance}
          </Text>
          <Text style={{ color: "white", opacity: 0.7, marginTop: 4 }}>
            {now.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Text style={{ color: "white", marginTop: 8 }}>
            Active Targets: {targets.length}
          </Text>
          <TouchableOpacity
  onPress={() => router.push("/status")}
  style={{
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "flex-start",
  }}
>
  <Text style={{ color: "white", fontWeight: "600" }}>
    View Status
  </Text>
</TouchableOpacity>
        </LinearGradient>

        {/* TARGET LIST */}
        <View style={{ padding: 20 }}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : targets.length === 0 ? (
            <Text style={{ color: theme.subText }}>
              No targets created this month.
            </Text>
          ) : (
            targets.map((t) => (
              <View
                key={t.id}
                style={{
                  backgroundColor: theme.card,
                  padding: 18,
                  borderRadius: 20,
                  marginBottom: 20,
                  elevation: 5,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 16, color: theme.text }}>
                  {t.title}
                </Text>

                <Text style={{ color: theme.subText, fontSize: 12 }}>
                  {t.category} • {t.month}/{t.year}
                </Text>

                <Text style={{ marginTop: 10, color: theme.text }}>
                  ₹ {t.currentAmount || 0} / ₹ {t.targetAmount}
                </Text>

                <View
                  style={{
                    height: 10,
                    backgroundColor: "#e5e7eb",
                    borderRadius: 20,
                    marginTop: 6,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${t.progress || 0}%`,
                      height: "100%",
                      backgroundColor: progressColor(t),
                    }}
                  />
                </View>

                <Text style={{ marginTop: 6, color: theme.subText }}>
                  {(t.progress || 0).toFixed(1)}%
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* FLOATING BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/createplanner")}
        style={{
          position: "absolute",
          bottom: 30,
          right: 25,
          backgroundColor: theme.primary,
          width: 60,
          height: 60,
          borderRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          elevation: 10,
        }}
      >
        <Text style={{ color: "white", fontSize: 30 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}