import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import API from "../../src/services/api";

export default function Profile() {

  const { theme, isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH USER ---------------- */

  const fetchUser = async () => {

    try {

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      const res = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);

    } catch (error) {

      console.log("User fetch error:", error?.response?.data || error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  /* ---------------- LOGOUT ---------------- */

const handleLogout = async () => {

  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },

      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {

          try {

            await AsyncStorage.removeItem("token");

            // clear axios auth header if you set it globally
            delete API.defaults.headers.common["Authorization"];

            // reset navigation stack
            router.replace("/");

          } catch (error) {
            console.log("Logout error:", error);
          }

        },
      },
    ]
  );

};
  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>

      {/* PROFILE HEADER */}

      <View style={styles.header}>

        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        </View>

        <Text style={[styles.name, { color: theme.text }]}>
          {user?.name || "User"}
        </Text>

        <Text style={[styles.email, { color: theme.subText }]}>
          {user?.email || ""}
        </Text>

      </View>

      {/* SETTINGS CARD */}

      <View style={[styles.card, { backgroundColor: theme.card }]}>

        {/* DARK MODE */}

        <TouchableOpacity
          style={styles.row}
          onPress={toggleTheme}
        >
          <View style={styles.rowLeft}>

            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={20}
              color={theme.primary}
            />

            <Text style={[styles.rowText, { color: theme.text }]}>
              Dark Mode
            </Text>

          </View>

          <Ionicons
            name={isDark ? "toggle" : "toggle-outline"}
            size={28}
            color={theme.primary}
          />

        </TouchableOpacity>

        <View
          style={{
            height: 1,
            backgroundColor: theme.border,
            marginVertical: 12,
          }}
        />

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.row}
          onPress={handleLogout}
        >
          <View style={styles.rowLeft}>

            <Ionicons
              name="log-out-outline"
              size={20}
              color="#ef4444"
            />

            <Text style={[styles.rowText, { color: "#ef4444" }]}>
              Logout
            </Text>

          </View>

        </TouchableOpacity>

      </View>

    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

container:{
flex:1,
padding:20
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

header:{
alignItems:"center",
marginTop:50,
marginBottom:35
},

avatar:{
width:95,
height:95,
borderRadius:50,
justifyContent:"center",
alignItems:"center",
marginBottom:12,
elevation:6
},

avatarText:{
fontSize:36,
fontWeight:"bold",
color:"#fff"
},

name:{
fontSize:22,
fontWeight:"700"
},

email:{
fontSize:13,
marginTop:4
},

card:{
borderRadius:18,
padding:18,
shadowColor:"#000",
shadowOpacity:0.1,
shadowRadius:10,
shadowOffset:{width:0,height:4},
elevation:5
},

row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
paddingVertical:12
},

rowLeft:{
flexDirection:"row",
alignItems:"center"
},

rowText:{
marginLeft:12,
fontSize:16,
fontWeight:"500"
}

});