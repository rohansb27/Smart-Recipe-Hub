const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Webhook route to handle Clerk 'user.created' event
router.post("/clerk-webhook", async (req, res) => {
  const { data, type } = req.body;

  if (type !== "user.created") {
    return res.status(400).json({ message: "Invalid webhook event type" });
  }

  const { id, email_addresses, first_name, last_name } = data;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ clerkUserId: id });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists in the database" });
    }

    // Save the new user to MongoDB
    const newUser = new User({
      clerkUserId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
    });

    await newUser.save();
    console.log("User saved successfully:", newUser);

    res.status(200).json({ message: "User saved successfully" });
  } catch (error) {
    console.error("Error saving user data:", error.message);
    res.status(500).json({ message: "Failed to save user data" });
  }
});

module.exports = router;
