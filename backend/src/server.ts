import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDatabase from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import seedTemplates from "./seeds/template.seed.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

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
