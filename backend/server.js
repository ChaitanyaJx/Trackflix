const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API endpoint to update movies
app.put("/api/movies", async (req, res) => {
  try {
    // Corrected path - going up one level from backend folder then into src/data
    const filePath = path.join(__dirname, "../src/data/movies.json");
    await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));
    res.json({ message: "Movies updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to update movies" });
  }
});
app.get("/api/movies", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../src/data/movies.json");
    const moviesData = await fs.readFile(filePath, "utf8");
    res.json(JSON.parse(moviesData));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get movies" });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
}); // API endpoint to get all movies
