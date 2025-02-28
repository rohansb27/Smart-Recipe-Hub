const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/add-recipe", upload.single("image"), async (req, res) => {
    try {
      const { title, description, instructions, ingredients, userId , username } = req.body;
      const imageFile = req.file;
  
      if (!title || !description || !instructions || !ingredients || !imageFile || !userId || !username) {
        return res.status(400).json({ message: "All fields, including userId, are required" });
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
        const parsedIngredients = JSON.parse(ingredients);
  
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