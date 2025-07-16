import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCharacterSchema, insertStorySchema } from "@shared/schema";
import { generateComicImage } from "./openai";
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
  
  // Characters
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData);
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to create character" });
      }
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, validatedData);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to update character" });
      }
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Stories
  app.get("/api/stories", async (req, res) => {
    try {
      const stories = await storage.getStories();
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStoryWithCharacters(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const validatedData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(validatedData);
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to create story" });
      }
    }
  });

  app.put("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStorySchema.partial().parse(req.body);
      const story = await storage.updateStory(id, validatedData);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: `Validation error: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to update story" });
      }
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  // Comics
  app.get("/api/comics", async (req, res) => {
    try {
      const comics = await storage.getComics();
      res.json(comics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comics" });
    }
  });

  app.get("/api/comics/story/:storyId", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const comics = await storage.getComicsByStory(storyId);
      res.json(comics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comics for story" });
    }
  });

  app.post("/api/comics/generate", async (req, res) => {
    try {
      const { storyId } = req.body;
      
      if (!storyId) {
        return res.status(400).json({ message: "Story ID is required" });
      }

      const story = await storage.getStoryWithCharacters(storyId);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Generate comic using OpenAI DALL-E
      const { url: imageUrl, prompt } = await generateComicImage({
        storyTitle: story.title,
        storyDescription: story.description,
        characters: story.characters,
      });

      // Save the comic
      const comic = await storage.createComic({
        storyId: story.id,
        imageUrl,
        prompt,
      });

      res.status(201).json(comic);
    } catch (error) {
      console.error("Comic generation error:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: `Failed to generate comic: ${error.message}` });
      } else {
        res.status(500).json({ message: "Failed to generate comic: Unknown error" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
