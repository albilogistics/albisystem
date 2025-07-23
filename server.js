console.log("=== SERVER STARTING ===");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({ status: "healthy", message: "AlbiSystem API is running" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Health check: http://localhost:" + PORT + "/api/health");
  console.log("Root endpoint: http://localhost:" + PORT + "/");
});
