import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  /** Fracción del elemento visible para disparar (0–1). Default: 0.15 */
  threshold?: number;
  /** Margen alrededor del viewport. Negativo abajo = dispara un poco antes de llegar. */
  rootMargin?: string;
  /** Si true (default) anima una sola vez y desconecta el observer. */
  once?: boolean;
}

/**
 * Observa un elemento y devuelve si está (o estuvo) dentro del viewport.
 * Cada instancia crea su propio IntersectionObserver: no depende de ningún
 * contenedor padre ni contexto compartido.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Sin soporte de IO o con reduced-motion: mostrar de una.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
