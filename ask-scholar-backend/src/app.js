const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const scholarRoutes = require("./routes/scholarRoutes");
const userRoutes = require("./routes/userRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// ------------------------------------------------------------------
// Global middleware
// ------------------------------------------------------------------
app.use(helmet({ crossOriginResourcePolicy: false })); // allow images to be served cross-origin
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Serve uploaded scholar pictures statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ------------------------------------------------------------------
// Health check
// ------------------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Ask Scholar API is running." });
});

// ------------------------------------------------------------------
// Routes
// ------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/scholars", scholarRoutes);
app.use("/api/users", userRoutes);

// ------------------------------------------------------------------
// 404 + error handling (must be last)
// ------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
