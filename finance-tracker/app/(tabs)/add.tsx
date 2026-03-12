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

import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import API from "../../src/services/api";

type TabType = "Income" | "Expense" | "Investment";

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Salary",
  "Stocks",
  "Crypto",
  "Other"
];

export default function AddTransaction() {

  const [activeTab, setActiveTab] = useState<TabType>("Expense");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [paymentMode, setPaymentMode] = useState("Cash");

  const [showCategory, setShowCategory] = useState(false);

  const [saving, setSaving] = useState(false);

  const validate = () => {

    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title required" });
      return false;
    }

    if (!amount) {
      Toast.show({ type: "error", text1: "Amount required" });
      return false;
    }

    if (isNaN(Number(amount))) {
      Toast.show({ type: "error", text1: "Amount must be number" });
      return false;
    }

    if (!category) {
      Toast.show({ type: "error", text1: "Select category" });
      return false;
    }

    return true;
  };

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

      await API.post("/transactions", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      Toast.show({
        type: "success",
        text1: "Transaction added 🎉"
      });

      router.replace("/(tabs)/dashboard");

    } catch {

      Toast.show({
        type: "error",
        text1: "Failed to save transaction"
      });

    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{flex:1, backgroundColor:"#0f172a"}}>

      {/* HEADER */}
      <LinearGradient
        colors={["#7C5CFC","#5F2EEA"]}
        style={styles.header}
      >
        <Text style={styles.headerText}>Add Transaction</Text>
      </LinearGradient>

      <ScrollView style={{padding:20}}>

        {/* TRANSACTION TYPE */}
        <View style={styles.tabs}>

          {(["Income","Expense","Investment"] as TabType[]).map(tab => (

            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.activeTab
              ]}
              onPress={()=>setActiveTab(tab)}
            >
              <Text style={{color:"white"}}>

                {tab === "Income" && "💰 Income"}
                {tab === "Expense" && "🛒 Expense"}
                {tab === "Investment" && "📈 Invest"}

              </Text>

            </TouchableOpacity>

          ))}

        </View>

        {/* FORM CARD */}
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

          {/* CATEGORY DROPDOWN */}

          <TouchableOpacity
            style={styles.input}
            onPress={()=>setShowCategory(true)}
          >
            <Text style={{color: category ? "white" : "#94a3b8"}}>
              {category || "Select Category"}
            </Text>
          </TouchableOpacity>

          {/* PAYMENT MODE */}

          <Text style={styles.label}>Payment Mode</Text>

          <View style={styles.paymentRow}>

            {["UPI","Account","Cash","Card"].map(mode => (

              <TouchableOpacity
                key={mode}
                onPress={()=>setPaymentMode(mode)}
                style={[
                  styles.paymentBtn,
                  paymentMode === mode && styles.paymentActive
                ]}
              >
                <Text style={{
                  color: paymentMode === mode ? "white" : "#cbd5f5"
                }}>
                  {mode}
                </Text>
              </TouchableOpacity>

            ))}

          </View>

          {/* DESCRIPTION */}

          <TextInput
            placeholder="Description"
            placeholderTextColor="#94a3b8"
            style={[styles.input,{height:80}]}
            multiline
            value={description}
            onChangeText={setDescription}
          />

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={{color:"white",fontWeight:"bold"}}>
              {saving ? "Saving..." : "Save Transaction"}
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* CATEGORY MODAL */}

      <Modal visible={showCategory} transparent animationType="slide">

        <View style={styles.modalBg}>

          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>Select Category</Text>

            <FlatList
              data={categories}
              keyExtractor={(item)=>item}
              renderItem={({item}) => (

                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={()=>{

                    setCategory(item);
                    setShowCategory(false);

                  }}
                >
                  <Text style={{color:"white"}}>
                    {item}
                  </Text>
                </TouchableOpacity>

              )}
            />

            <TouchableOpacity
              onPress={()=>setShowCategory(false)}
              style={styles.closeBtn}
            >
              <Text style={{color:"#22c55e"}}>
                Close
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </View>
  );
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
marginBottom:12,
justifyContent:"center"
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
maxHeight:"60%"
},

modalTitle:{
color:"white",
fontSize:18,
marginBottom:10
},

categoryItem:{
padding:15,
borderBottomWidth:1,
borderBottomColor:"#334155"
},

closeBtn:{
alignItems:"center",
padding:15
}

});