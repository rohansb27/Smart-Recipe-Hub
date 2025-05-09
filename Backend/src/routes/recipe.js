const express = require("express");
const multer = require("multer");
const Recipes = require("../models/Recipe");
const { ObjectId } = require("mongodb");
const { bucket } = require("../services/gcpConfig");
const { connectDB } = require("../services/db");
const router = express.Router();
const path = require("path");

//app.use(express.urlencoded({ extended: true }));
// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST Route: Add Recipe
router.post("/add-recipe", upload.single("image"), async (req, res) => {
  try {
    const { title, description, instructions, ingredients, userId, username } =
      req.body;
    const imageFile = req.file;

    console.log("Received req.body:", req.body);
    console.log("Received userId:", req.body.userId);
    console.log("Received username:", req.body.username);
    console.log("Received file:", req.file);

    if (
      !title ||
      !description ||
      !instructions ||
      !ingredients ||
      !imageFile ||
      !userId ||
      !username
    ) {
      return res
        .status(400)
        .json({ message: "All fields, including userId, are required" });
    }

    // Upload image to GCP
    const imageName = `${Date.now()}_${path.basename(imageFile.originalname)}`;
    const blob = bucket.file(imageName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: imageFile.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("Image upload failed:", err.message);
      return res.status(500).json({ message: "Image upload failed" });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      //const parsedIngredients = JSON.parse(ingredients);
      const parsedIngredients =
        typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;

      // Save Recipe to MongoDB
      const db = await connectDB();
      const recipesCollection = db.collection("recipes");

      const newRecipe = {
        title,
        description,
        instructions,
        ingredients: parsedIngredients,
        imageUrl: publicUrl,
        userId,
        username,
        createdAt: new Date(),
      };

      const result = await recipesCollection.insertOne(newRecipe);

      // Respond with the inserted recipe
      res.status(201).json({
        message: "Recipe added successfully!",
        recipe: { ...newRecipe, _id: result.insertedId },
      });
    });

    blobStream.end(imageFile.buffer);
  } catch (error) {
    console.error("Error adding recipe:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/all-recipes", async (req, res) => {
  try {
    const db = await connectDB(); // Connect to MongoDB
    const recipesCollection = db.collection("recipes");

    const recipes = await recipesCollection.find({}).toArray();

    res.status(200).json({
      message: "Recipes fetched successfully!",
      recipes: recipes,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Like or unlike a recipe
// router.post("/like-recipe/:id", async (req, res) => {
//   const { userId } = req.body;
//   const { id } = req.params;

//   if (!userId) return res.status(400).json({ message: "User ID is required" });

//   try {
//     const recipe = await Recipes.findById(id);
//     if (!recipe) return res.status(404).json({ message: "Recipe not found" });

//     if (recipe.likes.includes(userId)) {
//       recipe.likes = recipe.likes.filter((id) => id !== userId); // Unlike
//     } else {
//       recipe.likes.push(userId); // Like
//     }

//     await recipe.save();
//     res.status(200).json({ likes: recipe.likes, count: recipe.likes.length });
//   } catch (error) {
//     console.error("Error liking recipe:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/like-recipe/:id", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  console.log("Like request received for recipe:", id, "by user:", userId);

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const db = await connectDB();
    const recipesCollection = db.collection("recipes");

    const recipe = await recipesCollection.findOne({ _id: new ObjectId(id) });
    if (!recipe) {
      console.log("Recipe not found");
      return res.status(404).json({ message: "Recipe not found" });
    }

    let updatedLikes;
    if (recipe.likes && recipe.likes.includes(userId)) {
      updatedLikes = recipe.likes.filter((uid) => uid !== userId);
      console.log("User unliked the recipe");
    } else {
      updatedLikes = [...(recipe.likes || []), userId];
      console.log("User liked the recipe");
    }

    await recipesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { likes: updatedLikes } }
    );

    res.status(200).json({ likes: updatedLikes, count: updatedLikes.length });
  } catch (error) {
    console.error("Error in like-recipe route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/recipes/:recipeId/comments", async (req, res) => {
  const { recipeId } = req.params;
  const { userId, username, text } = req.body;

  try {
    // Validate input
    if (!userId || !username || !text) {
      return res.status(400).json({
        message: "All fields (userId, username, and text) are required",
      });
    }

    // Connect to the MongoDB database
    const db = await connectDB();
    const recipesCollection = db.collection("recipes");

    // Find the recipe by ID
    const recipe = await recipesCollection.findOne({
      _id: new ObjectId(recipeId),
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Create the new comment object
    const newComment = {
      userId,
      username,
      text,
      createdAt: new Date(),
    };

    // Update the recipe to add the comment
    await recipesCollection.updateOne(
      { _id: new ObjectId(recipeId) }, // Filter by recipe ID
      { $push: { comments: newComment } } // Push the new comment to the comments array
    );

    res.status(201).json({
      message: "Comment added successfully!",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/recipes/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Connect to MongoDB
    const db = await connectDB();
    const recipesCollection = db.collection("recipes");

    // Find all recipes for the user
    const userRecipes = await recipesCollection
      .find({ userId: userId })
      .toArray();

    res.status(200).json({
      message: "Recipes fetched successfully!",
      recipes: userRecipes,
    });
  } catch (error) {
    console.error("Error fetching user's recipes:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// DELETE Route: Delete a specific recipe
router.delete("/recipes/:recipeId", async (req, res) => {
  const { recipeId } = req.params;

  try {
    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Connect to MongoDB
    const db = await connectDB();
    const recipesCollection = db.collection("recipes");

    // Delete the recipe by ID
    const result = await recipesCollection.deleteOne({
      _id: new ObjectId(recipeId),
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Recipe not found or already deleted" });
    }

    res.status(200).json({ message: "Recipe deleted successfully!" });
  } catch (error) {
    console.error("Error deleting recipe:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
