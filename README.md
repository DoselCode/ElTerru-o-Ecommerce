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
  - *Filtros opcionales*: `?category=Vinos&search=malbec`.
- `GET /api/products/featured` -> Retorna el producto marcado como `isFeatured = true` para la sección principal.

#### 🔒 Endpoints Privados (Módulo B: Dashboard Admin)
- `POST /api/auth/login` -> Autenticación segura. Recibe `{ username, password }`, retorna token JWT y datos de usuario.
- `POST /api/products` -> Creación de producto.
- `PUT /api/products/:id` -> Edición de producto existente.
- `PATCH /api/products/:id/visibility` -> Alternar visibilidad (Ocultar/Mostrar).
- `DELETE /api/products/:id` -> Eliminación lógica/física del producto.
- `PUT /api/store-info` -> Actualización de la información del local, teléfono de WhatsApp, textos y fotos institucionales.

---

### 3. Modelo Base para la Base de Datos (SQL / NoSQL)

#### Tabla: `products`
| Campo | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `BIGINT / UUID` | Primary Key |
| `name` | `VARCHAR(255)` | Requerido |
| `year` | `VARCHAR(10)` | Opcional |
| `category` | `VARCHAR(50)` | `Vinos`, `Almacén`, `Fiambres`, `Regalos` |
| `price` | `DECIMAL(10,2)` | Requerido |
| `original_price` | `DECIMAL(10,2)` | Opcional |
| `discount_badge` | `VARCHAR(50)` | Opcional |
| `badge` | `VARCHAR(50)` | Opcional |
| `image_url` | `TEXT` | Requerido |
| `description` | `TEXT` | Requerido |
| `winery` | `VARCHAR(255)` | Opcional |
| `pairing` | `VARCHAR(255)` | Opcional |
| `stock` | `INT` | Opcional |
| `is_featured` | `BOOLEAN` | Default: `false` |
| `is_visible` | `BOOLEAN` | Default: `true` |
| `created_at` | `TIMESTAMP` | Default: `NOW()` |

---

### 4. Estructura del Código Frontend

```
src/
├── admin/                    # Base para el Módulo B: Dashboard Admin
│   ├── types.ts              # Contrato de operaciones CRUD y autenticación
│   └── README.md             # Notas técnicas específicas del módulo admin
├── components/
│   ├── navbar/               # Header y navegación pública
│   └── sections/             # Componentes visuales (Hero, Producto Destacado, Catálogo, Historia, Footer)
├── data/
│   └── initialData.ts        # Datos de prueba iniciales (mock dataset)
├── types/
│   └── product.ts            # Interfaces TypeScript principales
├── App.tsx                   # Componente raíz
└── index.css                 # Configuración de Tailwind CSS v4 y variables visuales
```

---

## 🚀 Scripts de Desarrollo

- `npm install` - Instalar dependencias.
- `npm run dev` - Ejecutar servidor de desarrollo local en Vite.
- `npx tsc --noEmit` - Validar los tipos de TypeScript sin emitir bundle.
- `npm run build` - Compilar el bundle optimizado para producción en `dist/`.
