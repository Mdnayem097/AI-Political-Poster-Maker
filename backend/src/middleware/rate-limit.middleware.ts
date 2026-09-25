import rateLimit from "express-rate-limit";

// Generation is the expensive part (Gemini + Puppeteer + Cloudinary)
export const generationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many generation requests, please try again later",
  },
});
