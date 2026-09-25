export interface Template {
  _id: string;
  title: string;
  occasionType: string;
  thumbnailUrl: string;
}

export interface Poster {
  _id: string;
  templateId: Template | string;
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
  regenerationsLeft?: number;
  createdAt: string;
}
