# DATOS EN BASE DE DATOS – POR RANGO DE TIEMPO

Cada registro incluye su **rango de tiempo** (periodStart → periodEnd) para poder hacer correcciones.

**Resumen rápido:**
- **Propiedades:** lista de todas (nombre, dirección, ID).
- **Facturas electricidad:** cada fila = 1 factura con su rango de fechas, kWh y total.
- **Cargos electricidad:** desglose por factura (misma fila = mismo rango que la factura).
- **Facturas agua:** cada fila = 1 factura con su rango, m³ y total.
- **Cargos agua:** desglose por factura (misma fila = mismo rango que la factura).

---
## 1. PROPIEDADES

| # | ID | Nombre | Dirección |
|---|----|--------|-----------|
| 1 | `09ea9c8a-17e7-4d3c-84b9-a7cb02b73d6c` | Apartamento 1 | Dirección de Apartamento 1 |
| 2 | `6acd2ef8-2ffb-4b8a-b1cd-21056e77d5bc` | Apartamento 2 | Dirección de Apartamento 2 |
| 3 | `57edd713-3c57-4b57-8fad-1a9a3178c638` | Cochera | Dirección de Cochera |
| 4 | `53e3be1c-6c5a-4910-95f5-8d8b3135b900` | Other Property | Other Address |
| 5 | `23d1c808-789f-4166-9f6c-69caffadaa12` | Other Property | Other Address |
| 6 | `5b3f67e8-2e44-428f-933e-390ed56c1ec7` | Other Property | Other Address |
| 7 | `8a679a1a-c9a1-49b7-b5e7-92a4ce2073de` | Other Property | Other Address |
| 8 | `7581d4c2-8290-4fb6-8c0b-62ee412f135c` | Room 3 Piso | Dirección de Room 3 Piso |
| 9 | `acf6da1b-350b-40df-84e6-4228d548856d` | Room 6 | Dirección de Room 6 |

---
## 2. FACTURAS DE ELECTRICIDAD

Cada fila = una factura. El **rango** es el período facturado.

| # | RANGO (periodStart → periodEnd) | Propiedad | totalKWh | totalCost (S/) | ID factura |
|---|----------------------------------|-----------|----------|----------------|------------|
| 1 | **2025-09-05 → 2025-10-06** | Apartamento 1 | 260 | 217.5 | `faa7b15a-1ca0-4d95-aa54-eb6900317f41` |
| 2 | **2025-11-07 → 2025-12-05** | Apartamento 1 | 248 | 254.5 | `a1f5bef1-8b38-4995-9230-e7ed4bfda929` |

### 2.1 Cargos de servicio (electricidad)

Cada fila está ligada a una factura de electricidad por su rango.

| RANGO de la factura | Propiedad | Mantenimiento | Cargo Fijo | Interés Comp. | Alumbrado | Ley 28749 | Mora | Red. Mes Ant. | Red. Mes Actual |
|---------------------|-----------|---------------|------------|---------------|-----------|-----------|------|---------------|-----------------|
| **2025-09-05 → 2025-10-06** | Apartamento 1 | 0 | 32.81 | 0 | 0 | 0 | 1.65 | 0 | 2.3 |
| **2025-11-07 → 2025-12-05** | Apartamento 1 | 2.25 | 153.56 | 0.12 | 9 | 0 | 0 | -3.67 | -0.08 |

---
## 3. FACTURAS DE AGUA

Cada fila = una factura. El **rango** es el período facturado.

| # | RANGO (periodStart → periodEnd) | Propiedad | Consumo (m³) | totalCost (S/) | ID factura |
|---|----------------------------------|-----------|--------------|-----------------|------------|

*Si la tabla no tiene filas de datos: no hay facturas de agua cargadas.*

### 3.1 Cargos de servicio (agua)

Cada fila está ligada a una factura de agua por su rango.

| RANGO de la factura | Propiedad | Cargo Fijo | Alcantarillado | Mora | Red. Mes Ant. | Red. Mes Actual |
|---------------------|-----------|------------|----------------|------|---------------|-----------------|
