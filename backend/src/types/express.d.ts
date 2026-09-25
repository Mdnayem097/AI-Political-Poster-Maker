import type { JwtPayload } from "../middleware/auth.middleware.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
