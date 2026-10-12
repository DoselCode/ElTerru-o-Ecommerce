# Auditoría de Skills Avanzadas

**Proyecto:** ElTerruño-Ecommerce
**Rama:** feature/admin-pos-floreria
**Fecha:** 2026-09-22

## Resumen Ejecutivo

He realizado una segunda pasada de auditoría aplicando estrictamente los dominios de **Code Quality**, **Arquitectura**, **Seguridad Avanzada** y **Patrones de Agentes**. 

**Peores Hallazgos Encontrados:**
1. **Arquitectura - God Object / Acoplamiento:** `AdminContext.tsx` viola los principios de Clean Architecture y Single Responsibility Principle (SRP). Centraliza estado UI, lógica de negocio, manejo de caché offline y consultas a la base de datos (Supabase/InsForge).
2. **Seguridad - Input Validation:** Parseo directo e inseguro de `localStorage` sin validación de esquemas (potencial de corrupción de estado o Logic Bugs si se adultera).

A continuación el detalle implacable de los hallazgos.

---

## 1. Code Quality 

- [ ] ⚠️ `[H]` **God Object / Mixed Concerns en `AdminContext.tsx`:** 
  - **Ubicación:** `src/admin/AdminContext.tsx` (397 líneas)
  - **Impacto:** Este archivo mezcla el estado del carrito, manejo de modales UI (toasts), la cola de sincronización offline (interacción con `localStorage`) y las llamadas directas a la base de datos (`insforge.database.from`). Es un anti-patrón enorme de mantenibilidad.
  - **Sugerencia:** Separar en múltiples hooks (ej. `useCart`, `useOfflineSync`) y mover la lógica de base de datos a servicios dedicados (Repository Pattern).

- [ ] ⚠️ `[H]` **Archivos Monolíticos:** 
  - **Ubicación:** `src/admin/ProductForm.tsx` (767 líneas)
  - **Impacto:** El componente de React tiene demasiadas responsabilidades (validación extensa, UI, llamadas asíncronas de base de datos, compresión de imágenes).
  - **Sugerencia:** Extraer la lógica de validación a un esquema (ej. Zod) y la lógica de subida de imágenes a un hook custom como `useImageUpload`.

- [ ] ⚠️ `[H]` **Magic Numbers & Strings:**
  - **Ubicación:** `src/admin/AdminContext.tsx:87` (`setTimeout(..., 4000)`), y strings repetidos como `'cerrada'`, `'pagado'`.
  - **Sugerencia:** Extraer a constantes (ej. `TOAST_DURATION = 4000`, `STATUS_CLOSED = 'cerrada'`).

- [ ] ⚠️ `[H]` **Manejo de Errores Silencioso:**
  - **Ubicación:** `src/admin/AdminContext.tsx:168` (`console.error('Sync error...', err); break;`)
  - **Impacto:** Falla de sincronización silenciosa sin notificar apropiadamente al usuario (el error se traga si no arroja toast y simplemente detiene la ejecución).

---

## 2. Arquitectura (Hexagonal & Patrones)

- [ ] ❌ `[H]` **Acoplamiento Fuerte entre Frontend y Base de Datos:**
  - **Ubicación:** `src/admin/ProductForm.tsx` y `src/admin/AdminContext.tsx`
  - **Impacto:** Los componentes de UI importan `insforge` y hacen consultas/mutaciones SQL/RPC directamente. Esto viola el principio de Inversión de Dependencias y hace imposible probar la UI sin mockear todo el SDK o tener base de datos de test.
  - **Sugerencia:** Implementar el Patrón Repositorio / Capa de Servicios. Crear una carpeta `src/services/` que exporte métodos puramente de negocio (ej. `createOrder(order)`, `updateProduct(id, data)`), abstrayendo a `insforge`.

- [ ] ⚠️ `[H]` **Manejo de Cola Offline Empotrado:**
  - **Ubicación:** `AdminContext.tsx` (`syncOfflineQueue` y `executeOrQueue`).
  - **Impacto:** Un Context de React no debería ser responsable de orquestar transacciones eventuales en base de datos.
  - **Sugerencia:** Abstraer a un módulo de persistencia local (ej. IndexedDB + Service Worker o un manejador de Workbox) para que la sincronización opere independientemente del ciclo de vida del Contexto de UI.

---

## 3. Seguridad Avanzada

- [x] ✅ `[P]` **Secretos y Dependencias:** No se detectaron secretos hardcodeados en el código fuente. Las dependencias en `package.json` utilizan versión mayor menor (`^`) lo cual está permitido, y el `.env.local` luce estándar (los valores expuestos allí corresponden al Anon Key que es público por diseño en Supabase).

- [ ] ⚠️ `[H]` **Insecure Input Validation (JSON Parse):**
  - **Ubicación:** `src/admin/AdminContext.tsx:101` (`JSON.parse(q)`)
  - **Riesgo:** Si ocurre una alteración maliciosa o corrupción accidental de los datos en el `localStorage('terruno_offline_queue')`, el sistema parseará e intentará ejecutar esos comandos a ciegas en `syncOfflineQueue()`.
  - **Sugerencia:** Validar el payload extraído del Local Storage utilizando un esquema estricto (ej. Zod) antes de pasarlo al loop de llamadas asíncronas de la base de datos.

---

## 4. Patrones de Agentes (Agent Patterns)

- [x] ✅ `[P|H]` **Inexistente:** Se realizó un escaneo profundo en busca de orquestadores de agentes (LangGraph, CrewAI, AutoGen) y manipulación de LLMs/Prompts en el código fuente. El proyecto actual es una aplicación web transaccional pura (React + Supabase/InsForge) y no implementa lógica AI activa del lado del cliente. Las skills pasaron sin emitir advertencias de bucles de reintentos ni desbordes de prompts.

---

## Recomendaciones Prioritarias

1. **Refactor de Capas (URGENTE):** Migrar las llamadas a `insforge.database` fuera de los componentes React (`ProductForm.tsx`, `POS.tsx`, `AdminContext.tsx`) hacia archivos de servicio puros, adoptando un Clean Architecture en el frontend.
2. **Desacoplar el AdminContext (URGENTE):** Dividir el mega-contexto en manejadores de estado atómicos (usando Zustand o Contextos separados para `Cart`, `Products` y `OfflineSync`).
3. **Validar LocalStorage (ALTO):** Sanitizar los payloads leídos de `terruno_offline_queue` para prevenir ejecución de acciones maliciosas o corruptas en la sincronización a la nube.
