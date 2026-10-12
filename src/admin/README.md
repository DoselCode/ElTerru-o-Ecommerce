# Panel de administración (POS, stock, ventas y configuración)

Se carga bajo demanda (lazy) desde `App.tsx` en las rutas `/admin/*`; el acceso lo controla `views/AdminLayout.tsx` con la sesión de InsForge.

## Estructura

- `views/`: pantallas con layout propio. `AdminLayout` (guard de sesión, menú y providers), `ProductForm` (alta/edición de productos) y `SettingsForm` (configuración de la landing).
- `components/`: módulos y modales del panel: `POS`, `Stock`, `Sales`, `Dashboard`, `RegisterModule` (caja), `PaymentModal`, `SaleDetailModal`, `Ticket`.
- `context/`: estado compartido. `AdminContext` (productos, ventas y caja, con cola offline), `CartContext` (carrito del POS) y `ToastContext` (avisos).
- `hooks/`: `useStoreSettings` (carga/guarda `store_info`) y `useModalDismiss` (Escape y clic en el fondo).
- `productForm/`: piezas del formulario de producto (campos, secciones, validación y conversión a payload).
- `settings/`: editor de horarios de la configuración.
- `utils/`: lógica pura sin UI. `posUtils` (descuentos, totales, formatos, resumen de caja) y `ticketConfig` (datos fiscales del ticket).
- `types.ts`: modelos del admin (`Order`, `RegisterState`, `PaymentMethod`).
- `Login.tsx`: acceso con límite de intentos fallidos.

## Cosas a tener en cuenta

- **Offline-first:** las escrituras (ventas, caja, stock) que fallan se guardan en `localStorage` (`terruno_offline_queue`) y se reenvían al recuperar la conexión.
- **Descuentos:** 10% en efectivo y en transferencia (`utils/posUtils.ts`).
- **Ticket:** es un comprobante no válido como factura; sus datos fiscales salen de `utils/ticketConfig.ts`.
- **Caja:** es una sola para todos los puestos (fila `registers` con id `global`).
