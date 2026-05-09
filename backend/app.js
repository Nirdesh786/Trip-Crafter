import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images from external URLs
}));

// General API rate limit: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP. Please try again after 15 minutes." },
});

// Strict limit for auth routes: 10 attempts per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again after 15 minutes." },
});

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const normalizedFrontend = frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (normalizedOrigin === normalizedFrontend || normalizedOrigin === "http://localhost:5173") {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", apiLimiter, authRoutes);     // use standard apiLimiter, authLimiter was too strict for /me and /stats
app.use("/api/places", apiLimiter, placeRoutes);
app.use("/api/hotels", apiLimiter, hotelRoutes);
app.use("/api/bookings", apiLimiter, bookingRoutes);
app.use("/api/buses", apiLimiter, busRoutes);
app.use("/api/wishlist", apiLimiter, wishlistRoutes);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export default app;
