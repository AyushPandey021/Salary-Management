import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = false;

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/login");
      }
    }, 200); // 👈 IMPORTANT DELAY

    return () => clearTimeout(timer);
  }, []);

  return null;
}