import { Router } from "express";

import { generateLayoutSuggestion } from "../services/gemini.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await generateLayoutSuggestion({
      templateTitle: "Classic Political",
      templateLayout: {
        background: "gradient",
        primaryColor: "#1B365D",
        secondaryColor: "#C5A059",
        textAlignment: "center",
        photoPosition: "center",
      },
      occasionType: "General",
      name: "Nayem Test",
      designation: "Test Designation",
      occasion: "General",
      headline: "Test Poster Headline",
      attempt: 0,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini test error:", error);

    res.status(500).json({
      success: false,
      message: "Gemini test failed",
    });
  }
});

export default router;
