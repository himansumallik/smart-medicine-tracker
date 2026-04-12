import React, { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const [medicines, setMedicines] = useState([]);

  const API = process.env.REACT_APP_API_URL;  // REGISTER

  const register = async () => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    setUserId(data.userId);

    localStorage.setItem("userId", data.userId);
    localStorage.setItem("name", name);
  };

  // AUTO LOGIN
  useEffect(() => {
    const savedUser = localStorage.getItem("userId");
    if (savedUser) setUserId(savedUser);
  }, []);

  // ADD MEDICINE
  const addMedicine = async () => {
    await fetch(`${API}/add-medicine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name: medName, dosage, time }),
    });
    getMedicines();
  };

  // GET MEDICINES
  const getMedicines = async () => {
    const res = await fetch(`${API}/medicines/${userId}`);
    const data = await res.json();
    setMedicines(data);
  };

  // MARK TAKEN
  const markTaken = async (id) => {
    await fetch(`${API}/mark-taken/${id}`, { method: "PUT" });
    getMedicines();
  };

  // STATUS LOGIC
  const getStatus = (med) => {
    if (med.status === "taken") return "taken";

    const now = new Date();
    const [h, m] = med.time.split(":");

    const medTime = new Date();
    medTime.setHours(h);
    medTime.setMinutes(m);

    if (now > medTime) return "missed";

    return "pending";
  };

  // DASHBOARD DATA
  const total = medicines.length;
  const taken = medicines.filter(m => getStatus(m) === "taken").length;
  const missed = medicines.filter(m => getStatus(m) === "missed").length;

  // NOTIFICATION
  const showNotification = (medicine) => {
    if (Notification.permission === "granted") {
      new Notification("💊 Reminder", {
        body: `Take ${medicine.name} (${medicine.dosage})`,
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
        const [h, m] = med.time.split(":");

        if (
          now.getHours() === h &&
          now.getMinutes() === m &&
          med.status !== "taken"
        ) {
          showNotification(med);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [medicines]);

  // 🔐 LOGIN SCREEN
  if (!userId) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>💊 Smart Medicine Tracker</h1>

        <div style={styles.card}>
          <h2>Register</h2>
          <input style={styles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <button style={styles.button} onClick={register}>
            Enter App
          </button>
        </div>
      </div>
    );
  }

  // 🏠 DASHBOARD (MAIN APP)
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Welcome, {localStorage.getItem("name")} 👋
      </h1>

      {/* DASHBOARD */}
      <div style={styles.dashboard}>
        <div style={styles.statCard}>
          <h3>Total</h3>
          <p>{total}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Taken</h3>
          <p style={{ color: "green" }}>{taken}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Missed</h3>
          <p style={{ color: "red" }}>{missed}</p>
        </div>
      </div>

      {/* ADD MEDICINE */}
      <div style={styles.card}>
        <h2>Add Medicine</h2>
        <input style={styles.input} placeholder="Name" onChange={(e) => setMedName(e.target.value)} />
        <input style={styles.input} placeholder="Dosage" onChange={(e) => setDosage(e.target.value)} />
        <input style={styles.input} type="time" onChange={(e) => setTime(e.target.value)} />
        <button style={styles.button} onClick={addMedicine}>Add</button>
      </div>

      {/* MEDICINE LIST */}
      <div style={styles.card}>
        <h2>Your Medicines</h2>
        <button style={styles.buttonSecondary} onClick={getMedicines}>
          Load
        </button>

        {medicines.map((med) => {
          const status = getStatus(med);

          return (
            <div key={med.id} style={styles.medCard}>
              <div>
                <strong>{med.name}</strong>
                <p>{med.dosage} | {med.time}</p>
                <span style={{
                  color:
                    status === "taken"
                      ? "green"
                      : status === "missed"
                      ? "red"
                      : "orange"
                }}>
                  {status}
                </span>
              </div>

              <button style={styles.smallButton} onClick={() => markTaken(med.id)}>
                ✔
              </button>
            </div>
          );
        })}
      </div>

      {/* LOGOUT */}
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

const styles = {
  container: {
    maxWidth: "700px",
    margin: "auto",
    padding: "20px",
    background: "#f4f6f8",
    minHeight: "100vh"
  },

  title: { textAlign: "center" },

  dashboard: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },

  statCard: {
    flex: 1,
    margin: "5px",
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
  },

  card: {
    background: "white",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
  },

  input: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0"
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none"
  },

  buttonSecondary: {
    padding: "10px",
    background: "#2196F3",
    color: "white",
    border: "none"
  },

  medCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    marginTop: "10px",
    background: "#fafafa",
    borderRadius: "8px"
  },

  smallButton: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "5px 10px"
  },

  logout: {
    marginTop: "20px",
    width: "100%",
    padding: "10px",
    background: "red",
    color: "white",
    border: "none",
    borderRadius: "5px"
  }
};

export default App;