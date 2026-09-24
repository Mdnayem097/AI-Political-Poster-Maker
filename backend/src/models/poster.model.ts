import { Schema, model, type Document, type Types } from "mongoose";

export interface IPoster extends Document {
  userId: Types.ObjectId;
  templateId: Types.ObjectId;

  formData: {
    name: string;
    designation: string;
    partyOrOrganization: string;
    unionThanaDistrict: string;
    occasion: string;
    headline: string;
  };

  uploadedPhotoUrls: string[];

  generatedImageUrl?: string;

  status: "draft" | "generating" | "completed" | "failed";

  regenerateCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const posterSchema = new Schema<IPoster>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },

    formData: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        required: true,
        trim: true,
      },

      partyOrOrganization: {
        type: String,
        required: true,
        trim: true,
      },

      unionThanaDistrict: {
        type: String,
        required: true,
        trim: true,
      },

      occasion: {
        type: String,
        required: true,
        trim: true,
      },

      headline: {
        type: String,
        required: true,
        trim: true,
      },
    },

    uploadedPhotoUrls: {
      type: [String],
      required: true,
      default: [],
    },

    generatedImageUrl: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "generating", "completed", "failed"],
      default: "draft",
    },

    regenerateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Poster = model<IPoster>("Poster", posterSchema);

export default Poster;
