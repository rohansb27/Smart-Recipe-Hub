const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Initialize Gemini API Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_LINK);

// Function to check if YouTube video is available
const isYouTubeVideoAvailable = async (url) => {
  try {
    const response = await axios.get(url, { validateStatus: false });
    return response.status === 200;
  } catch (error) {
    console.error("Error checking YouTube video:", error.message);
    return false;
  }
};

module.exports = router;