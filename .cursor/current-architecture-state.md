# Estado Actual de la Arquitectura: Zustand vs TanStack Query

## 📊 Resumen Ejecutivo

**Estado Actual:**
- ✅ **Zustand**: Instalado y funcionando (v5.0.8) - Para estado UI del cliente
- ✅ **TanStack Query**: Instalado y configurado (v5.90.9) - Para datos del servidor
- ✅ **DDD Architecture**: Domain-Driven Design implementado (domain/application/infrastructure)
- ✅ **Migración**: `useConsumptionStore` migrado a TanStack Query
- ✅ **Arquitectura**: Separación correcta entre Zustand (UI) y TanStack Query (servidor)
- ✅ **Integración DDD**: TanStack Query se integra con la arquitectura DDD a través de API routes y ServiceContainer
- ✅ **Payment System**: Sistema completo de pagos implementado con DDD, validación Zod, y manejo de errores de dominio
- ✅ **Domain Expansion**: Repositorios de Rental e Invoice implementados siguiendo patrones DDD
- ✅ **Error Handling**: Sistema de errores de dominio (`DomainError`) implementado
- ✅ **Validation**: Validación con Zod integrada en API routes
- ✅ **Authentication**: Mejoras en autenticación (session.user.id correctamente poblado)
- ✅ **CI/CD**: Migrado a pnpm en workflows de GitHub Actions

## 🔍 Análisis Detallado

### 1. Zustand - Estado Actual

#### ✅ Instalación y Configuración
- **Instalado**: `zustand@^5.0.8` en `package.json`
- **No requiere provider**: Zustand funciona sin configuración adicional
- **Stores implementados**:
  - `useNotificationsStore` - ✅ Correcto (notificaciones del cliente)
  - `useUIStore` - ✅ Correcto (estado de UI)
  - `useUserPreferencesStore` - ✅ Correcto (preferencias con persistencia)
  - `useConsumptionStore` - ⚠️ Deprecated (migrado a TanStack Query)

#### 📍 Uso Actual en Componentes

**`components/user/tenant-header.tsx`:**
```typescript
// ✅ CORRECTO - Notificaciones del cliente (Zustand)
const notifications = useNotificationsStore((state) => state.notifications);
const markAsRead = useNotificationsStore((state) => state.markAsRead);

// ✅ CORRECTO - Datos del servidor (TanStack Query)
const { data: quickStats = [] } = useQuickStatsQuery();
// Ya no necesita useEffect para fetch - TanStack Query lo maneja automáticamente
```

### 2. TanStack Query - Estado Actual

#### ✅ Instalado y Configurado
- **Instalado**: `@tanstack/react-query@5.90.9` en `package.json`
- **DevTools**: `@tanstack/react-query-devtools@5.90.2` instalado
- **QueryClient configurado**: `providers/query-provider.tsx`
- **Provider en layout**: `app/layout.tsx` incluye `QueryProvider`
- **Queries implementadas**: `lib/queries/consumption.ts`

#### 📍 Estructura Implementada

```
lib/
  queries/              # ✅ Implementado
    index.ts            # ✅ Exportaciones centralizadas
    keys.ts             # ✅ Query keys factories
    consumption.ts      # ✅ useConsumptionQuery, useQuickStatsQuery

providers/
  query-provider.tsx    # ✅ QueryClientProvider configurado

app/
  api/
    consumption/
      route.ts          # ✅ API route para consumo
```

### 3. Providers Actuales

**`app/layout.tsx`:**
```typescript
<ThemeProvider>
  <SidebarProvider>
    <SessionProvider>
      {children}
    </SessionProvider>
  </SidebarProvider>
</ThemeProvider>
```

**Falta:**
- ❌ `QueryClientProvider` de TanStack Query

## 🚨 Problemas Identificados

### 1. ✅ Migración Completada

**Estado:** `useConsumptionStore` ha sido migrado a TanStack Query.

**Implementación:**
```typescript
// ✅ CORRECTO - TanStack Query para datos del servidor
const { data: quickStats = [] } = useQuickStatsQuery();

// ❌ DEPRECATED - useConsumptionStore ya no se usa para fetch
// El store está marcado como @deprecated y será eliminado
```

### 2. ✅ Caché y Sincronización Implementados

**Características:**
- ✅ Caché de datos del servidor (gcTime: 5 minutos)
- ✅ Refetch automático configurado
- ✅ Deduplicación de requests automática
- ✅ Invalidación de caché disponible (`useInvalidateConsumption`)
- ✅ Optimistic updates disponibles para futuras mutaciones

### 3. ✅ Arquitectura Completa

**Implementado:**
- ✅ TanStack Query instalado
- ✅ QueryClient configurado con opciones optimizadas
- ✅ Provider en layout (`QueryProvider`)
- ✅ Queries organizadas por dominio (`lib/queries/`)
- ✅ Query keys factories para gestión de caché
- ⏳ Mutations para CRUD (pendiente de implementar según necesidad)

## ✅ Lo Que Está Bien

### Zustand Stores Correctos

1. **`useNotificationsStore`** ✅
   - Notificaciones generadas en el cliente
   - Estado de lectura/no lectura
   - Correcto uso de Zustand

2. **`useUIStore`** ✅
   - Estado de sidebar, modals
   - Loading states temporales
   - Correcto uso de Zustand

3. **`useUserPreferencesStore`** ✅
   - Preferencias con persistencia
   - Theme, language
   - Correcto uso de Zustand

## ✅ Plan de Acción Completado

### Fase 1: Instalación y Configuración ✅
1. ✅ Instalar `@tanstack/react-query` y devtools
2. ✅ Crear `providers/query-provider.tsx`
3. ✅ Agregar `QueryClientProvider` a `app/layout.tsx`

### Fase 2: Migración del Consumption Store ✅
1. ✅ Crear `lib/queries/consumption.ts`
2. ✅ Crear API route `app/api/consumption/route.ts`
3. ✅ Migrar `tenant-header.tsx` para usar `useQuickStatsQuery`
4. ⏳ Marcar `useConsumptionStore` como deprecated (pendiente eliminación completa)

### Fase 3: Estructura de Queries ✅
1. ✅ Crear estructura `lib/queries/`
2. ✅ Implementar query keys factories (`lib/queries/keys.ts`)
3. ✅ Crear exportaciones centralizadas (`lib/queries/index.ts`)
4. ⏳ Crear queries para otros dominios (bills, properties, etc.) - según necesidad

## 🎯 Arquitectura Completa Integrada

### Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────┐
│  Component (React)                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  useConsumptionQuery() [TanStack Query]              │  │
│  │  useNotificationsStore() [Zustand - UI]               │  │
│  │  useUIStore() [Zustand - UI]                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    ↓ (fetch)
┌─────────────────────────────────────────────────────────────┐
│  API Route (app/api/consumption/route.ts)                   │
│  └─ serviceContainer.consumption.getData.execute()         │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  ServiceContainer (src/Shared/infrastructure/)               │
│  └─ Centralized dependency injection                       │
│     └─ Application Services                                 │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (src/application/)                        │
│  └─ GetConsumptionData use case                             │
│     └─ Orchestrates domain logic                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Domain Layer (src/domain/)                                  │
│  └─ Consumption domain model                                │
│     └─ Business rules and interfaces                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer (src/infrastructure/)                  │
│  └─ PrismaConsumptionRepository                             │
│     └─ Maps domain models to database                       │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL via Prisma)                            │
└─────────────────────────────────────────────────────────────┘
```

### Providers en Layout

```
app/layout.tsx
└── QueryProvider (TanStack Query) ✅
    └── ThemeProvider
        └── SidebarProvider
            └── SessionProvider
                └── {children}
```

### Separación de Responsabilidades

**Zustand (Cliente - UI State):**
- `useNotificationsStore` - Notificaciones del cliente
- `useUIStore` - Estado de UI (sidebar, modals)
- `useUserPreferencesStore` - Preferencias del usuario

**TanStack Query (Servidor - Datos):**
- `useConsumptionQuery` - Datos de consumo del servidor
- `useBillsQuery` - Facturas del servidor (futuro)
- `usePropertiesQuery` - Propiedades del servidor (futuro)

**DDD Architecture (Servidor - Lógica de Negocio):**
- `src/domain/` - Modelos de dominio y reglas de negocio
  - `Payment/` - Entidad Payment con validaciones de negocio
  - `Rental/` - Entidad Rental y repositorio
  - `Invoice/` - Entidad Invoice y repositorio
  - `errors/` - Clase base DomainError para errores de dominio
- `src/application/` - Casos de uso y orquestación
  - `Payment/` - CreateRentalPayment, CreateServicePayment
  - `Rental/` - GetRentalById con validación de permisos
  - `Invoice/` - GetInvoiceById con validación de permisos
- `src/infrastructure/` - Implementaciones concretas (Prisma)
  - `Payment/` - PrismaPaymentRepository
  - `Rental/` - PrismaRentalRepository
  - `Invoice/` - PrismaInvoiceRepository
- `src/Shared/infrastructure/ServiceContainer` - Inyección de dependencias
- `zod/` - Schemas de validación para API routes

## 📊 Comparación: Antes vs Ahora

| Aspecto | Estado Anterior | Estado Actual |
|---------|----------------|---------------|
| **Zustand** | ✅ Instalado y funcionando | ✅ Instalado y funcionando |
| **TanStack Query** | ❌ No instalado | ✅ Instalado y configurado |
| **Consumption Data** | ❌ Zustand (incorrecto) | ✅ TanStack Query |
| **Notifications** | ✅ Zustand (correcto) | ✅ Zustand (correcto) |
| **UI State** | ✅ Zustand (correcto) | ✅ Zustand (correcto) |
| **Caché de Datos** | ❌ No existe | ✅ TanStack Query |
| **Provider Setup** | ⚠️ Incompleto | ✅ Completo |
| **Query Keys** | ❌ No existe | ✅ Factories implementadas |
| **API Routes** | ⚠️ Parcial | ✅ Estructura lista |

## 🔗 Integración DDD + TanStack Query + Zustand

### Cómo Encaja Todo

1. **Zustand**: Maneja estado del cliente que no viene del servidor
   - UI state (sidebar, modals)
   - Preferencias del usuario
   - Notificaciones generadas en el cliente

2. **TanStack Query**: Maneja datos del servidor con caché
   - Llama a API routes
   - Gestiona caché, refetch, y sincronización
   - No contiene lógica de negocio

3. **API Routes**: Punto de entrada del servidor
   - Usan `serviceContainer` para acceder a casos de uso
   - No llaman Prisma directamente
   - Mantienen límites DDD

4. **ServiceContainer**: Centraliza dependencias
   - Inyecta repositorios en casos de uso
   - Mantiene separación de responsabilidades

5. **Application Layer**: Orquesta lógica de negocio
   - Usa interfaces del dominio (no implementaciones)
   - Contiene casos de uso reutilizables

6. **Domain Layer**: Lógica de negocio pura
   - Modelos de dominio
   - Interfaces de repositorios
   - Reglas de negocio

7. **Infrastructure Layer**: Implementaciones concretas
   - Prisma repositories
   - Mapeo entre Prisma y modelos de dominio

### Ejemplo Real: Consumption

```
Component
  └─ useQuickStatsQuery() [TanStack Query]
      └─ fetch('/api/consumption')
          └─ API Route
              └─ serviceContainer.consumption.getData.execute()
                  └─ GetConsumptionData [Application]
                      └─ consumptionRepository.findByUserId()
                          └─ PrismaConsumptionRepository [Infrastructure]
                              └─ prisma.consumption.findMany()
                                  └─ Database
```

## 🔗 Referencias

- Ver `.cursor/project-rules.md` para reglas completas y arquitectura DDD
- Ver `.cursor/state-management-guide.md` para guía de uso de Zustand vs TanStack Query
- Ver `stores/consumption/useConsumptionStore.ts` para plan de migración

## 💳 Sistema de Pagos Implementado

### Arquitectura del Sistema de Pagos

**Domain Layer:**
- `src/domain/Payment/Payment.ts` - Entidad de dominio con validaciones de negocio
- `src/domain/Payment/IPaymentRepository.ts` - Interfaz del repositorio
- `src/domain/Payment/PaymentConstants.ts` - Constantes de validación
- `src/domain/Payment/errors/PaymentErrors.ts` - Errores específicos de dominio

**Application Layer:**
- `src/application/Payment/CreateRentalPayment.ts` - Caso de uso para pagos de alquiler
- `src/application/Payment/CreateServicePayment.ts` - Caso de uso para pagos de servicios (con transacciones)

**Infrastructure Layer:**
- `src/infrastructure/Payment/PrismaPaymentRepository.ts` - Implementación con Prisma

**API Routes:**
- `app/api/payments/route.ts` - POST para crear pagos (rental o invoice)
- `app/api/payments/rental/[rentalId]/route.ts` - GET pagos por rental
- `app/api/payments/invoice/[invoiceId]/route.ts` - GET pagos por invoice

**Validation:**
- `zod/payment-schemas.ts` - Schemas Zod para validación de entrada

### Características Clave

1. **Validación Robusta**: Validación en múltiples capas (Zod en API, validaciones de dominio en entidades)
2. **Manejo de Errores**: Errores específicos de dominio que se mapean a códigos HTTP apropiados
3. **Transacciones**: Uso de transacciones Prisma para operaciones atómicas (pagos de servicios con actualización de estado de invoice)
4. **Control de Acceso**: Validación de permisos usando casos de uso (GetRentalById, GetInvoiceById)
5. **Métodos de Pago**: Soporte para YAPE, CASH, y BANK_TRANSFER
6. **Actualización Automática**: El estado de Invoice se actualiza automáticamente a PAID cuando los pagos cubren el total

