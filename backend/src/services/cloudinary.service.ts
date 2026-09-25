import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (
  filePath: string,
): Promise<string> => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "ai-political-poster-maker",
    resource_type: "image",
  });

  return result.secure_url;
};
