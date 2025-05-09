const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Initialize Gemini API Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

// Function to fetch recipe image from Pexels
const fetchRecipeImage = async (query) => {
  try {
    const apiKey = "8Rfi7J8np2pXbcsJREQFd7oyDfa7Prj64iw4ZOOjKOojZ1hvnVbM2s75";
    const response = await axios.get(`https://api.pexels.com/v1/search`, {
      headers: { Authorization: apiKey },
      params: { query, per_page: 1 },
    });

    const photos = response.data.photos;
    if (photos && photos.length > 0) {
      return photos[0].src.medium;
    } else {
      console.warn("No image found for query:", query);
      return "https://via.placeholder.com/300"; // fallback if no image found
    }
  } catch (error) {
    console.error("Error fetching recipe image:", error.message);
    return "https://via.placeholder.com/300"; // fallback if API fails
  }
};

// Helper function to parse AI response
const parseAIResponse = (responseText) => {
  const lines = responseText.split("\n");

  const titleLine = lines.find((line) => line.toLowerCase().includes("title:"));
  const stepsLine = lines.find((line) => line.toLowerCase().includes("steps:"));
  const videoLine = lines.find((line) => line.includes("http"));

  const title = titleLine
    ? titleLine.replace(/Title:/i, "").trim()
    : "AI Generated Recipe";
  const steps = stepsLine
    ? stepsLine.replace(/Steps:/i, "").trim()
    : responseText;
  const video = videoLine ? videoLine.trim() : "";

  return { title, steps, video };
};

// Route to generate recipe recommendations
router.post("/gemini-recommend", async (req, res) => {
  const { cuisine, ingredients } = req.body;

  if (!cuisine || !ingredients || !Array.isArray(ingredients)) {
    return res
      .status(400)
      .json({ message: "Cuisine and ingredients array are required." });
  }

  try {
    // Build the AI prompt
    const prompt = `
      You are a helpful AI chef assistant. Based on the inputs below, return exactly 1 unique recipes.
      Suggest a recipe based on the following:
      - Cuisine: ${cuisine}
      - Ingredients: ${ingredients.join(", ")}

      Provide the following details:
      - Recipe Title
      - Steps to prepare the dish
      - Reference video link that is published
`;

    // Send prompt to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the AI response
    const { title, steps, video: initialVideo } = parseAIResponse(responseText);

    // Check if the video is valid
    let video = initialVideo;
    if (video && !(await isYouTubeVideoAvailable(video))) {
      console.warn("Invalid or inaccessible YouTube video, removing link.");
      video = "";
    }

    // Fetch relevant image based on recipe title
    const image = await fetchRecipeImage(`${title} recipe`);

    // Construct recommendation object
    const recommendation = {
      title,
      steps,
      video,
      image,
    };

    res.status(200).json({ recommendations: [recommendation] });
  } catch (error) {
    console.error("Error generating recipe:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch recipe recommendations." });
  }
});

module.exports = router;
