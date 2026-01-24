# Nostalgic (Quizlet-like clone)

Monorepo with web, mobile, and API apps for a Quizlet-style study experience.

## Apps
- Web: Next.js app router with Tailwind scaffolding (apps/web)
- Mobile: Expo + React Native with expo-router (apps/mobile)
- API: NestJS starter with in-memory study set endpoints (apps/api)
- Shared: Type definitions for study sets/terms (packages/shared)

## Getting started
1) Install pnpm if needed: `npm i -g pnpm`
2) Install deps: `pnpm install`
3) Run all dev servers in parallel: `pnpm dev`
   - Web at http://localhost:3000
   - API at http://localhost:3002/api
   - Expo will prompt for a target (web/iOS/Android)

## Notes
- API currently serves in-memory demo data; hook to Postgres/Prisma later.
- Types are shared via @nostalgic/shared.
- Turborepo manages pipelines; adjust `turbo.json` as needed.
