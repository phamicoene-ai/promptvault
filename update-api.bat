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
echo const prompts: Prompt[] = [
echo   { id: '1', title: 'Code Review Expert', content: 'You are a senior dev...', tags: ['code'], author: 'demo', votes: 12, createdAt: new Date^(^).toISOString^(^) },
echo   { id: '2', title: 'Blog Post Writer', content: 'Write a blog post...', tags: ['writing'], author: 'demo', votes: 8, createdAt: new Date^(^).toISOString^(^) },
echo ];
echo.
echo app.get^('/', ^(c^) =^> c.json^({ status: 'ok', service: 'PromptVault API' }^)^);
echo app.get^('/health', ^(c^) =^> c.json^({ status: 'healthy' }^)^);
echo.
echo app.get^('/api/prompts', ^(c^) =^> c.json^({ count: prompts.length, prompts }^)^);
echo.
echo app.get^('/api/prompts/:id', ^(c^) =^> {
echo   const prompt = prompts.find^((p^) =^> p.id === c.req.param^('id'^)^);
echo   if ^(!prompt^) return c.json^({ error: 'Not found' }, 404^);
echo   return c.json^(prompt^);
echo }^);
echo.
echo app.post^('/api/prompts', async ^(c^) =^> {
echo   const body = await c.req.json^(^);
echo   if ^(!body.title ^|^| !body.content^) return c.json^({ error: 'title and content required' }, 400^);
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
echo app.put^('/api/prompts/:id', async ^(c^) =^> {
echo   const index = prompts.findIndex^((p^) =^> p.id === c.req.param^('id'^)^);
echo   if ^(index === -1^) return c.json^({ error: 'Not found' }, 404^);
echo   const body = await c.req.json^(^);
echo   prompts[index] = { ...prompts[index], ...body, id: prompts[index].id };
echo   return c.json^(prompts[index]^);
echo }^);
echo.
echo app.delete^('/api/prompts/:id', ^(c^) =^> {
echo   const index = prompts.findIndex^((p^) =^> p.id === c.req.param^('id'^)^);
echo   if ^(index === -1^) return c.json^({ error: 'Not found' }, 404^);
echo   const deleted = prompts.splice^(index, 1^)[0];
echo   return c.json^({ message: 'Deleted', prompt: deleted }^);
echo }^);
echo.
echo app.post^('/api/prompts/:id/vote', ^(c^) =^> {
echo   const prompt = prompts.find^((p^) =^> p.id === c.req.param^('id'^)^);
echo   if ^(!prompt^) return c.json^({ error: 'Not found' }, 404^);
echo   prompt.votes += 1;
echo   return c.json^({ id: prompt.id, votes: prompt.votes }^);
echo }^);
echo.
echo const port = 3001;
echo console.log^(`API running on http://localhost:${port}`^);
echo serve^({ fetch: app.fetch, port }^);
) > apps\api\src\index.ts

echo.
echo ✅ index.ts mis a jour !
type apps\api\src\index.ts
pause