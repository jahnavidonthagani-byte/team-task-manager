const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");
const commentRoutes = require("./routes/comments");
const notificationRoutes = require("./routes/notifications");

const app = express();

// ==========================
// Security & Core Middleware
// ==========================
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Basic rate limiting to slow down brute-force / abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// ==========================
// API Routes
// ==========================
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

module.exports = app;
