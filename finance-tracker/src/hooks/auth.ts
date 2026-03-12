import AsyncStorage from "@react-native-async-storage/async-storage";

export const checkAuth = async () => {
  const token = await AsyncStorage.getItem("token");
  return token;
};