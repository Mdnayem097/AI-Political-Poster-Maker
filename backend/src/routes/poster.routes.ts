import { Router } from "express";

import {
  createPoster,
  deletePoster,
  generatePosterHandler,
  getMyPosters,
  getPosterById,
  regeneratePosterHandler,
} from "../controllers/poster.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createPoster);
router.get("/", authMiddleware, getMyPosters);
router.post("/:id/generate", authMiddleware, generatePosterHandler);
router.post("/:id/regenerate", authMiddleware, regeneratePosterHandler);
router.get("/:id", authMiddleware, getPosterById);
router.delete("/:id", authMiddleware, deletePoster);

export default router;
