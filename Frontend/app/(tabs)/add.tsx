import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");


export default function AddTransaction() {
type TabType = "Income" | "Expense" | "Investment";

const [activeTab, setActiveTab] = useState<TabType>("Income");

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState("Cash");
  const [selectedTag, setSelectedTag] = useState("");
  //   const [selectedTag, setSelectedTag] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
const [customTags, setCustomTags] = useState<string[]>([]);


const tagOptions: Record<TabType, string[]> = {
  Income: ["Salary", "Freelance", "Bonus", "Side Income"],
  Expense: ["Eating Out", "Shopping", "Movie", "Gym"],
  Investment: ["SIP", "Insurance", "Stocks", "Crypto"],
};

const handleSave = async () => {
  if (!title || !amount) {
    alert("Please fill required fields");
    return;
  }

  const token = await AsyncStorage.getItem("token");

  const now = new Date();
  const month = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const response = await fetch("http://localhost:8000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      type: activeTab,
      title,
      amount: Number(amount),
      tag: selectedTag,
      payment_method: transactionType,
      description,
      month,
    }),
  });

  if (response.ok) {
    alert("Transaction Added Successfully 🎉");
    setTitle("");
    setAmount("");
    setDescription("");
    setSelectedTag("");
  } else {
    alert("Something went wrong ❌");
  }
};



  return (
    <View style={{ flex: 1, backgroundColor: "#f4f6fb" }}>

      {/* 🔥 Compact Gradient Header */}
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Add Transaction</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* 🔥 Tabs */}
        <View style={styles.tabContainer}>
          {["Income", "Expense", "Investment"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => {
                setActiveTab(tab);
                setSelectedTag("");
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔥 Form */}
        <View style={styles.formCard}>

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Amount */}
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />


{/* 🔥 Tag Selector */}
<Text style={styles.label}>Tag</Text>

<TouchableOpacity
  style={styles.tagSelector}
  onPress={() => setShowTagModal(true)}
>
  <Text style={{ color: selectedTag ? "#000" : "#999" }}>
    {selectedTag || "Select Tag"}
  </Text>
  <Ionicons name="chevron-down" size={18} color="#555" />
</TouchableOpacity>


          {/* </View> */}

          {/* 🔥 Payment Method */}
          <Text style={styles.label}>Payment</Text>
          <View style={styles.typeContainer}>
            {["Cash", "UPI", "Bank", "Card"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  transactionType === type && styles.activeTypeChip,
                ]}
                onPress={() => setTransactionType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    transactionType === type && styles.activeTypeText,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
          />

          {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>

            <Text style={styles.saveText}>
              Save {activeTab}
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
      
     <Modal visible={showTagModal} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.tagModal}>
      <Text style={styles.modalTitle}>Select Tag</Text>

      <ScrollView>
        {[...tagOptions[activeTab], ...customTags].map((tag) => (
          <TouchableOpacity
            key={tag}
            style={styles.modalTagItem}
            onPress={() => {
              setSelectedTag(tag);
              setShowTagModal(false);
            }}
          >
            <Text>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addTagBtn}
        onPress={() => {
          const newTag = "New Tag " + (customTags.length + 1);
          setCustomTags([...customTags, newTag]);
        }}
      >
        <Text style={{ color: "#fff" }}>+ Add Tag</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => setShowTagModal(false)}
      >
        <Text>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 120,
    padding: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  body: {
    marginTop: -20,
    padding: 20,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  tabButton: {
    width: width / 3.5,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    elevation: 3,
  },

  activeTab: {
    backgroundColor: "#7C5CFC",
  },

  tabText: {
    fontWeight: "600",
    color: "#555",
  },

  activeTabText: {
    color: "#fff",
  },

  formCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    elevation: 4,
  },

  input: {
    backgroundColor: "#f2f3f7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },

  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#eef1ff",
    marginRight: 8,
    marginBottom: 8,
  },

  activeTag: {
    backgroundColor: "#7C5CFC",
  },

  tagText: {
    fontSize: 12,
    color: "#555",
  },

  activeTagText: {
    color: "#fff",
  },

  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },

  activeTypeChip: {
    backgroundColor: "#7C5CFC",
  },

  typeText: {
    fontSize: 12,
    color: "#555",
  },

  activeTypeText: {
    color: "#fff",
  },

  saveBtn: {
    backgroundColor: "#7C5CFC",
    padding: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f3f7",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  tagModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "70%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  modalTagItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  addTagBtn: {
    backgroundColor: "#7C5CFC",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 15,
  },

  closeBtn: {
    alignItems: "center",
    marginTop: 10,
  },

});
