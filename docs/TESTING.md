# Testing en EcoHome

Este documento describe la estrategia de tests del proyecto: tests unitarios (Vitest) y tests E2E (Playwright). Las reglas de convenciones y flujos están en `.cursor/project-rules.md` (sección "Testing & QA").

---

## Tests unitarios (Vitest)

### Ejecución
```bash
pnpm test:unit
```
No requiere servidor de desarrollo ni base de datos.

### Estructura
- **Config:** `vitest.config.ts` (raíz). Entorno `node`, patrones `tests/unit/**/*.test.ts`, alias con `vite-tsconfig-paths`.
- **Ubicación:** `tests/unit/` refleja la estructura de `src/`:
  - `tests/unit/domain/` — modelos y lógica de dominio (p. ej. `Property/Property.test.ts`).
  - `tests/unit/application/` — casos de uso (p. ej. `Property/CreateProperty.test.ts`, `DeleteProperty.test.ts` — soft-delete de rentals de la propiedad y luego propiedad; `ListPropertiesForAdmin.test.ts`, `GetPropertyById.test.ts`, `UpdateProperty.test.ts`; `Invoice/GetUserInvoices.test.ts`; `ElectricityBill/ListElectricityBillsForAdmin.test.ts`; `WaterBill/ListWaterBillsForAdmin.test.ts`).

### Convenciones
- Un archivo `.test.ts` por caso de uso o clase de dominio.
- Usar `describe` / `it`; nombres claros (español o inglés).
- Mockear repositorios cuando se prueben use cases en aislamiento.

---

## Tests E2E (Playwright)

### Ejecución
```bash
pnpm test
```
Por defecto, Playwright arranca el servidor de desarrollo (`pnpm dev`) si no hay uno en marcha. En CI se usa una sola worker y 2 reintentos.

### Estructura
- **Config:** `tests/e2e/playwright.config.ts`.
- **Specs:** `tests/e2e/specs/`
  - `auth.spec.ts` — login, registro, roles.
  - `dashboard.spec.ts` — dashboards admin e inquilino.
  - `properties.spec.ts` — listado, crear propiedad, asignar inquilino, eliminar propiedad.
  - `billing.spec.ts`, `consumption.spec.ts`, `payments.spec.ts` — facturación, consumo, pagos.
- **Fixtures:** `tests/e2e/fixtures/` — creación de datos vía API (usuarios, propiedades, rentals, bills, consumption, payments). Export desde `fixtures/index.ts`.
- **Support:** `tests/e2e/support/` — `api.ts` (helpers API), `auth.ts` (login E2E), `database.ts` (limpieza/helpers DB).
- **Pages:** `tests/e2e/pages/` — page objects (LoginPage, AdminDashboardPage, DashboardPage).

### Propiedades (properties.spec.ts)
- **Listado:** navegación y tabla de propiedades.
- **Crear propiedad:** formulario "Nueva propiedad" (nombre, dirección, opcionalmente inquilinos).
- **Asignar inquilino:** desde detalle de propiedad; el date picker se maneja con el popover abierto (`[data-state="open"]`) y los `select` de mes/año dentro del popover para no interferir con el combobox de inquilino.
- **Eliminar propiedad:** se crea una propiedad de prueba por API al inicio del test (p. ej. nombre "E2E Propiedad a Eliminar"), se busca en la tabla, se elimina y se comprueba que la fila desaparece. En backend, al borrar una propiedad también se hace soft-delete de todos sus rentals. En `afterAll` se limpia con el helper de eliminación por nombre para no dejar datos huérfanos en reintentos/CI.

El inquilino ve sus propiedades asignadas en dashboard y `/dashboard/properties` vía GET `/api/tenant/rentals`; solo se listan rentals cuya propiedad existe (no eliminada).

### Requisitos
- Variables de entorno de la aplicación configuradas (p. ej. `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`). Opcionalmente variables para usuario E2E (email/contraseña) si los specs dependen de credenciales fijas.

### CI
- El workflow de CI ejecuta E2E con 1 worker, 2 reintentos y modo headless.
- Las mutaciones que eliminan recursos deben usar siempre la ruta con id (p. ej. `DELETE /api/properties/[id]`); en la app, `useDeletePropertyMutation()` se llama con `mutate(propertyId)` para que la URL sea correcta.

---

## Resumen de comandos

| Comando        | Descripción                          |
|----------------|--------------------------------------|
| `pnpm test:unit` | Tests unitarios (Vitest)             |
| `pnpm test`      | Tests E2E (Playwright)               |
| `pnpm lint`      | Lint + formato (ejecutar antes de PR)|

Antes de abrir un PR se recomienda: `pnpm lint`, `pnpm test:unit` y `pnpm test`.
