import {
View,
Text,
TouchableOpacity,
StyleSheet,
Alert,
ActivityIndicator,
ScrollView
} from "react-native";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";

export default function Profile() {

const { theme, isDark, toggleTheme } = useTheme();

const [user,setUser] = useState<any>(null);
const [loading,setLoading] = useState(true);

const [transactions,setTransactions] = useState<any[]>([]);

const [stats,setStats] = useState({
count:0,
income:0,
expense:0,
investment:0
});

/* ---------------- FETCH USER ---------------- */

const fetchUser = async () => {

try{

const token = await AsyncStorage.getItem("token");

if(!token){
router.replace("/login");
return;
}

const res = await API.get("/auth/me");

setUser(res.data);

}catch(err){

console.log(err);

}

};

/* ---------------- FETCH TRANSACTIONS ---------------- */

const fetchTransactions = async () => {

try{

const res = await API.get("/transactions");

setTransactions(res.data);

let income = 0;
let expense = 0;
let investment = 0;

res.data.forEach((t:any)=>{

if(t.type === "Income") income += t.amount;
if(t.type === "Expense") expense += t.amount;
if(t.type === "Investment") investment += t.amount;

});

setStats({
count: res.data.length,
income,
expense,
investment
});

}catch(err){

console.log(err);

}

};

useEffect(()=>{

(async()=>{

await fetchUser();
await fetchTransactions();
setLoading(false);

})();

},[]);

/* ---------------- LOGOUT ---------------- */

const handleLogout = ()=>{

Alert.alert(
"Logout",
"Are you sure you want to logout?",
[
{ text:"Cancel",style:"cancel"},
{
text:"Logout",
style:"destructive",
onPress:async()=>{

await AsyncStorage.removeItem("token");

router.replace("/login");

}
}
]
);

};

if(loading){

return(
<View style={[styles.loading,{backgroundColor:theme.background}]}>
<ActivityIndicator size="large" color={theme.primary}/>
</View>
);

}

const totalBalance = stats.income - stats.expense;

/* ---------------- UI ---------------- */

return(

<ScrollView
style={{flex:1,backgroundColor:theme.background}}
showsVerticalScrollIndicator={false}
>

{/* HEADER */}

<LinearGradient
colors={["#8E67FF","#5F6BFF"]}
style={styles.header}
>

<View style={styles.avatar}>
<Text style={styles.avatarText}>
{user?.name?.charAt(0)?.toUpperCase()}
</Text>
</View>

<Text style={styles.name}>{user?.name}</Text>

<Text style={styles.email}>{user?.email}</Text>

</LinearGradient>


{/* BALANCE CARD */}

<View style={[styles.balanceCard,{backgroundColor:theme.card}]}>
<Text style={{color:theme.subText}}>Total Balance</Text>

<Text style={{
fontSize:28,
fontWeight:"bold",
marginTop:6,
color: totalBalance >=0 ? "#16a34a" : "#ef4444"
}}>
₹ {totalBalance}
</Text>
</View>


{/* TRANSACTION STATS */}

<View style={styles.statsRow}>

<View style={[styles.statCard,{backgroundColor:theme.card}]}>
<Ionicons name="list" size={22} color="#6366f1"/>
<Text style={[styles.statNumber,{color:theme.text}]}>
{stats.count}
</Text>
<Text style={{color:theme.subText,fontSize:12}}>
Transactions
</Text>
</View>

<View style={[styles.statCard,{backgroundColor:theme.card}]}>
<Ionicons name="arrow-down" size={22} color="#16a34a"/>
<Text style={[styles.statNumber,{color:"#16a34a"}]}>
₹ {stats.income}
</Text>
<Text style={{color:theme.subText,fontSize:12}}>
Income
</Text>
</View>

</View>


<View style={styles.statsRow}>

<View style={[styles.statCard,{backgroundColor:theme.card}]}>
<Ionicons name="arrow-up" size={22} color="#ef4444"/>
<Text style={[styles.statNumber,{color:"#ef4444"}]}>
₹ {stats.expense}
</Text>
<Text style={{color:theme.subText,fontSize:12}}>
Expense
</Text>
</View>

<View style={[styles.statCard,{backgroundColor:theme.card}]}>
<Ionicons name="trending-up" size={22} color="#2563eb"/>
<Text style={[styles.statNumber,{color:"#2563eb"}]}>
₹ {stats.investment}
</Text>
<Text style={{color:theme.subText,fontSize:12}}>
Investment
</Text>
</View>

</View>


{/* SETTINGS */}

<View style={[styles.card,{backgroundColor:theme.card}]}>

<TouchableOpacity
style={styles.row}
onPress={toggleTheme}
activeOpacity={0.7}
>

<View style={styles.rowLeft}>
<Ionicons
name={isDark ? "moon":"sunny"}
size={20}
color={theme.primary}
/>

<Text style={[styles.rowText,{color:theme.text}]}>
Dark Mode
</Text>
</View>

<Ionicons
name={isDark ? "toggle":"toggle-outline"}
size={30}
color={theme.primary}
/>

</TouchableOpacity>


<View style={{height:1,backgroundColor:theme.border,marginVertical:12}}/>

<TouchableOpacity
style={styles.logoutBtn}
onPress={handleLogout}
>

<Ionicons name="log-out-outline" size={18} color="#fff"/>

<Text style={styles.logoutText}>
Logout
</Text>

</TouchableOpacity>

</View>

</ScrollView>

);

}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

header:{
paddingTop:60,
paddingBottom:40,
alignItems:"center",
borderBottomLeftRadius:35,
borderBottomRightRadius:35
},

avatar:{
width:90,
height:90,
borderRadius:45,
backgroundColor:"rgba(255,255,255,0.25)",
justifyContent:"center",
alignItems:"center",
marginBottom:12
},

avatarText:{
fontSize:36,
fontWeight:"bold",
color:"#fff"
},

name:{
fontSize:22,
fontWeight:"bold",
color:"#fff"
},

email:{
color:"rgba(255,255,255,0.8)",
marginTop:4
},

balanceCard:{
margin:20,
padding:18,
borderRadius:18,
shadowColor:"#000",
shadowOpacity:0.1,
shadowRadius:10,
shadowOffset:{width:0,height:5},
elevation:6
},

statsRow:{
flexDirection:"row",
justifyContent:"space-between",
paddingHorizontal:20,
marginBottom:15
},

statCard:{
width:"48%",
padding:18,
borderRadius:16,
alignItems:"center",
shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:8,
shadowOffset:{width:0,height:3},
elevation:4
},

statNumber:{
fontSize:18,
fontWeight:"bold",
marginTop:6
},

card:{
margin:20,
padding:18,
borderRadius:18,
shadowColor:"#000",
shadowOpacity:0.1,
shadowRadius:10,
shadowOffset:{width:0,height:4},
elevation:5
},

row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

rowLeft:{
flexDirection:"row",
alignItems:"center"
},

rowText:{
marginLeft:12,
fontSize:16,
fontWeight:"500"
},

logoutBtn:{
marginTop:10,
backgroundColor:"#ef4444",
padding:14,
borderRadius:12,
alignItems:"center",
flexDirection:"row",
justifyContent:"center",
gap:8,
shadowColor:"#ef4444",
shadowOpacity:0.3,
shadowRadius:6,
shadowOffset:{width:0,height:4},
elevation:5
},

logoutText:{
color:"#fff",
fontWeight:"bold"
}

});