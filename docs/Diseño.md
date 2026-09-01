# Registro y Especificación de Diseño Frontend

Este documento resume los lineamientos de diseño, mejoras de componentes y optimizaciones de experiencia de usuario implementadas en la tienda web de **El Terruño**.

---

## 1. Sección Producto Destacado (`FeaturedProduct`)

- **Composición Visual y Tarjeta Flotante:**
  - Tarjeta con esquinas redondeadas (`rounded-[24px]` en móvil, `rounded-[28px]` en desktop), borde sutil (`border-[#3D2C23]/10`) y sombra de alta profundidad (`shadow-2xl`).
  - Animación continua de levitación/flotación suave (`animate-float`) que eleva la tarjeta visualmente sin perturbar el flujo de la página.
- **Anillos Concéntricos de Fondo:**
  - 3 anillos concéntricos circulares sutiles (`border-[#70232B]/10`, `/15` y `/20`) centrados detrás de la botella/producto.
  - Animación suave de respiración/pulso (`animate-pulse-ring`) que aporta dinamismo orgánico.
  - Dimensiones escaladas de forma responsive (`340px`/`270px`/`200px` en móvil hasta `540px`/`430px`/`330px` en desktop) con `overflow-hidden` para evitar scroll horizontal.
- **Insignias Flotantes (Badges):**
  - **Insignia Superior Derecha ("BEST SELLER"):** Círculo en tono borgoña institucional (`bg-[#70232B]`), estrella blanca (`Star`) y texto en mayúsculas apilado, sobresaliendo de la esquina superior derecha.
  - **Pastilla Inferior Izquierda ("15% OFF esta semana"):** Pastilla en tono verde oliva (`bg-[#55633D]`) con texto en blanco bold, sobresaliendo de la esquina inferior izquierda.
  - Ambas insignias cuentan con valores por defecto y soporte dinámico según los datos configurados en el panel de administración.

---

## 2. Unificación y Jerarquía de Encabezados

Se estandarizó la nomenclatura y estilo de las etiquetas de sección a lo largo de toda la web:
- `— NUESTRA HISTORIA —`
- `— PRODUCTO DESTACADO —`
- `— NUESTRO CATÁLOGO —`

Estilo uniforme: tipografía sans en mayúsculas, tamaño `text-[11px] sm:text-xs`, espaciado `tracking-[0.22em] sm:tracking-[0.25em]` y color verde oliva (`#55633D`).

---

## 3. Optimización de Fuentes en Catálogo y Tarjetas de Producto

Para otorgar máximo protagonismo visual a la fotografía y presentación del producto:
- **Catálogo (`Catalog.tsx`):**
  - Título principal reducido de `5xl` a `text-2xl sm:text-3xl md:text-4xl`.
  - Buscador compacto con icono centrado y padding refinado.
  - Botones de categorías (chips) estilizados con transiciones suaves.
- **Tarjetas de Producto (`ProductCard.tsx`):**
  - Título del producto ajustado a `font-serif text-lg font-bold`.
  - Descripción reducida a `text-xs sm:text-[13px]` con límite de 2 líneas (`line-clamp-2`).
  - Precios estilizados a `font-serif text-xl font-bold`.
  - Padding interior optimizado (`p-5`) para dar mayor superficie a la imagen.

---

## 4. Adaptabilidad Mobile Integral

- **Barra de Navegación (`Navbar.tsx`):**
  - Menú hamburguesa interactivo con transición animada (`Menu` / `X`).
  - Menú desplegable móvil que permite navegar y se cierra automáticamente al seleccionar un destino.
  - Logotipo y textos de marca fluidos que previenen desbordes en pantallas pequeñas (iPhone SE, mini, etc.).
- **Hero / Portada (`Hero.tsx`):**
  - Título escalado de `text-3xl` a `text-7xl` para evitar cortes de palabras en pantallas estrechas.
  - Botón CTA *"Ver Catálogo"* adaptado a ancho completo en móviles para ergonomía táctil.
- **Nuestra Historia (`About.tsx`):**
  - Foto secundaria superpuesta ajustada con márgenes seguros dentro del ancho del dispositivo.
  - Fila de 3 estadísticas (Años, Productores, Catálogo) con tipografía proporcional y alineación centrada.

---

## 5. Compatibilidad iOS / iPhone (Safe Area del Footer)

- Se incorporó `viewport-fit=cover` en la metaetiqueta del viewport en `index.html`.
- Se configuró el padding inferior del `Footer.tsx` utilizando `env(safe-area-inset-bottom)`:
  ```css
  padding-bottom: max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 2rem));
  ```
  Esto garantiza que la barra de navegación de Safari y el indicador de inicio (*home bar*) de iPhone nunca corten el copyright ni los datos de contacto.

---

## 6. Estructura y Orden de Navegación

El flujo de secciones de la landing page y el menú de navegación quedaron alineados con la narrativa del negocio:

1. **Inicio (`#home`)** — Presentación y propuesta de valor.
2. **Nuestra Historia / El Local (`#about`)** — Identidad, fundadoras y trayectoria local.
3. **Producto Destacado** — Recomendación de la semana con oferta e insignias.
4. **Catálogo (`#catalog`)** — Exploración de productos por categoría y buscador.
5. **Pie de Página (`Footer`)** — Contacto, horarios y ubicación.
