import Template from "../models/template.model.js";

const templates = [
  {
    title: "Classic Political",
    occasionType: "General",
    thumbnailUrl: "https://placehold.co/600x800/png",
    layoutConfig: {
      background: "gradient",
      primaryColor: "#0F172A",
      secondaryColor: "#2563EB",
      textAlignment: "center",
      photoPosition: "bottom",
    },
    isActive: true,
  },
  {
    title: "National Occasion",
    occasionType: "National",
    thumbnailUrl: "https://placehold.co/600x800/png",
    layoutConfig: {
      background: "solid",
      primaryColor: "#166534",
      secondaryColor: "#DC2626",
      textAlignment: "center",
      photoPosition: "bottom",
    },
    isActive: true,
  },
  {
    title: "Modern Campaign",
    occasionType: "Campaign",
    thumbnailUrl: "https://placehold.co/600x800/png",
    layoutConfig: {
      background: "gradient",
      primaryColor: "#1E293B",
      secondaryColor: "#F59E0B",
      textAlignment: "left",
      photoPosition: "right",
    },
    isActive: true,
  },
];

const seedTemplates = async (): Promise<void> => {
  try {
    const existingTemplates = await Template.countDocuments();

    if (existingTemplates > 0) {
      console.log("Templates already exist. Skipping seed.");
      return;
    }

    await Template.insertMany(templates);

    console.log("Template seed data inserted successfully");
  } catch (error) {
    console.error("Template seed failed:", error);
  }
};

export default seedTemplates;
