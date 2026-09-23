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

export const getTemplateById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const template = await Template.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!template) {
      res.status(404).json({
        success: false,
        message: "Template not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get template by id error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching template",
    });
  }
};
