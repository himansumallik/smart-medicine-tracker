const admin = require("firebase-admin");
const path = require("path");

let serviceAccount;

try {
  // Try to load from environment variable first
  if (process.env.FIREBASE_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  } else {
    // Fall back to loading from file
    serviceAccount = require("./serviceAccountKey.json");
  }
} catch (error) {
  console.error("Error loading Firebase credentials:", error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;