import { pgTable, text, integer, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  tags: text('tags').array().notNull().default([]),
  author: varchar('author', { length: 100 }).notNull().default('anonymous'),
  votes: integer('votes').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;