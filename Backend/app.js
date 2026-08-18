const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// --- Middleware ---
app.use(express.json()); // parse JSON body
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(cors()); // allow frontend to call backend

// --- MongoDB Connection ---
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/purchaseWarrantyManager";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// --- Test Route ---
app.get("/", (req, res) => {
  res.send("Smart Purchase & Warranty Manager API is running 🚀");
});

// --- Routes ---
app.use("/api/purchases", require("./routes/purchase.routes"));
// app.use("/api/users", require("./routes/user.routes"));

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
