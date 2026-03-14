import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import { useEffect, useState } from "react";
import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";

const screenWidth = Dimensions.get("window").width;

type Transaction = {
  _id: string;
  type: "Income" | "Expense" | "Investment";
  title: string;
  amount: number;
  // tag: string;
  category: string;

  createdAt: string;
};

export default function Reports() {

  const { theme, isDark } = useTheme();

  const [transactions,setTransactions] = useState<Transaction[]>([]);
  const [chartData,setChartData] = useState<any[]>([]);

  const [activeType,setActiveType] =
  useState<"All" | "Income" | "Expense" | "Investment">("All");

  const [chartType,setChartType] =
  useState<"pie" | "line" | "bar">("pie");

  const [period,setPeriod] = useState("Monthly");
  const [showPeriodMenu,setShowPeriodMenu] = useState(false);

  /* ---------- MONTH GENERATOR ---------- */

  const generateMonths = () => {

    const now = new Date();
    const year = now.getFullYear();

    return Array.from({ length:12 },(_,i)=>{

      const date = new Date(year,i);

      return date.toLocaleString("default",{
        month:"short",
        year:"numeric"
      });

    });

  };

  const months = generateMonths();

  const now = new Date();

  const currentMonth = now.toLocaleString("default",{
    month:"short",
    year:"numeric"
  });

  const [selectedMonth,setSelectedMonth] = useState(currentMonth);

  /* ---------- FETCH TRANSACTIONS ---------- */

  const fetchTransactions = async () => {

    try {

      const res = await API.get("/transactions/month",{
        params:{ month:selectedMonth }
      });

      setTransactions(res.data);

    } catch(err){

      console.log("Report fetch error:",err);

    }

  };

  useEffect(()=>{
    fetchTransactions();
  },[selectedMonth]);

  /* ---------- PERIOD FILTER ---------- */

  const filterByPeriod = (data:Transaction[]) => {

    const now = new Date();

    if(period === "Daily"){

      return data.filter(t=>
        new Date(t.createdAt).toDateString() === now.toDateString()
      );

    }

    if(period === "Weekly"){

      const weekAgo = new Date();
      weekAgo.setDate(now.getDate()-7);

      return data.filter(t =>
        new Date(t.createdAt) >= weekAgo
      );

    }

    if(period === "Monthly"){

      const [monthName,year] = selectedMonth.split(" ");

      return data.filter(t=>{

        const d = new Date(t.createdAt);

        return (
          d.toLocaleString("default",{month:"short"}) === monthName &&
          d.getFullYear().toString() === year
        );

      });

    }

    return data;

  };

  /* ---------- CHART PREPARATION ---------- */

  useEffect(()=>{

    let filtered = filterByPeriod(transactions);

    if(activeType !== "All"){
      filtered = filtered.filter(t => t.type === activeType);
    }

    const grouped:any = {};
    let total = 0;

    filtered.forEach(item=>{

      total += item.amount;

      // const key = item.tag || "Other";
      const key = item.category || "Other";

      grouped[key] = (grouped[key] || 0) + item.amount;

    });

    const colors = [
      "#7C5CFC","#22c55e","#ef4444","#f59e0b",
      "#06b6d4","#a855f7","#3b82f6","#f97316"
    ];

    const formatted = Object.keys(grouped).map((key,index)=>{

      const amount = grouped[key];

      const percent =
      total ? ((amount/total)*100).toFixed(1) : "0";

      return {

        name:`${key} ${percent}%`,
        amount,
        percentage:percent,
        color:colors[index % colors.length],
        legendFontColor:theme.text,
        legendFontSize:12

      };

    });

    setChartData(formatted);

  },[transactions,activeType,period]);

  /* ---------- UI ---------- */

  return (

<View style={{flex:1,backgroundColor:theme.background}}>

{/* HEADER */}

<LinearGradient
colors={isDark?["#1a253f","#232947"]:["#8E67FF","#5F6BFF"]}
style={{
paddingTop:35,
paddingBottom:24,
paddingHorizontal:16,
borderBottomLeftRadius:35,
borderBottomRightRadius:35
}}
>

<Text style={{
color:"#fff",
fontSize:24,
fontWeight:"700"
}}>
Reports
</Text>

<Text style={{
color:"rgba(255,255,255,0.8)",
marginTop:4
}}>
{selectedMonth}
</Text>

{/* MONTH SELECTOR */}

<FlatList
horizontal
data={months}
showsHorizontalScrollIndicator={false}
keyExtractor={(item)=>item}
style={{marginTop:18}}
renderItem={({item})=>{

const active = selectedMonth === item;

return(

<TouchableOpacity
onPress={()=>setSelectedMonth(item)}
style={{marginRight:18,alignItems:"center"}}
>

<Text style={{
color:active?"#fff":"rgba(255,255,255,0.6)",
fontWeight:active?"700":"500",
fontSize:15
}}>
{item.split(" ")[0]}
</Text>

{active && (

<View style={{
marginTop:6,
height:3,
width:26,
borderRadius:20,
backgroundColor:"#fff"
}}/>

)}

</TouchableOpacity>

);

}}
/>

</LinearGradient>

{/* TYPE FILTER */}

<View style={{
flexDirection:"row",
justifyContent:"space-around",
marginTop:12,
paddingHorizontal:12
}}>

{["All","Income","Expense","Investment"].map(type=>{

const active = activeType === type;

return(

<TouchableOpacity
key={type}
onPress={()=>setActiveType(type as any)}
style={{
paddingHorizontal:16,
paddingVertical:8,
borderRadius:20,
backgroundColor:active?theme.primary:theme.card
}}
>

<Text style={{
color:active?"#fff":theme.text,
fontWeight:"500"
}}>
{type}
</Text>

</TouchableOpacity>

);

})}

</View>

{/* CHART CARD */}

<View style={{
margin:14,
backgroundColor:theme.card,
borderRadius:24,
padding:10
}}>

{/* CHART SWITCH */}

<View style={{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
}}>

<Text style={{
color:theme.text,
fontWeight:"600"
}}>
Distribution
</Text>

<View style={{flexDirection:"row"}}>

{[
{type:"pie",icon:"pie-chart"},
{type:"line",icon:"stats-chart"},
{type:"bar",icon:"bar-chart"}
].map(item=>{

const active = chartType === item.type;

return(

<TouchableOpacity
key={item.type}
onPress={()=>setChartType(item.type as any)}
style={{marginLeft:8}}
>

<Ionicons
name={item.icon as any}
size={20}
color={active?theme.primary:theme.text}
/>

</TouchableOpacity>

);

})}

</View>

</View>

{/* CHART */}

<View style={{alignItems:"center",marginTop:10}}>

{chartData.length === 0 ? (

<View style={{alignItems:"center",padding:40}}>

<Ionicons
name="analytics-outline"
size={40}
color={theme.subText}
/>

<Text style={{
color:theme.subText,
marginTop:8
}}>
No data available
</Text>

</View>

) : chartType === "pie" ? (

<PieChart
data={chartData}
width={screenWidth-60}
height={230}
accessor="amount"
backgroundColor="transparent"
paddingLeft="15"
chartConfig={{
backgroundGradientFrom:theme.card,
backgroundGradientTo:theme.card,
decimalPlaces:0,
color:()=>theme.text,
labelColor:()=>theme.text
}}
/>

) : chartType === "line" ? (

<LineChart
data={{
labels:chartData.map(d=>d.name.split(" ")[0]),
datasets:[{data:chartData.map(d=>d.amount)}]
}}
width={screenWidth-60}
height={230}
chartConfig={{
backgroundGradientFrom:theme.card,
backgroundGradientTo:theme.card,
decimalPlaces:0,
color:()=>theme.primary,
labelColor:()=>theme.text
}}
bezier
/>

) : (

<BarChart
data={{
labels:chartData.map(d=>d.name.split(" ")[0]),
datasets:[{data:chartData.map(d=>d.amount)}]
}}
width={screenWidth-60}
height={230}
fromZero
showValuesOnTopOfBars
chartConfig={{
backgroundGradientFrom:theme.card,
backgroundGradientTo:theme.card,
decimalPlaces:0,
color:()=>theme.primary,
labelColor:()=>theme.text
}}
/>

)}

</View>

</View>

{/* BREAKDOWN LIST */}

<FlatList
data={chartData}
keyExtractor={(item,index)=>index.toString()}
contentContainerStyle={{paddingBottom:120}}
renderItem={({item})=>(

<View style={{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginHorizontal:14,
marginBottom:6,
padding:14,
borderRadius:12,
backgroundColor:theme.card
}}>

<View style={{flexDirection:"row",alignItems:"center"}}>

<View style={{
width:10,
height:10,
borderRadius:6,
marginRight:10,
backgroundColor:item.color
}}/>

<Text style={{color:theme.text}}>
{item.name}
</Text>

</View>

<Text style={{
color:theme.text,
fontWeight:"600"
}}>
₹ {item.amount} ({item.percentage}%)
</Text>

</View>

)}
/>

</View>

  );

}
