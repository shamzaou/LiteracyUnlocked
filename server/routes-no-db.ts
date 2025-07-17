import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateComicImage } from "./openai";
import { sendComicEmail, type ComicEmailData } from "./email";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown"
    });
  });

  // Add a specific route to serve example_uae.jpeg
  app.get("/example_uae.jpeg", (req, res) => {
    res.sendFile(path.resolve(process.cwd(), "example_uae.jpeg"));
  });

  // Add a specific route to serve generated comic images via API (priority route)
  app.get("/api/images/:filename", (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.resolve(process.cwd(), "public", "generated-images", filename);
    
    console.log(`🔍 API image request for: ${filename}`);
    console.log(`🔍 Looking for image at: ${imagePath}`);
    
    // Check if file exists before serving
    if (require('fs').existsSync(imagePath)) {
      console.log(`✅ Found image, serving: ${imagePath}`);
      res.sendFile(imagePath);
    } else {
      console.log(`❌ Image not found: ${imagePath}`);
      res.status(404).json({ error: "Image not found", path: imagePath });
    }
  });

  // Add a specific route to serve generated comic images (legacy static path)
  app.get("/generated-images/:filename", (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.resolve(process.cwd(), "public", "generated-images", filename);
    
    console.log(`🔍 Static image request for: ${filename}`);
    console.log(`🔍 Looking for image at: ${imagePath}`);
    
    // Check if file exists before serving
    if (require('fs').existsSync(imagePath)) {
      console.log(`✅ Found image, serving: ${imagePath}`);
      res.sendFile(imagePath);
    } else {
      console.log(`❌ Image not found: ${imagePath}`);
      res.status(404).json({ error: "Image not found", path: imagePath });
    }
  });
  
  // Test endpoint for OpenAI integration
  app.get("/api/test-openai", async (req, res) => {
    try {
      const testResult = await generateComicImage({
        storyTitle: "Test Story",
        storyDescription: "This is a test to verify the OpenAI API key is working",
        characters: [{
          name: "Test Character",
          appearance: "A friendly character with blue clothes",
          personality: "Helpful and kind",
          role: "Main character"
        }]
      });
      res.json({ success: true, message: "OpenAI API is working!", imageUrl: testResult.url });
    } catch (error) {
      console.error("OpenAI API test failed:", error);
      res.status(500).json({ 
        success: false, 
        message: "OpenAI API test failed", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Simplified comic generation and email endpoint
  app.post("/api/comics/generate-and-email", async (req, res) => {
    try {
      const {
        childName,
        childEmail,
        parentEmail,
        storyTitle,
        storyDescription,
        characters
      } = req.body;

      // Validate required fields
      if (!childName || !parentEmail || !storyTitle || !storyDescription || !characters || !Array.isArray(characters)) {
        return res.status(400).json({ 
          message: "Missing required fields: childName, parentEmail, storyTitle, storyDescription, and characters are required" 
        });
      }

      if (characters.length === 0) {
        return res.status(400).json({ 
          message: "At least one character is required" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return res.status(400).json({ message: "Invalid parent email format" });
      }
      
      if (childEmail && !emailRegex.test(childEmail)) {
        return res.status(400).json({ message: "Invalid child email format" });
      }

      // Generate comic using OpenAI DALL-E
      const { url: imageUrl, prompt } = await generateComicImage({
        storyTitle,
        storyDescription,
        characters,
      });

      // Prepare email data
      const emailData: ComicEmailData = {
        childName,
        childEmail: childEmail || '',
        parentEmail,
        storyTitle,
        storyDescription,
        characters,
        imageUrl,
      };

      // Send email with comic
      const emailResult = await sendComicEmail(emailData);

      res.status(201).json({
        success: true,
        message: "Comic generated and email sent successfully!",
        data: {
          imageUrl,
          prompt,
          emailSent: emailResult.success,
          messageId: emailResult.messageId
        }
      });

    } catch (error) {
      console.error("Comic generation and email error:", error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false,
          message: `Failed to generate comic and send email: ${error.message}` 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: "Failed to generate comic and send email: Unknown error" 
        });
      }
    }
  });

  // Keep the original generate endpoint for testing without email
  app.post("/api/comics/generate", async (req, res) => {
    try {
      const { storyTitle, storyDescription, characters } = req.body;
      
      if (!storyTitle || !storyDescription || !characters) {
        return res.status(400).json({ message: "Story title, description, and characters are required" });
      }

      // Generate comic using OpenAI DALL-E
      const { url: imageUrl, prompt } = await generateComicImage({
        storyTitle,
        storyDescription,
        characters,
      });

      res.status(201).json({
        success: true,
        imageUrl,
        prompt
      });
    } catch (error) {
      console.error("Comic generation error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Failed to generate comic: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to generate comic: Unknown error" });
      }
    }
  });

  // Email existing comic endpoint
  app.post("/api/comics/email", async (req, res) => {
    try {
      const {
        childName,
        childEmail,
        parentEmail,
        storyTitle,
        storyDescription,
        characters,
        imageUrl
      } = req.body;

      // Validate required fields
      if (!childName || !parentEmail || !storyTitle || !storyDescription || !characters || !imageUrl) {
        return res.status(400).json({ 
          message: "Missing required fields: childName, parentEmail, storyTitle, storyDescription, characters, and imageUrl are required" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return res.status(400).json({ message: "Invalid parent email format" });
      }
      
      if (childEmail && !emailRegex.test(childEmail)) {
        return res.status(400).json({ message: "Invalid child email format" });
      }

      // Convert base64 to URL if needed (temporary compatibility)
      let processedImageUrl = imageUrl;
      if (imageUrl.startsWith('data:image/')) {
        console.log('⚠️ WARNING: Base64 image received. Consider using URLs instead for better performance.');
        console.log('💡 SUGGESTION: Use the generate endpoint first, then use the returned imageUrl.');
      }

      // Prepare email data
      const emailData: ComicEmailData = {
        childName,
        childEmail: childEmail || '',
        parentEmail,
        storyTitle,
        storyDescription,
        characters,
        imageUrl: processedImageUrl,
      };

      // Send email with comic
      const emailResult = await sendComicEmail(emailData);

      res.status(200).json({
        success: true,
        message: "Comic emailed successfully!",
        emailSent: emailResult.success,
        messageId: emailResult.messageId
      });

    } catch (error) {
      console.error("Comic email error:", error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false,
          message: `Failed to send comic email: ${error.message}` 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: "Failed to send comic email: Unknown error" 
        });
      }
    }
  });

  // NEW: Generate and email comic without base64 (recommended approach)
  app.post("/api/comics/generate-and-email-v2", async (req, res) => {
    try {
      const {
        childName,
        childEmail,
        parentEmail,
        storyTitle,
        storyDescription,
        characters
      } = req.body;

      // Validate required fields
      if (!childName || !parentEmail || !storyTitle || !storyDescription || !characters || !Array.isArray(characters)) {
        return res.status(400).json({ 
          message: "Missing required fields: childName, parentEmail, storyTitle, storyDescription, and characters are required" 
        });
      }

      if (characters.length === 0) {
        return res.status(400).json({ 
          message: "At least one character is required" 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return res.status(400).json({ message: "Invalid parent email format" });
      }
      
      if (childEmail && !emailRegex.test(childEmail)) {
        return res.status(400).json({ message: "Invalid child email format" });
      }

      console.log('🚀 Generating comic without base64...');
      
      // Generate comic using OpenAI DALL-E (returns URL, not base64)
      const { url: imageUrl, prompt } = await generateComicImage({
        storyTitle,
        storyDescription,
        characters,
      });

      console.log(`✅ Comic generated with URL: ${imageUrl}`);

      // Prepare email data using the URL (no base64 involved)
      const emailData: ComicEmailData = {
        childName,
        childEmail: childEmail || '',
        parentEmail,
        storyTitle,
        storyDescription,
        characters,
        imageUrl, // This will be a clean URL path like "/generated-images/comic-123.png"
      };

      // Send email with comic (email service will find the file locally)
      const emailResult = await sendComicEmail(emailData);

      res.status(201).json({
        success: true,
        message: "Comic generated and email sent successfully! (No base64 used)",
        data: {
          imageUrl,
          prompt,
          emailSent: emailResult.success,
          messageId: emailResult.messageId
        }
      });

    } catch (error) {
      console.error("Comic generation and email error:", error);
      if (error instanceof Error) {
        res.status(500).json({ 
          success: false,
          message: `Failed to generate comic and send email: ${error.message}` 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: "Failed to generate comic and send email: Unknown error" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
