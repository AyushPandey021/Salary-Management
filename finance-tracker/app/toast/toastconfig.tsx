import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./toastStyle";

export const toastConfig = {
  success: ({ text1 }: any) => (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#8a4bf6", "#06b6d4"]}
        style={styles.border}
      />

      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
        <Text style={styles.text}>{text1}</Text>
      </View>
    </View>
  ),

  error: ({ text1 }: any) => (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#ff4d4d", "#ff7a7a"]}
        style={styles.border}
      />

      <View style={styles.container}>
        <Ionicons name="close-circle" size={22} color="#ef4444" />
        <Text style={styles.text}>{text1}</Text>
      </View>
    </View>
  ),
};