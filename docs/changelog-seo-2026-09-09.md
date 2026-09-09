# Optimización SEO y Performance (9 de Septiembre de 2026)

Este documento detalla todas las mejoras estructurales, de posicionamiento y de velocidad de carga implementadas para resolver los problemas marcados por los analizadores SEO (como Google Search Console y Lighthouse).

## 1. Resolución de Cuellos de Botella (Performance)
- **Eliminación del Waterfall en Carga de Datos**: Se refactorizó la lógica principal en `App.tsx`. Antes, las consultas a Supabase (`store_info` y `products`) se ejecutaban de forma secuencial. Ahora utilizan `Promise.all()` para ejecutarse en paralelo, reduciendo drásticamente el tiempo del **LCP (Largest Contentful Paint)**.
- **FCP (First Contentful Paint) Instantáneo**: Se insertó un *skeleton* de carga estilizado con la paleta de la marca directamente en el `index.html` estático. Esto elimina la pantalla en blanco que veían los usuarios (y los crawlers) durante los primeros segundos mientras se descargaba y ejecutaba el bundle de React.

## 2. Inyección de Metadatos y Headings
- **React Helmet Async**: Se integró la librería `react-helmet-async` envolviendo toda la aplicación desde `main.tsx`. 
- **SEO Dinámico vs Estático**: 
  - Se agregó un componente `<Helmet>` global (fuera del condicional de carga) en `App.tsx` para asegurar que herramientas de SEO estrictas nunca detecten la página sin etiqueta `<title>`.
  - Una vez que la info de la tienda carga desde la DB, la vista `Storefront` inyecta dinámicamente un `<title>` rico en palabras clave y un `<meta name="description">` basado en los textos institucionales.

## 3. Semántica HTML5
- Se reemplazaron las etiquetas genéricas `<div>` por etiquetas semánticas para mejorar el entendimiento de la jerarquía por parte de los crawlers:
  - `<main>` envolviendo el contenido central.
  - `<section>` y `<article>` para los componentes `Hero`, `About` y las tarjetas de productos (`FeaturedProduct`, `ProductCard`).
  - Se validó la presencia de encabezados H1 y una jerarquía lógica de Hs. (El componente `<Reveal as="h1">` gestiona el titular principal).

## 4. Crawling, Indexación y Verificación
- **robots.txt**: Se creó un archivo base en `/public/robots.txt` con permisos de acceso global y la declaración absoluta hacia el sitemap (estándar requerido).
- **sitemap.xml**: Se generó una estructura XML básica apuntando a la raíz del sitio.
- **Google Search Console**: 
  - Se agregó el archivo HTML de verificación estático en la carpeta `public/`.
  - Se inyectó la etiqueta `<meta name="google-site-verification">` en el `<head>` del `index.html`.

## 5. UI y Experiencia Visual
- **Lazy Loading**: Se añadió el atributo `loading="lazy"` a las imágenes secundarias o que se encuentran "below the fold" para ahorrar ancho de banda inicial.
- **Fusión Visual**: Se eliminó un borde superior (`border-t`) sutil en la sección "Nosotros" (`About.tsx`) para que el degradado del fondo del `Hero` se funda limpiamente con la sección contigua.
