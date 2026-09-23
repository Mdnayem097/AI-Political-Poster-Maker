import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

const uploadBufferToCloudinary = (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ai-political-poster-maker",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};

export const uploadImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Image file is required",
      });

      return;
    }

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong while uploading image",
    });
  }
};
