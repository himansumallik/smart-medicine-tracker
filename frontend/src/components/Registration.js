import React, { useState } from "react";

function Registration({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "/api";

  const register = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // ✅ Store user session
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("name", data.name);
        localStorage.setItem("sessionStart", Date.now().toString());

        onRegister(data.userId);

        // AWS backend will send 'existing' flag
        if (data.existing) {
          alert(`Welcome back, ${data.name}! Your medicines are loaded.`);
        } else {
          alert(`Welcome, ${data.name}! Account created successfully.`);
        }
      } else {
        setError("Registration failed. Please try again.");
      }

    } catch (err) {
      setError(`Registration error: ${err.message}`);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "480px",
      margin: "40px auto",
      padding: "20px",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    card: {
      background: "white",
      padding: "40px 30px",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      width: "100%",
      textAlign: "center",
    },
    title: {
      fontSize: "28px",
      marginBottom: "8px",
      color: "#1a3c5e",
    },
    subtitle: {
      color: "#555",
      marginBottom: "30px",
      fontSize: "16px",
    },
    icon: {
      fontSize: "48px",
      marginBottom: "15px",
    },
    input: {
      display: "block",
      width: "100%",
      padding: "14px 16px",
      margin: "12px 0",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#4CAF50",
      boxShadow: "0 0 0 3px rgba(76, 175, 80, 0.1)",
    },
    button: {
      width: "100%",
      padding: "14px",
      marginTop: "10px",
      background: "linear-gradient(135deg, #4CAF50, #45a049)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "17px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    buttonHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 15px rgba(76, 175, 80, 0.3)",
    },
    errorText: {
      color: "#e74c3c",
      backgroundColor: "#fdf2f2",
      padding: "10px",
      borderRadius: "8px",
      marginBottom: "15px",
      fontSize: "14px",
    },
    footerText: {
      marginTop: "25px",
      color: "#777",
      fontSize: "14px",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>💊</div>
        
        <h1 style={styles.title}>Smart Medicine Tracker</h1>
        <p style={styles.subtitle}>Sign in or create your account</p>

        {error && <div style={styles.errorText}>{error}</div>}

        <input
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        
        <input
          style={styles.input}
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <button
          style={styles.button}
          onClick={register}
          disabled={loading}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 15px rgba(76, 175, 80, 0.3)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          {loading ? "Signing you in..." : "Continue"}
        </button>

        <p style={styles.footerText}>
          Simple • Secure • Smart Reminders
        </p>
      </div>
    </div>
  );
}

export default Registration;