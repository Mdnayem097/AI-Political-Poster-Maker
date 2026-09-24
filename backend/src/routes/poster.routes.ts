import { Router } from "express";

import {
  createPoster,
  generatePosterHandler,
  getPosterById,
  regeneratePosterHandler,
} from "../controllers/poster.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createPoster);
router.post("/:id/generate", authMiddleware, generatePosterHandler);
router.post("/:id/regenerate", authMiddleware, regeneratePosterHandler);
router.get("/:id", authMiddleware, getPosterById);

export default router;
