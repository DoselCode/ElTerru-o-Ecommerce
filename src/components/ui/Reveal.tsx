import React from 'react';
import { useInView } from '../../hooks/useInView';

// Hook para reutilizar donde quiera que se necesite un efecto de revelado al entrar en el viewport.

export type RevealVariant =
  | 'fade-up'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in';

interface RevealProps {
  children: React.ReactNode;
  /** Tipo de entrada. Default: 'fade-up'. */
  variant?: RevealVariant;
  /** Retraso en ms (para stagger manual). Default: 0. */
  delay?: number;
  /** Etiqueta HTML a renderizar. Default: 'div'. */
  as?: keyof React.JSX.IntrinsicElements;
  /** Clases extra para el wrapper. */
  className?: string;
  /** Fracción visible para disparar. Default: 0.15. */
  threshold?: number;
  /** Repetir la animación al re-entrar. Default: false (anima una vez). */
  repeat?: boolean;
}

/**
 * Envuelve cualquier nodo y lo revela al entrar en el viewport.
 * Autónomo: cada <Reveal> tiene su propio observer, sin orquestador global.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  as = 'div',
  className = '',
  threshold = 0.15,
  repeat = false,
}) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold, once: !repeat });
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${inView ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};
