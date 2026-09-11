@echo off
chcp 65001 >nul
cd /d C:\Users\HP\promptvault

echo [1/3] apps\api\package.json...
(
echo {
echo   "name": "@promptvault/api",
echo   "version": "0.1.0",
echo   "private": true,
echo   "type": "module",
echo   "scripts": {
echo     "dev": "tsx watch src/index.ts",
echo     "build": "tsc",
echo     "start": "node dist/index.js"
echo   },
echo   "dependencies": {
echo     "@hono/node-server": "^1.8.0",
echo     "hono": "^4.2.0"
echo   },
echo   "devDependencies": {
echo     "tsx": "^4.7.0",
echo     "typescript": "^5.4.0",
echo     "@types/node": "^20.11.0"
echo   }
echo }
) > apps\api\package.json

echo [2/3] apps\api\src\index.ts...
(
echo import { serve } from '@hono/node-server';
echo import { Hono } from 'hono';
echo import { cors } from 'hono/cors';
echo.
echo const app = new Hono^(^);
echo app.use^('*', cors^(^)^);
echo.
echo app.get^('/', ^(c^) =^> c.json^({ status: 'ok' }^)^);
echo app.get^('/health', ^(c^) =^> c.json^({ status: 'healthy' }^)^);
echo app.get^('/api/prompts', ^(c^) =^> c.json^({ prompts: [] }^)^);
echo.
echo const port = 3001;
echo serve^({ fetch: app.fetch, port }^);
) > apps\api\src\index.ts

echo [3/3] apps\api\tsconfig.json...
(
echo {
echo   "extends": "../../tsconfig.base.json",
echo   "compilerOptions": {
echo     "outDir": "dist",
echo     "rootDir": "src",
echo     "module": "ESNext",
echo     "moduleResolution": "Bundler",
echo     "target": "ES2022",
echo     "types": ["node"]
echo   },
echo   "include": ["src/**/*"]
echo }
) > apps\api\tsconfig.json

echo.
echo ✅ Fichiers API crees !
pause