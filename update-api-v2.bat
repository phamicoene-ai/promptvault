@echo off
chcp 65001 >nul
cd /d C:\Users\HP\promptvault

(
echo import { serve } from '@hono/node-server';
echo import { Hono } from 'hono';
echo import { cors } from 'hono/cors';
echo import { db } from './db/client';
echo import { prompts } from './db/schema';
echo import { eq, desc } from 'drizzle-orm';
echo.
echo const app = new Hono^(^);
echo app.use^('*', cors^(^)^);
echo.
echo // Health
echo app.get^('/', ^(c^) =^> c.json^({ status: 'ok', service: 'PromptVault API', db: 'postgres' }^)^);
echo app.get^('/health', ^(c^) =^> c.json^({ status: 'healthy' }^)^);
echo.
echo // GET all prompts
echo app.get^('/api/prompts', async ^(c^) =^> {
echo   const all = await db.select^(^).from^(prompts^).orderBy^(desc^(prompts.createdAt^)^);
echo   return c.json^({ count: all.length, prompts: all }^);
echo }^);
echo.
echo // GET one prompt
echo app.get^('/api/prompts/:id', async ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const ^[prompt^] = await db.select^(^).from^(prompts^).where^(eq^(prompts.id, id^)^);
echo   if ^(!prompt^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   return c.json^(prompt^);
echo }^);
echo.
echo // POST create prompt
echo app.post^('/api/prompts', async ^(c^) =^> {
echo   const body = await c.req.json^(^);
echo   if ^(!body.title ^|^| !body.content^) {
echo     return c.json^({ error: 'title and content required' }, 400^);
echo   }
echo   const ^[newPrompt^] = await db.insert^(prompts^).values^({
echo     title: body.title,
echo     content: body.content,
echo     tags: body.tags ^|^| [],
echo     author: body.author ^|^| 'anonymous',
echo   }^).returning^(^);
echo   return c.json^(newPrompt, 201^);
echo }^);
echo.
echo // PUT update prompt
echo app.put^('/api/prompts/:id', async ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const body = await c.req.json^(^);
echo   const ^[updated^] = await db.update^(prompts^)
echo     .set^({ ...body, updatedAt: new Date^(^) }^)
echo     .where^(eq^(prompts.id, id^)^)
echo     .returning^(^);
echo   if ^(!updated^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   return c.json^(updated^);
echo }^);
echo.
echo // DELETE prompt
echo app.delete^('/api/prompts/:id', async ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const ^[deleted^] = await db.delete^(prompts^).where^(eq^(prompts.id, id^)^).returning^(^);
echo   if ^(!deleted^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   return c.json^({ message: 'Deleted', prompt: deleted }^);
echo }^);
echo.
echo // POST vote
echo app.post^('/api/prompts/:id/vote', async ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const ^[prompt^] = await db.select^(^).from^(prompts^).where^(eq^(prompts.id, id^)^);
echo   if ^(!prompt^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   const ^[updated^] = await db.update^(prompts^)
echo     .set^({ votes: prompt.votes + 1 }^)
echo     .where^(eq^(prompts.id, id^)^)
echo     .returning^(^);
echo   return c.json^({ id: updated.id, votes: updated.votes }^);
echo }^);
echo.
echo const port = Number^(process.env.PORT^) ^|^| 3001;
echo console.log^(`API running on http://localhost:${port}`^);
echo serve^({ fetch: app.fetch, port }^);
) > apps\api\src\index.ts

echo.
echo ✅ apps\api\src\index.ts mis a jour avec Drizzle !
pause