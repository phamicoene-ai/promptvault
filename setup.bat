@echo off
chcp 65001 >nul
echo ========================================
echo   PromptVault - Setup automatique
echo ========================================
echo.

echo [1/9] package.json...
> package.json echo {"name":"promptvault","version":"0.1.0","private":true,"description":"The open-source GitHub for AI prompts","license":"MIT","packageManager":"pnpm@9.0.0","scripts":{"dev":"turbo run dev","build":"turbo run build","lint":"turbo run lint","test":"turbo run test"},"devDependencies":{"turbo":"^2.0.0","typescript":"^5.4.0","prettier":"^3.2.5","@types/node":"^20.11.0"}}

echo [2/9] pnpm-workspace.yaml...
> pnpm-workspace.yaml echo packages:
>> pnpm-workspace.yaml echo   - "apps/*"
>> pnpm-workspace.yaml echo   - "packages/*"

echo [3/9] turbo.json...
> turbo.json echo {"$schema":"https://turbo.build/schema.json","tasks":{"build":{"dependsOn":["^build"],"outputs":[".next/**","dist/**"]},"dev":{"cache":false,"persistent":true},"lint":{},"test":{}}}

echo [4/9] tsconfig.base.json...
> tsconfig.base.json echo {"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"skipLibCheck":true,"esModuleInterop":true}}

echo [5/9] .gitignore...
> .gitignore echo node_modules/
>> .gitignore echo dist/
>> .gitignore echo .next/
>> .gitignore echo .turbo/
>> .gitignore echo .env
>> .gitignore echo .env.local
>> .gitignore echo *.log
>> .gitignore echo .DS_Store

echo [6/9] .env.example...
> .env.example echo NODE_ENV=development
>> .env.example echo PORT=3001
>> .env.example echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/promptvault
>> .env.example echo JWT_SECRET=change-me-in-production
>> .env.example echo NEXT_PUBLIC_API_URL=http://localhost:3001

echo [7/9] .prettierrc...
> .prettierrc echo {"semi":true,"singleQuote":true,"trailingComma":"all","printWidth":100}

echo [8/9] .editorconfig...
> .editorconfig echo root = true
>> .editorconfig echo [*]
>> .editorconfig echo charset = utf-8
>> .editorconfig echo indent_style = space
>> .editorconfig echo indent_size = 2

echo [9/9] LICENSE...
> LICENSE echo MIT License
>> LICENSE echo.
>> LICENSE echo Copyright (c) 2025 PromptVault Contributors
>> LICENSE echo.
>> LICENSE echo Permission is hereby granted, free of charge.

echo.
echo ========================================
echo   TOUT EST CREE AVEC SUCCES !
echo ========================================
echo.
pause