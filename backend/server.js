const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "TrustLens AI Backend is running 🚀",
  });
});

// Test Route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "TrustLens AI API is working!",
  });
});

// Analyze URL Route
app.post("/api/analyze", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL is required",
    });
  }

  let result = {
    url,
    prediction: "Safe",
    confidence: "95%",
    reasons: [],
  };

  // Simple phishing detection rules
  if (url.includes("@")) {
    result.prediction = "Phishing";
    result.confidence = "98%";
    result.reasons.push("Contains '@' symbol");
  }

  if (url.includes("login") && url.includes("-")) {
    result.prediction = "Phishing";
    result.confidence = "96%";
    result.reasons.push("Suspicious login domain");
  }

  if (url.length > 80) {
    result.prediction = "Suspicious";
    result.confidence = "85%";
    result.reasons.push("Very long URL");
  }

  if (url.includes("bit.ly") || url.includes("tinyurl")) {
    result.prediction = "Suspicious";
    result.confidence = "90%";
    result.reasons.push("Shortened URL detected");
  }

  res.json({
    success: true,
    result,
  });
});

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});