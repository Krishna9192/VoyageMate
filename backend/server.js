const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// ALLOWED FRONTEND ORIGINS
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://voyagemate.onrender.com",
];

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(
          new Error("Not allowed by CORS")
        );
      }
    },

    credentials: true,
  })
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Voyage Mate API is running 🚀",
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",

    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",

    timestamp:
      new Date().toISOString(),
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/trips",
  tripRoutes
);

app.use(
  "/api/itinerary",
  itineraryRoutes
);

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "MongoDB connected successfully ✅"
    );

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Voyage Mate API running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed ❌"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
};

startServer();