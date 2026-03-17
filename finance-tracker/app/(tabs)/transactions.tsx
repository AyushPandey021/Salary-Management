// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   Platform,
//   ActionSheetIOS,
// } from "react-native";

// import { LinearGradient } from "expo-linear-gradient";
// import { Ionicons } from "@expo/vector-icons";
// import { useFocusEffect, useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";

// import { useTheme } from "../../src/context/ThemeContext";
// import API from "../../src/services/api";
// import { useLocalSearchParams } from "expo-router";
// export default function Transactions() {
//   const { theme, isDark } = useTheme();
//   const router = useRouter();

//   const [transactions, setTransactions] = useState([]);

//   const [typeFilter, setTypeFilter] = useState<
//     "All" | "Income" | "Expense" | "Investment"
//   >("All");

//   const [timeFilter, setTimeFilter] = useState<
//     "All" | "Day" | "Week" | "Month"
//   >("All");

//   const [dropdownVisible, setDropdownVisible] = useState(false);

//   const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
//   const [showActions, setShowActions] = useState(false);
//   const { mode, id } = useLocalSearchParams();
//   /* ---------- FETCH DATA ---------- */

//   const fetchTransactions = async () => {
//     try {
//       const res = await API.get("/transactions");
//       setTransactions(res.data);
//     } catch (err) {
//       console.log("Transactions fetch error:", err);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       fetchTransactions();
//     }, []),
//   );

//   /* ---------- DATE FILTER ---------- */

//   const filterByDate = (list: any[]) => {
//     if (timeFilter === "All") return list;

//     const now = new Date();

//     return list.filter((t) => {
//       const date = new Date(t.date);

//       if (timeFilter === "Day") {
//         return date.toDateString() === now.toDateString();
//       }

//       if (timeFilter === "Week") {
//         const weekAgo = new Date();
//         weekAgo.setDate(now.getDate() - 7);
//         return date >= weekAgo;
//       }

//       if (timeFilter === "Month") {
//         return (
//           date.getMonth() === now.getMonth() &&
//           date.getFullYear() === now.getFullYear()
//         );
//       }

//       return true;
//     });
//   };

//   /* ---------- APPLY FILTER ---------- */

//   let filteredTransactions =
//     typeFilter === "All"
//       ? transactions
//       : transactions.filter((t: any) => t.type === typeFilter);

//   filteredTransactions = filterByDate(filteredTransactions);

//   /* ---------- DELETE ---------- */



//   /* ---------- LONG PRESS MENU ---------- */

// //   const openMenu = (item: any) => {
// //     const edit = () => {
// //       router.push({
// //         pathname: "/add",
// //         params: {
// //           transaction: JSON.stringify(item),
// //         },
// //       });
// //     };

// //     const remove = () => {
// //       Alert.alert("Delete Transaction", "Are you sure you want to delete?", [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: () => deleteTransaction(item._id),
// //         },
// //       ]);
// //     };

// //     if (Platform.OS === "ios") {
// //       ActionSheetIOS.showActionSheetWithOptions(
// //         {
// //           options: ["Cancel", "Edit", "Delete"],
// //           destructiveButtonIndex: 2,
// //           cancelButtonIndex: 0,
// //         },
// //         (buttonIndex) => {
// //           if (buttonIndex === 1) edit();
// //           if (buttonIndex === 2) remove();
// //         },
// //       );
// //     } else {
// //       <Modal visible={showActions} transparent animationType="slide">
// //         <View
// //           style={{
// //             flex: 1,
// //             backgroundColor: "rgba(0,0,0,0.4)",
// //             justifyContent: "flex-end",
// //           }}
// //         >
// //           <View
// //             style={{
// //               backgroundColor: theme.card,
// //               padding: 20,
// //               borderTopLeftRadius: 25,
// //               borderTopRightRadius: 25,
// //             }}
// //           >
// //             <TouchableOpacity
// //               onPress={handleEdit}
// //               style={{
// //                 flexDirection: "row",
// //                 alignItems: "center",
// //                 paddingVertical: 14,
// //               }}
// //             >
// //               <Ionicons name="create-outline" size={20} color={theme.text} />

// //               <Text
// //                 style={{
// //                   marginLeft: 10,
// //                   fontSize: 16,
// //                   color: theme.text,
// //                 }}
// //               >
// //                 Edit Transaction
// //               </Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               onPress={handleDelete}
// //               style={{
// //                 flexDirection: "row",
// //                 alignItems: "center",
// //                 paddingVertical: 14,
// //               }}
// //             >
// //               <Ionicons name="trash-outline" size={20} color="#ef4444" />

// //               <Text
// //                 style={{
// //                   marginLeft: 10,
// //                   fontSize: 16,
// //                   color: "#ef4444",
// //                 }}
// //               >
// //                 Delete Transaction
// //               </Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               onPress={() => setShowActions(false)}
// //               style={{
// //                 marginTop: 10,
// //                 alignItems: "center",
// //               }}
// //             >
// //               <Text
// //                 style={{
// //                   color: theme.subText,
// //                   fontSize: 15,
// //                 }}
// //               >
// //                 Cancel
// //               </Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>;
// //     }
// //   };
// const openMenu = (item:any) => {
//   setSelectedTransaction(item)
//   setShowActions(true)
// }
// const handleEdit = () => {
//     setShowActions(false);

//     router.push({
//       pathname: "/add",
//       params: {
//         transaction: JSON.stringify(selectedTransaction),
//       },
//     });
//   };
  
// const handleDelete = () => {
//   if (!selectedTransaction?._id) {
//     console.log("No transaction selected");
//     return;
//   }

//   Alert.alert(
//     "Delete Transaction",
//     "Are you sure you want to delete this transaction?",
//     [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await API.delete(`/transactions/${selectedTransaction._id}`);

//             setShowActions(false);
//             setSelectedTransaction(null);

//             fetchTransactions();
//           } catch (err) {
//             console.log("Delete error:", err);
//           }
//         },
//       },
//     ]
//   );
// };

//   /* ---------- UI ---------- */

//   return (
//     <View style={{ flex: 1, backgroundColor: theme.background }}>
//       {/* HEADER */}

//       <LinearGradient
//         colors={isDark ? ["#1f2a44", "#1a1f33"] : ["#8E67FF", "#5F6BFF"]}
//         style={{
//           paddingTop: 40,
//           paddingBottom: 30,
//           paddingHorizontal: 20,
//           borderBottomLeftRadius: 35,
//           borderBottomRightRadius: 35,
//         }}
//       >
//         <Text
//           style={{
//             color: "#fff",
//             fontSize: 24,
//             fontWeight: "700",
//           }}
//         >
//           Transactions
//         </Text>

//         <Text
//           style={{
//             color: "rgba(255,255,255,0.8)",
//             marginTop: 4,
//           }}
//         >
//           All your financial activity
//         </Text>
//       </LinearGradient>

//       {/* TYPE TABS */}

//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-around",
//           marginTop: 15,
//         }}
//       >
//         {["All", "Income", "Expense", "Investment"].map((type) => {
//           const active = typeFilter === type;

//           return (
//             <TouchableOpacity
//               key={type}
//               onPress={() => setTypeFilter(type as any)}
//               style={{
//                 paddingHorizontal: 16,
//                 paddingVertical: 8,
//                 borderRadius: 20,
//                 backgroundColor: active ? theme.primary : theme.card,
//               }}
//             >
//               <Text
//                 style={{
//                   color: active ? "#fff" : theme.text,
//                   fontWeight: "600",
//                 }}
//               >
//                 {type}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       {/* TIME FILTER DROPDOWN */}

//       <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
//         <TouchableOpacity
//           onPress={() => setDropdownVisible(!dropdownVisible)}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//             backgroundColor: theme.card,
//             padding: 12,
//             borderRadius: 12,
//           }}
//         >
//           <Text style={{ color: theme.text, fontWeight: "600" }}>
//             Filter: {timeFilter}
//           </Text>

//           <Ionicons name="chevron-down" size={18} color={theme.text} />
//         </TouchableOpacity>

//         {dropdownVisible && (
//           <View
//             style={{
//               backgroundColor: theme.card,
//               borderRadius: 12,
//               marginTop: 6,
//             }}
//           >
//             {["All", "Day", "Week", "Month"].map((item) => (
//               <TouchableOpacity
//                 key={item}
//                 onPress={() => {
//                   setTimeFilter(item as any);
//                   setDropdownVisible(false);
//                 }}
//                 style={{
//                   padding: 12,
//                   borderBottomWidth: 0.5,
//                   borderColor: "#ccc",
//                 }}
//               >
//                 <Text style={{ color: theme.text }}>{item}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>

//       {/* TRANSACTIONS LIST */}

//       <FlatList
//         data={filteredTransactions}
//         keyExtractor={(item: any) => item._id}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{
//           padding: 16,
//           paddingBottom: 120,
//         }}
//         renderItem={({ item }) => {
//           const color =
//             item.type === "Income"
//               ? "#16a34a"
//               : item.type === "Expense"
//                 ? "#ef4444"
//                 : "#2563eb";

//           const icon =
//             item.type === "Income"
//               ? "arrow-down"
//               : item.type === "Expense"
//                 ? "arrow-up"
//                 : "trending-up";

//           return (
//             <TouchableOpacity
//               activeOpacity={0.85}
//               onLongPress={() => openMenu(item)}
//               style={{
//                 backgroundColor: theme.card,
//                 padding: 16,
//                 borderRadius: 18,
//                 marginBottom: 12,

//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "space-between",

//                 shadowColor: "#000",
//                 shadowOpacity: 0.05,
//                 shadowRadius: 8,
//                 shadowOffset: { width: 0, height: 3 },
//                 elevation: 3,
//               }}
//             >
//               {/* LEFT SECTION */}

//               <View style={{ flexDirection: "row", flex: 1 }}>
//                 {/* ICON */}

//                 <View
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: color + "20",
//                   }}
//                 >
//                   <Ionicons name={icon} size={20} color={color} />
//                 </View>

//                 <View style={{ marginLeft: 12, flex: 1 }}>
//                   {/* TITLE */}

//                   <Text
//                     style={{
//                       color: theme.text,
//                       fontWeight: "600",
//                       fontSize: 14,
//                     }}
//                   >
//                     {item.title}
//                   </Text>

//                   {/* DESCRIPTION */}

//                   {item.description && (
//                     <Text
//                       style={{
//                         color: theme.subText,
//                         fontSize: 12,
//                         marginTop: 2,
//                       }}
//                     >
//                       {item.description}
//                     </Text>
//                   )}

//                   {/* CATEGORY + DATE */}

//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       marginTop: 5,
//                     }}
//                   >
//                     {/* CATEGORY TAG */}

//                     <View
//                       style={{
//                         backgroundColor: theme.primary + "20",
//                         paddingHorizontal: 8,
//                         paddingVertical: 2,
//                         borderRadius: 10,
//                         marginRight: 8,
//                       }}
//                     >
//                       <Text
//                         style={{
//                           fontSize: 10,
//                           fontWeight: "600",
//                           color: theme.primary,
//                         }}
//                       >
//                         {item.category}
//                       </Text>
//                     </View>

//                     {/* DATE */}

//                     <Text
//                       style={{
//                         color: theme.subText,
//                         fontSize: 11,
//                       }}
//                     >
//                       {new Date(item.date).toLocaleDateString("en-GB", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               {/* AMOUNT */}

//               <Text
//                 numberOfLines={1}
//                 adjustsFontSizeToFit
//                 style={{
//                   fontWeight: "700",
//                   fontSize: 15,
//                   color: color,
//                 }}
//               >
//                 ₹ {Number(item.amount).toLocaleString()}
//               </Text>
//             </TouchableOpacity>
//           );
//         }}
//         ListEmptyComponent={
//           <View style={{ alignItems: "center", marginTop: 80 }}>
//             <Ionicons name="wallet-outline" size={50} color={theme.subText} />

//             <Text
//               style={{
//                 color: theme.subText,
//                 marginTop: 10,
//               }}
//             >
//               No transactions found
//             </Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

 
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
} from "react-native";

import React, { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";

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

  /* ================= FETCH ================= */

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.log("Transactions error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  /* ================= FILTER ================= */

  const filterByDate = (list: any[]) => {
    if (timeFilter === "All") return list;

    const now = new Date();

    return list.filter((t) => {
      const d = new Date(t.date);

      if (timeFilter === "Day") {
        return d.toDateString() === now.toDateString();
      }

      if (timeFilter === "Week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }

      if (timeFilter === "Month") {
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  };

  let filtered =
    typeFilter === "All"
      ? transactions
      : transactions.filter((t: any) => t.type === typeFilter);

  filtered = filterByDate(filtered);

  /* ================= ACTIONS ================= */

  const openMenu = (item: any) => {
    setSelectedTransaction(item);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Edit", "Delete"],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        (i) => {
          if (i === 1) handleEdit(item);
          if (i === 2) handleDelete(item);
        }
      );
    } else {
      setShowActions(true);
    }
  };

  const handleEdit = (item?: any) => {
    const data = item || selectedTransaction;
    if (!data) return;

    setShowActions(false);

    router.push({
      pathname: "/add",
      params: { transaction: JSON.stringify(data) },
    });
  };

  const handleDelete = (item?: any) => {
    const data = item || selectedTransaction;
    if (!data?._id) return;

    Alert.alert("Delete", "Delete this transaction?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await API.delete(`/transactions/${data._id}`);
          fetchTransactions();
          setShowActions(false);
        },
      },
    ]);
  };

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* HEADER */}
      <LinearGradient
        colors={isDark ? ["#1f2a44", "#1a1f33"] : ["#8E67FF", "#5F6BFF"]}
        style={{
          paddingTop: 40,
          paddingBottom: 25,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
          Transactions
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
          Manage your financial activity
        </Text>
      </LinearGradient>

      {/* TYPE FILTER */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          paddingHorizontal: 10,
          gap: 8,
        }}
      >
        {["All", "Income", "Expense", "Investment"].map((type) => {
          const active = typeFilter === type;

          return (
            <TouchableOpacity
              key={type}
              onPress={() => setTypeFilter(type as any)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: active ? theme.primary : theme.card,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: active ? "#fff" : theme.text,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TIME FILTER */}
      <View style={{ padding: 12 }}>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          style={{
            backgroundColor: theme.card,
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: theme.text }}>Filter: {timeFilter}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.text} />
        </TouchableOpacity>

        {dropdownVisible && (
          <View
            style={{
              backgroundColor: theme.card,
              marginTop: 6,
              borderRadius: 12,
            }}
          >
            {["All", "Day", "Week", "Month"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setTimeFilter(item as any);
                  setDropdownVisible(false);
                }}
                style={{ padding: 12 }}
              >
                <Text style={{ color: theme.text }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const color =
            item.type === "Income"
              ? "#16a34a"
              : item.type === "Expense"
              ? "#ef4444"
              : "#2563eb";

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/add",
                  params: { transaction: JSON.stringify(item) },
                })
              }
              onLongPress={() => openMenu(item)}
              style={{
                backgroundColor: theme.card,
                padding: 14,
                borderRadius: 16,
                marginBottom: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", flex: 1 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="wallet" size={16} color={color} />
                </View>

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={{ color: theme.text, fontWeight: "600" }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={{ color: theme.subText, fontSize: 11 }}
                    numberOfLines={1}
                  >
                    {item.category} •{" "}
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Text style={{ color, fontWeight: "700" }}>
                ₹ {Number(item.amount).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ANDROID ACTION MODAL */}
      <Modal visible={showActions} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <TouchableOpacity onPress={() => handleEdit()}>
              <Text style={{ padding: 12, color: theme.text }}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete()}>
              <Text style={{ padding: 12, color: "#ef4444" }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowActions(false)}>
              <Text style={{ padding: 12, textAlign: "center" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}