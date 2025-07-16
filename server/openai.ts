import OpenAI from "openai";
import dotenv from "dotenv";

// Ensure .env is loaded in this file as well
dotenv.config();

// Check if the API key is commented out (starts with #) or doesn't exist
const envKey = process.env.OPENAI_API_KEY;
const isCommented = typeof envKey === 'string' && envKey.trim().startsWith('#');
const apiKey = isCommented ? undefined : envKey;

if (!apiKey) {
  console.error("⚠️ No OpenAI API key found in environment variables or it's commented out. Will use default image.");
} else {
  console.log("✅ OpenAI API key found with length:", apiKey.length);
}

const openai = new OpenAI({ 
  apiKey: apiKey || "your-api-key-here" // Fallback only for development
});

export interface ComicGenerationRequest {
  storyTitle: string;
  storyDescription: string;
  characters: Array<{
    name: string;
    appearance: string;
    personality: string;
    role: string;
  }>;
}

export async function generateComicImage(request: ComicGenerationRequest): Promise<{ url: string; prompt: string }> {
  try {
    // Check if API key is commented out or missing
    const envKey = process.env.OPENAI_API_KEY;
    const isCommented = typeof envKey === 'string' && envKey.trim().startsWith('#');

    if (!envKey || isCommented) {
      console.log("API key is commented out or missing. Using default example image.");
      // Return path to the default example image - using absolute URL
      const defaultImagePath = "/example_uae.jpeg"; // This will be served by our specific route
      return {
        url: defaultImagePath,
        prompt: "Default example image used because API key is commented out or missing."
      };
    }

    // Create a detailed prompt for DALL-E optimized for children's comics
    const characterDescriptions = request.characters
      .map(char => `${char.name} (${char.role}): ${char.appearance}`)
      .join(", ");

    const prompt = `
Create a single comic page divided into exactly four horizontal panels (tiles), arranged in two rows. The top two panels must be spanned by one large, bold comic-style title that visually stretches across both upper tiles.

Each of the four panels must include dialogue bubbles with clear, rounded fonts. The story should be logically adapted into four distinct moments—one per panel—each contributing to a cohesive and engaging narrative with friendly interaction between characters.

The visual style must resemble a whimsical, child-friendly, handcrafted paper cutout illustration, with tactile textures (like parchment, felt, or colored paper) and a nostalgic, educational tone. Use warm earth tones and soft pastels such as beige, brown, teal, and sky blue to create a comforting visual environment. Characters should be cute, stylized, expressive, and round-faced, with traditional Emirati or themed clothing.

The scene must be set exclusively in the United Arab Emirates—preferably in recognizable locations such as the Abu Dhabi Corniche, Dubai desert dunes, Emirati villages, schools, or iconic urban areas. Incorporate regional symbols like date palms, falcons, camels, traditional houses, the UAE flag, or skyline silhouettes to enhance local authenticity.

All objects and characters must have consistent thick outlines, with minor gradients and shadows for depth. Use bold comic headers, clear tile separation, and a consistent panel layout. The tone should remain positive, cooperative, motivational, and ideally educational, similar to a vintage children’s book or a government-sponsored school poster.

The comic must center around a child protagonist and an animal sidekick (like a falcon, camel, or desert fox) working together to explore a topic like teamwork, recycling, culture, or technology in an Emirati setting.

Story: "${request.storyTitle}" - ${request.storyDescription}
Characters: ${characterDescriptions}`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No data returned from DALL-E");
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E");
    }

    return { 
      url: imageUrl,
      prompt: prompt
    };
  } catch (error) {
    console.error("Failed to generate comic image:", error);
    throw new Error(`Failed to generate comic image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
