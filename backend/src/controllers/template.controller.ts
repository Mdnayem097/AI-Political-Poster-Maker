import type { Request, Response } from "express";

import Template from "../models/template.model.js";

export const getTemplates = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const templates = await Template.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching templates",
    });
  }
};
