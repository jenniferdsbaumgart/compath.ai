// src/app.ts
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";

import userRoutes from "./routes/userRoutes";
import searchRoutes from "./routes/searchRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import adminRoutes from "./routes/adminRoutes";
import coinRoutes from "./routes/coinRoutes";
import favouriteRoutes from "./routes/favouriteRoutes";
import recommendationRoutes from "./routes/recommendationRoutes";
import profileRoutes from "./routes/profileRoutes";
import aiReportRoutes from "./routes/aiReportRoutes";

// Security and validation middlewares
import {
  securityHeaders,
  corsOptions,
  sanitizeInput,
  requestLogger,
  apiRateLimit,
  authRateLimit,
} from "./middleware/securityMiddleware";

dotenv.config();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(sanitizeInput);

// CORS configuration
app.use(cors(corsOptions));

// Rate limiting
app.use("/api/users/login", authRateLimit);
app.use("/api/users/register", authRateLimit);
app.use("/api", apiRateLimit);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Rotas existentes
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/ai", aiReportRoutes);

// Nova rota para recomendações com KNN
app.use("/api/users/profile/recommendations", recommendationRoutes);
app.use("/api/profile", profileRoutes);

export default app;
