const { MongoClient, ServerApiVersion } = require("mongodb");

// Validate environment variable
if (!process.env.MONGO_URI) {
  console.error(
    "MongoDB URI is missing. Please set MONGO_URI in your environment variables."
  );
  process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db("recipe-hub"); // Default DB
      console.log("✅ Successfully connected to MongoDB");
    }
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = { connectDB, client };
