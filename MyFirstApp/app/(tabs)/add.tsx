import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function AddTransaction() {
  type TabType = "Income" | "Expense" | "Investment";

  const [activeTab, setActiveTab] = useState<TabType>("Income");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transactionType, setTransactionType] = useState("Cash");
  const [selectedTag, setSelectedTag] = useState("");
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
        Authorization: `Bearer ${token}`,
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
    <View className="flex-1 bg-[#f4f6fb]">

      {/* Header */}
      <LinearGradient
        colors={["#7C5CFC", "#5F2EEA"]}
        className="h-32 px-5 justify-center rounded-b-3xl"
      >
        <Text className="text-white text-xl font-bold">
          Add Transaction
        </Text>
      </LinearGradient>

      <ScrollView className="-mt-5 px-5" showsVerticalScrollIndicator={false}>

        {/* Tabs */}
        <View className="flex-row justify-between mb-5">
          {["Income", "Expense", "Investment"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`w-[31%] py-2.5 rounded-full items-center shadow ${
                activeTab === tab ? "bg-[#7C5CFC]" : "bg-white"
              }`}
              onPress={() => {
                setActiveTab(tab as TabType);
                setSelectedTag("");
              }}
            >
              <Text
                className={`font-semibold ${
                  activeTab === tab ? "text-white" : "text-gray-600"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Card */}
        <View className="bg-white p-5 rounded-2xl shadow">

          {/* Title */}
          <TextInput
            className="bg-gray-100 p-3.5 rounded-xl mb-3.5"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Amount */}
          <TextInput
            className="bg-gray-100 p-3.5 rounded-xl mb-3.5"
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Tag */}
          <Text className="font-semibold mb-2 text-gray-700">Tag</Text>

          <TouchableOpacity
            className="flex-row justify-between items-center bg-gray-100 p-3.5 rounded-xl mb-4"
            onPress={() => setShowTagModal(true)}
          >
            <Text className={selectedTag ? "text-black" : "text-gray-400"}>
              {selectedTag || "Select Tag"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>

          {/* Payment */}
          <Text className="font-semibold mb-2 text-gray-700">Payment</Text>

          <View className="flex-row flex-wrap mb-4">
            {["Cash", "UPI", "Bank", "Card"].map((type) => (
              <TouchableOpacity
                key={type}
                className={`py-1.5 px-3.5 rounded-full mr-2 mb-2 ${
                  transactionType === type
                    ? "bg-[#7C5CFC]"
                    : "bg-gray-200"
                }`}
                onPress={() => setTransactionType(type)}
              >
                <Text
                  className={`text-xs ${
                    transactionType === type
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <TextInput
            className="bg-gray-100 p-3.5 rounded-xl mb-3.5 h-16"
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Save Button */}
          <TouchableOpacity
            className="bg-[#7C5CFC] p-3.5 rounded-2xl items-center mt-2"
            onPress={handleSave}
          >
            <Text className="text-white font-bold">
              Save {activeTab}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={showTagModal} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white p-5 rounded-t-3xl max-h-[70%]">

            <Text className="text-lg font-bold mb-4">
              Select Tag
            </Text>

            <ScrollView>
              {[...tagOptions[activeTab], ...customTags].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  className="py-3 border-b border-gray-200"
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
              className="bg-[#7C5CFC] p-3 rounded-xl items-center mt-4"
              onPress={() => {
                const newTag = "New Tag " + (customTags.length + 1);
                setCustomTags([...customTags, newTag]);
              }}
            >
              <Text className="text-white">+ Add Tag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-3"
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
