# EcoHome Project Rules

## Overview
- Stack: Next.js 15 (App Router), React 19, TypeScript 5, Prisma 6, NextAuth v5, Tailwind 3 + Shadcn UI.
- Package manager: **pnpm** only. Run `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm test`.
- Target runtime: Node.js 18+. Keep code ESM-friendly.

## Code Style & Conventions
- Follow the existing ESLint (`next/core-web-vitals`, `next/typescript`) and Prettier setup. Run `pnpm lint` before submitting changes.
- Use TypeScript everywhere. Prefer explicit types for public APIs and domain classes.
- Keep files ASCII unless a file already contains Unicode glyphs (branding text is acceptable).
- Favor named exports for components/utilities unless the file already uses default export.
- UI components should leverage existing Shadcn primitives (`components/ui/*`) and helper utilities (`cn` in `lib/utils.ts`).
- When working inside domain/application layers (`src/domain`, `src/application`), keep classes immutable where practical and respect DDD boundaries (no direct Prisma calls).

## Architecture Guardrails
- Reuse the shared Prisma client from `@/prisma`. Do **not** instantiate `PrismaClient` directly outside that module.
- Use `serviceContainer` for application use-cases; inject dependencies instead of importing concrete repos directly.
- App Router pages/components live under `app/`. Preserve existing route segment conventions (`(auth)`, `(protected)`).
- Keep infrastructure adapters in `src/infrastructure`. Each adapter should map to domain models before returning.

## Authentication & Security
- NextAuth is configured with credentials + Google. Extend providers through `auth.config.ts` and keep callbacks role-aware.
- Middleware enforces RBAC (`USER`, `ADMIN`, `NULL`). Maintain role checks when adding protected routes.
- Never hardcode secrets. Load email, OAuth, Cloudinary, and database credentials via environment variables.
- When sending emails, use the transporter configured in `app/api/auth/send-email/route.ts` and rely on env vars (`EMAIL_FROM`, `SMTP_*`, `GOOGLE_APP_PASSWORD` fallback).

## UI & Design
- Follow the design guidelines in `DesignManual.md`: EcoBlue/EcoGreen palette, Geist/Inter typography, responsive layouts.
- Reuse shared components (headers, sidebars, auth forms). Prefer composition over duplicating styles.
- For theming, use `ThemeProvider`/`ThemeToggle` from `components/theme`.
- Landing and dashboards rely on Tailwind classes already defined in `globals.css`; align new sections with existing spacing and animation patterns.

## Data & Persistence
- Update Prisma schema via migrations. After schema edits, run `pnpm prisma migrate dev` and regenerate client.
- Domain models expect enums: `Role` (`USER` | `ADMIN` | `NULL`) and `PaymentStatus` (`PAID` | `UNPAID`). Keep new logic consistent with these values.

## Environment Variables
- Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
- Optional/Fallback: `GOOGLE_APP_PASSWORD`, `SMTP_SECURE`.
- Cloudinary uploads rely on `NEXT_PUBLIC_CLOUDINARY_*` and `CLOUDINARY_API_SECRET`.
- Keep `.env.local` out of version control.

## Testing & QA
- E2E tests use Playwright (`tests/e2e`). Add new specs when modifying auth flows or protected dashboards.
- For new domain/application logic, add unit tests where possible (Mocha/Jest not set up—prefer Playwright or lightweight integration tests).
- Capture regression scenarios for auth/email/role flows.

## Workflow Expectations
- Before opening a PR: `pnpm lint`, `pnpm test`.
- Reference relevant sections in README when adding setup steps or env vars.
- Document any new commands or flags in README/scripts.


