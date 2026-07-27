const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

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

// Analyze Function
const handleAnalysis = (req, res) => {
  const input = req.body.url || req.body.message;

  if (!input) {
    return res.status(400).json({
      success: false,
      error: "URL or message is required",
      message: "URL or message is required",
    });
  }

  const url = input.trim();
  let result = {
    url,
    prediction: "Safe",
    confidence: "95%",
    reasons: [],
  };

  let trustScore = 95;
  let indicators = [];
  let category = "Low Risk";
  let riskLevel = "Safe";
  let recommendation = "This link / message appears safe to proceed.";

  // Phishing detection rules
  if (url.includes("@")) {
    result.prediction = "Phishing";
    result.confidence = "98%";
    result.reasons.push("Contains '@' symbol");
    trustScore = 15;
    riskLevel = "High Risk";
    category = "Phishing";
    indicators.push("Contains '@' symbol in URL");
    recommendation = "Do not open or click this link. High probability of phishing.";
  }

  if (url.includes("login") && url.includes("-")) {
    result.prediction = "Phishing";
    result.confidence = "96%";
    result.reasons.push("Suspicious login domain");
    trustScore = 20;
    riskLevel = "High Risk";
    category = "Phishing";
    indicators.push("Suspicious login keyword with hyphenated domain");
    recommendation = "Caution: domain structure mimics credential harvesting sites.";
  }

  if (url.length > 80) {
    result.prediction = "Suspicious";
    result.confidence = "85%";
    result.reasons.push("Very long URL");
    trustScore = 45;
    riskLevel = "Medium Risk";
    category = "Suspicious";
    indicators.push("Unusually long URL length (>80 characters)");
  }

  if (url.includes("bit.ly") || url.includes("tinyurl")) {
    result.prediction = "Suspicious";
    result.confidence = "90%";
    result.reasons.push("Shortened URL detected");
    trustScore = 40;
    riskLevel = "Medium Risk";
    category = "Suspicious";
    indicators.push("Shortened URL link detected");
  }

  res.json({
    success: true,
    result,
    trustScore,
    riskLevel,
    category,
    indicators,
    recommendation,
  });
};

// Analyze Routes
app.post("/api/analyze", handleAnalysis);
app.post("/api/analyze-url", handleAnalysis);

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