import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";

const BASE_URL = "http://192.168.10.48:8000";

export default function PlannerStatus() {
  const { theme } = useTheme();
  const [targets, setTargets] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const fetchTargets = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/targets/status-all`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setTargets(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const filterStatus = (status: string) => {
    setSelectedStatus(status);

    if (status === "ALL") {
      setFiltered(targets);
    } else {
      setFiltered(targets.filter((t) => t.status === status));
    }
  };

  const badgeColor = (status: string) => {
    if (status === "COMPLETED") return "#22c55e";
    if (status === "FAILED") return "#ef4444";
    return "#f59e0b";
  };

  const progressColor = (progress: number) => {
    if (progress >= 100) return "#22c55e";
    if (progress >= 80) return "#f59e0b";
    return theme.primary;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          Planner Status
        </Text>

        {/* FILTER BUTTONS */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          {["ALL", "COMPLETED", "PROCESS", "FAILED"].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => filterStatus(status)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor:
                  selectedStatus === status
                    ? theme.primary
                    : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  color:
                    selectedStatus === status ? "#fff" : "#000",
                  fontSize: 12,
                }}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : filtered.length === 0 ? (
          <Text>No targets found.</Text>
        ) : (
          filtered.map((t) => {
            const progress =
              t.targetAmount > 0
                ? (t.currentAmount / t.targetAmount) * 100
                : 0;

            return (
              <View
                key={t.id}
                style={{
                  backgroundColor: theme.card,
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 15,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: theme.text,
                  }}
                >
                  {t.title}
                </Text>

                <Text style={{ color: theme.subText, fontSize: 12 }}>
                  {t.category} • {t.month}/{t.year}
                </Text>

                {/* PROGRESS LINE ONLY */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: "#e5e7eb",
                    borderRadius: 20,
                    marginTop: 10,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      height: "100%",
                      backgroundColor: progressColor(progress),
                    }}
                  />
                </View>

                {/* STATUS BADGE */}
                <View
                  style={{
                    marginTop: 10,
                    alignSelf: "flex-start",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: badgeColor(t.status),
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>
                    {t.status}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}