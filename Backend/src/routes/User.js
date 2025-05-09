const express = require("express");
const { connectDB } = require("../services/db"); // Import centralized DB connection
const router = express.Router();
const crypto = require("crypto");

// Middleware to validate webhook
function verifyClerkWebhook(req, res, next) {
  const signature = req.headers["clerk-signature"];
  const secret = "whsec_AWFp1n/i4EHVw50vzqgZY/bxNi0dotoY"; // From Clerk Dashboard

  if (!signature) {
    return res.status(400).send("Missing signature.");
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).send("Invalid signature.");
  }

  next();
}

router.post("/save-user", async (req, res) => {
  console.log("Incoming Request Body:", req.body);

  const { clerkUserId, email, name } = req.body;

  if (!clerkUserId || !email || !name) {
    console.error("❌ Invalid user data received:", req.body);
    return res.status(400).json({ message: "Invalid user data" });
  }

  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ clerkUserId });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    const newUser = {
      clerkUserId,
      email,
      name,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    console.log("✅ User saved successfully:", newUser);
    return res.status(201).json({ message: "User saved successfully" });
  } catch (error) {
    console.error("❌ Error saving user data:", error.message);
    return res.status(500).json({ message: "Failed to save user data" });
  }
});

module.exports = router;
