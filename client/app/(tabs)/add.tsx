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
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
// import { BASE_URL } from "../../src/config/api";
import { useTheme } from "../../src/context/ThemeContext";
import { FlatList } from "react-native";

type TabType = "Income" | "Expense" | "Investment";

export default function AddTransaction() {
  const { theme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>("Expense");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [paymentType, setPaymentType] = useState("Cash");

  const [saving, setSaving] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("🏷️");

  const [editingTag, setEditingTag] = useState<any>(null);
  const [showEditTag, setShowEditTag] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [lastTap, setLastTap] = useState<number>(0);

  const params = useLocalSearchParams();
  const editData = params?.edit ? JSON.parse(params.edit as string) : null;
  const isEdit = !!editData;

  /* ---------------- LOAD TAGS ---------------- */

  const loadTags = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`http://192.168.10.48:8000/tags/${activeTab}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("TAGS RESPONSE:", data);
    setTags(data);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTags();
    }, [activeTab])
  );
  useFocusEffect(
    React.useCallback(() => {

      if (!params?.edit) {
        // NEW TRANSACTION → CLEAR FORM
        setTitle("");
        setAmount("");
        setDescription("");
        setSelectedTag(null);
        setPaymentType("Cash");
        setActiveTab("Expense");
        return;
      }

      const data = JSON.parse(params.edit as string);

      setTitle(data.title);
      setAmount(String(data.amount));
      setDescription(data.description || "");
      setSelectedTag(data.tag ? { name: data.tag, emoji: "🏷️" } : null);
      setActiveTab(data.type);

    }, [params?.edit])
  );



  /* ---------------- VALIDATION ---------------- */
  // update tag 
  const updateTag = async () => {
    if (!editingTag?._id) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`http://192.168.10.48:8000/tags/${editingTag._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingTag.name?.trim(),
          emoji: editingTag.emoji || "🏷️",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Toast.show({ type: "error", text1: data.detail || "Update failed" });
        return;
      }

      Toast.show({ type: "success", text1: "Tag updated ✏️" });

      setShowEditTag(false);
      setEditingTag(null);

      // IMPORTANT
      await loadTags();

    } catch (err) {
      Toast.show({ type: "error", text1: "Network error" });
    }
  };


  // delete tag 
  const deleteTag = async (id: string) => {
    const token = await AsyncStorage.getItem("token");

    await fetch(`http://192.168.10.48:8000/tags/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadTags();
    setDeleteMode(false);
  };


  const validateAmount = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) {
      setAmountError("Amount must be a number");
    } else {
      setAmountError("");
      setAmount(value);
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    const token = await AsyncStorage.getItem("token");

    const payload = {
      type: activeTab,
      title,
      amount: Number(amount),
      tag: selectedTag?.name || "",
      description,
      month: new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };

    let res;

    if (isEdit) {
      res = await fetch(`http://192.168.10.48:8000/transactions/${editData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`http://192.168.10.48:8000/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) {
      Toast.show({ type: "error", text1: "Failed" });
      return;
    }

    Toast.show({
      type: "success",
      text1: isEdit ? "Transaction Updated ✏️" : "Transaction Added 🎉",
    });

    router.replace("/(tabs)/transactions");
    // router.back();

  };


  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>

      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#3a485d", "#2c374d"] : ["#7C5CFC", "#5F2EEA"]}
        className="h-32 px-5 justify-center rounded-b-3xl"
      >
        <Text className="text-white text-xl font-semibold">
          Add Transaction
        </Text>
      </LinearGradient>

      <ScrollView className="-mt-5 px-5">

        {/* Tabs */}
        <View className="flex-row justify-between mb-5">
          {(["Income", "Expense", "Investment"] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 mx-1 py-2 rounded-full items-center"
              style={{
                backgroundColor:
                  activeTab === tab ? theme.primary : theme.card,
              }}
            >
              <Text style={{
                color: activeTab === tab ? "#fff" : theme.text
              }}>
                {tab === "Income" ? "💰 Income" :
                  tab === "Expense" ? "🛒 Expense" : "📈 Invest"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FORM */}
        <View className="p-4 rounded-2xl" style={{ backgroundColor: theme.card }}>

          {/* TITLE */}
          <TextInput
            placeholder="Title"
            placeholderTextColor={theme.subText}
            value={title}
            onChangeText={setTitle}
            className="p-3 rounded-xl mb-3"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />

          {/* AMOUNT */}
          <TextInput
            placeholder="Amount"
            placeholderTextColor={theme.subText}
            keyboardType="numeric"
            value={amount}
            onChangeText={validateAmount}
            className="p-3 rounded-xl"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />

          {amountError ? (
            <Text className="text-red-500 text-xs mt-1">
              {amountError}
            </Text>
          ) : null}

          {/* TAG SELECT */}
          <TouchableOpacity
            onPress={() => setShowTagModal(true)}
            className="p-3 rounded-xl mt-3"
            style={{ backgroundColor: theme.background }}
          >
            <Text style={{ color: theme.text }}>
              {selectedTag ? `${selectedTag.emoji} ${selectedTag.name}` : "Select Tag"}

            </Text>
          </TouchableOpacity>
          <Text
            className="text-[13px] font-semibold  mt-1"
            style={{ color: theme.subText, fontWeight: "600" }}
          >
            Payment Method
          </Text>
          <View className="flex-row flex-wrap mt-3">

            {["Cash", "UPI", "Bank", "Card"].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPaymentType(p)}
                className="px-3 py-1.5 rounded-full mr-2 mb-2"
                style={{
                  backgroundColor: paymentType === p ? theme.primary : theme.background
                }}
              >
                <Text style={{ color: paymentType === p ? "white" : theme.text }}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* DESCRIPTION */}
          <TextInput
            placeholder="Description"
            placeholderTextColor={theme.subText}
            value={description}
            onChangeText={setDescription}
            multiline
            className="p-3 rounded-xl mt-3 h-20"
            style={{ backgroundColor: theme.background, color: theme.text }}
          />

          {/* SAVE BUTTON */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="p-3 rounded-xl mt-4 items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-semibold">
              {saving ? "Saving..." : "Save Transaction"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* TAG MODAL */}
      <Modal visible={showTagModal} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">

          <View
            className="rounded-t-3xl pt-5 pb-3"
            style={{
              backgroundColor: theme.card,
              height: "70%",
            }}
          >

            {/* HEADER */}
            <View className="flex-row justify-between items-center px-5 mb-3">
              <Text className="text-lg font-semibold" style={{ color: theme.text }}>
                Select Tag
              </Text>

              <TouchableOpacity onPress={() => setShowAddTag(true)}>
                <Ionicons name="add-circle" size={26} color={theme.primary} />
              </TouchableOpacity>
            </View>


            {/* TAG GRID */}
            {Array.isArray(tags) && tags.length > 0 ? (
              <FlatList
                data={tags}
                numColumns={3}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 10,
                  paddingBottom: 25,
                }}
                renderItem={({ item }) => {

                  const handlePress = (item) => {
                    const now = Date.now();
                    const DOUBLE_PRESS_DELAY = 280;

                    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
                      // DOUBLE TAP → EDIT
                      setEditingTag({ ...item }); // IMPORTANT (clone object)
                      setShowEditTag(true);
                    } else {
                      // SINGLE TAP → SELECT
                      setSelectedTag(item);
                      setShowTagModal(false);
                    }

                    setLastTap(now);
                  };


                  return (
                    <TouchableOpacity
                      onPress={() => handlePress(item)}
                      onLongPress={() => {
                        setDeleteMode(true);
                        setEditingTag(item);
                      }}
                      className="flex-1 m-1 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor: theme.background,
                        height: 60,
                      }}
                    >
                      {/* DELETE BUTTON */}
                      {deleteMode && editingTag?._id === item._id && (
                        <TouchableOpacity
                          onPress={() => deleteTag(item._id)}
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            zIndex: 10,
                          }}
                        >
                          <Ionicons name="close-circle" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}

                      <Text style={{ fontSize: 18 }}>
                        {item.emoji || "🏷️"}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: theme.text,
                          fontSize: 12,
                          marginTop: 6,
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text style={{ color: theme.subText }}>
                  No tags yet...
                </Text>
              </View>
            )}


            {/* CLOSE */}
            <TouchableOpacity
              onPress={() => {
                setDeleteMode(false);
                setShowTagModal(false);
              }}
              className="items-center py-3 border-t"
              style={{ borderColor: theme.border }}
            >
              <Text style={{ color: theme.primary }}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* // new add  */}
      <Modal visible={showEditTag} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">

          <View className="w-[85%] p-5 rounded-2xl" style={{ backgroundColor: theme.card }}>

            <Text className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
              Edit Tag
            </Text>

            <TextInput
              value={editingTag?.emoji ?? ""}

              onChangeText={(v) => setEditingTag({ ...editingTag, emoji: v })}
              className="p-3 rounded-xl mb-3"
              style={{ backgroundColor: theme.background, color: theme.text }}
            />

            <TextInput
              value={editingTag?.name ?? ""}
              onChangeText={(v) => setEditingTag({ ...editingTag, name: v })}
              className="p-3 rounded-xl"
              style={{ backgroundColor: theme.background, color: theme.text }}
            />

            <TouchableOpacity
              className="mt-4 p-3 rounded-xl items-center"
              style={{ backgroundColor: theme.primary }}
              onPress={updateTag}
            >
              <Text className="text-white">Update Tag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center mt-3"
              onPress={() => setShowEditTag(false)}
            >
              <Text style={{ color: theme.subText }}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>


      <Modal visible={showAddTag} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/40">

          <View className="w-[85%] p-5 rounded-2xl" style={{ backgroundColor: theme.card }}>

            <Text className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
              New Tag
            </Text>

            <TextInput
              placeholder="Emoji (example 🍕)"
              value={newTagEmoji}
              onChangeText={setNewTagEmoji}
              className="p-3 rounded-xl mb-3"
              style={{ backgroundColor: theme.background, color: theme.text }}
            />

            <TextInput
              placeholder="Tag name"
              value={newTagName}
              onChangeText={setNewTagName}
              className="p-3 rounded-xl"
              style={{ backgroundColor: theme.background, color: theme.text }}
            />

            <TouchableOpacity
              className="mt-4 p-3 rounded-xl items-center"
              style={{ backgroundColor: theme.primary }}
              onPress={async () => {

                if (!newTagName.trim()) {
                  Toast.show({ type: "error", text1: "Enter tag name" });
                  return;
                }

                const token = await AsyncStorage.getItem("token");

                const res = await fetch(`http://192.168.10.48:8000/tags`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    name: newTagName,
                    emoji: newTagEmoji,
                    category: activeTab
                  })
                });

                if (!res.ok) {
                  Toast.show({ type: "error", text1: "Failed to add tag" });
                  return;
                }

                Toast.show({ type: "success", text1: "Tag Added 🎉" });

                setShowAddTag(false);
                setNewTagName("");
                setNewTagEmoji("🏷️");

                // IMPORTANT
                setTimeout(loadTags, 500);
              }}

            >
              <Text className="text-white">Save Tag</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}
