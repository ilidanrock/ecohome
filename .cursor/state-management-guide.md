# Guía Rápida: Zustand vs TanStack Query

## 🎯 Regla de Oro

```
¿Los datos vienen del servidor? → TanStack Query
¿Es estado de UI del cliente? → Zustand
```

## 📋 Tabla de Decisión Rápida

| Tipo de Datos | Herramienta | Ejemplo |
|--------------|-------------|---------|
| Sidebar abierto/cerrado | Zustand | `useUIStore` |
| Tema (light/dark) | Zustand | `useUserPreferencesStore` |
| Notificaciones toast | Zustand | `useNotificationsStore` |
| Consumo de energía/agua | TanStack Query | `useConsumptionQuery` |
| Facturas | TanStack Query | `useBillsQuery` |
| Propiedades | TanStack Query | `usePropertiesQuery` |
| Usuarios (admin) | TanStack Query | `useUsersQuery` |
| Filtros temporales en UI | Zustand | `useFiltersStore` |
| Estado de formulario local | Zustand | `useFormStore` |

## ✅ Zustand - Casos de Uso

### 1. Estado de UI
```typescript
// ✅ CORRECTO - Estado de UI
const useUIStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

### 2. Preferencias del Usuario
```typescript
// ✅ CORRECTO - Preferencias con persistencia
const useUserPreferencesStore = create(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'user-preferences' }
  )
);
```

### 3. Notificaciones del Cliente
```typescript
// ✅ CORRECTO - Notificaciones generadas en el cliente
const useNotificationsStore = create((set) => ({
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification],
  })),
}));
```

## ✅ TanStack Query - Casos de Uso

### 1. Datos del Servidor
```typescript
// ✅ CORRECTO - Datos del servidor
export function useConsumptionQuery() {
  return useQuery({
    queryKey: ['consumption'],
    queryFn: async () => {
      const response = await fetch('/api/consumption');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### 2. Mutaciones (CRUD)
```typescript
// ✅ CORRECTO - Crear/Actualizar/Eliminar
export function useCreateBillMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (billData) => {
      const response = await fetch('/api/bills', {
        method: 'POST',
        body: JSON.stringify(billData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}
```

### 3. Datos con Caché
```typescript
// ✅ CORRECTO - Datos que necesitan caché
export function useBillsQuery(filters?: BillFilters) {
  return useQuery({
    queryKey: ['bills', filters],
    queryFn: async () => {
      const response = await fetch(`/api/bills?${new URLSearchParams(filters)}`);
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
```

## ❌ Errores Comunes

### ❌ NO hacer esto:
```typescript
// ❌ INCORRECTO - Fetching en Zustand store
const useConsumptionStore = create((set) => ({
  data: null,
  fetchData: async () => {
    const response = await fetch('/api/consumption');
    const data = await response.json();
    set({ data }); // ❌ Esto debería ser TanStack Query
  },
}));
```

### ✅ Hacer esto:
```typescript
// ✅ CORRECTO - Usar TanStack Query
export function useConsumptionQuery() {
  return useQuery({
    queryKey: ['consumption'],
    queryFn: async () => {
      const response = await fetch('/api/consumption');
      return response.json();
    },
  });
}

// En el componente
function ConsumptionComponent() {
  const { data, isLoading } = useConsumptionQuery();
  // ...
}
```

## 🔄 Patrón de Integración

### Combinar Zustand + TanStack Query
```typescript
// Zustand para UI state
const useUIStore = create((set) => ({
  selectedBillId: null,
  setSelectedBillId: (id) => set({ selectedBillId: id }),
}));

// TanStack Query para datos
function useBillDetailQuery(billId: string | null) {
  return useQuery({
    queryKey: ['bills', billId],
    queryFn: () => fetch(`/api/bills/${billId}`).then(r => r.json()),
    enabled: !!billId, // Solo fetch si hay billId
  });
}

// En el componente
function BillComponent() {
  const selectedBillId = useUIStore((state) => state.selectedBillId);
  const { data: bill } = useBillDetailQuery(selectedBillId);
  // ...
}
```

## 📁 Estructura de Archivos

```
lib/
  queries/
    consumption.ts      # useConsumptionQuery, useConsumptionMutation
    bills.ts            # useBillsQuery, useBillMutation
    properties.ts       # usePropertiesQuery
    users.ts            # useUsersQuery (admin)
    notifications.ts    # useNotificationsQuery (del servidor)

stores/
  ui/
    useUIStore.ts       # Estado de UI (sidebar, modals)
  user/
    useUserPreferencesStore.ts  # Preferencias (theme, language)
  notifications/
    useNotificationsStore.ts     # Notificaciones del cliente (toasts)
```

## 🚀 Migración del Consumption Store

El `useConsumptionStore` actual debe migrarse a TanStack Query:

**Antes (Zustand):**
```typescript
const { quickStats, fetchConsumptionData } = useConsumptionStore();
useEffect(() => {
  fetchConsumptionData();
}, []);
```

**Después (TanStack Query):**
```typescript
const { data: consumptionData, isLoading } = useConsumptionQuery();
const quickStats = consumptionData?.quickStats || [];
```

## 📚 Recursos

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- Ver `.cursor/project-rules.md` para reglas completas del proyecto

