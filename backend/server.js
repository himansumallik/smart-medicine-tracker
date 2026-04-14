const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

// AWS SDK v3 imports
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: 'https://medicine-tracker-frontend.netlify.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ---------------- AWS CONFIG ---------------- */
const client = new DynamoDBClient({
  region: "ap-south-1",
});

const db = DynamoDBDocumentClient.from(client);

/* ---------------- TEST API ---------------- */
app.get("/", (req, res) => {
  res.send("Smart Medicine Tracker API running on AWS 🚀");
});

/* ---------------- REGISTER USER ---------------- */
app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }

  const userId = email;

  try {
    const existing = await db.send(
      new GetCommand({
        TableName: "Users",
        Key: { userId },
      })
    );

    if (existing.Item) {
      // User exists → update last login
      await db.send(
        new UpdateCommand({
          TableName: "Users",
          Key: { userId },
          UpdateExpression: "set lastLogin = :l",
          ExpressionAttributeValues: {
            ":l": new Date().toISOString(),
          },
        })
      );

      return res.json({
        message: "User logged in",
        userId,
        name: existing.Item.name,
        existing: true,
      });
    }

    // New user
    await db.send(
      new PutCommand({
        TableName: "Users",
        Item: {
          userId,
          name,
          email,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      })
    );

    res.json({
      message: "User registered",
      userId,
      name,
      existing: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ---------------- ADD MEDICINE ---------------- */
app.post("/add-medicine", async (req, res) => {
  const { userId, name, dosage, time } = req.body;

  if (!userId || !name || !dosage || !time) {
    return res.status(400).json({ error: "All fields required" });
  }

  const medicineId = uuidv4();

  try {
    await db.send(
      new PutCommand({
        TableName: "Medicines",
        Item: {
          userId,
          medicineId,
          name,
          dosage,
          time,
          status: "pending",
        },
      })
    );

    res.json({ message: "Medicine added", medicineId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ---------------- GET MEDICINES ---------------- */
app.get("/medicines/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await db.send(
      new QueryCommand({
        TableName: "Medicines",
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
          ":u": userId,
        },
      })
    );

    res.json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ---------------- MARK AS TAKEN ---------------- */
app.put("/mark-taken/:userId/:medicineId", async (req, res) => {
  const { userId, medicineId } = req.params;

  try {
    await db.send(
      new UpdateCommand({
        TableName: "Medicines",
        Key: { userId, medicineId },
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: {
          "#s": "status",
        },
        ExpressionAttributeValues: {
          ":s": "taken",
        },
      })
    );

    res.json({ message: "Marked as taken" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);