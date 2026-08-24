const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 DNS resolution for cloud hosts like Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

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
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "https://voyagemate.onrender.com",
];

if (process.env.FRONTEND_URL) {
  const customFrontend = process.env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(customFrontend)) {
    allowedOrigins.push(customFrontend);
  }
}

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/$/, "")) ||
        /\.onrender\.com$/.test(new URL(origin).hostname) ||
        /^(localhost|127\.0\.0\.1)$/.test(new URL(origin).hostname);

      if (isAllowed) {
        callback(null, true);
      } else {
        // Allow origin to prevent unwanted CORS blocking while logging
        callback(null, true);
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