import { 
  characters, 
  stories, 
  comics,
  type Character, 
  type InsertCharacter,
  type Story,
  type InsertStory,
  type Comic,
  type InsertComic,
  type StoryWithCharacters
} from "@shared/schema";

export interface IStorage {
  // Characters
  getCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
  
  // Stories
  getStories(): Promise<Story[]>;
  getStory(id: number): Promise<Story | undefined>;
  getStoryWithCharacters(id: number): Promise<StoryWithCharacters | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;
  
  // Comics
  getComics(): Promise<Comic[]>;
  getComic(id: number): Promise<Comic | undefined>;
  getComicsByStory(storyId: number): Promise<Comic[]>;
  createComic(comic: InsertComic): Promise<Comic>;
}

export class MemStorage implements IStorage {
  private characters: Map<number, Character>;
  private stories: Map<number, Story>;
  private comics: Map<number, Comic>;
  private currentCharacterId: number;
  private currentStoryId: number;
  private currentComicId: number;

  constructor() {
    this.characters = new Map();
    this.stories = new Map();
    this.comics = new Map();
    this.currentCharacterId = 1;
    this.currentStoryId = 1;
    this.currentComicId = 1;
  }

  // Characters
  async getCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentCharacterId++;
    const character: Character = { ...insertCharacter, id };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updated = { ...character, ...updates };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: number): Promise<boolean> {
    return this.characters.delete(id);
  }

  // Stories
  async getStories(): Promise<Story[]> {
    return Array.from(this.stories.values());
  }

  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getStoryWithCharacters(id: number): Promise<StoryWithCharacters | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const storyCharacters = story.characterIds
      .map(charId => this.characters.get(Number(charId)))
      .filter((char): char is Character => char !== undefined);

    return {
      ...story,
      characters: storyCharacters,
    };
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const story: Story = { 
      ...insertStory, 
      id,
      characterIds: insertStory.characterIds ? [...insertStory.characterIds] : []
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;
    
    const updated = { 
      ...story, 
      ...updates,
      characterIds: updates.characterIds ? Array.isArray(updates.characterIds) ? updates.characterIds : [] : story.characterIds
    };
    this.stories.set(id, updated);
    return updated;
  }

  async deleteStory(id: number): Promise<boolean> {
    return this.stories.delete(id);
  }

  // Comics
  async getComics(): Promise<Comic[]> {
    return Array.from(this.comics.values());
  }

  async getComic(id: number): Promise<Comic | undefined> {
    return this.comics.get(id);
  }

  async getComicsByStory(storyId: number): Promise<Comic[]> {
    return Array.from(this.comics.values()).filter(comic => comic.storyId === storyId);
  }

  async createComic(insertComic: InsertComic): Promise<Comic> {
    const id = this.currentComicId++;
    const comic: Comic = { ...insertComic, id };
    this.comics.set(id, comic);
    return comic;
  }
}

export const storage = new MemStorage();
