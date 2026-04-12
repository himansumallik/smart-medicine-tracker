import React, { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");

  const [medicines, setMedicines] = useState([]);

  const API = "http://localhost:5000";

  // Register User
  const register = async () => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setUserId(data.userId);
  };

  // Add Medicine
  const addMedicine = async () => {
    await fetch(`${API}/add-medicine`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        userId,
        name: medName,
        dosage,
        time,
      }),
    });
    getMedicines();
  };

  // Get Medicines
  const getMedicines = async () => {
    const res = await fetch(`${API}/medicines/${userId}`);
    const data = await res.json();
    setMedicines(data);
  };

  // Mark as taken
  const markTaken = async (id) => {
    await fetch(`${API}/mark-taken/${id}`, {
      method: "PUT",
    });
    getMedicines();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Medicine Tracker</h1>

      <h2>Register</h2>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <button onClick={register}>Register</button>

      <h2>Add Medicine</h2>
      <input placeholder="Medicine Name" onChange={(e) => setMedName(e.target.value)} />
      <input placeholder="Dosage" onChange={(e) => setDosage(e.target.value)} />
      <input placeholder="Time" onChange={(e) => setTime(e.target.value)} />
      <button onClick={addMedicine}>Add</button>

      <h2>Medicines</h2>
      <button onClick={getMedicines}>Load Medicines</button>

      <ul>
        {medicines.map((med) => (
          <li key={med.id}>
            {med.name} - {med.dosage} - {med.time} - {med.status}
            <button onClick={() => markTaken(med.id)}>Taken</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;