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
- **Never use `eslint-disable` comments**. If a parameter is required by an interface but not used directly, use `void parameterName` to explicitly mark it as intentionally unused. Document why the parameter exists but isn't used in a comment above.

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
- **Shared Utilities**: Place reusable utilities in `stores/utils.ts` for store-related helpers. Use `lib/utils.ts` for general UI utilities. Use `lib/format.ts` for date/time display (`formatDate`, `formatDateTime` with locale es-PE) when showing audit or list dates.

### Example: Adding a New Feature

When adding a new feature (e.g., Payment, ElectricityBill, ServiceCharges):

1. **Domain Layer** (`src/domain/FeatureName/`):
   - Create domain model (e.g., `Payment.ts`, `ElectricityBill.ts`, `ServiceCharges.ts`) with business validations
   - Create repository interface (e.g., `IPaymentRepository.ts`, `IElectricityBillRepository.ts`)
   - Create domain error classes (e.g., `PaymentErrors.ts`) extending `DomainError`
   - Create constants file (e.g., `PaymentConstants.ts`) for validation rules

2. **Infrastructure Layer** (`src/infrastructure/FeatureName/`):
   - Create Prisma repository (e.g., `PrismaPaymentRepository.ts`) implementing the interface
   - Map Prisma models to domain models
   - Handle database-specific logic

3. **Application Layer** (`src/application/FeatureName/`):
   - Create use cases (e.g., `CreateRentalPayment.ts`, `CreateInvoicesForProperty.ts`)
   - Inject repository interfaces (not concrete implementations)
   - Handle business logic and transactions
   - Use `ITransactionManager` for operations requiring atomicity

4. **Validation Layer** (`zod/`):
   - Create Zod schemas for API input validation (e.g., `payment-schemas.ts`, `electricity-bill-schemas.ts`)
   - Use schemas in API routes for type-safe validation

5. **ServiceContainer** (`src/Shared/infrastructure/ServiceContainer.ts`):
   - Add repository and use cases to container
   - Inject dependencies into use cases
   - Export through serviceContainer for API routes

6. **API Route** (`app/api/feature-name/route.ts`):
   - Use Zod schemas for input validation
   - Use `serviceContainer` to access use cases
   - Handle domain errors and return appropriate HTTP status codes
   - Apply rate limiting and payload size validation
   - Use centralized error handler (`handleApiError`)
   - Never call Prisma directly

7. **TanStack Query** (`lib/queries/feature-name.ts`):
   - Create query hooks (e.g., `useFeatureQuery()`)
   - Fetch from API routes
   - Implement proper error handling

8. **Component**:
   - Use TanStack Query hooks
   - Display data

## Authentication & Security
- NextAuth is configured with credentials + Google. Extend providers through `auth.config.ts` and keep callbacks role-aware.
- **Session Management**: `session.user.id` must always be the **database user id** (primary key from `User` table), not the OAuth provider id. This is required so that admin property assignment, audit fields (`created_by`, `updated_by`), and relations work correctly. In the JWT callback, when the user signs in with OAuth (e.g. Google), resolve the user by email via `serviceContainer.user.userFind.execute(user.email)` and set `token.id = dbUser.id` and `token.role = dbUser.role`; with Credentials, the `user` returned from `authorize` already has the database id.
- Middleware enforces RBAC (`USER`, `ADMIN`, `NULL`). Maintain role checks when adding protected routes.
- Never hardcode secrets. Load email, OAuth, Cloudinary, and database credentials via environment variables.
- When sending emails, use the transporter configured in `app/api/auth/send-email/route.ts` and rely on env vars (`EMAIL_FROM`, `SMTP_*`, `GOOGLE_APP_PASSWORD` fallback).
- **Input Validation**: Use Zod schemas for all API route input validation. Schemas are located in `zod/` directory.
- **Error Handling**: Use domain-specific error classes extending `DomainError` for consistent error handling across the application.

## Global Error Handling System

### Overview
EcoHome implements a centralized global error handling system that automatically captures errors from backend and frontend, categorizes them into three levels (success, error, advisory), and displays toast notifications to users with standardized error codes and messages.

### Error Levels
- **success**: Successful operations (2xx status codes)
- **error**: Client (4xx) or server (5xx) errors
- **advisory**: Warnings or informational messages

### Error Codes
All errors use standardized codes from `ErrorCode` enum (`lib/errors/error-codes.ts`):
- Success: `SUCCESS`, `CREATED`, `UPDATED`, `DELETED`
- Client errors: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT_EXCEEDED`, `PAYLOAD_TOO_LARGE`, `BAD_REQUEST`
- Server errors: `INTERNAL_ERROR`, `DATABASE_ERROR`, `EXTERNAL_SERVICE_ERROR`, `SERVICE_UNAVAILABLE`
- Advisory: `WARNING`, `INFO`, `PARTIAL_SUCCESS`

### Backend Error Handling
- **API Routes**: Use `handleApiError()` from `lib/error-handler.ts` which automatically:
  - Generates unique error IDs for tracking
  - Maps errors to standardized `ErrorCode` enum
  - Determines error level based on status code
  - Returns `ErrorResponse` structure with `code`, `message`, `level`, `errorId`, and optional `details`
  - Logs full error details server-side (never exposed to client)
- **Domain Errors**: Extend `DomainError` and implement `toErrorResponse()` method to map domain codes to standard codes
- **Response Structure**: All API error responses follow `ErrorResponse` interface:
  ```typescript
  {
    code: ErrorCode,
    message: string,
    level: 'success' | 'error' | 'advisory',
    errorId?: string,
    details?: unknown
  }
  ```

### Frontend Error Handling

#### Automatic Interceptors
- **TanStack Query**: Errors are automatically intercepted via `queryCache` and `mutationCache` in `QueryProvider`
- **Fetch Wrapper**: Use `fetchWithErrorHandling()` from `lib/errors/fetch-wrapper.ts` for automatic error handling
- **Error Extraction**: Interceptors extract `ErrorResponse` from:
  - Custom error classes with `errorResponse` property (e.g., `BillsApiError`, `ConsumptionApiError`)
  - API responses with `ErrorResponse` structure
  - Standard Error objects (fallback)

#### Toast Service
- **Automatic Display**: `ToastService.show()` automatically displays toasts based on error level:
  - `success` → green toast (toast.success)
  - `error` → red toast (toast.error)
  - `advisory` → yellow/orange toast (toast.warning or toast.info)
- **Manual Display**: Use `useErrorToast()` hook for manual toast display:
  ```typescript
  const { showSuccess, showError, showAdvisory } = useErrorToast();
  ```
- **Toast Configuration**: Toasts include error code in message format: `"Message (CODE)"`
- **Duration**: Automatic duration based on level (success: 3s, error: 5s, advisory: 4s)

#### Form Error Handling
- **React Hook Form**: Use `useFormErrorHandler()` hook to automatically show toasts on validation errors
- **Server Validation**: Use `showServerFormErrors()` for server-side validation errors
- **Manual Display**: Use `showFormErrors()` to manually display form validation errors

### Usage Guidelines

#### In API Routes
```typescript
import { handleApiError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // ... business logic ...
  } catch (error) {
    return handleApiError(error, { endpoint: '/api/example', method: 'POST' });
  }
}
```

#### In TanStack Query
Errors are automatically intercepted. No manual handling needed:
```typescript
// Errors automatically show toast via interceptor
const { data, error } = useQuery({ queryKey: ['key'], queryFn: fetchData });
```

#### Manual Toast Display
```typescript
import { useErrorToast } from '@/lib/errors/useErrorToast';

const { showSuccess, showError, showAdvisory } = useErrorToast();

// Show success
showSuccess('Operation completed successfully', ErrorCode.CREATED);

// Show error
showError('Something went wrong', ErrorCode.INTERNAL_ERROR);

// Show advisory
showAdvisory('Please review the data', ErrorCode.WARNING);
```

#### In Forms
```typescript
import { useFormErrorHandler } from '@/lib/errors/form-error-handler';

const form = useForm<FormData>({ ... });
useFormErrorHandler(form); // Automatically shows toasts on validation errors
```

### Error Flow
```
Backend Error → handleApiError() → ErrorResponse (code, message, level)
                                           ↓
Frontend Fetch/TanStack Query → Interceptor → ToastService.show()
                                                      ↓
                                              Sonner Toast (success/error/warning)
```

### Key Principles
- **Always show feedback**: Every user action should result in a toast notification (success or error)
- **Use standardized codes**: Always use `ErrorCode` enum, never custom strings
- **Automatic handling**: Let interceptors handle errors automatically when possible
- **Manual when needed**: Use manual toast display for specific UI feedback
- **Error details**: Include relevant details in `ErrorResponse.details` for debugging (only in development)
- **No stack traces**: Never expose stack traces to clients, only in server logs

## UI & Design
- Follow the design guidelines in `DesignManual.md`: EcoBlue (#007BFF)/EcoGreen (#28A745) palette, Geist/Inter typography, responsive layouts.
- **Header Styling**: Use `ecoblue` and `ecogreen` Tailwind classes for brand colors. Ensure dark/light mode contrast meets WCAG AA standards.
- **Responsive Design**: Use responsive breakpoints (`sm:`, `md:`, `lg:`) consistently. Header components should adapt gracefully on mobile.
- Reuse shared components (headers, sidebars, auth forms). Prefer composition over duplicating styles.
- For theming, use `ThemeProvider`/`ThemeToggle` from `components/theme`.
- Landing and dashboards rely on Tailwind classes already defined in `globals.css`; align new sections with existing spacing and animation patterns.

## Data & Persistence
- Update Prisma schema via migrations. After schema edits, run `pnpm prisma migrate dev` and regenerate client.
- **Audit fields**: Main entities (Property, Rental, Consumption, ElectricityBill, WaterBill, Invoice, Payment) have `deletedAt`, `createdById`, `updatedById`, `deletedById` (and relations to User). Use `DateTime` for timestamps (DB/UI compatible). On create set `createdById` and `updatedById` from the current user id; on update set `updatedById`; on soft delete set `deletedAt` and `deletedById`. All repository find* methods filter by `deletedAt: null` unless explicitly including deleted. Do not hard-delete these entities; use repository `softDelete(id, userId)`.
- Domain models expect enums: `Role` (`USER` | `ADMIN` | `NULL`), `PaymentStatus` (`PAID` | `UNPAID`), and `PaymentMethod` (`YAPE` | `CASH` | `BANK_TRANSFER`). Keep new logic consistent with these values.
- **Server Data**: Use TanStack Query for all server-side data fetching. Create API routes in `app/api/` or Server Actions in `actions/`.
- **Client State**: Use Zustand stores only for client-side UI state and user preferences.
- **Data Flow with DDD**: 
  ```
  Component → TanStack Query → API Route → ServiceContainer → Application Service → Domain → Infrastructure → Database
  ```
- **API Routes Integration**: API routes must use `serviceContainer` to access application services. This maintains DDD boundaries and ensures business logic stays in the application layer.
- **No Direct Prisma in API Routes**: API routes should never call Prisma directly. Always go through the application layer via `serviceContainer`.
- **Input Validation**: All API routes must validate input using Zod schemas before processing. Validation schemas are located in `zod/` directory.
- **Error Handling**: Use domain-specific error classes (`DomainError` subclasses) for business logic errors. Catch and map to appropriate HTTP status codes in API routes.
- **Transactions**: Use Prisma transactions for operations that require atomicity (e.g., payment creation with invoice status updates). Use `Serializable` isolation level when needed to prevent race conditions.
  - **Transaction Consistency**: All database operations within a transaction must use the transaction client. For example, when checking for existing invoices within a transaction, use `findByRentalMonthYearInTransaction()` instead of `findByRentalMonthYear()` to ensure consistency and prevent race conditions.
  - **Repository Methods**: Repository interfaces should provide both regular methods and transaction-aware methods (e.g., `findByRentalMonthYear()` and `findByRentalMonthYearInTransaction()`) for operations that may be called within transactions.

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
- **Payment System**: ✅ Complete payment system implemented for rentals and services with DDD architecture, Zod validation, and domain error handling.
- **Domain Layer Expansion**: ✅ Added Rental and Invoice domain entities with repositories following DDD patterns.
- **Service Split Calculation System**: ✅ Implemented automated invoice generation system with:
  - `ElectricityBill` and `ServiceCharges` domain entities
  - Proportional energy cost calculation based on individual consumption (kWh)
  - Equitable water cost distribution
  - Service charges distribution with 18% IGV application
  - Automatic owner consumption calculation
  - `CreateInvoicesForProperty` use case for automated invoice generation
- **Invoice Delivery Specification**: 📋 Invoices can be sent via:
  - **Email**: As PDF attachment
  - **WhatsApp**: As text message (not PDF)
- **Consumption Tracking**: ✅ Enhanced `Consumption` entity with `previousReading` field for accurate period consumption calculation.
- **OCR System**: ✅ Complete OCR system with OpenAI Vision for automatic extraction:
  - **Meter Reading Extraction:**
    - OCR service (`lib/ocr-service.ts`) using GPT-4o-mini for cost-effective extraction
    - Automatic extraction with confidence scoring (0-100)
    - Retry logic: 3 attempts with exponential backoff
    - Error types: `OCRApiError`, `OCRParsingError`, `OCRValidationError` for better error handling
    - Manual editing capability when confidence is low (< 70%)
    - OCR fields tracked: `ocrExtracted`, `ocrConfidence`, `ocrRawText`, `extractedAt`
    - UI components: `MeterImageUpload` (image upload + OCR), `MeterReadingDisplay` (reading display with confidence)
    - TanStack Query mutations: `useExtractMeterReadingMutation`, `useUpdateMeterReadingMutation`
    - Rate limiting: OCR extraction (20/min), meter reading updates (100/min)
    - Use cases: `ExtractMeterReading`, `UpdateMeterReading`, `GetConsumptionById`
    - API endpoints: `POST /api/consumption/extract-reading`, `GET/PUT /api/consumption/[consumptionId]`
    - Validation: Readings must be positive, reasonable (0-10M kWh), and >= previous reading if exists
  - **Bill Data Extraction:**
    - Function `extractBillInformation` in `lib/ocr-service.ts` for complete bill data extraction
    - Extracts `ElectricityBill` (periodStart, periodEnd, totalKWh, totalCost) and `ServiceCharges` (8 fields)
    - Designed for Pluz Energía Perú format but adaptable to other formats
    - API endpoint: `POST /api/electricity-bills/extract` (ADMIN only)
    - UI components: `BillPDFUpload` (PDF/image upload + extraction), `ElectricityBillForm` (unified form with pre-fill)
    - TanStack Query mutations: `useExtractBillDataMutation`, `useCreateElectricityBillWithChargesMutation`
    - Rate limiting: Bill extraction (10/min)
    - Validation: Complete validation of dates, numbers, and data structure
    - Warnings when confidence < 70%
    - Unified form allows review and editing before submission
    - **Error Handling**: Preserves specific OCR error types (`OCRApiError`, `OCRParsingError`, `OCRValidationError`) when retries fail, improving error categorization and debugging
- **Error Handling**: ✅ Implemented `DomainError` base class and specific error types for better error management.
- **Validation**: ✅ Integrated Zod schemas for API input validation (`zod/payment-schemas.ts`, `zod/electricity-bill-schemas.ts`, `zod/service-charges-schemas.ts`, `zod/consumption-schemas.ts`, `zod/ocr-schemas.ts`).
- **Authentication**: ✅ Session always uses database user id: JWT callback resolves OAuth (Google) user by email and sets `token.id = dbUser.id` so admin property list/create and audit fields work; Credentials already return DB user.
- **Admin Properties**: ✅ List (GET /api/properties), create (POST), soft delete (DELETE /api/properties/[id]); admin sees only properties where they are in `administrators` (N:M). Date display uses `lib/format.ts` (`formatDate`, `formatDateTime`) with locale es-PE.
- **Audit & soft delete**: ✅ Property, Rental, Consumption, ElectricityBill, WaterBill, Invoice, Payment have `deletedAt`, `createdById`, `updatedById`, `deletedById`; repositories set *_by on create/update and implement `softDelete(id, userId)`; all reads filter `deletedAt: null`.
- **CI/CD**: ✅ Migrated workflows from npm to pnpm for consistency with local development.
- **Logging**: ✅ Improved error logging in client-side queries to ensure meaningful information is always displayed.
- **ServiceCharges (Pluz Perú):** Documentadas correcciones manuales y magnitudes típicas de los 8 campos; revisión manual obligatoria tras OCR. Ver sección "Pluz Perú – ServiceCharges" en OCR System Guidelines.
- **OCR Rules**: 
  - **Meter Reading OCR:**
    - When OCR confidence is below 70%, always allow and encourage manual editing
    - OCR-extracted readings must be clearly marked in the UI with confidence badge
    - Manual edits clear OCR fields (`ocrExtracted=false`, `ocrConfidence=null`, `ocrRawText=null`, `extractedAt=null`) to maintain data integrity
    - Only ADMIN role can perform OCR extraction and manual updates
    - Rate limiting applies to prevent API cost overruns (20 OCR extractions/min)
    - Always validate readings: positive, reasonable range (0-10M kWh), and >= previous reading
    - Use `UpdateMeterReading` use case for manual edits, never directly update OCR fields when manually editing
  - **Bill Data OCR:**
    - When OCR confidence is below 70%, show warning and require manual review
    - All extracted data must be reviewable and editable in the unified form before submission
    - Only ADMIN role can perform bill extraction
    - Rate limiting: 10 bill extractions/min to prevent API cost overruns
    - Validate all dates (periodStart < periodEnd), numbers (positive for most fields, can be negative for rounding)
    - Use `useCreateElectricityBillWithChargesMutation` to create both ElectricityBill and ServiceCharges in sequence
    - Always allow manual correction of extracted data before saving

### Pluz Perú – ServiceCharges (facturas de luz)

- **Revisión manual obligatoria:** El OCR suele confundir líneas de la factura (p. ej. "Cargo Fijo" con importes de otra sección). Siempre revisar y corregir los 8 campos antes de guardar.
- **Campos y magnitudes típicas (referencia de facturas corregidas):**
  - `maintenanceAndReplacement` (Reposición y mantenimiento): suele ser bajo, 0–2.25. No confundir con totales de sección.
  - `fixedCharge` (Cargo fijo): en Pluz suele ser bajo (2.25–2.3). Si el OCR devuelve valores altos (30+, 150+), es muy probable que esté leyendo otra línea.
  - `compensatoryInterest` (Interés compensatorio): típicamente 0 o decimal pequeño (0.12).
  - `publicLighting` (Alumbrado público): puede ser 0, 9 o 13.5 según factura.
  - `lawContribution` (Aporte Ley N° 28749): suele ser bajo, 0–2.78.
  - `lateFee` (Recargo por mora): suele ser 0 o bajo (0.01–0.05); si sale > 1.5 revisar.
  - `previousMonthRounding` / `currentMonthRounding`: pueden ser negativos (p. ej. -0.08, -0.14, -3.67) o pequeños positivos.
- **Ejemplos de períodos ya corregidos en DB (usar como referencia):**
  - **2025-09-05 → 2025-10-06:** mant 1.65, fijo 2.3, interés 0, alumbrado 13.5, ley 2.78, mora 0.05, redondeo actual -0.14.
  - **2025-11-07 → 2025-12-05:** mant 1.61, fijo 2.25, interés 0.12, alumbrado 9, ley 2.65, mora 0.01, red anterior 0.07, red actual -0.08.
- Al mejorar prompts o validaciones de OCR, usar estos rangos y ejemplos para detectar valores sospechosos (p. ej. cargo fijo > 10 o mora > 1 sin contexto).

## OCR System Guidelines

### OCR Implementation Rules
- **Service Layer**: OCR logic is in `lib/ocr-service.ts`, not in domain/application layers
- **ServiceCharges (facturas luz):** Tras extraer facturas Pluz Perú, revisar siempre los 8 campos contra la factura; el OCR suele intercambiar o malinterpretar líneas (p. ej. cargo fijo vs otros importes). Ver "Pluz Perú – ServiceCharges" más arriba para magnitudes típicas y ejemplos.
- **Error Handling**: Use specific error types (`OCRApiError`, `OCRParsingError`, `OCRValidationError`) for better error categorization
  - **Error Preservation**: When retries fail, preserve the original error type instead of wrapping in generic `Error`. This improves error handling and debugging
  - **Error Types**: Always throw specific OCR error types (`OCRApiError`, `OCRParsingError`, `OCRValidationError`) when possible
- **Retry Logic**: Always implement retry with exponential backoff (3 attempts default)
- **Confidence Threshold**: When OCR confidence < 70%, UI must show warning and allow manual editing
- **Manual Edits**: When manually editing a reading, always clear OCR fields (`ocrExtracted=false`, `ocrConfidence=null`, `ocrRawText=null`, `extractedAt=null`)
- **Rate Limiting**: OCR endpoints must use rate limiting (20 requests/min for extraction, 100/min for updates)
- **Authorization**: Only ADMIN role can perform OCR extraction and manual meter reading updates
- **Validation**: Readings must be validated: positive, reasonable (0-10M kWh), and >= previous reading if exists
- **UI Components**: Use `MeterImageUpload` for image upload + OCR, `MeterReadingDisplay` for showing readings with confidence
- **TanStack Query**: Use mutations (`useExtractMeterReadingMutation`, `useUpdateMeterReadingMutation`) for OCR operations, never direct API calls

### OCR Data Flow
1. User uploads image via `MeterImageUpload` component (Cloudinary)
2. Component calls `useExtractMeterReadingMutation` with `consumptionId` and `imageUrl`
3. Mutation calls `POST /api/consumption/extract-reading`
4. API route validates auth/role, applies rate limiting, calls `ExtractMeterReading` use case
5. Use case calls `lib/ocr-service.ts` to extract reading via OpenAI Vision
6. Use case updates `Consumption` entity with OCR data
7. Repository saves to database
8. TanStack Query invalidates cache and refetches data
9. UI updates to show extracted reading with confidence badge

## Migration Notes
- **Consumption Store**: ✅ Migrated to TanStack Query. The `useConsumptionStore` is deprecated and will be removed.
- **Future Stores**: When creating new stores, first determine if data comes from server (→ TanStack Query) or is client UI state (→ Zustand).
- **DDD Integration**: When adding new server-side features, follow the DDD flow: Domain → Infrastructure → Application → ServiceContainer → API Route → TanStack Query → Component.
