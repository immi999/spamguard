import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const apiKey = process.env.VIRUS_TOTAL_API_KEY;
const apiUrl = "https://www.virustotal.com/api/v3";

app.post("/submit-url", async (req, res) => {
  const url = req.body.url;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ url }),
  };

  try {
    const response = await fetch(`${apiUrl}/urls`, options);
    const { data } = await response.json();
    res.json({ id: data.id });
  } catch (error) {
    console.error("Error occurred while posting url data:", error.message);
    res.status(500).json({ error: "Failed to post data to totalvirus api" });
  }
});

app.get("/scan-results/:id", async (req, res) => {
  const id = req.params.id;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
    },
  };

  try {
    const response = await fetch(`${apiUrl}/analyses/${id}`, options);
    const { data } = await response.json();
    res.json({ stats: data.attributes.stats });
  } catch (error) {
    console.error(
      "Error occurred while fetching analyses data:",
      error.message
    );
    res.status(500).json({ error: "Failed to fetch data from virustotal database" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port} 🚀`);
});
