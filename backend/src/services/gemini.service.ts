import gemini from "../config/gemini.js";

interface LayoutSuggestionInput {
  templateTitle: string;
  occasionType: string;
  templateLayout: {
    background: string;
    primaryColor: string;
    secondaryColor: string;
    textAlignment: "left" | "center" | "right";
    photoPosition: "left" | "center" | "right" | "bottom";
  };
  name: string;
  designation: string;
  occasion: string;
  headline: string;
  attempt: number;
}

export interface LayoutSuggestion {
  background: string;
  primaryColor: string;
  secondaryColor: string;
  textAlignment: "left" | "center" | "right";
  photoPosition: "left" | "center" | "right" | "bottom";
  decoration: string;
  variant: 0 | 1 | 2;
}


interface GeminiLayout {
  paletteId: string;
  background: string;
  textAlignment: "left" | "center" | "right";
  photoPosition: "left" | "center" | "right" | "bottom";
  decoration: string;
}

const requestLayoutFromGemini = async (
  input: LayoutSuggestionInput,
): Promise<LayoutSuggestion> => {

  const prompt = `
You are helping a poster rendering system choose a visual layout.

Return ONLY valid JSON.
Do not include markdown.
Do not write political slogans or persuasive political content.
Do not change or rewrite the user's provided text.

A selected template already defines the main visual identity of the poster.
You MUST preserve the template's background, colors, text alignment, and photo position.
Do not replace or invent different template colors or positions.

Selected template:
Template: ${input.templateTitle}
Occasion type: ${input.occasionType}

Template layout rules:
- Background: ${input.templateLayout.background}
- Primary color: ${input.templateLayout.primaryColor}
- Secondary color: ${input.templateLayout.secondaryColor}
- Text alignment: ${input.templateLayout.textAlignment}
- Photo position: ${input.templateLayout.photoPosition}

Poster content:
Name: ${input.name}
Designation: ${input.designation}
Occasion: ${input.occasion}
Headline: ${input.headline}

Use the selected template layout rules exactly.
You may only suggest a simple decorative treatment that fits the selected template.

Return exactly this JSON structure:

{
  "paletteId": "template",
  "background": "${input.templateLayout.background}",
  "textAlignment": "${input.templateLayout.textAlignment}",
  "photoPosition": "${input.templateLayout.photoPosition}",
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

  let suggestion: GeminiLayout;

  try {
    suggestion = JSON.parse(cleanedText) as GeminiLayout;
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return {
    background: input.templateLayout.background,
    primaryColor: input.templateLayout.primaryColor,
    secondaryColor: input.templateLayout.secondaryColor,
    textAlignment: input.templateLayout.textAlignment,
    photoPosition: input.templateLayout.photoPosition,
    decoration: suggestion.decoration,
    variant: (input.attempt % 3) as 0 | 1 | 2,
  };
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const MAX_GEMINI_TRIES = 3;

export const generateLayoutSuggestion = async (
  input: LayoutSuggestionInput,
): Promise<LayoutSuggestion> => {
  for (let tryNumber = 1; tryNumber <= MAX_GEMINI_TRIES; tryNumber++) {
    try {
      return await requestLayoutFromGemini(input);
    } catch (error) {
      console.error(`Gemini try ${tryNumber} failed:`, error);

      if (tryNumber < MAX_GEMINI_TRIES) {
        await wait(2000 * tryNumber);
      }
    }
  }

  return {
    background: input.templateLayout.background,
    primaryColor: input.templateLayout.primaryColor,
    secondaryColor: input.templateLayout.secondaryColor,
    textAlignment: input.templateLayout.textAlignment,
    photoPosition: input.templateLayout.photoPosition,
    decoration: "simple border",
    variant: (input.attempt % 3) as 0 | 1 | 2,
  };
};
