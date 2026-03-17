import {
View,
Text,
TextInput,
TouchableOpacity,
ScrollView,
StyleSheet,
Modal,
FlatList
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import API from "../../src/services/api";
import { useFocusEffect } from "expo-router";
type TabType = "Income" | "Expense" | "Investment";

export default function AddTransaction() {

const [activeTab,setActiveTab] = useState<TabType>("Expense")
const params = useLocalSearchParams();

const transaction =
  params.transaction && params.transaction !== "null"
    ? params.transaction
    : null;

const mode = params.mode || "create";

// const editData = transaction ? JSON.parse(transaction as string) : null;
const [title,setTitle] = useState("")
const [amount,setAmount] = useState("")
const [category,setCategory] = useState("")
const [description,setDescription] = useState("")
const [paymentMode,setPaymentMode] = useState("Cash")

const [showCategory,setShowCategory] = useState(false)
const [saving,setSaving] = useState(false)

/* CATEGORY STATES */

const [categories,setCategories] = useState<any[]>([])

const [showAdd,setShowAdd] = useState(false)

const [emoji,setEmoji] = useState("😀")
const [catTitle,setCatTitle] = useState("")

const [editing,setEditing] = useState<any>(null)

/* LOAD CATEGORY */

const loadCategories = async () => {

try{

const token = await AsyncStorage.getItem("token")

const res = await API.get(`/categories/${activeTab}`,{
headers:{ Authorization:`Bearer ${token}` }
})

setCategories(res.data)

}catch{
Toast.show({type:"error",text1:"Failed loading categories"})
}

}

useEffect(()=>{
loadCategories()
},[activeTab])


/* CREATE CATEGORY */

const createCategory = async ()=>{

if(!catTitle.trim()){
Toast.show({type:"error",text1:"Category title required"})
return
}

try{

const token = await AsyncStorage.getItem("token")

const res = await API.post("/categories",
{
title:catTitle,
emoji,
type:activeTab
},
{
headers:{ Authorization:`Bearer ${token}` }
})

setCategories([res.data,...categories])

setCatTitle("")
setEmoji("😀")
setShowAdd(false)

Toast.show({type:"success",text1:"Category created"})

}catch{

Toast.show({type:"error",text1:"Create failed"})

}

}


/* UPDATE CATEGORY */

const updateCategory = async ()=>{

try{

const token = await AsyncStorage.getItem("token")

const res = await API.put(`/categories/${editing._id}`,
{
title:catTitle,
emoji
},
{
headers:{ Authorization:`Bearer ${token}` }
})

setCategories(
categories.map(c =>
c._id === editing._id ? res.data : c
)
)

setEditing(null)
setCatTitle("")
setEmoji("😀")
setShowAdd(false)

Toast.show({type:"success",text1:"Category updated"})

}catch{

Toast.show({type:"error",text1:"Update failed"})

}

}


/* DELETE CATEGORY */

const deleteCategory = async(id:string)=>{

try{

const token = await AsyncStorage.getItem("token")

await API.delete(`/categories/${id}`,{
headers:{ Authorization:`Bearer ${token}` }
})

setCategories(categories.filter(c=>c._id!==id))

Toast.show({type:"success",text1:"Category deleted"})

}catch{

Toast.show({type:"error",text1:"Delete failed"})

}

}


/* VALIDATE */

const validate = ()=>{

if(!title.trim()){
Toast.show({type:"error",text1:"Title required"})
return false
}

if(!amount){
Toast.show({type:"error",text1:"Amount required"})
return false
}

if(isNaN(Number(amount))){
Toast.show({type:"error",text1:"Amount must be number"})
return false
}

if(!category){
Toast.show({type:"error",text1:"Select category"})
return false
}

return true
}


useFocusEffect(
  React.useCallback(() => {
    // ✅ HARD RESET FIRST
    setTitle("");
    setAmount("");
    setCategory("");
    setDescription("");
    setPaymentMode("Cash");
    setActiveTab("Expense");

    // small delay ensures state flush (important)
    setTimeout(() => {
      if (transaction && mode !== "create") {
        try {
          const parsed = JSON.parse(transaction as string);

          setTitle(parsed.title || "");
          setAmount(String(parsed.amount || ""));
          setCategory(parsed.category || "");
          setDescription(parsed.description || "");
          setPaymentMode(parsed.paymentMode || "Cash");
          setActiveTab(parsed.type || "Expense");
        } catch (e) {
          console.log("Parse error", e);
        }
      }
    }, 0);

  }, [transaction, mode])
);

/* SAVE TRANSACTION */

const handleSave = async () => {

if (!validate()) return;

try {

setSaving(true);

const token = await AsyncStorage.getItem("token");

const payload = {
type: activeTab,
title,
amount: Number(amount),
category,
paymentMode,
description,
date: new Date()
};

if (transaction && mode !== "create") {
  const parsed = JSON.parse(transaction as string);

  await API.put(`/transactions/${parsed._id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
}else{

await API.post("/transactions", payload,{
headers:{Authorization:`Bearer ${token}`}
});

Toast.show({
type:"success",
text1:"Transaction added"
});

}

router.replace("/(tabs)/dashboard");

}catch{

Toast.show({
type:"error",
text1:"Failed to save transaction"
});

}finally{
setSaving(false);
}

};

return(

<View style={{flex:1,backgroundColor:"#0f172a"}}>

{/* HEADER */}

<LinearGradient
colors={["#7C5CFC","#5F2EEA"]}
style={styles.header}
>
<Text style={styles.headerText}>Add Transaction</Text>
</LinearGradient>


<ScrollView style={{padding:20}}>

{/* TABS */}

<View style={styles.tabs}>

{(["Income","Expense","Investment"] as TabType[]).map(tab=>(
<TouchableOpacity
key={tab}
style={[styles.tabBtn,activeTab===tab && styles.activeTab]}
onPress={()=>setActiveTab(tab)}
>

<Text style={{color:"white"}}>
{tab==="Income" && " Income"}
{tab==="Expense" && " Expense"}
{tab==="Investment" && " Invest"}
</Text>

</TouchableOpacity>
))}

</View>


<View style={styles.card}>

<TextInput
placeholder="Title"
placeholderTextColor="#94a3b8"
style={styles.input}
value={title}
onChangeText={setTitle}
/>

<TextInput
placeholder="Amount"
placeholderTextColor="#94a3b8"
keyboardType="numeric"
style={styles.input}
value={amount}
onChangeText={setAmount}
/>


{/* CATEGORY */}

<TouchableOpacity
style={styles.input}
onPress={()=>setShowCategory(true)}
>

<Text style={{color:category?"white":"#94a3b8"}}>
{category || "Select Category"}
</Text>

</TouchableOpacity>


<Text style={styles.label}>Payment Mode</Text>

<View style={styles.paymentRow}>

{["UPI","Account","Cash","Card"].map(mode=>(
<TouchableOpacity
key={mode}
onPress={()=>setPaymentMode(mode)}
style={[
styles.paymentBtn,
paymentMode===mode && styles.paymentActive
]}
>

<Text style={{
color:paymentMode===mode?"white":"#cbd5f5"
}}>
{mode}
</Text>

</TouchableOpacity>
))}

</View>


<TextInput
placeholder="Description"
placeholderTextColor="#94a3b8"
style={[styles.input,{height:80}]}
multiline
value={description}
onChangeText={setDescription}
/>


<TouchableOpacity
style={styles.saveBtn}
onPress={handleSave}
disabled={saving}
>

<Text style={{color:"white",fontWeight:"bold"}}>
{saving
  ? "Saving..."
  : transaction && mode !== "create"
  ? "Update Transaction"
  : "Save Transaction"}
</Text>

</TouchableOpacity>

</View>

</ScrollView>


{/* CATEGORY MODAL */}

<Modal visible={showCategory} transparent animationType="slide">

<View style={styles.modalBg}>

<View style={styles.modalCard}>

<View style={styles.modalHeader}>

<Text style={styles.modalTitle}>Select Category</Text>

<TouchableOpacity
style={styles.floatingAdd}
onPress={()=>{
setEditing(null)
setCatTitle("")
setEmoji("😀")
setShowAdd(true)
}}
>
<Text style={{color:"white",fontSize:22}}>+</Text>
</TouchableOpacity>

</View>


{showAdd && (

<View style={styles.addBox}>

<TextInput
placeholder="Emoji"
placeholderTextColor="#94a3b8"
style={styles.input}
value={emoji}
onChangeText={setEmoji}
/>

<TextInput
placeholder="Category Title"
placeholderTextColor="#94a3b8"
style={styles.input}
value={catTitle}
onChangeText={setCatTitle}
/>

<TouchableOpacity
style={styles.saveBtn}
onPress={editing ? updateCategory : createCategory}
>

<Text style={{color:"white",fontWeight:"600"}}>
{editing ? "Update Category" : "Save Category"}
</Text>

</TouchableOpacity>

</View>

)}


<FlatList
data={categories}
numColumns={4}
keyExtractor={(item)=>item._id}
contentContainerStyle={{paddingTop:15}}
renderItem={({item})=>(

<TouchableOpacity
style={styles.categoryBox}

onPress={()=>{
setCategory(item.title)
setShowCategory(false)
}}

onLongPress={()=>{

if(item.isDefault) return

setEditing(item)
setCatTitle(item.title)
setEmoji(item.emoji)

Alert.alert(
"Category",
"Choose action",
[
{ text:"Edit", onPress:()=>setShowAdd(true) },
{ text:"Delete", onPress:()=>deleteCategory(item._id), style:"destructive" },
{ text:"Cancel", style:"cancel" }
]
)

}}
>

<Text style={styles.categoryEmoji}>
{item.emoji}
</Text>

<Text style={styles.categoryText}>
{item.title}
</Text>

</TouchableOpacity>

)}
/>


<TouchableOpacity
onPress={()=>setShowCategory(false)}
style={styles.closeBtn}
>

<Text style={{color:"#22c55e",fontWeight:"600"}}>
Close
</Text>

</TouchableOpacity>

</View>

</View>

</Modal>

</View>

)

}


const styles = StyleSheet.create({

header:{
height:120,
justifyContent:"center",
paddingHorizontal:20,
borderBottomLeftRadius:30,
borderBottomRightRadius:30
},

headerText:{
color:"white",
fontSize:20,
fontWeight:"600"
},

tabs:{
flexDirection:"row",
marginBottom:20
},

tabBtn:{
flex:1,
padding:10,
marginHorizontal:5,
borderRadius:20,
backgroundColor:"#1e293b",
alignItems:"center"
},

activeTab:{
backgroundColor:"#22c55e"
},

card:{
backgroundColor:"#1e293b",
padding:15,
borderRadius:20
},

input:{
backgroundColor:"#0f172a",
padding:14,
borderRadius:12,
color:"white",
marginBottom:12
},

label:{
color:"#cbd5f5",
marginBottom:8
},

paymentRow:{
flexDirection:"row",
flexWrap:"wrap",
marginBottom:12
},

paymentBtn:{
backgroundColor:"#0f172a",
paddingVertical:8,
paddingHorizontal:14,
borderRadius:20,
marginRight:10,
marginBottom:10
},

paymentActive:{
backgroundColor:"#22c55e"
},

saveBtn:{
backgroundColor:"#22c55e",
padding:15,
borderRadius:14,
alignItems:"center",
marginTop:10
},

modalBg:{
flex:1,
backgroundColor:"rgba(0,0,0,0.6)",
justifyContent:"flex-end"
},

modalCard:{
backgroundColor:"#1e293b",
padding:20,
borderTopLeftRadius:25,
borderTopRightRadius:25,
maxHeight:"70%"
},

modalTitle:{
color:"white",
fontSize:18,
marginBottom:10
},

categoryRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
padding:15,
borderBottomWidth:1,
borderBottomColor:"#334155"
},

addBtn:{
backgroundColor:"#334155",
padding:12,
borderRadius:12,
alignItems:"center",
marginBottom:10
},

closeBtn:{
alignItems:"center",
padding:15
},
modalHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

floatingAdd:{
backgroundColor:"#22c55e",
width:36,
height:36,
borderRadius:18,
alignItems:"center",
justifyContent:"center"
},

addBox:{
marginTop:15
},

categoryBox:{
flex:1,
margin:6,
backgroundColor:"#0f172a",
borderRadius:14,
alignItems:"center",
justifyContent:"center",
paddingVertical:16
},

categoryEmoji:{
fontSize:24
},

categoryText:{
color:"white",
fontSize:12,
marginTop:6,
textAlign:"center"
}

})