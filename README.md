# **EcoHome – Energy and Water Consumption Management Platform**  

## **📖 Introduction**  
**EcoHome** is a modern and efficient web platform designed to manage and monitor water and electricity consumption in rental properties. Its main goal is to provide **property administrators** and **tenants** with a digital solution to register, visualize, and analyze utility consumption, improving transparency and financial control.  

By integrating advanced tools such as **cloud storage with Amazon S3** and **PDF report generation**, EcoHome enables users to make informed decisions about their resource usage, promoting more efficient and sustainable consumption.

---

## **🎯 Purpose of the Web App**  
The primary objective of EcoHome is to offer a **digital and automated platform** for **energy and water consumption management** in rental properties. Through its intuitive interface, administrators can **register, track, and analyze utility consumption**, while tenants can **access their consumption records and understand their expenses** over time.

---

## **👤 User Roles in the Application**  


### **1️⃣ Administrator**  
The administrator is responsible for managing tenant consumption and overseeing the platform.  

#### **Key Features:**  
- Secure login and authentication.  
- View the water and electricity consumption history of each tenant.  
- Upload images of meters to verify recorded consumption.  
- Generate monthly reports in **PDF format** summarizing utility usage.  
- Upload electricity and water bills to register payments and calculate costs.  
- Access a **multi-step form** preloaded with invoice data to automatically calculate the service costs (water, electricity, and total) for each tenant.  
- Mark whether a tenant has **paid or not** for the services directly from the UI.  
- Store images and documents in **Amazon S3** for secure access.  
- View payment status in the **billing history** and include this data in the **PDF reports**.  

### **2️⃣ User (Tenant)**  
Tenants can check their personal consumption history and view detailed cost calculations.

#### **Key Features:**  
- Log in and access their **monthly consumption history**.  
- Access a **multi-step form** to view a detailed breakdown of their consumption and costs.  
- Download **PDF reports** with the final calculation of their payments, including payment status.  
- Retrieve past consumption data stored securely.

---

## UML web app


![UML Diagram](./public//ecohome_full_er.svg)


## **🛠️ Tecnologías en uso (actuales)**  
Estas son las herramientas y librerías que realmente se usan actualmente en el proyecto (según `package.json`):  

### **📌 Frameworks y core**  
- **Next.js 15** (`next@15.1.8`)  
- **React 19** (`react@~19`, `react-dom@~19`)  
- **TypeScript 5** (`typescript@~5`)  

### **📌 UI y estilos**  
- **Radix UI** (`@radix-ui/react-*`)  
- **Tailwind CSS 3** (`tailwindcss@~3.4.1`, `tailwind-merge@~3.3.0`, `tailwindcss-animate@~1.0.7`)  
- **Lucide React** (`lucide-react@~0.511.0`)  
- **next-themes** (`~0.4.6`)  
- **styled-components 6** (`~6`)  

### **📌 Forms y validación**  
- **React Hook Form** (`react-hook-form@~7.56.4`)  
- **Zod** (`zod@~3.25.23`) + **@hookform/resolvers** (`~5.0.1`)  

### **📌 Auth y base de datos**  
- **NextAuth.js 5 (beta)** (`next-auth@~5.0.0-beta.28`)  
- **Prisma 6** (`prisma@~6.10.1`, `@prisma/client@~6.10.1`) + **@auth/prisma-adapter** (`~2.9.1`)  
- **Base de datos:** PostgreSQL (mediante Prisma)  

### **📌 CMS / Contenido**  
- **Sanity** (`sanity@~3`, `next-sanity@~9`, `@sanity/image-url@~1`, `@sanity/icons@~3.7.0`, `@sanity/vision@3`)  

### **📌 Email y notificaciones**  
- **Nodemailer** (`~6.9.1`) y **Resend** (`~4.5.1`)  
- **Sonner** (`~2.0.5`)  

### **📌 Utilidades**  
- `class-variance-authority`, `clsx`, `nanoid`, `reflect-metadata`  

---
## **📦 Dependencias actuales (desde `package.json`)**  

### Runtime  
- `@auth/prisma-adapter@~2.9.1`  
- `@hookform/resolvers@~5.0.1`  
- `@prisma/client@~6.10.1`  
- `@radix-ui/react-dialog@~1.1.14`  
- `@radix-ui/react-dropdown-menu@~2.1.15`  
- `@radix-ui/react-label@~2.1.7`  
- `@radix-ui/react-popover@~1.1.14`  
- `@radix-ui/react-progress@~1.1.7`  
- `@radix-ui/react-select@~2.2.5`  
- `@radix-ui/react-separator@~1.1.7`  
- `@radix-ui/react-slot@~1.2.3`  
- `@radix-ui/react-tooltip@~1.2.7`  
- `@sanity/icons@~3.7.0`  
- `@sanity/image-url@~1`  
- `@sanity/vision@3`  
- `bcryptjs@~3.0.2`  
- `class-variance-authority@~0.7.1`  
- `clsx@~2.1.1`  
- `lucide-react@~0.511.0`  
- `nanoid@~5.1.5`  
- `next@15.1.8`  
- `next-auth@~5.0.0-beta.28`  
- `next-sanity@~9`  
- `next-themes@~0.4.6`  
- `nodemailer@~6.9.1`  
- `react@~19.0.0`  
- `react-dom@~19.0.0`  
- `react-hook-form@~7.56.4`  
- `reflect-metadata@~0.2.2`  
- `resend@~4.5.1`  
- `sanity@~3`  
- `sonner@~2.0.5`  
- `styled-components@~6`  
- `tailwind-merge@~3.3.0`  
- `tailwindcss-animate@~1.0.7`  
- `zod@~3.25.23`  

### Dev  
- `@eslint/eslintrc@~3`  
- `@playwright/test@^1.55.0`  
- `@types/bcryptjs@^3.0.0`  
- `@types/node@~20`  
- `@types/nodemailer@~6.4.17`  
- `@types/prettier@^3.0.0`  
- `@types/react@~19`  
- `@types/react-dom@~19`  
- `eslint@~9`  
- `eslint-config-next@~15.1.8`  
- `eslint-config-prettier@^10.1.8`  
- `eslint-plugin-prettier@^5.5.3`  
- `husky@^9.1.7`  
- `lint-staged@^16.1.4`  
- `postcss@~8`  
- `prettier@^3.6.2`  
- `prisma@~6.10.1`  
- `tailwindcss@~3.4.1`  
- `typescript@~5`  

---

## 🚀 Instalación y ejecución rápida
- **Requisitos previos**: Node.js 18+ y PNPM
- **Instalación**:  
  ```bash
  pnpm install
  ```
- **Desarrollo**:  
  ```bash
  pnpm dev
  ```
- **Build producción**:  
  ```bash
  pnpm build && pnpm start
  ```
- **Post-instalación** (automático): genera Prisma Client.  
- **Linter y formato**: `pnpm lint`, `pnpm format`, `pnpm format:check`
- **Tests E2E**: `pnpm test`
> Nota: configura tus variables de entorno en `.env.local` (por ejemplo: `DATABASE_URL`, credenciales de NextAuth, claves de Sanity, email/resend, etc.).

## 📜 Scripts disponibles
- **dev**: `next dev --turbopack`  
- **build**: `next build`  
- **start**: `next start`  
- **postinstall**: `prisma generate`  
- **format**: `prettier --write .`  
- **format:check**: `prettier --check .`  
- **lint**: `next lint --fix && pnpm format`  
- **prepare**: `husky`  
- **test**: `npx playwright test`

---

## 🔧 Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto. Ejemplos típicos (ajusta según tu configuración):

### Base de datos (Prisma / PostgreSQL)
- `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"`

### Autenticación (NextAuth / Auth.js v5)
- `AUTH_SECRET=...`  
- `NEXTAUTH_URL="http://localhost:3000"` (o la URL de producción)

### Sanity (CMS)
- `SANITY_PROJECT_ID=...`  
- `SANITY_DATASET=production`  
- `SANITY_API_VERSION=2024-01-01`  
- `SANITY_READ_TOKEN=...` (si se requiere acceso a contenido protegido)

### Email / Notificaciones
- `RESEND_API_KEY=...` (si se usa Resend)  
- `EMAIL_FROM="EcoHome <no-reply@tudominio.com>"`  
- `SMTP_HOST=smtp.gmail.com` (o tu proveedor)  
- `SMTP_PORT=465` (465 SSL, 587 STARTTLS, etc.)  
- `SMTP_SECURE=true` (opcional, por defecto se infiere del puerto)  
- `SMTP_USER=...`  
- `SMTP_PASS=...`  
- `GOOGLE_APP_PASSWORD=...` (opcional como fallback solo para Gmail)

### App (opcional)
- `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

> Tras configurar `DATABASE_URL`, ejecuta la app con `pnpm dev`. `prisma generate` se ejecuta automáticamente en `postinstall`.

---

## **🔐 Security**  
To guarantee privacy and data security, EcoHome implements:  
- **Authentication with NextAuth.js**, allowing access only to **authorized users**.  
- **Role-based access control (RBAC)** to restrict functionalities according to user type (**Administrator or Tenant**).  
- **Secure cloud storage** with Amazon S3 to protect documents and sensitive data.  
- **Data encryption** and **HTTPS usage** to prevent information leaks.  

---

## **📊 Benefits of EcoHome**  
✅ **Automation & Accuracy:** Automatically calculates **each tenant’s monthly consumption**.  
✅ **Transparency & Control:** Keeps **detailed records of consumption history, costs, and payment status**.  
✅ **Secure & Centralized Access:** Stores **essential documents in the cloud**.  
✅ **User-Friendly Interface:** Optimized UI, responsive for all devices.  
✅ **Sustainability:** Encourages **efficient resource usage** through reports and consumption analysis.  

---

# 🧭 Flujo de Navegación del Usuario en la Web App – EcoHome

Cuando un usuario llega a **EcoHome**, su navegación debe ser **clara, intuitiva y eficiente**. A continuación, te explico cómo es la experiencia de usuario desde que accede a la web hasta que realiza sus acciones principales.

---

## **1️⃣ Acceso Inicial – Página de Inicio (Landing Page)**

📌 **Ruta:** `/` (Página principal antes de iniciar sesión)

🔹 **Elementos clave:**  
✅ Breve descripción de la plataforma y su funcionalidad.  
✅ Botones de **"Iniciar Sesión"** y **"Registrarse"**.  
✅ Imagen o ilustración representativa del servicio.  
✅ Información sobre la gestión del consumo de agua y luz.  

🖥 **Ejemplo de contenido:**  
```
Bienvenido a EcoHome - Administra tu consumo de energía y agua de manera eficiente.
🔹 Visualiza tu historial de consumo
🔹 Descarga reportes detallados
🔹 Optimiza tus gastos en servicios
```  

👆 **Acción principal:** El usuario hace clic en **"Iniciar Sesión"** o **"Registrarse"**.

---

## **2️⃣ Inicio de Sesión / Registro**

📌 **Ruta:** `/auth/login` (Iniciar sesión) / `/auth/register` (Registro)

🔹 **Acciones disponibles:**  
✅ **Usuario existente:** Introduce su correo y contraseña.  
✅ **Nuevo usuario:** Rellena el formulario de registro con datos básicos.  
✅ **Opción de autenticación con Google o redes sociales (si está configurado).**  

📌 **Después del login:**  
- 🔹 Si es **Administrador**, redirige a `/admin/dashboard`.  
- 🔹 Si es **Inquilino**, redirige a `/dashboard`.  

🔐 **Protección:** Si el usuario intenta acceder a una página sin iniciar sesión, será redirigido a `/auth/login`.

---

## **3️⃣ Dashboard – Vista Principal**

📌 **Ruta:** `/dashboard` (Para inquilinos) / `/admin/dashboard` (Para administradores)

🔹 **Elementos clave:**  
✅ **Resumen del consumo mensual** de agua y electricidad.  
✅ **Gráfico de tendencia de consumo** en los últimos meses.  
✅ **Acceso rápido a facturación y reportes**.  
✅ **Notificaciones de consumo alto o alertas importantes**.  

🖥 **Ejemplo de tarjetas en el dashboard:**  
```
🔹 Agua consumida: 15.8 m³  
🔹 Electricidad consumida: 120.3 kWh  
🔹 Costo total: $85.75  
🔹 Estado de pago: Pagado / Pendiente
```  

👆 **Acciones disponibles:**  
- Ver historial de consumo.  
- Descargar reporte de consumo mensual.  
- Acceder a detalles de facturación.

---

## **4️⃣ Historial de Consumo**

📌 **Ruta:** `/consumption-history`

🔹 **Acciones disponibles:**  
✅ Consultar consumo mensual en una tabla o gráfico.  
✅ Comparar el consumo de diferentes meses.  
✅ Filtrar por rango de fechas.  
✅ Ver estado de pago de cada factura.  
✅ Descargar reporte en PDF.  

👆 **Ejemplo de interacción:**  
- El usuario selecciona un mes para ver cuánto ha consumido en comparación con meses anteriores y si ya ha pagado.

---

## **5️⃣ Facturación y Costos**

📌 **Ruta:** `/billing`

🔹 **Acciones disponibles:**  
✅ Ver facturas de agua y luz de meses anteriores.  
✅ Consultar costos calculados automáticamente.  
✅ Ver y modificar el estado de pago desde la UI (solo admin).  
✅ Descargar PDF con resumen de pagos.  

👆 **Ejemplo de interacción:**  
- El administrador cambia el estado de una factura a "Pagado", y el inquilino puede ver la actualización.

---

## **6️⃣ Generación de Reportes**

📌 **Ruta:** `/reports`

🔹 **Acciones disponibles:**  
✅ Generar reportes en PDF con datos detallados del consumo.  
✅ Filtrar reportes por fechas y tipos de servicio.  
✅ Incluir estado de pago en los reportes.  

👆 **Ejemplo de interacción:**  
- El usuario selecciona el período **"Últimos 6 meses"** y descarga un reporte en PDF con gráficos, costos desglosados y estados de pago.

---

## **7️⃣ Configuración del Usuario**

📌 **Ruta:** `/settings`

🔹 **Acciones disponibles:**  
✅ Modificar datos personales (nombre, email).  
✅ Cambiar contraseña.  
✅ Configurar alertas de consumo alto.  

👆 **Ejemplo de interacción:**  
- El usuario activa una alerta para recibir un aviso si su consumo de electricidad supera los 500 kWh en un mes.

---

## **8️⃣ Cierre de Sesión**

📌 **Ruta:** `/logout`

👆 **Acción:**  
- El usuario cierra sesión y es redirigido a la **página de inicio (`/`)**.

---

## **📍 Resumen del Flujo de Navegación**

1️⃣ **Usuario visita** `/` (Landing Page).  
2️⃣ **Inicia sesión** en `/auth/login`.  
3️⃣ **Es redirigido al dashboard** `/dashboard` o `/admin/dashboard`.  
4️⃣ **Explora las funciones principales:**  
   - 🔹 Historial de Consumo → `/consumption-history`  
   - 🔹 Facturación → `/billing`  
   - 🔹 Reportes → `/reports`  
   - 🔹 Configuración → `/settings`  
5️⃣ **Puede descargar reportes o consultar costos.**  
6️⃣ **Cierra sesión y regresa a la landing page.**  

## **🚀 Conclusion**  
EcoHome **revolutionizes the way tenants and administrators manage utility consumption** in rental properties. Through its **intuitive and optimized digital platform**, it enables **detailed tracking of consumption**, facilitates **cost administration**, and promotes **efficient energy management**, including **clear tracking of payment status**.
