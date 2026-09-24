import fs from "node:fs/promises";

import Poster from "../models/poster.model.js";
import Template from "../models/template.model.js";
import { uploadImageToCloudinary } from "./cloudinary.service.js";
import { generateLayoutSuggestion } from "./gemini.service.js";
import { renderPoster } from "./poster-renderer.service.js";

export const generatePoster = async (posterId: string): Promise<void> => {
  const poster = await Poster.findById(posterId);

  if (!poster) {
    throw new Error("Poster not found");
  }

  const template = await Template.findById(poster.templateId);

  if (!template) {
    throw new Error("Template not found");
  }

  await Poster.findByIdAndUpdate(posterId, {
    status: "generating",
  });

  let imagePath: string | undefined;

  try {
    // 1. Ask Gemini for a layout suggestion
    const layout = await generateLayoutSuggestion({
      templateTitle: template.title,
      occasionType: template.occasionType,
      name: poster.formData.name,
      designation: poster.formData.designation,
      occasion: poster.formData.occasion,
      headline: poster.formData.headline,
    });

    // 2. Render the poster PNG with Puppeteer
    imagePath = await renderPoster({
      name: poster.formData.name,
      designation: poster.formData.designation,
      partyOrOrganization: poster.formData.partyOrOrganization,
      unionThanaDistrict: poster.formData.unionThanaDistrict,
      occasion: poster.formData.occasion,
      headline: poster.formData.headline,
      photoUrls: poster.uploadedPhotoUrls,
      layout,
    });

    // 3. Upload the PNG to Cloudinary
    const generatedImageUrl = await uploadImageToCloudinary(imagePath);

    // 4. Save the result
    await Poster.findByIdAndUpdate(posterId, {
      generatedImageUrl,
      status: "completed",
    });
  } catch (error) {
    await Poster.findByIdAndUpdate(posterId, {
      status: "failed",
    });

    throw error;
  } finally {
    // Always remove the temporary PNG file
    if (imagePath) {
      await fs.unlink(imagePath).catch(() => undefined);
    }
  }
};
