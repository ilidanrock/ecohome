# EcoHome Project Rules

## Overview
- Stack: Next.js 15 (App Router), React 19, TypeScript 5, Prisma 6, NextAuth v5, Tailwind 3 + Shadcn UI, Zustand 5, TanStack Query.
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
- **Component Composition**: Prefer composition over prop drilling. Use Zustand stores for shared client UI state and TanStack Query for server data.
- **Data Fetching**: Use TanStack Query hooks (`useQuery`, `useMutation`) in components for server data. Avoid fetching data directly in Zustand stores.
- **Type Safety**: Export and reuse types from centralized location (`@/types`). All types are organized by category in `types/` directory. Component-specific types can remain in component files.
- **Header Pattern**: The global header (`components/shared/header.tsx`) is modular and accepts props for customization. Use `AdminHeader` and `TenantHeader` wrappers for role-specific configurations.

## State Management Strategy: Zustand vs TanStack Query

### Decision Rule: When to Use What?

**Use Zustand for:**
- ✅ **Client-side UI state**: Sidebar open/closed, modals, dropdowns, temporary loading states
- ✅ **User preferences**: Theme, language, notification settings (with persistence)
- ✅ **Client-generated notifications**: Toast notifications, temporary alerts
- ✅ **Form state**: Local form drafts, temporary form data
- ✅ **Navigation state**: Temporary navigation state, filters in memory
- ✅ **Session-only state**: Data that doesn't need to persist or sync with server

**Use TanStack Query for:**
- ✅ **Server data fetching**: All data that comes from API routes or Server Actions
- ✅ **CRUD operations**: Create, read, update, delete operations on server entities
- ✅ **Data that needs caching**: Consumption data, bills, properties, rentals, users
- ✅ **Data synchronization**: Data shared between users or that changes frequently
- ✅ **Background refetching**: Data that needs automatic updates (e.g., real-time consumption)
- ✅ **Optimistic updates**: UI updates before server confirmation
- ✅ **Pagination & infinite scroll**: Large datasets that need pagination

### Golden Rule
> **If data comes from the server → TanStack Query**  
> **If it's client UI state → Zustand**

### Zustand Implementation
- **Store Organization**: Organize stores by domain in `stores/` directory (e.g., `stores/notifications/`, `stores/ui/`, `stores/user/`).
- **Centralized Exports**: Import stores and types from `stores/index.ts` for consistency.
- **Store Pattern**: Keep stores focused and small. Each store should handle a single domain concern.
- **Persistence**: Use `zustand/middleware/persist` only for user preferences that should survive page reloads. Avoid persisting temporary UI state.
- **Store Structure**: Separate state and actions in store interfaces. Use TypeScript for full type safety.
- **Available Stores**:
  - `useNotificationsStore`: Client-side notification management (toasts, alerts)
  - `useUIStore`: UI state (modals, sidebars, temporary loading)
  - `useUserPreferencesStore`: User preferences with persistence (theme, language)

### TanStack Query Implementation
- **Query Organization**: Organize queries by domain in `lib/queries/` directory (e.g., `lib/queries/consumption.ts`, `lib/queries/bills.ts`).
- **Query Hooks**: Create custom hooks for each data domain (e.g., `useConsumptionQuery`, `useBillsQuery`).
- **Mutation Hooks**: Create mutation hooks for data modifications (e.g., `useCreateBillMutation`, `useUpdatePropertyMutation`).
- **Query Keys**: Use consistent query key factories for cache management (e.g., `consumptionKeys.all`, `consumptionKeys.detail(id)`).
- **Server Integration**: Use API routes (`app/api/`) or Server Actions (`actions/`) for data fetching. API routes must use `serviceContainer` to maintain DDD architecture.
- **DDD Integration**: TanStack Query hooks call API routes, which use `serviceContainer` to access application services. This maintains clean separation: TanStack Query handles client-side caching, while DDD handles server-side business logic.
- **Cache Strategy**: Configure appropriate `staleTime` and `gcTime` based on data freshness requirements.
- **Error Handling**: Implement consistent error handling and retry logic across all queries.

## Architecture Guardrails

### Domain-Driven Design (DDD) Structure
The project follows a DDD-inspired architecture with clear separation of concerns:

```
src/
  domain/          # Domain models and interfaces (business logic)
  application/     # Use cases / application services
  infrastructure/  # Concrete implementations (Prisma, external services)
  Shared/          # Shared infrastructure (ServiceContainer)
```

### Data Flow Architecture

**Complete Flow: Component → TanStack Query → API Route → ServiceContainer → Application → Domain → Infrastructure**

```
┌─────────────────────────────────────────────────────────────┐
│  Component (React)                                           │
│  └─ useConsumptionQuery() [TanStack Query]                  │
│     └─ fetch('/api/consumption')                             │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  API Route (app/api/consumption/route.ts)                   │
│  └─ serviceContainer.consumption.getData.execute()          │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  ServiceContainer (src/Shared/infrastructure/)              │
│  └─ Centralized dependency injection                         │
│     └─ Application Services                                  │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (src/application/)                        │
│  └─ Use cases (e.g., GetConsumptionData)                    │
│     └─ Orchestrates domain logic                            │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Domain Layer (src/domain/)                                  │
│  └─ Domain models (User, Consumption, etc.)                 │
│     └─ Business rules and interfaces                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer (src/infrastructure/)                 │
│  └─ PrismaUserRepository, PrismaConsumptionRepository       │
│     └─ Maps domain models to database                       │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL via Prisma)                           │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles
- **Reuse the shared Prisma client** from `@/prisma`. Do **not** instantiate `PrismaClient` directly outside that module.
- **Use `serviceContainer`** for application use-cases; inject dependencies instead of importing concrete repos directly.
- **API Routes** (`app/api/`) should use `serviceContainer` to access application services. Never call Prisma directly from API routes.
- **Application Services** (`src/application/`) orchestrate domain logic and use domain interfaces, not concrete implementations.
- **Infrastructure** (`src/infrastructure/`) implements domain interfaces and maps between domain models and external systems (Prisma, APIs, etc.).
- **Domain Layer** (`src/domain/`) contains pure business logic, entities, and interfaces. No dependencies on infrastructure.
- **App Router** pages/components live under `app/`. Preserve existing route segment conventions (`(auth)`, `(protected)`).
- **Shared Utilities**: Place reusable utilities in `stores/utils.ts` for store-related helpers. Use `lib/utils.ts` for general UI utilities.

### Example: Adding a New Feature

When adding a new feature (e.g., Consumption):

1. **Domain Layer** (`src/domain/Consumption/`):
   - Create `Consumption.ts` domain model
   - Create `IConsumptionRepository.ts` interface

2. **Infrastructure Layer** (`src/infrastructure/Consumption/`):
   - Create `PrismaConsumptionRepository.ts` implementing `IConsumptionRepository`
   - Map Prisma models to domain models

3. **Application Layer** (`src/application/Consumption/`):
   - Create `GetConsumptionData.ts` use case
   - Inject `IConsumptionRepository` (not concrete implementation)

4. **ServiceContainer** (`src/Shared/infrastructure/ServiceContainer.ts`):
   - Add consumption repository and use case to container

5. **API Route** (`app/api/consumption/route.ts`):
   - Use `serviceContainer.consumption.getData.execute()`
   - Return JSON response

6. **TanStack Query** (`lib/queries/consumption.ts`):
   - Create `useConsumptionQuery()` hook
   - Fetch from `/api/consumption`

7. **Component**:
   - Use `useConsumptionQuery()` hook
   - Display data

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
- **Server Data**: Use TanStack Query for all server-side data fetching. Create API routes in `app/api/` or Server Actions in `actions/`.
- **Client State**: Use Zustand stores only for client-side UI state and user preferences.
- **Data Flow with DDD**: 
  ```
  Component → TanStack Query → API Route → ServiceContainer → Application Service → Domain → Infrastructure → Database
  ```
- **API Routes Integration**: API routes must use `serviceContainer` to access application services. This maintains DDD boundaries and ensures business logic stays in the application layer.
- **No Direct Prisma in API Routes**: API routes should never call Prisma directly. Always go through the application layer via `serviceContainer`.

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

## Type Organization
- **Centralized Types**: All types are centralized in `types/` directory and exported from `types/index.ts`.
- **Organization by Category**:
  - `types/domain.ts` - Domain types (User, Role, PaymentStatus)
  - `types/api.ts` - API response types (ResponseAPI, ErrorAuthTypes)
  - `types/ui.ts` - UI types (Notification, QuickStat, ConsumptionData, UserPreferences, UIState)
  - `types/queries.ts` - TanStack Query response types (ConsumptionResponse)
- **Import Pattern**: Always import types from `@/types`: `import type { User, Role, Notification } from '@/types'`
- **Legacy Files**: `types/user.ts` and `types/https.ts` are deprecated but maintained for backward compatibility.
- **Domain Interfaces**: Repository interfaces remain in `src/domain/*/` as they are part of the domain layer.

## Recent Improvements (2024)
- **Header Refactoring**: Extracted modular components (`HeaderSearch`, `HeaderNotifications`, `HeaderUserMenu`) for better reusability.
- **Global State**: Implemented Zustand stores for scalable client-side state management. Stores are organized by domain and fully typed.
- **State Management Strategy**: Established clear separation between Zustand (client UI state) and TanStack Query (server data).
- **Type Centralization**: ✅ All types centralized in `types/` directory with single import point (`@/types`).
- **Component Reusability**: Created shared header components that work for both admin and tenant roles with proper customization.

## Migration Notes
- **Consumption Store**: ✅ Migrated to TanStack Query. The `useConsumptionStore` is deprecated and will be removed.
- **Future Stores**: When creating new stores, first determine if data comes from server (→ TanStack Query) or is client UI state (→ Zustand).
- **DDD Integration**: When adding new server-side features, follow the DDD flow: Domain → Infrastructure → Application → ServiceContainer → API Route → TanStack Query → Component.
