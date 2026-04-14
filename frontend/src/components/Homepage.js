import React, { useState, useEffect, useCallback } from "react";

function Homepage({ userId }) {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = process.env.REACT_APP_API_URL || "http://43.205.130.165";

  const getMedicines = useCallback(async () => {
    try {
      const res = await fetch(`${API}/medicines/${userId}`);
      if (!res.ok) throw new Error("Failed to load medicines");
      const data = await res.json();
      const formatted = data.map((m) => ({ ...m, id: m.medicineId }));
      setMedicines(formatted);
      setError("");
    } catch (err) {
      setError("Error loading medicines: " + err.message);
    }
  }, [API, userId]);

  useEffect(() => { getMedicines(); }, [getMedicines]);

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
      setMedName(""); setDosage(""); setTime("");
      getMedicines();
    } catch (err) {
      setError("Error adding medicine: " + err.message);
    } finally { setLoading(false); }
  };

  const markTaken = async (medicineId) => {
    try {
      const res = await fetch(`${API}/mark-taken/${userId}/${medicineId}`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark as taken");
      getMedicines();
    } catch (err) {
      setError("Error marking medicine: " + err.message);
    }
  };

  const getStatus = (med) => {
    if (med.status === "taken") return "taken";
    const now = new Date();
    const [h, m] = med.time.split(":").map(Number);
    const medTime = new Date();
    medTime.setHours(h, m, 0, 0);
    return now > medTime ? "missed" : "pending";
  };

  const total = medicines.length;
  const taken = medicines.filter(m => getStatus(m) === "taken").length;
  const missed = medicines.filter(m => getStatus(m) === "missed").length;

  const showNotification = (medicine) => {
    if (Notification.permission === "granted") {
      new Notification("💊 Medicine Reminder", {
        body: `Time to take ${medicine.name} (${medicine.dosage})`,
        icon: "https://cdn-icons-png.flaticon.com/512/2966/2966481.png"
      });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") Notification.requestPermission();
    const interval = setInterval(() => {
      const now = new Date();
      medicines.forEach((med) => {
        if (med.status === "taken") return;
        const [h, m] = med.time.split(":").map(Number);
        const medTime = new Date();
        medTime.setHours(h, m, 0, 0);
        const diff = now - medTime;
        if (diff >= 0 && diff < 60000) showNotification(med);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [medicines]);

  // --- MODERNIZED UI STYLES ---
  const styles = {
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
      background: "white",
      padding: "24px",
      borderRadius: "20px",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    },
    title: {
      fontSize: "24px",
      color: "#0f172a",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    welcome: { color: "#64748b", margin: "5px 0 0 0", fontSize: "14px" },
    dashboard: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      background: "white",
      padding: "20px",
      borderRadius: "16px",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #f1f5f9",
    },
    statNumber: { fontSize: "32px", fontWeight: "800", margin: "10px 0 0 0", color: "#1e293b" },
    card: {
      background: "white",
      padding: "30px",
      borderRadius: "24px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      marginBottom: "30px",
      border: "1px solid #f1f5f9",
    },
    inputGroup: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 150px",
      gap: "15px",
      marginBottom: "20px",
    },
    input: {
      padding: "12px 16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "15px",
      outline: "none",
      transition: "border-color 0.2s",
      backgroundColor: "#fbfcfd",
    },
    button: {
      background: "#3b82f6",
      color: "white",
      border: "none",
      padding: "12px 24px",
      borderRadius: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    medCard: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      borderRadius: "16px",
      backgroundColor: "#ffffff",
      border: "1px solid #f1f5f9",
      marginBottom: "12px",
      transition: "transform 0.2s",
    },
    statusBadge: (status) => ({
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      backgroundColor: status === "taken" ? "#dcfce7" : status === "missed" ? "#fee2e2" : "#fef3c7",
      color: status === "taken" ? "#15803d" : status === "missed" ? "#b91c1c" : "#b45309",
    }),
    smallButton: {
      background: "#f1f5f9",
      color: "#475569",
      border: "none",
      padding: "8px 16px",
      borderRadius: "8px",
      fontWeight: "600",
      cursor: "pointer",
      fontSize: "13px",
    },
    logout: {
      marginTop: "20px",
      background: "transparent",
      color: "#94a3b8",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      textDecoration: "underline"
    },
    errorText: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
      padding: "12px",
      borderRadius: "12px",
      marginBottom: "20px",
      fontSize: "14px",
      border: "1px solid #fee2e2"
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>💊 MedTracker Pro</h1>
          <p style={styles.welcome}>Hello, {localStorage.getItem("name")} • Mumbai Region</p>
        </div>
        <button 
          style={{...styles.button, background: "#ef4444", padding: "8px 16px", fontSize: "13px"}}
          onClick={() => { localStorage.clear(); window.location.reload(); }}
        >
          Sign Out
        </button>
      </header>

      {error && <div style={styles.errorText}>⚠️ {error}</div>}

      {/* STATS SECTION */}
      <div style={styles.dashboard}>
        <div style={styles.statCard}>
          <div style={{color: "#64748b", fontSize: "13px", fontWeight: "600"}}>TOTAL</div>
          <p style={styles.statNumber}>{total}</p>
        </div>
        <div style={styles.statCard}>
          <div style={{color: "#15803d", fontSize: "13px", fontWeight: "600"}}>TAKEN</div>
          <p style={{ ...styles.statNumber, color: "#15803d" }}>{taken}</p>
        </div>
        <div style={styles.statCard}>
          <div style={{color: "#b91c1c", fontSize: "13px", fontWeight: "600"}}>MISSED</div>
          <p style={{ ...styles.statNumber, color: "#b91c1c" }}>{missed}</p>
        </div>
      </div>

      {/* ADD MEDICINE SECTION */}
      <div style={styles.card}>
        <h2 style={{fontSize: "18px", marginBottom: "20px", color: "#1e293b"}}>New Schedule</h2>
        <div style={styles.inputGroup}>
          <input style={styles.input} placeholder="Medicine Name" value={medName} onChange={(e) => setMedName(e.target.value)} />
          <input style={styles.input} placeholder="Dosage (e.g. 1 pill)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          <input style={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <button 
          style={{...styles.button, width: "100%"}} 
          onClick={addMedicine} 
          disabled={loading}
        >
          {loading ? "Saving to Cloud..." : "Add to Schedule"}
        </button>
      </div>

      {/* LIST SECTION */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{fontSize: "18px", color: "#1e293b"}}>Daily Timeline</h2>
          <span style={{fontSize: "12px", color: "#94a3b8"}}>Auto-syncing with DynamoDB</span>
        </div>

        {medicines.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
            <div style={{fontSize: "40px", marginBottom: "10px"}}>Empty</div>
            <p>Your medicine cabinet is empty. Add one above!</p>
          </div>
        ) : (
          medicines.map((med) => {
            const status = getStatus(med);
            return (
              <div key={med.id} style={styles.medCard}>
                <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
                  <div style={{fontSize: "24px"}}>{status === 'taken' ? '✅' : '🕒'}</div>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>{med.name}</strong>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                      {med.dosage} • {med.time}
                    </div>
                  </div>
                </div>

                <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
                  <span style={styles.statusBadge(status)}>{status}</span>
                  {status !== "taken" && (
                    <button style={styles.button} onClick={() => markTaken(med.id)}>
                      Take Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Homepage;