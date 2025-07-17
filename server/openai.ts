import OpenAI from "openai";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Image storage utilities
async function downloadImageFromUrl(imageUrl: string, filename: string): Promise<string> {
  // Store images in persistent public directory, not in dist which gets rebuilt
  const imagesDir = path.join(__dirname, '..', 'public', 'generated-images');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const filePath = path.join(imagesDir, filename);
  
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https:') ? https : http;
    
    const request = protocol.get(imageUrl, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const writeStream = fs.createWriteStream(filePath);
      response.pipe(writeStream);
      
      writeStream.on('finish', () => {
        writeStream.close();
        // Return the public URL path
        const publicUrl = `/generated-images/${filename}`;
        resolve(publicUrl);
      });
      
      writeStream.on('error', reject);
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

function generateImageFilename(prefix: string = 'comic'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.png`;
}

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
    Create a single comic page divided into exactly four panels arranged in a 2x2 grid layout. Each panel should be clearly separated and numbered (1, 2, 3, 4) to show the story progression.

    The comic should be designed specifically for children with:
    - Bright, cheerful colors that are appealing to kids
    - Simple, clear artwork that's easy to understand
    - Friendly, expressive characters with welcoming faces
    - Clean, uncluttered panel layouts

    IMPORTANT RESTRICTIONS:
    - NO dialogue bubbles or speech balloons (these will be added separately)
    - NO text or words anywhere in the image
    - Keep all content completely appropriate for children
    - Respect UAE cultural values and traditions
    - Avoid any controversial, scary, or inappropriate elements

    Setting and Cultural Elements:
    - Set exclusively in the United Arab Emirates
    - Include recognizable UAE locations like Dubai skyline, Abu Dhabi Corniche, desert landscapes, traditional markets, or Emirati neighborhoods
    - Incorporate appropriate cultural symbols: date palms, falcons, camels, traditional architecture, UAE flag colors (red, green, white, black)
    - Characters should wear modest, culturally appropriate clothing

    Story Structure:
    Panel 1: Introduction/setup of the situation
    Panel 2: Development of the story/problem
    Panel 3: Action/solution being attempted
    Panel 4: Resolution/happy ending

    Visual Style Guidelines:
    - Make it colorful and engaging for children
    - Use clear, bold outlines to define characters and objects
    - Ensure good contrast between characters and backgrounds
    - Keep facial expressions warm and friendly
    - Make sure the story flows logically from panel to panel

    Story: "${request.storyTitle}" - ${request.storyDescription}
    Characters: ${characterDescriptions}

    Remember: This is for children in the UAE, so keep everything positive, educational, and culturally respectful.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1792",
      quality: "standard",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No data returned from DALL-E");
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from DALL-E");
    }

    // Download and store the image locally
    try {
      const filename = generateImageFilename('comic');
      const localImageUrl = await downloadImageFromUrl(imageUrl, filename);
      console.log(`✅ Image downloaded and stored as: ${localImageUrl}`);
      
      return { 
        url: localImageUrl, // Return the local URL instead of the temporary OpenAI URL
        prompt: prompt
      };
    } catch (downloadError) {
      console.warn(`⚠️ Failed to download image locally, using original URL:`, downloadError);
      // Fallback to original URL if download fails
      return { 
        url: imageUrl,
        prompt: prompt
      };
    }
  } catch (error) {
    console.error("Failed to generate comic image:", error);
    throw new Error(`Failed to generate comic image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
