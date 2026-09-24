import { Router } from "express";

import { createPoster } from "../controllers/poster.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createPoster);

export default router;
