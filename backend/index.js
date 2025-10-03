import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is alive! 🚀" });
});

// Fetch product details by AliExpress link
app.get("/api/product", async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "Product link required" });
  }

  // Extract itemId from the link
  const cleanLink = link.split("?")[0]; // remove query string
  const match = cleanLink.match(/\/item\/(\d+)\.html/);
  if (!match) return res.status(400).json({ error: "Invalid AliExpress link" });

  const itemId = match[1];

  try {
    const response = await axios.get(
      `https://${process.env.RAPIDAPI_HOST}/item_detail_2`,
      {
        params: { itemId },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST,
        },
      }
    );

    // You can extract main details to send to frontend
    const product = {
      id: response.data.product_id,
      title: response.data.product_title,
      price: response.data.sale_price,
      currency: response.data.currency,
      image: response.data.main_image_url,
      variants: response.data.product_attributes
    };

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch product from AliExpress" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
