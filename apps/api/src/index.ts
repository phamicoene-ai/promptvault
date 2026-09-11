import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db/client';
import { prompts } from './db/schema';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();
app.use('*', cors());

// Health
app.get('/', (c) => c.json({ status: 'ok', service: 'PromptVault API', db: 'postgres' }));
app.get('/health', (c) => c.json({ status: 'healthy' }));

// GET all prompts
app.get('/api/prompts', async (c) => {
  const all = await db.select().from(prompts).orderBy(desc(prompts.createdAt));
  return c.json({ count: all.length, prompts: all });
});

// GET one prompt
app.get('/api/prompts/:id', async (c) => {
  const id = c.req.param('id');
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
  if (!prompt) return c.json({ error: 'Prompt not found' }, 404);
  return c.json(prompt);
});

// POST create prompt
app.post('/api/prompts', async (c) => {
  const body = await c.req.json();
  if (!body.title || !body.content) {
    return c.json({ error: 'title and content required' }, 400);
  }
  const [newPrompt] = await db.insert(prompts).values({
    title: body.title,
    content: body.content,
    tags: body.tags || [],
    author: body.author || 'anonymous',
  }).returning();
  return c.json(newPrompt, 201);
});

// PUT update prompt
app.put('/api/prompts/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const [updated] = await db.update(prompts)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(prompts.id, id))
    .returning();
  if (!updated) return c.json({ error: 'Prompt not found' }, 404);
  return c.json(updated);
});

// DELETE prompt
app.delete('/api/prompts/:id', async (c) => {
  const id = c.req.param('id');
  const [deleted] = await db.delete(prompts).where(eq(prompts.id, id)).returning();
  if (!deleted) return c.json({ error: 'Prompt not found' }, 404);
  return c.json({ message: 'Deleted', prompt: deleted });
});

// POST vote
app.post('/api/prompts/:id/vote', async (c) => {
  const id = c.req.param('id');
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
  if (!prompt) return c.json({ error: 'Prompt not found' }, 404);
  const [updated] = await db.update(prompts)
    .set({ votes: prompt.votes + 1 })
    .where(eq(prompts.id, id))
    .returning();
  return c.json({ id: updated.id, votes: updated.votes });
});

const port = Number(process.env.PORT) || 3001;
console.log(`API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
