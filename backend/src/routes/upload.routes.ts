import { Router } from "express";

import { uploadImage } from "../controllers/upload.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", upload.single("image"), uploadImage);

export default router;
