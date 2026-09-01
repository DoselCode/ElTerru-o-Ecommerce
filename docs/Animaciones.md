# Animaciones de scroll (reveal)

Sistema de animaciones de entrada al hacer scroll. **0 dependencias nuevas**, ~1.5 KB.

## Cómo funciona

Cada elemento se anima solo cuando entra al viewport. No hay contenedor global que
orqueste: cada `<Reveal>` tiene su propio `IntersectionObserver`, que se **desconecta
apenas revela** (no hay trabajo en scroll después). Respeta `prefers-reduced-motion`
(si está activo, todo aparece sin animar).

## Archivos

| Archivo | Rol |
|---|---|
| `src/hooks/useInView.ts` | Hook con `IntersectionObserver` por elemento |
| `src/components/ui/Reveal.tsx` | Componente wrapper `<Reveal>` |
| `src/index.css` | Clases `.reveal--*` (transición GPU: `opacity` + `transform`, 0.7s) |

## Uso

```tsx
import { Reveal } from '../ui/Reveal';

<Reveal variant="fade-up" delay={80}>...</Reveal>
<Reveal as="h2" variant="slide-right" className="...">Título</Reveal>
<Reveal as="li" variant="fade-up" delay={i * 60}>...</Reveal>
```

**Props:** `variant` · `delay` (ms, para stagger) · `as` (etiqueta HTML, default `div`) ·
`className` · `threshold` (default 0.15) · `repeat` (default `false` = anima una vez).

**Variants:** `fade-up` · `fade` · `slide-left` · `slide-right` · `scale-in`

## Dónde se aplicó

| Sección | Detalle |
|---|---|
| `Hero` | Badge → título → subtítulo → CTA, `fade-up` escalonado |
| `About` | Imagen `slide-left`; texto y stats `fade-up` escalonado |
| `FeaturedProduct` | Card de imagen `fade` (ya tiene `animate-float`); título `slide-right`; detalle `fade-up` |
| `Catalog` | Header/buscador/filtros `fade-up`; grid de productos `scale-in` con stagger |
| `ProductCard` | Animado desde `Catalog` vía wrapper; se le agregó `h-full` para igualar alturas |
| `Footer` | Columnas `fade-up` escalonadas |

### Nota sobre el grid del catálogo

El `<Reveal>` de cada card usa `key={`${product.id}-${currentPage}`}`, así que al
cambiar de página / filtrar / buscar los wrappers se remontan y la animación se repite.

## Cambios que tocan layout (no solo estético)

- `ProductCard`: se agregó `h-full` al `<article>` (y al wrapper `Reveal`) para
  mantener las cards de igual altura por fila ahora que `ProductCard` no es hijo
  directo del grid.
- `Hero`: se quitó la clase `animate-fade-in` del contenedor (estaba **rota**, no
  existía en CSS); ahora está definida en `index.css`.
