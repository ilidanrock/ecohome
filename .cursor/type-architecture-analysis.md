# Análisis Completo de Tipos - EcoHome

## 📊 Resumen Ejecutivo

**Estado Actual:**
- ✅ **Tipos Centralizados**: Todos los tipos están ahora centralizados en `types/`
- ✅ **Estructura Organizada**: Tipos organizados por categorías (domain, api, ui, queries)
- ✅ **Backward Compatibility**: Archivos antiguos mantienen re-exports para compatibilidad
- ✅ **Single Source of Truth**: `types/index.ts` es el punto único de importación

## 🏗️ Estructura de Tipos

### Organización por Categorías

```
types/
├── index.ts          # Exportaciones centralizadas (punto único de importación)
├── domain.ts         # Tipos de dominio (User, Role, PaymentStatus)
├── api.ts            # Tipos de API (ResponseAPI, ErrorAuthTypes)
├── ui.ts             # Tipos de UI (Notification, QuickStat, ConsumptionData, etc.)
├── queries.ts        # Tipos de queries (ConsumptionResponse)
│
├── user.ts           # @deprecated - Re-exporta desde domain.ts
└── https.ts          # @deprecated - Re-exporta desde api.ts
```

### Categorías de Tipos

#### 1. Domain Types (`types/domain.ts`)
**Propósito**: Tipos fundamentales del dominio de negocio

```typescript
- Role: 'USER' | 'ADMIN' | 'NULL'
- PaymentStatus: 'PAID' | 'UNPAID'
- User: Interface para usuarios
- role: Alias legacy (deprecated, usar Role)
```

**Usado en:**
- `src/domain/User/User.ts`
- `actions/auth-action.ts`
- `app/(auth)/select-role/page.tsx`
- Prisma schema (enums)

#### 2. API Types (`types/api.ts`)
**Propósito**: Tipos para respuestas y errores de API

```typescript
- ResponseAPI: Formato estándar de respuesta
- ErrorAuthTypes: Mensajes de error específicos de autenticación
```

**Usado en:**
- `actions/auth-action.ts`
- `src/infrastructure/VerifyToken/GmailRepository.ts`
- `src/domain/VerifyToken/EmailRepository.ts`
- `lib/decorators.ts`
- `components/form-register.tsx`

#### 3. UI Types (`types/ui.ts`)
**Propósito**: Tipos relacionados con la interfaz de usuario

```typescript
- NotificationType: 'info' | 'warning' | 'success' | 'error'
- Notification: Notificaciones del cliente
- QuickStat: Estadísticas rápidas del dashboard
- ConsumptionData: Datos de consumo
- UserPreferences: Preferencias del usuario
- UIState: Estado de UI (sidebar, modals, loading)
```

**Usado en:**
- `stores/notifications/useNotificationsStore.ts`
- `stores/ui/useUIStore.ts`
- `stores/user/useUserPreferencesStore.ts`
- `components/shared/header.tsx`
- `components/user/tenant-header.tsx`

#### 4. Query Types (`types/queries.ts`)
**Propósito**: Tipos para respuestas de TanStack Query

```typescript
- ConsumptionResponse: Respuesta de /api/consumption
```

**Usado en:**
- `lib/queries/consumption.ts`
- `app/api/consumption/route.ts`

## 📍 Ubicaciones de Tipos

### Tipos Centralizados ✅
- `types/index.ts` - Punto único de importación
- `types/domain.ts` - Tipos de dominio
- `types/api.ts` - Tipos de API
- `types/ui.ts` - Tipos de UI
- `types/queries.ts` - Tipos de queries

### Tipos Legacy (Re-exports) ⚠️
- `types/user.ts` - Re-exporta desde `domain.ts` (deprecated)
- `types/https.ts` - Re-exporta desde `api.ts` (deprecated)
- `stores/types.ts` - Re-exporta desde `types/ui.ts` (deprecated)

### Tipos de Dominio (DDD) 📦
- `src/domain/*/` - Interfaces de repositorios (mantener en domain)
- `src/domain/User/User.ts` - Clase de dominio (mantener en domain)

### Tipos de Componentes UI 🎨
- `components/ui/*` - Tipos específicos de componentes Shadcn (mantener en componentes)

## 🔄 Migración Completada

### Archivos Actualizados

1. **Tipos Centralizados Creados:**
   - ✅ `types/index.ts`
   - ✅ `types/domain.ts`
   - ✅ `types/api.ts`
   - ✅ `types/ui.ts`
   - ✅ `types/queries.ts`

2. **Archivos Migrados:**
   - ✅ `stores/types.ts` → Re-exporta desde `@/types`
   - ✅ `lib/queries/consumption.ts` → Usa `ConsumptionResponse` de `@/types`
   - ✅ `app/api/consumption/route.ts` → Usa tipos de `@/types`
   - ✅ `src/domain/User/User.ts` → Usa `Role` de `@/types`
   - ✅ `actions/auth-action.ts` → Usa `ResponseAPI, Role` de `@/types`
   - ✅ `app/(auth)/select-role/page.tsx` → Usa `Role` de `@/types`
   - ✅ `src/infrastructure/VerifyToken/GmailRepository.ts` → Usa `ResponseAPI` de `@/types`
   - ✅ `src/domain/VerifyToken/EmailRepository.ts` → Usa `ResponseAPI` de `@/types`
   - ✅ `lib/decorators.ts` → Usa `ErrorAuthTypes` de `@/types`
   - ✅ `components/form-register.tsx` → Usa `ErrorAuthTypes` de `@/types`

3. **Archivos Legacy (Backward Compatibility):**
   - ✅ `types/user.ts` → Re-exporta desde `domain.ts`
   - ✅ `types/https.ts` → Re-exporta desde `api.ts`

## 📋 Guía de Uso

### Importar Tipos

**✅ CORRECTO - Usar el punto centralizado:**
```typescript
import type { User, Role, ResponseAPI, Notification, QuickStat } from '@/types';
```

**❌ INCORRECTO - No usar rutas específicas:**
```typescript
import type { User } from '@/types/user';        // Deprecated
import type { ResponseAPI } from '@/types/https'; // Deprecated
import type { Notification } from '@/stores/types'; // Deprecated
```

### Agregar Nuevos Tipos

1. **Tipos de Dominio** → `types/domain.ts`
2. **Tipos de API** → `types/api.ts`
3. **Tipos de UI** → `types/ui.ts`
4. **Tipos de Queries** → `types/queries.ts`
5. **Exportar** desde `types/index.ts`

### Ejemplo: Agregar un Nuevo Tipo

```typescript
// 1. Agregar a types/ui.ts
export interface NewFeature {
  id: string;
  name: string;
}

// 2. Exportar desde types/index.ts
export type { NewFeature } from './ui';

// 3. Usar en componentes
import type { NewFeature } from '@/types';
```

## 🎯 Beneficios de la Centralización

1. **Single Source of Truth**: Un solo lugar para todos los tipos
2. **Consistencia**: Evita duplicación y inconsistencias
3. **Mantenibilidad**: Fácil de encontrar y actualizar tipos
4. **Organización**: Tipos agrupados por categoría lógica
5. **Backward Compatibility**: Archivos legacy mantienen compatibilidad
6. **Type Safety**: TypeScript puede inferir mejor los tipos

## 📊 Estadísticas

- **Total de archivos de tipos**: 7
- **Tipos centralizados**: 5 archivos nuevos
- **Archivos migrados**: 10 archivos
- **Archivos legacy**: 2 archivos (mantienen compatibilidad)
- **Tipos únicos**: ~15 interfaces/types

## 🔗 Integración con Arquitectura

### DDD Architecture
- Tipos de dominio en `types/domain.ts` complementan las clases de dominio en `src/domain/`
- Interfaces de repositorios permanecen en `src/domain/*/` (son parte del dominio)

### TanStack Query
- Tipos de queries en `types/queries.ts` para respuestas de API
- Tipos de UI en `types/ui.ts` para datos consumidos por queries

### Zustand Stores
- Tipos de UI en `types/ui.ts` para stores de Zustand
- `stores/types.ts` re-exporta para compatibilidad

## ✅ Checklist de Migración

- [x] Crear estructura centralizada de tipos
- [x] Migrar tipos de `stores/types.ts` a `types/ui.ts`
- [x] Migrar tipos de `types/user.ts` a `types/domain.ts`
- [x] Migrar tipos de `types/https.ts` a `types/api.ts`
- [x] Crear `types/queries.ts` para tipos de queries
- [x] Actualizar todas las importaciones
- [x] Mantener backward compatibility
- [x] Verificar que no hay errores de linting
- [x] Documentar estructura y uso

## 🚀 Próximos Pasos

1. **Eliminar archivos legacy** (después de verificar que todo funciona):
   - `types/user.ts`
   - `types/https.ts`
   - `stores/types.ts` (o mantener solo como re-export)

2. **Agregar más tipos según necesidad**:
   - Tipos para Bills
   - Tipos para Properties
   - Tipos para Rentals
   - Tipos para otras entidades del dominio

3. **Documentar en project-rules.md**:
   - Agregar sección sobre organización de tipos
   - Actualizar guía de uso

