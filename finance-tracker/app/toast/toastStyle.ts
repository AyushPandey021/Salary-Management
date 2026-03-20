import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
  },

  border: {
    height: 3,
    width: "100%",
  },

  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  text: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 14,
  },
});