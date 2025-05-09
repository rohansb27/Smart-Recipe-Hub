const mongoose = require("mongoose");

const recipeHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  cuisine: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  recommendedRecipes: [
    {
      title: { type: String },
      ingredients: [{ type: String }], // Added ingredients array
      instructions: [{ type: String }],
      steps: { type: String },
      image: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const RecipeHistory = mongoose.model("RecipeHistory", recipeHistorySchema);
module.exports = RecipeHistory;
