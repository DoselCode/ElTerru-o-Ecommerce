# Registro de Cambios y Mejoras (Changelog)

Este documento detalla todas las modificaciones, nuevas funcionalidades y optimizaciones implementadas en el proyecto.

---

## 1. Paginador Reutilizable
- **Componente**: `src/components/ui/Pagination.tsx`
- **Implementación**:
  - Paginador interactivo con números de página, puntos suspensivos para rangos amplios y botones *Anterior* / *Siguiente*.
  - Paleta de diseño unificada con los tonos del footer (`terruno-brown` #3D2C23 y `terruno-olive` #55633D).
  - Integrado en:
    - **Catálogo de la Tienda** (`src/components/sections/Catalog.tsx`): 6 productos por página.
    - **Listado del Panel Admin** (`src/admin/Dashboard.tsx`): 8 productos por página con resumen (*"Mostrando X - Y de Z productos"*).

---

## 2. Integración con Google Drive Picker
- **Módulo**: `src/lib/googleDrivePicker.ts`
- **Funcionalidad**:
  - Carga asíncrona de Google Identity Services (`gis`) y Google Picker API (`gapi`).
  - Autenticación OAuth 2.0 (`drive.readonly`) con selector de cuentas.
  - Navegación fluida dentro de carpetas de Drive (`DocsView` con soporte de `application/vnd.google-apps.folder`).
  - Vista en cuadrícula de fotos (`DocsViewMode.GRID`).
  - **Soporte de Formatos y Vista Previa Segura**:
    - Descarga directa de archivos binarios vía API.
    - Respaldo automático en JPEG de alta resolución (`1600px`) para fotos tomadas con celulares (`.HEIC`/RAW) que no pueden ser renderizadas por navegadores de forma nativa.
    - Conversión a Data URL (`base64`) mediante `FileReader` para previsualización instantánea y confiable.

---

## 3. Buscador en Tiempo Real en Panel Admin
- **Ubicación**: `src/admin/Dashboard.tsx`
- **Características**:
  - Búsqueda reactiva (`useMemo`) sobre múltiples campos: nombre del producto, bodega/productor, categoría y descripción.
  - Reinicio automático de la paginación a la página 1 al escribir.
  - Botón de limpieza rápida (*X*) para restablecer el listado.
  - Conteo dinámico y mensaje personalizado en caso de no encontrar coincidencias.
  - Atributo `maxLength={100}` en el input de búsqueda.

---

## 4. Validaciones, Descuentos y Modal de Éxito en Formulario de Productos
- **Ubicación**: `src/admin/ProductForm.tsx`
- **Validaciones**:
  - **Nombre**: Obligatorio, entre 2 y 100 caracteres.
  - **Categoría**: Selección obligatoria.
  - **Precio**: Obligatorio, mayor a $0.
  - **Precio Original**: Validado para que sea mayor a $0 y superior al precio con descuento.
  - **Stock**: Obligatorio, número entero mayor o igual a 0 (límite 999.999).
  - **Año / Cosecha**: Formato de 4 dígitos (1900 a año actual + 2).
  - **Descripción**: Obligatoria, entre 5 y 1000 caracteres.
  - **Imagen**: Obligatoria en creación y mantenida en edición.
- **Autocompletado de Porcentaje de Descuento**:
  - Al ingresar el precio de oferta y el precio original, el campo *"Desc. Etiqueta"* calcula automáticamente el porcentaje de descuento (ej. `-20%`).
- **Contadores de Caracteres y Longitudes Máximas**:
  - Contadores visuales en vivo (`X/100`, `X/1000`, `X/250`, etc.) y atributos `maxLength`.
- **Modal de Éxito**:
  - Ventana modal interactiva al guardar con confirmación del nombre del producto.
  - Acciones rápidas: *"Volver al listado"*, *"Crear otro"* (en alta) o *"Continuar editando"* (en edición).

---

## 5. Corrección de Horarios en el Pie de Página
- **Ubicación**: `src/components/sections/Footer.tsx`
- **Cambio**:
  - Se añadieron explícitamente los días de atención en cada renglón:
    - **Lunes a viernes:** `{horario}`
    - **Sábados:** `{horario}`
    - **Domingos:** `{horario}`
  - Saneamiento de cadenas para evitar textos repetidos si la base de datos ya incluía el nombre del día.
