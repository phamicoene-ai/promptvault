import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db/client.js';
import { prompts, users, votes } from './db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from './auth.js';

const app = new Hono();

// CORS
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://promptvault-pearl.vercel.app',
      'https://promptvault.vercel.app',
      'https://promptvault-git-main-phamicoene-ai.vercel.app',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health
app.get('/', (c) =>
  c.json({ status: 'ok', service: 'PromptVault API', db: 'postgres' })
);
app.get('/health', (c) => c.json({ status: 'healthy' }));

// ================================
// AUTH ROUTES
// ================================

app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, username } = body;

    if (!email || !password || !username) {
      return c.json({ error: 'email, password, username required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'password must be at least 6 characters' }, 400);
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) {
      return c.json({ error: 'email already registered' }, 409);
    }

    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUsername) {
      return c.json({ error: 'username already taken' }, 409);
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, username })
      .returning();

    const token = generateToken(newUser.id, newUser.email);

    return c.json(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      },
      201
    );
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'email and password required' }, 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (!user) {
      return c.json({ error: 'invalid credentials' }, 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: 'invalid credentials' }, 401);
    }

    const token = generateToken(user.id, user.email);

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/api/auth/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'no token' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: 'invalid token' }, 401);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId));
  if (!user) {
    return c.json({ error: 'user not found' }, 404);
  }

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  });
});

// ================================
// PROMPTS ROUTES
// ================================

// GET all prompts
app.get('/api/prompts', async (c) => {
  const all = await db.select().from(prompts).orderBy(desc(prompts.createdAt));

  const authHeader = c.req.header('Authorization');
  let userId: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) userId = payload.userId;
  }

  if (userId) {
    const userVotes = await db
      .select()
      .from(votes)
      .where(eq(votes.userId, userId));
    const votedPromptIds = new Set(userVotes.map((v) => v.promptId));

    const promptsWithVoteStatus = all.map((p) => ({
      ...p,
      hasVoted: votedPromptIds.has(p.id),
    }));

    return c.json({
      count: promptsWithVoteStatus.length,
      prompts: promptsWithVoteStatus,
    });
  }

  return c.json({
    count: all.length,
    prompts: all.map((p) => ({ ...p, hasVoted: false })),
  });
});

// GET one prompt
app.get('/api/prompts/:id', async (c) => {
  const id = c.req.param('id');
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
  if (!prompt) return c.json({ error: 'Prompt not found' }, 404);

  const authHeader = c.req.header('Authorization');
  let hasVoted = false;
  if (authHeader?.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) {
      const [existingVote] = await db
        .select()
        .from(votes)
        .where(and(eq(votes.userId, payload.userId), eq(votes.promptId, id)));
      hasVoted = !!existingVote;
    }
  }

  return c.json({ ...prompt, hasVoted });
});

// POST create prompt
app.post('/api/prompts', async (c) => {
  try {
    const body = await c.req.json();
    if (!body.title || !body.content) {
      return c.json({ error: 'title and content required' }, 400);
    }

    let userId: string | null = null;
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.slice(7));
      if (payload) userId = payload.userId;
    }

    const [newPrompt] = await db
      .insert(prompts)
      .values({
        title: body.title,
        content: body.content,
        tags: body.tags || [],
        author: body.author || 'anonymous',
        userId,
      })
      .returning();
    return c.json(newPrompt, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Creation failed' }, 500);
  }
});

// ========================================
// PUT update prompt (seul le owner peut modifier)
// ========================================
app.put('/api/prompts/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // 1. Vérifie que l'user est connecté
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'You must be logged in to edit' }, 401);
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // 2. Vérifie que le prompt existe
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!prompt) return c.json({ error: 'Prompt not found' }, 404);

    // 3. Vérifie que c'est TON prompt
    if (prompt.userId !== payload.userId) {
      return c.json({ error: 'You can only edit your own prompts' }, 403);
    }

    // 4. Update
    const body = await c.req.json();
    const [updated] = await db
      .update(prompts)
      .set({
        title: body.title ?? prompt.title,
        content: body.content ?? prompt.content,
        tags: body.tags ?? prompt.tags,
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, id))
      .returning();

    return c.json(updated);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Update failed' }, 500);
  }
});

// ========================================
// DELETE prompt (seul le owner peut supprimer)
// ========================================
app.delete('/api/prompts/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // 1. Vérifie que l'user est connecté
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'You must be logged in to delete' }, 401);
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // 2. Vérifie que le prompt existe
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!prompt) return c.json({ error: 'Prompt not found' }, 404);

    // 3. Vérifie que c'est TON prompt
    if (prompt.userId !== payload.userId) {
      return c.json({ error: 'You can only delete your own prompts' }, 403);
    }

    // 4. Supprime
    await db.delete(prompts).where(eq(prompts.id, id));

    return c.json({ message: 'Deleted', prompt });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Delete failed' }, 500);
  }
});

// ========================================
// POST vote (1 vote par user, toggle)
// ========================================
app.post('/api/prompts/:id/vote', async (c) => {
  try {
    const id = c.req.param('id');

    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'You must be logged in to vote' }, 401);
    }
    const payload = verifyToken(authHeader.slice(7));
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!prompt) return c.json({ error: 'Prompt not found' }, 404);

    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, payload.userId), eq(votes.promptId, id)));

    if (existingVote) {
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      const [updated] = await db
        .update(prompts)
        .set({ votes: Math.max(0, prompt.votes - 1) })
        .where(eq(prompts.id, id))
        .returning();
      return c.json({
        id: updated.id,
        votes: updated.votes,
        hasVoted: false,
      });
    }

    await db.insert(votes).values({
      userId: payload.userId,
      promptId: id,
    });
    const [updated] = await db
      .update(prompts)
      .set({ votes: prompt.votes + 1 })
      .where(eq(prompts.id, id))
      .returning();
    return c.json({
      id: updated.id,
      votes: updated.votes,
      hasVoted: true,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Vote failed' }, 500);
  }
});

const port = Number(process.env.PORT) || 3001;

console.log(`API running on http://0.0.0.0:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0',
});