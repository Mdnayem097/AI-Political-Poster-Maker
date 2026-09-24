import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";

import connectDatabase from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import seedTemplates from "./seeds/template.seed.js";
import templateRoutes from "./routes/template.routes.js";
import "./config/cloudinary.js";
import uploadRoutes from "./routes/upload.routes.js";
import posterRoutes from "./routes/poster.routes.js";
import geminiTestRoutes from "./routes/gemini-test.routes.js";
import rendererTestRoutes from "./routes/renderer-test.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Needed behind Render/Vercel so rate limiting sees the real client IP
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/posters", posterRoutes);

// Test routes are only for local development
if (!isProduction) {
  app.use("/api/gemini-test", geminiTestRoutes);
  app.use("/api/renderer-test", rendererTestRoutes);
}

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AI Political Poster Maker API is running",
  });
});

// Unknown route
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Any error that was not handled inside a controller
app.use(
  (
    error: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("Unhandled error:", error);

    const status = error.status ?? 500;

    res.status(status).json({
      success: false,
      message: status === 500 ? "Something went wrong" : error.message,
    });
  },
);

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await seedTemplates();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
