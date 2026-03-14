import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";
export default function Dashboard() {

  const { theme, isDark } = useTheme();

  const [user,setUser] = useState(null);

  const [summary,setSummary] = useState({
    income:0,
    expense:0,
    investment:0,
    balance:0
  });

  const [transactions,setTransactions] = useState([]);
  const [recentTransactions,setRecentTransactions] = useState([]);

  // const BASE_URL = "http://192.168.10.47:5000/api";

  /* ---------------- FETCH USER ---------------- */

 const fetchUser = async () => {
  try {
    const res = await API.get("/auth/me");
    setUser(res.data);
  } catch (err) {
    console.log("User fetch error:", err);
  }
};
  /* ---------------- FETCH DASHBOARD ---------------- */

const fetchDashboard = async () => {
  try {
    const summaryRes = await API.get("/transactions/summary");
    setSummary(summaryRes.data);

    const recentRes = await API.get("/transactions/recent");
    setRecentTransactions(recentRes.data);
  } catch (err) {
    console.log("Dashboard error:", err);
  }
};

  /* ---------------- FETCH ALL ---------------- */

const fetchTransactions = async () => {
  try {
    const res = await API.get("/transactions");
    setTransactions(res.data);
  } catch (err) {
    console.log("Transactions error:", err);
  }
};

  useFocusEffect(
    React.useCallback(()=>{
      fetchUser();
      fetchDashboard();
      fetchTransactions();
    },[])
  );

  /* ---------------- CATEGORY ANALYTICS ---------------- */

  const categoryMap = {};

  transactions.forEach(t=>{
    if(!categoryMap[t.category]) categoryMap[t.category]=0;
    categoryMap[t.category]+=Number(t.amount);
  });

  const topCategories = Object.entries(categoryMap)
  .sort((a,b)=>b[1]-a[1])
  .slice(0,3);

  /* ---------------- UI ---------------- */

  return (

<View style={{flex:1,backgroundColor:theme.background}}>

{/* HEADER */}

<LinearGradient
colors={isDark?["#1f2a44","#1a1f33"]:["#8E67FF","#5F6BFF"]}
style={{
paddingTop:40,
paddingBottom:30,
borderBottomLeftRadius:35,
borderBottomRightRadius:35,
paddingHorizontal:20
}}
>

{/* TOP ROW */}

<View style={{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
}}>

<Text style={{color:"#fff",fontSize:16}}>
Hello {user?.name ?? ""}
</Text>

<TouchableOpacity
onPress={()=>router.push("/settings")}
style={{
width:42,
height:42,
borderRadius:21,
backgroundColor:"white",
alignItems:"center",
justifyContent:"center"
}}
>
<Text style={{fontWeight:"bold",color:"#6366f1"}}>
{user?.name?.charAt(0).toUpperCase()}
</Text>
</TouchableOpacity>

</View>

{/* BALANCE */}

<View style={{alignItems:"center",marginTop:20}}>

<Text style={{color:"rgba(255,255,255,0.7)",fontSize:12}}>
CURRENT BALANCE
</Text>

<Text style={{
color:"#fff",
fontSize:36,
fontWeight:"bold",
marginTop:5
}}>
₹ {summary.balance.toLocaleString()}
</Text>

</View>

{/* QUICK ACTIONS */}

<View style={{
flexDirection:"row",
justifyContent:"space-around",
marginTop:25
}}>



</View>

</LinearGradient>

{/* BODY */}

<ScrollView
style={{flex:1}}
contentContainerStyle={{padding:16,paddingBottom:100}}
>

{/* SUMMARY CARDS */}

<View style={{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:20
}}>

{[
{label:"Income",value:summary.income,color:"#16a34a",icon:"arrow-down"},
{label:"Expense",value:summary.expense,color:"#ef4444",icon:"arrow-up"},
{label:"Invest",value:summary.investment,color:"#2563eb",icon:"trending-up"}
].map(card=>(

<View
key={card.label}
style={{
flex:1,
backgroundColor:theme.card,
padding:14,
borderRadius:18,
marginHorizontal:4,
alignItems:"center"
}}
>

<Ionicons name={card.icon} size={20} color={card.color}/>

<Text style={{color:theme.subText,fontSize:11}}>
{card.label}
</Text>

<Text style={{color:card.color,fontWeight:"bold"}}>
₹ {card.value}
</Text>

</View>

))}

</View>

{/* CATEGORY INSIGHTS */}

<Text style={{
color:theme.text,
fontWeight:"600",
marginBottom:8
}}>
Top Spending
</Text>

{topCategories.map(([cat,val])=>(

<View
key={cat}
style={{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:8
}}
>

<Text style={{color:theme.text}}>
{cat}
</Text>

<Text style={{color:theme.primary}}>
₹ {val}
</Text>

</View>

))}

{/* RECENT TRANSACTIONS */}

<View style={{
flexDirection:"row",
justifyContent:"space-between",
marginTop:20
}}>

<Text style={{
color:theme.text,
fontWeight:"600"
}}>
Recent Transactions
</Text>

<TouchableOpacity onPress={()=>router.push("/transactions")}>
<Text style={{color:"#6366f1"}}>
View All
</Text>
</TouchableOpacity>

</View>

{recentTransactions.map(item=>(

<View
key={item._id}
style={{
backgroundColor:theme.card,
padding:14,
borderRadius:16,
marginTop:10,
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
}}
>

<View>

<Text style={{color:theme.text,fontWeight:"600"}}>
{item.title}
</Text>

<Text style={{color:theme.subText,fontSize:12}}>
{item.category}
</Text>

</View>

<Text style={{
fontWeight:"bold",
color:item.type==="Income"
?"#16a34a"
:item.type==="Expense"
?"#ef4444"
:"#2563eb"
}}>
₹ {item.amount}
</Text>

</View>

))}

</ScrollView>

</View>

  );
}