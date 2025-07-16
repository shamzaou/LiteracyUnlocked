import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  appearance: text("appearance").notNull(),
  personality: text("personality").notNull(),
  role: text("role").notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  characterIds: json("character_ids").$type<number[]>().notNull().default([]),
});

export const comics = pgTable("comics", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
});

export const insertComicSchema = createInsertSchema(comics).omit({
  id: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertComic = z.infer<typeof insertComicSchema>;
export type Comic = typeof comics.$inferSelect;

export type StoryWithCharacters = Story & {
  characters: Character[];
};
