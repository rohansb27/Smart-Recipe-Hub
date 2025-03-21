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

// Function to fetch fallback recipe image
const fetchRecipeImage = async (query) => {
  const apiKey = process.env.PEXELS_API_KEY; // Use Pexels API or Unsplash
  try {
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      headers: { Authorization: apiKey },
      params: { query, per_page: 1 },
    });
    return response.data.photos[0]?.src?.medium || "https://via.placeholder.com/300";
  } catch (error) {
    console.error("Error fetching fallback image:", error.message);
    return "https://via.placeholder.com/300"; // Placeholder fallback
  }
};

module.exports = router;