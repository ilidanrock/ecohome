# EcoHome Project Rules

## Overview
- Stack: Next.js 15 (App Router), React 19, TypeScript 5, Prisma 6, NextAuth v5, Tailwind 3 + Shadcn UI, Zustand 5.
- Package manager: **pnpm** only. Run `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm test`.
- Target runtime: Node.js 18+. Keep code ESM-friendly.

## Code Style & Conventions
- Follow the existing ESLint (`next/core-web-vitals`, `next/typescript`) and Prettier setup. Run `pnpm lint` before submitting changes.
- Use TypeScript everywhere. Prefer explicit types for public APIs and domain classes.
- Keep files ASCII unless a file already contains Unicode glyphs (branding text is acceptable).
- Favor named exports for components/utilities unless the file already uses default export.
- UI components should leverage existing Shadcn primitives (`components/ui/*`) and helper utilities (`cn` in `lib/utils.ts`).
- When working inside domain/application layers (`src/domain`, `src/application`), keep classes immutable where practical and respect DDD boundaries (no direct Prisma calls).

## Component Architecture
- **Modular Components**: Extract reusable sub-components from large components (e.g., `HeaderSearch`, `HeaderNotifications`, `HeaderUserMenu` from `Header`).
- **Shared Components**: Place reusable components in `components/shared/` for cross-role usage (admin/tenant).
- **Component Composition**: Prefer composition over prop drilling. Use Zustand stores for shared state instead of passing props through multiple layers.
- **Type Safety**: Export and reuse types from centralized locations (`stores/types.ts` for global types, component-specific types in component files).
- **Header Pattern**: The global header (`components/shared/header.tsx`) is modular and accepts props for customization. Use `AdminHeader` and `TenantHeader` wrappers for role-specific configurations.

## State Management (Zustand)
- **Store Organization**: Organize stores by domain in `stores/` directory (e.g., `stores/notifications/`, `stores/ui/`, `stores/user/`, `stores/consumption/`).
- **Centralized Exports**: Import stores and types from `stores/index.ts` for consistency.
- **Store Pattern**: Keep stores focused and small. Each store should handle a single domain concern.
- **Persistence**: Use `zustand/middleware/persist` only for user preferences that should survive page reloads. Avoid persisting temporary UI state.
- **Store Structure**: Separate state and actions in store interfaces. Use TypeScript for full type safety.
- **Initialization**: Initialize store data in components using `useEffect` when needed, but prefer server-side data fetching when possible.
- **Available Stores**:
  - `useNotificationsStore`: Global notification management
  - `useUIStore`: UI state (modals, sidebars, loading)
  - `useUserPreferencesStore`: User preferences with persistence
  - `useConsumptionStore`: Consumption data and quick stats

## Architecture Guardrails
- Reuse the shared Prisma client from `@/prisma`. Do **not** instantiate `PrismaClient` directly outside that module.
- Use `serviceContainer` for application use-cases; inject dependencies instead of importing concrete repos directly.
- App Router pages/components live under `app/`. Preserve existing route segment conventions (`(auth)`, `(protected)`).
- Keep infrastructure adapters in `src/infrastructure`. Each adapter should map to domain models before returning.
- **Shared Utilities**: Place reusable utilities in `stores/utils.ts` for store-related helpers. Use `lib/utils.ts` for general UI utilities.

## Authentication & Security
- NextAuth is configured with credentials + Google. Extend providers through `auth.config.ts` and keep callbacks role-aware.
- Middleware enforces RBAC (`USER`, `ADMIN`, `NULL`). Maintain role checks when adding protected routes.
- Never hardcode secrets. Load email, OAuth, Cloudinary, and database credentials via environment variables.
- When sending emails, use the transporter configured in `app/api/auth/send-email/route.ts` and rely on env vars (`EMAIL_FROM`, `SMTP_*`, `GOOGLE_APP_PASSWORD` fallback).

## UI & Design
- Follow the design guidelines in `DesignManual.md`: EcoBlue (#007BFF)/EcoGreen (#28A745) palette, Geist/Inter typography, responsive layouts.
- **Header Styling**: Use `ecoblue` and `ecogreen` Tailwind classes for brand colors. Ensure dark/light mode contrast meets WCAG AA standards.
- **Responsive Design**: Use responsive breakpoints (`sm:`, `md:`, `lg:`) consistently. Header components should adapt gracefully on mobile.
- Reuse shared components (headers, sidebars, auth forms). Prefer composition over duplicating styles.
- For theming, use `ThemeProvider`/`ThemeToggle` from `components/theme`.
- Landing and dashboards rely on Tailwind classes already defined in `globals.css`; align new sections with existing spacing and animation patterns.

## Data & Persistence
- Update Prisma schema via migrations. After schema edits, run `pnpm prisma migrate dev` and regenerate client.
- Domain models expect enums: `Role` (`USER` | `ADMIN` | `NULL`) and `PaymentStatus` (`PAID` | `UNPAID`). Keep new logic consistent with these values.
- **Store Data**: Use Zustand stores for client-side state. For server-side data, prefer Server Components and API routes.

## Environment Variables
- Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.
- Optional/Fallback: `GOOGLE_APP_PASSWORD`, `SMTP_SECURE`.
- Cloudinary uploads rely on `NEXT_PUBLIC_CLOUDINARY_*` and `CLOUDINARY_API_SECRET`.
- Keep `.env.local` out of version control.

## Testing & QA
- E2E tests use Playwright (`tests/e2e`). Add new specs when modifying auth flows or protected dashboards.
- For new domain/application logic, add unit tests where possible (Mocha/Jest not set up—prefer Playwright or lightweight integration tests).
- Capture regression scenarios for auth/email/role flows.
- **Store Testing**: When adding new stores, test state transitions and persistence (if applicable).

## Workflow Expectations
- Before opening a PR: `pnpm lint`, `pnpm test`.
- Reference relevant sections in README when adding setup steps or env vars.
- Document any new commands or flags in README/scripts.
- **Component Updates**: When modifying shared components (header, sidebar), ensure both admin and tenant views remain functional.
- **Store Updates**: When adding new stores, export them from `stores/index.ts` and document their purpose.

## Recent Improvements (2024)
- **Header Refactoring**: Extracted modular components (`HeaderSearch`, `HeaderNotifications`, `HeaderUserMenu`) for better reusability.
- **Global State**: Implemented Zustand stores for scalable state management. Stores are organized by domain and fully typed.
- **Type Centralization**: Moved shared types to `stores/types.ts` to avoid duplication and ensure consistency.
- **Component Reusability**: Created shared header components that work for both admin and tenant roles with proper customization.
