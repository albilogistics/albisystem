console.log("=== SERVER STARTING ===");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Root endpoint for basic health check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    message: "AlbiSystem API is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint without authentication
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// Placeholder endpoints for functionality
app.get('/api/costs', (req, res) => {
  res.json({
    success: true,
    message: 'Costs endpoint available (database not connected)',
    data: []
  });
});

app.get('/api/admin-prices', (req, res) => {
  res.json({
    success: true,
    message: 'Admin prices endpoint available (database not connected)',
    data: []
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint available (authentication not connected)',
    data: { user: { role: 'admin' }, token: 'placeholder' }
  });
});

app.post('/api/sync', (req, res) => {
  res.json({
    success: true,
    message: 'Sync endpoint available (scraping not connected)',
    data: []
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Health check: http://localhost:" + PORT + "/api/health");
  console.log("Root endpoint: http://localhost:" + PORT + "/");
  console.log("AFTER app.listen: Server should be alive and listening!");
});
