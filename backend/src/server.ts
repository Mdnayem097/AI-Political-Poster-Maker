import "dotenv/config";
import express from "express";
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

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/posters", posterRoutes);
app.use("/api/gemini-test", geminiTestRoutes);
app.use("/api/renderer-test", rendererTestRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "AI Political Poster Maker API is running",
  });
});

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await seedTemplates();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
