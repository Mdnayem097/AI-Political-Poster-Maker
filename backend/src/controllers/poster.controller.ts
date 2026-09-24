import type { Request, Response } from "express";

import Poster from "../models/poster.model.js";
import Template from "../models/template.model.js";

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
