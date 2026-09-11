@echo off
chcp 65001 >nul
cd /d C:\Users\HP\promptvault

(
echo import { serve } from '@hono/node-server';
echo import { Hono } from 'hono';
echo import { cors } from 'hono/cors';
echo.
echo const app = new Hono^(^);
echo app.use^('*', cors^(^)^);
echo.
echo // ============ TYPES ============
echo interface Prompt {
echo   id: string;
echo   title: string;
echo   content: string;
echo   tags: string[];
echo   author: string;
echo   votes: number;
echo   createdAt: string;
echo }
echo.
echo // ============ IN-MEMORY STORAGE ============
echo const prompts: Prompt[] = [
echo   {
echo     id: '1',
echo     title: 'Code Review Expert',
echo     content: 'You are a senior developer. Review this code...',
echo     tags: ['code', 'review'],
echo     author: 'demo',
echo     votes: 12,
echo     createdAt: new Date^(^).toISOString^(^),
echo   },
echo   {
echo     id: '2',
echo     title: 'Blog Post Writer',
echo     content: 'Write a blog post about...',
echo     tags: ['writing', 'blog'],
echo     author: 'demo',
echo     votes: 8,
echo     createdAt: new Date^(^).toISOString^(^),
echo   },
echo ];
echo.
echo // ============ ROUTES ============
echo.
echo // Health
echo app.get^('/', ^(c^) =^> c.json^({ status: 'ok', service: 'PromptVault API' }^)^);
echo app.get^('/health', ^(c^) =^> c.json^({ status: 'healthy' }^)^);
echo.
echo // GET all prompts
echo app.get^('/api/prompts', ^(c^) =^> {
echo   return c.json^({ count: prompts.length, prompts }^);
echo }^);
echo.
echo // GET one prompt
echo app.get^('/api/prompts/:id', ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const prompt = prompts.find^((p^) =^> p.id === id^);
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
echo   const newPrompt: Prompt = {
echo     id: String^(Date.now^(^)^),
echo     title: body.title,
echo     content: body.content,
echo     tags: body.tags ^|^| [],
echo     author: body.author ^|^| 'anonymous',
echo     votes: 0,
echo     createdAt: new Date^(^).toISOString^(^),
echo   };
echo   prompts.push^(newPrompt^);
echo   return c.json^(newPrompt, 201^);
echo }^);
echo.
echo // PUT update prompt
echo app.put^('/api/prompts/:id', async ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const index = prompts.findIndex^((p^) =^> p.id === id^);
echo   if ^(index === -1^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   const body = await c.req.json^(^);
echo   prompts[index] = { ...prompts[index], ...body, id } as Prompt;
echo   return c.json^(prompts[index]^);
echo }^);
echo.
echo // DELETE prompt
echo app.delete^('/api/prompts/:id', ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const index = prompts.findIndex^((p^) =^> p.id === id^);
echo   if ^(index === -1^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   const deleted = prompts.splice^(index, 1^)[0];
echo   return c.json^({ message: 'Deleted', prompt: deleted }^);
echo }^);
echo.
echo // POST vote
echo app.post^('/api/prompts/:id/vote', ^(c^) =^> {
echo   const id = c.req.param^('id'^);
echo   const prompt = prompts.find^((p^) =^> p.id === id^);
echo   if ^(!prompt^) return c.json^({ error: 'Prompt not found' }, 404^);
echo   prompt.votes += 1;
echo   return c.json^({ id, votes: prompt.votes }^);
echo }^);
echo.
echo const port = 3001;
echo console.log^(`API running on http://localhost:${port}`^);
echo serve^({ fetch: app.fetch, port }^);
) > apps\api\src\index.ts

echo.
echo ✅ apps\api\src\index.ts mis a jour !
pause