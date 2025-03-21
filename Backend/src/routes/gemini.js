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

// Route to generate recipe recommendations
router.post("/gemini-recommend", async (req, res) => {
    const { cuisine, ingredients } = req.body;
  
    if (!cuisine || !ingredients) {
      return res.status(400).json({ message: "Cuisine and ingredients are required." });
    }
  
    try {
      // Build the AI prompt
      const prompt = `
        Suggest a recipe based on the following:
        - Cuisine: ${cuisine}
        - Ingredients: ${ingredients.join(", ")}
  
        Provide the following details:
        - Recipe Title
        - Steps to prepare the dish
        - Reference video link that is published
      `;
  
      // Send prompt to Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

    // Parse response
    const lines = responseText.split("\n");
    const title = lines.find((line) => line.includes("Title:"))?.replace("Title:", "").trim() || "AI Generated Recipe";
    const steps = lines.find((line) => line.includes("Steps:"))?.replace("Steps:", "").trim() || responseText;
    let video = lines.find((line) => line.includes("http"))?.trim() || "";

    // Check if video is valid; fetch fallback image if not
    let image = "";
    if (video && !(await isYouTubeVideoAvailable(video))) {
      video = "";
      image = await fetchRecipeImage(`${title} recipe`);
    }

    const recommendation = {
      title,
      steps,
      video,
      image: video ? "" : image, // Provide fallback image if no video is available
    };

    res.status(200).json({ recommendations: [recommendation] });
  } catch (error) {
    console.error("Error generating recipe:", error.message);
    res.status(500).json({ message: "Failed to fetch recipe recommendations." });
  }
});

module.exports = router;