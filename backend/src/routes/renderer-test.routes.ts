import { Router } from "express";

import { renderPoster } from "../services/poster-renderer.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const outputPath = await renderPoster({
      name: "Nayem Test",
      designation: "Test Designation",
      partyOrOrganization: "Test Organization",
      unionThanaDistrict: "Thakurgaon",
      occasion: "General",
      headline: "Test Poster Headline",
      photoUrls: [
        "https://res.cloudinary.com/kqp9sezy/image/upload/v1790192763/ai-political-poster-maker/xgk80k9twvqjk75jhcbq.png",
      ],
      layout: {
        background: "gradient",
        primaryColor: "#1B365D",
        secondaryColor: "#C5A059",
        textAlignment: "center",
        photoPosition: "center",
        decoration: "Thin gold border with subtle horizontal accent lines",
        variant: 0,
      },
    });

    res.status(200).json({
      success: true,
      message: "Poster rendered successfully",
      data: {
        outputPath,
      },
    });
  } catch (error) {
    console.error("Renderer test error:", error);

    res.status(500).json({
      success: false,
      message: "Poster rendering failed",
    });
  }
});

export default router;
