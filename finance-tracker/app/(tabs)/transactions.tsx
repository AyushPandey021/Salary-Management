import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";
import { useLocalSearchParams } from "expo-router";
export default function Transactions() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);

  const [typeFilter, setTypeFilter] = useState<
    "All" | "Income" | "Expense" | "Investment"
  >("All");

  const [timeFilter, setTimeFilter] = useState<
    "All" | "Day" | "Week" | "Month"
  >("All");

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showActions, setShowActions] = useState(false);
  const { mode, id } = useLocalSearchParams();
  /* ---------- FETCH DATA ---------- */

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.log("Transactions fetch error:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, []),
  );

  /* ---------- DATE FILTER ---------- */

  const filterByDate = (list: any[]) => {
    if (timeFilter === "All") return list;

    const now = new Date();

    return list.filter((t) => {
      const date = new Date(t.date);

      if (timeFilter === "Day") {
        return date.toDateString() === now.toDateString();
      }

      if (timeFilter === "Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }

      if (timeFilter === "Month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  /* ---------- APPLY FILTER ---------- */

  let filteredTransactions =
    typeFilter === "All"
      ? transactions
      : transactions.filter((t: any) => t.type === typeFilter);

  filteredTransactions = filterByDate(filteredTransactions);

  /* ---------- DELETE ---------- */

const handleDelete = () => {

  Alert.alert(
    "Delete Transaction",
    "Are you sure you want to delete?",
    [
      { text:"Cancel", style:"cancel" },
      {
        text:"Delete",
        style:"destructive",
        onPress: async () => {

          try {

            await API.delete(`/transactions/${selectedTransaction._id}`)
            fetchTransactions()

          } catch(err) {
            console.log("Delete error:", err)
          }

        }
      }
    ]
  )

}

  /* ---------- LONG PRESS MENU ---------- */

//   const openMenu = (item: any) => {
//     const edit = () => {
//       router.push({
//         pathname: "/add",
//         params: {
//           transaction: JSON.stringify(item),
//         },
//       });
//     };

//     const remove = () => {
//       Alert.alert("Delete Transaction", "Are you sure you want to delete?", [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => deleteTransaction(item._id),
//         },
//       ]);
//     };

//     if (Platform.OS === "ios") {
//       ActionSheetIOS.showActionSheetWithOptions(
//         {
//           options: ["Cancel", "Edit", "Delete"],
//           destructiveButtonIndex: 2,
//           cancelButtonIndex: 0,
//         },
//         (buttonIndex) => {
//           if (buttonIndex === 1) edit();
//           if (buttonIndex === 2) remove();
//         },
//       );
//     } else {
//       <Modal visible={showActions} transparent animationType="slide">
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.4)",
//             justifyContent: "flex-end",
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: theme.card,
//               padding: 20,
//               borderTopLeftRadius: 25,
//               borderTopRightRadius: 25,
//             }}
//           >
//             <TouchableOpacity
//               onPress={handleEdit}
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingVertical: 14,
//               }}
//             >
//               <Ionicons name="create-outline" size={20} color={theme.text} />

//               <Text
//                 style={{
//                   marginLeft: 10,
//                   fontSize: 16,
//                   color: theme.text,
//                 }}
//               >
//                 Edit Transaction
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={handleDelete}
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 paddingVertical: 14,
//               }}
//             >
//               <Ionicons name="trash-outline" size={20} color="#ef4444" />

//               <Text
//                 style={{
//                   marginLeft: 10,
//                   fontSize: 16,
//                   color: "#ef4444",
//                 }}
//               >
//                 Delete Transaction
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => setShowActions(false)}
//               style={{
//                 marginTop: 10,
//                 alignItems: "center",
//               }}
//             >
//               <Text
//                 style={{
//                   color: theme.subText,
//                   fontSize: 15,
//                 }}
//               >
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>;
//     }
//   };
const openMenu = (item:any) => {
  setSelectedTransaction(item)
  setShowActions(true)
}
const handleEdit = () => {
    setShowActions(false);

    router.push({
      pathname: "/add",
      params: {
        transaction: JSON.stringify(selectedTransaction),
      },
    });
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/transactions/${selectedTransaction._id}`);

      setShowActions(false);

      fetchTransactions();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  /* ---------- UI ---------- */

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}

      <LinearGradient
        colors={isDark ? ["#1f2a44", "#1a1f33"] : ["#8E67FF", "#5F6BFF"]}
        style={{
          paddingTop: 40,
          paddingBottom: 30,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 35,
          borderBottomRightRadius: 35,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "700",
          }}
        >
          Transactions
        </Text>

        <Text
          style={{
            color: "rgba(255,255,255,0.8)",
            marginTop: 4,
          }}
        >
          All your financial activity
        </Text>
      </LinearGradient>

      {/* TYPE TABS */}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: 15,
        }}
      >
        {["All", "Income", "Expense", "Investment"].map((type) => {
          const active = typeFilter === type;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => setTypeFilter(type as any)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? theme.primary : theme.card,
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : theme.text,
                  fontWeight: "600",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TIME FILTER DROPDOWN */}

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "600" }}>
            Filter: {timeFilter}
          </Text>

          <Ionicons name="chevron-down" size={18} color={theme.text} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 12,
              marginTop: 6,
            }}
          >
            {["All", "Day", "Week", "Month"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setTimeFilter(item as any);
                  setDropdownVisible(false);
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 0.5,
                  borderColor: "#ccc",
                }}
              >
                <Text style={{ color: theme.text }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* TRANSACTIONS LIST */}

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item: any) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
        renderItem={({ item }) => {
          const color =
            item.type === "Income"
              ? "#16a34a"
              : item.type === "Expense"
                ? "#ef4444"
                : "#2563eb";

          const icon =
            item.type === "Income"
              ? "arrow-down"
              : item.type === "Expense"
                ? "arrow-up"
                : "trending-up";

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={() => openMenu(item)}
              style={{
                backgroundColor: theme.card,
                padding: 16,
                borderRadius: 18,
                marginBottom: 12,

                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",

                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              }}
            >
              {/* LEFT SECTION */}

              <View style={{ flexDirection: "row", flex: 1 }}>
                {/* ICON */}

                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color + "20",
                  }}
                >
                  <Ionicons name={icon} size={20} color={color} />
                </View>

                <View style={{ marginLeft: 12, flex: 1 }}>
                  {/* TITLE */}

                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {item.title}
                  </Text>

                  {/* DESCRIPTION */}

                  {item.description && (
                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}

                  {/* CATEGORY + DATE */}

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    {/* CATEGORY TAG */}

                    <View
                      style={{
                        backgroundColor: theme.primary + "20",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginRight: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: theme.primary,
                        }}
                      >
                        {item.category}
                      </Text>
                    </View>

                    {/* DATE */}

                    <Text
                      style={{
                        color: theme.subText,
                        fontSize: 11,
                      }}
                    >
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AMOUNT */}

              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  color: color,
                }}
              >
                ₹ {Number(item.amount).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Ionicons name="wallet-outline" size={50} color={theme.subText} />

            <Text
              style={{
                color: theme.subText,
                marginTop: 10,
              }}
            >
              No transactions found
            </Text>
          </View>
        }
      />
    </View>
  );
}
