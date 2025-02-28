const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructions: { type: String, required: true },
  ingredients: [
    {
      item: { type: String, required: true },
      quantity: { type: String, required: true },
    },
  ],
  imageUrl: { type: String, required: true },
  userId: { type: String, required: true }, // Clerk User ID
  username: { type: String, required: true },
  comments: [
    {
      userId: { type: String, required: true }, // Commenter's Clerk User ID
      username: { type: String, required: true }, // Commenter's name
      text: { type: String, required: true }, // Comment content
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Recipes = mongoose.model("Recipes", RecipeSchema);
module.exports = Recipes;