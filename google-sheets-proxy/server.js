import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Only needed if Node <18

const app = express();
const PORT = 3001;
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP8n4qp477Tk5vM3PeFpgfEzNMVC1b7nmrR4SI0J2XT4vTK1EDPzZpED89rz49w8tk/exec";

// Middleware
app.use(cors());
app.use(express.json());

// Helper to safely fetch JSON from Apps Script
async function fetchAppsScript(method = "GET", body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(APPS_SCRIPT_URL, options);

  // Check if response is OK
  if (!response.ok) {
    throw new Error(`Apps Script returned status ${response.status}`);
  }

  // Try parsing JSON safely
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from Apps Script: ${text}`);
  }
}

// GET: forward request to Apps Script
app.get("/api/script", async (req, res) => {
  try {
    const data = await fetchAppsScript("GET");
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to fetch Apps Script data", error: err.message });
  }
});

// POST: forward request to Apps Script
app.post("/api/script", async (req, res) => {
  try {
    const data = await fetchAppsScript("POST", req.body);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to send data to Apps Script", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Node proxy server running at http://localhost:${PORT}`);
});
