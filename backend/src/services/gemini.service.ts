import gemini from "../config/gemini.js";

interface LayoutSuggestionInput {
  templateTitle: string;
  occasionType: string;
  name: string;
  designation: string;
  occasion: string;
  headline: string;
  // 0 for the first generation, then 1, 2 for each regeneration
  attempt: number;
}

export interface LayoutSuggestion {
  background: string;
  primaryColor: string;
  secondaryColor: string;
  textAlignment: "left" | "center" | "right";
  photoPosition: "left" | "center" | "right" | "bottom";
  decoration: string;
}

interface Palette {
  id: string;
  primaryColor: string;
  secondaryColor: string;
}

// Approved palettes, all dark enough for white text
const PALETTES: Palette[] = [
  { id: "green-red", primaryColor: "#006A4E", secondaryColor: "#F42A41" },
  { id: "navy-orange", primaryColor: "#0B2545", secondaryColor: "#E85D04" },
  { id: "maroon-gold", primaryColor: "#6B1E2E", secondaryColor: "#C9971C" },
  { id: "teal-coral", primaryColor: "#0F5257", secondaryColor: "#E4572E" },
  { id: "charcoal-red", primaryColor: "#22223B", secondaryColor: "#C81D25" },
  { id: "purple-pink", primaryColor: "#3C1053", secondaryColor: "#D6336C" },
];

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
  const paletteIds = PALETTES.map((palette) => palette.id).join(", ");

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

Pick the palette that best fits the occasion from this list: ${paletteIds}

Return exactly this JSON structure:

{
  "paletteId": "one id from the list above",
  "background": "solid or gradient",
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

  let suggestion: GeminiLayout;

  try {
    suggestion = JSON.parse(cleanedText) as GeminiLayout;
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  // Start from the palette Gemini picked (or the first one if the id is unknown),
  // then move to the next palette on every regeneration
  const foundIndex = PALETTES.findIndex(
    (palette) => palette.id === suggestion.paletteId,
  );
  const startIndex = foundIndex >= 0 ? foundIndex : 0;
  const palette = PALETTES[(startIndex + input.attempt) % PALETTES.length];

  return {
    background: suggestion.background,
    primaryColor: palette.primaryColor,
    secondaryColor: palette.secondaryColor,
    textAlignment: suggestion.textAlignment,
    photoPosition: suggestion.photoPosition,
    decoration: suggestion.decoration,
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

  // Gemini only suggests the look, so if it stays unavailable
  // we still build the poster with a default layout
  const palette = PALETTES[input.attempt % PALETTES.length];

  return {
    background: "gradient",
    primaryColor: palette.primaryColor,
    secondaryColor: palette.secondaryColor,
    textAlignment: "center",
    photoPosition: "center",
    decoration: "simple border",
  };
};
