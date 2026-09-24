import type { Request, Response } from "express";

import Poster from "../models/poster.model.js";
import Template from "../models/template.model.js";
import { isValidObjectId } from "mongoose";
import { generatePoster } from "../services/poster-generation.service.js";

// 3 generations in total: the first one + 2 regenerations
const MAX_REGENERATIONS = 2;

// A poster stuck in "generating" for longer than this is treated as stuck
const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;

const EDITABLE_FIELDS = [
  "name",
  "designation",
  "partyOrOrganization",
  "unionThanaDistrict",
  "occasion",
  "headline",
] as const;

const isGenerationStuck = (poster: {
  status: string;
  updatedAt: Date;
}): boolean =>
  poster.status === "generating" &&
  Date.now() - poster.updatedAt.getTime() > GENERATION_TIMEOUT_MS;

export const createPoster = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const {
      templateId,
      name,
      designation,
      partyOrOrganization,
      unionThanaDistrict,
      occasion,
      headline,
      uploadedPhotoUrls,
    } = req.body;

    if (
      !templateId ||
      !name ||
      !designation ||
      !partyOrOrganization ||
      !unionThanaDistrict ||
      !occasion ||
      !headline
    ) {
      res.status(400).json({
        success: false,
        message: "All required poster fields must be provided",
      });

      return;
    }

    const template = await Template.findOne({
      _id: templateId,
      isActive: true,
    });

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });

      return;
    }

    const poster = await Poster.create({
      userId,
      templateId,
      formData: {
        name,
        designation,
        partyOrOrganization,
        unionThanaDistrict,
        occasion,
        headline,
      },
      uploadedPhotoUrls: Array.isArray(uploadedPhotoUrls)
        ? uploadedPhotoUrls
        : [],
      status: "draft",
      regenerateCount: 0,
    });

    res.status(201).json({
      success: true,
      message: "Poster created successfully",
      data: poster,
    });
  } catch (error) {
    console.error("Create poster error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating poster",
    });
  }
};

export const generatePosterHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid poster id",
      });

      return;
    }

    const poster = await Poster.findOne({ _id: id, userId });

    if (!poster) {
      res.status(404).json({
        success: false,
        message: "Poster not found",
      });

      return;
    }

    if (poster.status === "generating" && !isGenerationStuck(poster)) {
      res.status(409).json({
        success: false,
        message: "Poster is already being generated",
      });

      return;
    }

    if (poster.status === "completed") {
      res.status(409).json({
        success: false,
        message: "Poster is already generated",
      });

      return;
    }

    // Mark as generating now, so a double click cannot start it twice
    poster.status = "generating";
    await poster.save();

    // Run in the background, the frontend will poll GET /api/posters/:id
    generatePoster(poster.id).catch((error) => {
      console.error("Poster generation error:", error);
    });

    res.status(200).json({
      success: true,
      data: {
        ...poster.toObject(),
        regenerationsLeft: Math.max(
          MAX_REGENERATIONS - poster.regenerateCount,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("Generate poster error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while starting poster generation",
    });
  }
};

export const getPosterById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid poster id",
      });

      return;
    }

    const poster = await Poster.findOne({ _id: id, userId }).populate(
      "templateId",
      "title occasionType thumbnailUrl",
    );

    if (!poster) {
      res.status(404).json({
        success: false,
        message: "Poster not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: poster,
    });
  } catch (error) {
    console.error("Get poster error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching poster",
    });
  }
};

export const regeneratePosterHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid poster id",
      });

      return;
    }

    const poster = await Poster.findOne({ _id: id, userId });

    if (!poster) {
      res.status(404).json({
        success: false,
        message: "Poster not found",
      });

      return;
    }

    if (poster.status === "generating") {
      res.status(409).json({
        success: false,
        message: "Poster is already being generated",
      });

      return;
    }

    if (poster.status !== "completed") {
      res.status(400).json({
        success: false,
        message: "Only a completed poster can be regenerated",
      });

      return;
    }

    if (poster.regenerateCount >= MAX_REGENERATIONS) {
      res.status(403).json({
        success: false,
        message: "Regeneration limit reached for this poster",
      });

      return;
    }

    // Optional: the user can tweak the text before regenerating
    for (const field of EDITABLE_FIELDS) {
      const value = req.body[field];

      if (typeof value === "string" && value.trim()) {
        poster.formData[field] = value.trim();
      }
    }

    poster.regenerateCount += 1;
    poster.status = "generating";
    await poster.save();

    // Run in the background, the frontend will poll GET /api/posters/:id
    generatePoster(poster.id).catch((error) => {
      console.error("Poster regeneration error:", error);
    });

    res.status(202).json({
      success: true,
      message: "Poster regeneration started",
      data: {
        id: poster.id,
        status: poster.status,
        regenerationsLeft: MAX_REGENERATIONS - poster.regenerateCount,
      },
    });
  } catch (error) {
    console.error("Regenerate poster error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while regenerating poster",
    });
  }
};
