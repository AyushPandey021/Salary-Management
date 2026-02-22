const BASE_URL = "http://localhost:8000"; 


const handleAuth = async () => {
  try {
    const endpoint = isLogin ? "login" : "signup";

    const response = await fetch(`${BASE_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        isLogin
          ? { email, password }
          : { name, email, password }
      ),
    });

    const data = await response.json();

    if (isLogin) {
      if (data.access_token) {
        router.replace("/(tabs)/dashboard");
      } else {
        alert(data.detail || "Login failed");
      }
    } else {
      alert("Signup successful. Please login.");
      setIsLogin(true);
    }
  } catch (error) {
    alert("Network error");
  }
};
