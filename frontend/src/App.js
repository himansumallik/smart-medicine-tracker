import React, { useState, useEffect } from "react";
import Registration from "./components/Registration";
import Homepage from "./components/Homepage";

function App() {
  const [userId, setUserId] = useState("");

  // AUTO LOGIN
  useEffect(() => {
    const savedUser = localStorage.getItem("userId");
    if (savedUser) setUserId(savedUser);
  }, []);

  // 🔐 LOGIN SCREEN
  if (!userId) {
    return <Registration onRegister={setUserId} />;
  }

  // 🏠 DASHBOARD (MAIN APP)
  return <Homepage userId={userId} />;
}

export default App;