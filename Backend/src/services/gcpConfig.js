const { Storage } = require("@google-cloud/storage");
const { VertexAI } = require("@google-cloud/vertexai");
const path = require("path");
require("dotenv").config();

// Path to your GCP service account key JSON file
const keyFilename = path.join(
  __dirname,
  "../../smart-recipe-hub-14045841313b.json"
);

// ============================
// Google Cloud Storage Config
// ============================
const storage = new Storage({ keyFilename });
const bucketName = "recipe-image-storage-full-stack"; // Replace with your GCP bucket name
const bucket = storage.bucket(bucketName);

// ============================
// Vertex AI Config
// ============================
const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID, // Project ID from environment or fallback
  location: "us-central1", // Set your preferred region
  keyFilename, // Reuse the service account key
});

// ============================
// Export Configurations
// ============================
module.exports = {
  bucket,
  vertexAI,
};
