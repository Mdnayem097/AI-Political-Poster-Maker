import type { Request, Response } from "express";

import Poster from "../models/poster.model.js";
import Template from "../models/template.model.js";
import { isValidObjectId } from "mongoose";
import { generatePoster } from "../services/poster-generation.service.js";

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

    if (poster.status === "generating") {
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

    res.status(202).json({
      success: true,
      message: "Poster generation started",
      data: {
        id: poster.id,
        status: poster.status,
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
