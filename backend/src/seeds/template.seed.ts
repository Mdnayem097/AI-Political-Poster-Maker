import Template from "../models/template.model.js";

const templates = [
  {
    title: "Classic Political",
    occasionType: "General",
    thumbnailUrl: "/templates/classic-political.svg",
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
    thumbnailUrl: "/templates/national-occasion.svg",
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
    thumbnailUrl: "/templates/modern-campaign.svg",
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
    for (const template of templates) {
      await Template.updateOne(
        { title: template.title },
        {
          $set: {
            occasionType: template.occasionType,
            thumbnailUrl: template.thumbnailUrl,
            layoutConfig: template.layoutConfig,
            isActive: template.isActive,
          },
        },
        { upsert: true },
      );
    }

    console.log("Template seed data updated successfully");
  } catch (error) {
    console.error("Template seed failed:", error);
  }
};

export default seedTemplates;
