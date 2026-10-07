# Estructura de `src/`

- `App.tsx` / `main.tsx`: rutas y arranque. La landing pública está en `/`; el panel admin se carga bajo demanda en `/admin/*`.
- `admin/`: panel privado (POS, stock, ventas, configuración). Ver `admin/README.md`.
- `components/`: UI de la landing pública (`navbar/`, `sections/`) y piezas compartidas (`ui/`).
- `hooks/`: hooks de la landing (`useStorefrontData` carga tienda y productos).
- `services/`: acceso a datos de InsForge para productos, ventas, caja y storage (la landing y la configuración de la tienda consultan `store_info` desde sus propios hooks).
- `lib/insforge.ts`: cliente único de InsForge; lee `VITE_INSFORGE_URL` y `VITE_INSFORGE_ANON_KEY` del `.env`.
- `types/`: modelos de producto y de la tienda (filas de BD y modelo de la app).
