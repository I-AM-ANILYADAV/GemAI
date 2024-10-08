require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Express instance
const app = express();

// Middlewares
const corsOptions = {
  origin: ["http://localhost:5174", "http://localhost:5173"],
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a schema for prompts and responses
const promptSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a model based on the schema
const PromptResponse = mongoose.model("PromptResponse", promptSchema);

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Generate content route
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save the prompt and response to MongoDB
    const newPromptResponse = new PromptResponse({ prompt, response: text });
    await newPromptResponse.save();

    res.send(text);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to generate content");
  }
});

// Start the server
app.listen(8080, () => console.log("Server is running"));
