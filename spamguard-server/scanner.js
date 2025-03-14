import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { ZAP_API_KEY, ZAP_API_BASE_URL } from "./config.js"; // Add your configuration

const app = express();
app.use(cors());
app.use(express.json());

// API to start a security scan
app.post("/start-scan", async (req, res) => {
  try {
    const url = req.body.url;

    // Start the security scan using OWASP ZAP API
    const scanResponse = await fetch(`${ZAP_API_BASE_URL}/spider/action/scan/?url=${url}`, {
      method: "GET",
      headers: {
        "apikey": ZAP_API_KEY,
      },
    });

    if (!scanResponse.ok) {
      throw new Error("Error starting security scan");
    }

    res.json({ message: "Scan started successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error starting security scan" });
  }
});

// API to fetch scan results
app.get("/scan-results", async (req, res) => {
  try {
    // Fetch scan results using OWASP ZAP API
    const resultsResponse = await fetch(`${ZAP_API_BASE_URL}/core/view/alerts/?baseurl=${url}`, {
      method: "GET",
      headers: {
        "apikey": ZAP_API_KEY,
      },
    });

    if (!resultsResponse.ok) {
      throw new Error("Error fetching scan results");
    }

    const results = await resultsResponse.json();
    res.json(results);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error fetching scan results" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
