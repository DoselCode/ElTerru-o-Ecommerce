# El Terruño - Frontend & Guía para Integración Backend

Bienvenido al repositorio oficial de **El Terruño** (Almacén Gourmet & Vinos Boutique). El frontend ha sido desarrollado y estructurado con la última versión de **React 19**, **TypeScript** y **Tailwind CSS v4** sobre **Vite**.

---

## 📌 Guía para el Desarrollador Backend

Este proyecto está preparado para conectarse con una API REST o GraphQL. A continuación se detallan la arquitectura de datos, los modelos requeridos y los endpoints a implementar para el **Módulo B: Dashboard Administrador (Panel Privado)**.

---

### 1. Definición de Tipos y DTOs

Las interfaces principales de datos se encuentran en `src/types/product.ts` y `src/admin/types.ts`:

- **Producto (`Product`)**:
  ```typescript
  export interface Product {
    id: number;
    name: string;
    year?: string;                   // Ej: "2021" (para vinos)
    category: 'Vinos' | 'Almacén' | 'Fiambres' | 'Regalos';
    price: number;                  // Precio actual
    originalPrice?: number;         // Precio sin descuento (opcional)
    discountBadge?: string;         // Ej: "15% OFF"
    badge?: string;                 // Ej: "BEST SELLER"
    image: string;                  // URL de la imagen
    description: string;
    winery?: string;                // Ej: "Clos de los Siete, Mendoza"
    pairing?: string;               // Ej: "carnes rojas, quesos estacionados"
    stock?: number;                 // Stock disponible
    isFeatured?: boolean;           // Indica si se muestra en la sección "Producto Destacado"
    isVisible: boolean;             // Conmutador para ocultar/mostrar en tienda pública
  }
  ```

- **Información General del Almacén (`StoreInfo`)**:
  ```typescript
  export interface StoreInfo {
    name: string;
    tagline: string;
    logo: string;
    phone: string;
    whatsappNumber: string;         // Ej: "+5493525518649"
    email: string;
    address: string;
    hoursWeekdays: string;
    hoursSaturday: string;
    hoursSunday: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBgImage: string;
    aboutTitle: string;
    aboutQuote: string;
    aboutQuoteAuthor: string;
    aboutParagraph1: string;
    aboutParagraph2: string;
    aboutParagraph3: string;
    aboutMainImage: string;
    aboutSubImage: string;
    statYears: string;
    statProducers: string;
    statProducts: string;
  }
  ```

---

### 2. Endpoints Backend Sugeridos

#### 🔓 Endpoints Públicos (Tienda Frontend)
- `GET /api/store-info` -> Retorna el objeto `StoreInfo` con la configuración general.
- `GET /api/products` -> Lista de productos visibles (`isVisible = true`).
  - *Filtros y paginación opcional*: `?category=Vinos&search=malbec&page=1&limit=9`.
- `GET /api/products/featured` -> Retorna el producto marcado como `isFeatured = true` para la sección principal (incluyendo `badge` y `discount_badge`).

#### 🔒 Endpoints Privados (Módulo B: Dashboard Admin)
- `POST /api/auth/login` -> Autenticación segura. Recibe `{ username, password }`, retorna token JWT y datos de usuario.
- `GET /api/admin/products` -> Listado paginado de stock con filtros `?page=1&limit=10&search=&category=`.
- `POST /api/products` -> Creación de producto con validación de campos.
- `PUT /api/products/:id` -> Edición de producto existente con validación de campos.
- `PATCH /api/products/:id/visibility` -> Alternar visibilidad (Ocultar/Mostrar).
- `DELETE /api/products/:id` -> Eliminación lógica/física del producto.
- `PUT /api/store-info` -> Actualización de la información del local, teléfono de WhatsApp, textos y fotos institucionales.

---

### 3. Requerimientos Específicos para el Backend

A continuación se detallan las tareas y reglas de negocio requeridas para el backend:

#### 🏷️ 1. Etiqueta de Descuento Configurable sobre Producto Destacado
- El campo `discount_badge` en la tabla `products` (y opcionalmente en la configuración del destacado) debe ser editable desde el panel de administración.
- El backend debe persistir y retornar este valor (ej: `"15% OFF"`, `"-20%"`, `"Promo Especial"`) para que el frontend lo proyecte dinámicamente tanto en la pastilla flotante como en el bloque de precios del producto destacado.

#### 📄 2. Paginación en el Listado de Administración de Stock
- El endpoint `GET /api/admin/products` debe soportar paginación mediante query params: `page` (número de página) y `limit` (cantidad de ítems por página, ej: 10).
- Formato de respuesta JSON esperado:
  ```json
  {
    "data": [ /* Array de productos */ ],
    "pagination": {
      "total": 54,
      "page": 1,
      "limit": 10,
      "totalPages": 6,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
  ```

#### 🛡️ 3. Validaciones de Campos al Crear o Editar Productos
Al recibir peticiones `POST /api/products` o `PUT /api/products/:id`, el backend debe validar estrictamente los siguientes campos antes de persistir en base de datos:

| Campo | Regla de Validación | Mensaje / Detalle |
| :--- | :--- | :--- |
| `name` | Requerido, tipo string, mín. 2 caracteres, máx. 255 | `"El nombre del producto es obligatorio."` |
| `price` | Requerido, numérico, mayor a 0 (`price > 0`) | `"El precio debe ser un valor numérico positivo."` |
| `original_price` | Opcional, numérico, si se define debe ser mayor a `price` | `"El precio original debe ser mayor al precio de venta."` |
| `category` | Requerido, enum: `['Vinos', 'Almacén', 'Fiambres', 'Regalos']` | `"Categoría no válida."` |
| `stock` | Opcional/Requerido, entero mayor o igual a 0 (`stock >= 0`) | `"El stock no puede ser un número negativo."` |
| `image_url` | Requerido, string con formato de URL válida o ruta a storage | `"La imagen del producto es obligatoria."` |
| `description` | Requerido, string, mín. 5 caracteres | `"La descripción del producto es obligatoria."` |
| `badge` | Opcional, string, máx. 50 caracteres | Ej: `"BEST SELLER"`, `"Novedad"` |
| `discount_badge` | Opcional, string, máx. 50 caracteres | Ej: `"15% OFF"`, `"-20%"` |

- En caso de error de validación, responder con código HTTP `400 Bad Request` y un objeto estructurado:
  ```json
  {
    "status": "error",
    "message": "Error de validación en los datos del producto.",
    "errors": {
      "price": "El precio debe ser un valor numérico positivo.",
      "category": "Categoría no válida."
    }
  }
  ```

---

### 4. Modelo Base para la Base de Datos (SQL / NoSQL)

#### Tabla: `products`
| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `BIGINT / UUID` | Primary Key |
| `name` | `VARCHAR(255)` | Requerido |
| `year` | `VARCHAR(10)` | Opcional |
| `category` | `VARCHAR(50)` | `Vinos`, `Almacén`, `Fiambres`, `Regalos` |
| `price` | `DECIMAL(10,2)` | Requerido (> 0) |
| `original_price` | `DECIMAL(10,2)` | Opcional |
| `discount_badge` | `VARCHAR(50)` | Opcional (ej: "15% OFF") |
| `badge` | `VARCHAR(50)` | Opcional (ej: "BEST SELLER") |
| `image_url` | `TEXT` | Requerido |
| `description` | `TEXT` | Requerido |
| `winery` | `VARCHAR(255)` | Opcional |
| `pairing` | `VARCHAR(255)` | Opcional |
| `stock` | `INT` | Default: `0` (>= 0) |
| `is_featured` | `BOOLEAN` | Default: `false` |
| `is_visible` | `BOOLEAN` | Default: `true` |
| `created_at` | `TIMESTAMP` | Default: `NOW()` |

---

### 5. Estructura del Código Frontend

```
src/
├── admin/                    # Base para el Módulo B: Dashboard Admin
│   ├── types.ts              # Contrato de operaciones CRUD y autenticación
│   └── README.md             # Notas técnicas específicas del módulo admin
├── components/
│   ├── navbar/               # Header y navegación pública (con menú responsive)
│   └── sections/             # Secciones visuales (Hero, Historia, Producto Destacado, Catálogo, Footer)
├── docs/                     # Documentación de diseño y animaciones
│   ├── Diseño.md             # Registro de componentes y lineamientos UX/UI
│   └── Animaciones.md        # Documentación de animaciones de scroll y levitación
├── types/
│   └── product.ts            # Interfaces TypeScript principales
├── App.tsx                   # Componente raíz y orden de secciones
└── index.css                 # Configuración de Tailwind CSS v4, animaciones y safe-areas
```

---

## 🚀 Scripts de Desarrollo

- `npm install` - Instalar dependencias.
- `npm run dev` - Ejecutar servidor de desarrollo local en Vite.
- `npx tsc --noEmit` - Validar los tipos de TypeScript sin emitir bundle.
- `npm run build` - Compilar el bundle optimizado para producción en `dist/`.

