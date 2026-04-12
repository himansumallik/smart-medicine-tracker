import React, { useState, useEffect, useCallback } from "react";

function Homepage({ userId }) {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = process.env.REACT_APP_API_URL;

  // GET MEDICINES
  const getMedicines = useCallback(async () => {
    try {
      const res = await fetch(`${API}/medicines/${userId}`);
      if (!res.ok) throw new Error("Failed to load medicines");
      const data = await res.json();
      setMedicines(data);
      setError("");
    } catch (err) {
      setError("Error loading medicines: " + err.message);
    }
  }, [API, userId]);

  // Load medicines on mount
  useEffect(() => {
    getMedicines();
  }, [getMedicines]);

  // ADD MEDICINE
  const addMedicine = async () => {
    if (!medName.trim() || !dosage.trim() || !time) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/add-medicine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: medName, dosage, time }),
      });

      if (!res.ok) throw new Error("Failed to add medicine");

      setMedName("");
      setDosage("");
      setTime("");
      getMedicines();
    } catch (err) {
      setError("Error adding medicine: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // MARK TAKEN
  const markTaken = async (id) => {
    try {
      const res = await fetch(`${API}/mark-taken/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark as taken");
      getMedicines();
    } catch (err) {
      setError("Error marking medicine: " + err.message);
    }
  };

  // STATUS LOGIC
  const getStatus = (med) => {
    if (med.status === "taken") return "taken";

    const now = new Date();
    const [h, m] = med.time.split(":").map(Number);
    const medTime = new Date();
    medTime.setHours(h, m, 0, 0);

    return now > medTime ? "missed" : "pending";
  };

  // DASHBOARD DATA
  const total = medicines.length;
  const taken = medicines.filter(m => getStatus(m) === "taken").length;
  const missed = medicines.filter(m => getStatus(m) === "missed").length;

  // NOTIFICATION
  const showNotification = (medicine) => {
    if (Notification.permission === "granted") {
      new Notification("💊 Medicine Reminder", {
        body: `Time to take ${medicine.name} (${medicine.dosage})`,
        icon: "https://cdn-icons-png.flaticon.com/512/2966/2966481.png"
      });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      medicines.forEach((med) => {
        if (med.status === "taken") return;
        const [h, m] = med.time.split(":").map(Number);
        const medTime = new Date();
        medTime.setHours(h, m, 0, 0);
        const diff = now - medTime;

        if (diff >= 0 && diff < 60000) {
          showNotification(med);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [medicines]);

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "40px auto",
      padding: "20px",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 100%)",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "28px",
      color: "#1a3c5e",
      margin: "0",
    },
    welcome: {
      color: "#555",
      fontSize: "18px",
      marginTop: "8px",
    },
    dashboard: {
      display: "flex",
      gap: "15px",
      marginBottom: "30px",
    },
    statCard: {
      flex: 1,
      padding: "20px",
      background: "white",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
      textAlign: "center",
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: "bold",
      margin: "8px 0 4px 0",
    },
    card: {
      background: "white",
      padding: "28px",
      marginBottom: "25px",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
    },
    input: {
      display: "block",
      width: "100%",
      padding: "14px 16px",
      margin: "12px 0",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "16px",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "linear-gradient(135deg, #4CAF50, #45a049)",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "17px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "8px",
    },
    buttonSecondary: {
      padding: "10px 20px",
      background: "#2196F3",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
    },
    medCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      marginTop: "12px",
      background: "#f8f9fa",
      borderRadius: "12px",
      border: "1px solid #eee",
    },
    smallButton: {
      background: "#4CAF50",
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
    },
    logout: {
      width: "100%",
      padding: "14px",
      background: "#f44336",
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "20px",
    },
    errorText: {
      color: "#e74c3c",
      backgroundColor: "#fdf2f2",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center",
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💊 Medicine Dashboard</h1>
        <p style={styles.welcome}>
          Welcome back, <strong>{localStorage.getItem("name")}</strong> 👋
        </p>
      </div>

      {error && <div style={styles.errorText}>{error}</div>}

      {/* Dashboard Stats */}
      <div style={styles.dashboard}>
        <div style={styles.statCard}>
          <h4>Total Medicines</h4>
          <p style={styles.statNumber}>{total}</p>
        </div>
        <div style={styles.statCard}>
          <h4 style={{ color: "#2e7d32" }}>Taken</h4>
          <p style={{ ...styles.statNumber, color: "#2e7d32" }}>{taken}</p>
        </div>
        <div style={styles.statCard}>
          <h4 style={{ color: "#d32f2f" }}>Missed</h4>
          <p style={{ ...styles.statNumber, color: "#d32f2f" }}>{missed}</p>
        </div>
      </div>

      {/* Add Medicine Card */}
      <div style={styles.card}>
        <h2>Add New Medicine</h2>
        <input
          style={styles.input}
          placeholder="Medicine Name"
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
          disabled={loading}
        />
        <input
          style={styles.input}
          placeholder="Dosage (e.g. 1 tablet)"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          disabled={loading}
        />
        <input
          style={styles.input}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={loading}
        />
        <button
          style={styles.button}
          onClick={addMedicine}
          disabled={loading}
        >
          {loading ? "Adding Medicine..." : "Add Medicine"}
        </button>
      </div>

      {/* Medicines List */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2>Your Medicines</h2>
          <button style={styles.buttonSecondary} onClick={getMedicines}>
            Refresh
          </button>
        </div>

        {medicines.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "20px" }}>
            No medicines added yet. Add your first medicine above.
          </p>
        ) : (
          medicines.map((med) => {
            const status = getStatus(med);
            return (
              <div key={med.id} style={styles.medCard}>
                <div>
                  <strong style={{ fontSize: "17px" }}>{med.name}</strong>
                  <p style={{ margin: "6px 0", color: "#555" }}>
                    {med.dosage} • {med.time}
                  </p>
                  <span
                    style={{
                      color: status === "taken" ? "#2e7d32" : status === "missed" ? "#d32f2f" : "#f57c00",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      fontSize: "14px"
                    }}
                  >
                    {status}
                  </span>
                </div>

                {status !== "taken" && (
                  <button
                    style={styles.smallButton}
                    onClick={() => markTaken(med.id)}
                  >
                    Mark Taken
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Logout Button */}
      <button
        style={styles.logout}
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Homepage;