import gemini from "../config/gemini.js";

interface LayoutSuggestionInput {
  templateTitle: string;
  occasionType: string;
  name: string;
  designation: string;
  occasion: string;
  headline: string;
}

export interface LayoutSuggestion {
  background: string;
  primaryColor: string;
  secondaryColor: string;
  textAlignment: "left" | "center" | "right";
  photoPosition: "left" | "center" | "right" | "bottom";
  decoration: string;
}

export const generateLayoutSuggestion = async (
  input: LayoutSuggestionInput,
): Promise<LayoutSuggestion> => {
  const prompt = `
You are helping a poster rendering system choose a visual layout.

Return ONLY valid JSON.
Do not include markdown.
Do not write political slogans or persuasive political content.
Do not change or rewrite the user's provided text.

Choose a clean, professional visual layout based on these details:

Template: ${input.templateTitle}
Occasion type: ${input.occasionType}
Name: ${input.name}
Designation: ${input.designation}
Occasion: ${input.occasion}
Headline: ${input.headline}

Return exactly this JSON structure:

{
  "background": "solid or gradient",
  "primaryColor": "#hexcolor",
  "secondaryColor": "#hexcolor",
  "textAlignment": "left, center, or right",
  "photoPosition": "left, center, right, or bottom",
  "decoration": "short description of simple decorative elements"
}
`;

  const response = await gemini.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleanedText) as LayoutSuggestion;
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }
};
