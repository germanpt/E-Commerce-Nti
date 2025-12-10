const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config({ path: "./.env" });
connectDB();
const app = express();
app.use(cors());
app.use((req, res, next) => {
  req.url = req.url.replace(/%0A|%0D|%0a|%0d/g, "");

  try {
    req.url = decodeURIComponent(req.url);
  } catch (e) {}

  req.url = req.url
    .replace(/[\r\n\t\s]+$/, "")
    .replace(/^[\r\n\t\s]+/, "")
    .replace(/[\x00-\x1F\x7F]/g, "");

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running and accessible!",
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const salesRoutes = require("./routes/salesRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sales", salesRoutes);

app.use((req, res, next) => {
  const cleanUrl = req.url.replace(/%0A|%0D|%0a|%0d/g, "").trim();

  let errorMessage = `Route ${req.method} ${cleanUrl} not found`;

  if (cleanUrl.includes("/register") || cleanUrl.includes("/login")) {
    if (req.method !== "POST") {
      errorMessage += `. Did you mean to use POST instead of ${req.method}?`;
    } else {
      errorMessage += `. Make sure your URL doesn't contain extra characters or spaces.`;
    }
  }

  res.status(404).json({
    success: false,
    error: errorMessage,
  });
});

const errorHandler = require("./middleware/error");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
  console.log(`Server also accessible at http://127.0.0.1:${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});
