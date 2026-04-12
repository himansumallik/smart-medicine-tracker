const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./firebase");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// TEST API
app.get("/", (req, res) => {
  res.send("Medicine Tracker API Running");
});

// REGISTER
app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  try {
    const userRef = await db.collection("users").add({
      name,
      email,
    });

    res.json({ message: "User registered", userId: userRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD MEDICINE
app.post("/add-medicine", async (req, res) => {
  const { userId, name, dosage, time } = req.body;

  try {
    const medRef = await db.collection("medicines").add({
      userId,
      name,
      dosage,
      time,
      status: "pending",
    });

    res.json({ message: "Medicine added", id: medRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET MEDICINES
app.get("/medicines/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const snapshot = await db
      .collection("medicines")
      .where("userId", "==", userId)
      .get();

    let medicines = [];
    snapshot.forEach((doc) => {
      medicines.push({ id: doc.id, ...doc.data() });
    });

    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MARK AS TAKEN
app.put("/mark-taken/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("medicines").doc(id).update({
      status: "taken",
    });

    res.json({ message: "Marked as taken" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));