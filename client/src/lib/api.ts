import { apiRequest } from "./queryClient";
import type { Character, Story, Comic, InsertCharacter, InsertStory, StoryWithCharacters } from "@shared/schema";

// Characters API
export const charactersApi = {
  getAll: async (): Promise<Character[]> => {
    const response = await apiRequest("GET", "/api/characters");
    return response.json();
  },

  getById: async (id: number): Promise<Character> => {
    const response = await apiRequest("GET", `/api/characters/${id}`);
    return response.json();
  },

  create: async (character: InsertCharacter): Promise<Character> => {
    const response = await apiRequest("POST", "/api/characters", character);
    return response.json();
  },

  update: async (id: number, character: Partial<InsertCharacter>): Promise<Character> => {
    const response = await apiRequest("PUT", `/api/characters/${id}`, character);
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/characters/${id}`);
  },
};

// Stories API
export const storiesApi = {
  getAll: async (): Promise<Story[]> => {
    const response = await apiRequest("GET", "/api/stories");
    return response.json();
  },

  getById: async (id: number): Promise<StoryWithCharacters> => {
    const response = await apiRequest("GET", `/api/stories/${id}`);
    return response.json();
  },

  create: async (story: InsertStory): Promise<Story> => {
    const response = await apiRequest("POST", "/api/stories", story);
    return response.json();
  },

  update: async (id: number, story: Partial<InsertStory>): Promise<Story> => {
    const response = await apiRequest("PUT", `/api/stories/${id}`, story);
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/stories/${id}`);
  },
};

// Comics API
export const comicsApi = {
  getAll: async (): Promise<Comic[]> => {
    const response = await apiRequest("GET", "/api/comics");
    return response.json();
  },

  getByStory: async (storyId: number): Promise<Comic[]> => {
    const response = await apiRequest("GET", `/api/comics/story/${storyId}`);
    return response.json();
  },

  generate: async (storyId: number): Promise<Comic> => {
    const response = await apiRequest("POST", "/api/comics/generate", { storyId });
    return response.json();
  },
};

// Local Storage utilities for backup
export const localStorageApi = {
  saveCharacters: (characters: Character[]) => {
    localStorage.setItem("comic-characters", JSON.stringify(characters));
  },

  loadCharacters: (): Character[] => {
    const saved = localStorage.getItem("comic-characters");
    return saved ? JSON.parse(saved) : [];
  },

  saveStories: (stories: Story[]) => {
    localStorage.setItem("comic-stories", JSON.stringify(stories));
  },

  loadStories: (): Story[] => {
    const saved = localStorage.getItem("comic-stories");
    return saved ? JSON.parse(saved) : [];
  },
};
