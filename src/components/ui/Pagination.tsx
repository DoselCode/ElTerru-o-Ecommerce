import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export type PaginationVariant = 'footer' | 'burgundy' | 'outline';

export interface PaginationProps {
  /** Página activa actual (base 1). */
  currentPage: number;
  /** Total de páginas disponibles. */
  totalPages: number;
  /** Función callback ejecutada al seleccionar una página. */
  onPageChange: (page: number) => void;
  /** Número de páginas hermanas visibles alrededor de la página actual. Default: 1 */
  siblingCount?: number;
  /** Clases CSS adicionales para el contenedor principal. */
  className?: string;
  /** Variante visual de color. Default: 'footer' (colores del footer: terruno-brown / terruno-olive). */
  variant?: PaginationVariant;
  /** Si debe mostrar los botones para saltar a la primera y última página. Default: false */
  showEdges?: boolean;
  /** Si se debe ocultar el paginador cuando solo hay 1 página. Default: false */
  hideOnSinglePage?: boolean;
}

export const DOTS = '...';

const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
  variant = 'footer',
  showEdges = false,
  hideOnSinglePage = false,
}) => {
  const paginationRange = useMemo(() => {
    if (totalPages <= 1) {
      return [1];
    }

    // Total de números a mostrar = siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    // Caso 1: Si el total de páginas es menor que los números que queremos mostrar
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Caso 2: Sin puntos a la izquierda, pero con puntos a la derecha
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Caso 3: Con puntos a la izquierda, pero sin puntos a la derecha
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Caso 4: Con puntos a ambos lados
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return range(1, totalPages);
  }, [totalPages, siblingCount, currentPage]);

  if (totalPages <= 0) {
    return null;
  }

  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // Estilos según la variante seleccionada
  const variantStyles = {
    footer: {
      navBtn:
        'bg-terruno-brown text-white hover:bg-terruno-olive active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      edgeBtn:
        'bg-white border border-terruno-brown/20 text-terruno-brown hover:bg-terruno-brown hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      activePage:
        'bg-terruno-brown text-white font-bold ring-2 ring-terruno-olive/40 shadow-sm',
      inactivePage:
        'bg-white/90 border border-terruno-brown/20 text-terruno-brown hover:bg-terruno-brown hover:text-white active:scale-95 shadow-sm',
      dots: 'text-terruno-brown/60',
    },
    burgundy: {
      navBtn:
        'bg-terruno-burgundy text-white hover:bg-terruno-burgundy-light active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      edgeBtn:
        'bg-white border border-terruno-burgundy/30 text-terruno-burgundy hover:bg-terruno-burgundy hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      activePage:
        'bg-terruno-burgundy text-white font-bold ring-2 ring-terruno-burgundy/30 shadow-sm',
      inactivePage:
        'bg-white/90 border border-terruno-burgundy/20 text-terruno-burgundy hover:bg-terruno-burgundy hover:text-white active:scale-95 shadow-sm',
      dots: 'text-terruno-burgundy/60',
    },
    outline: {
      navBtn:
        'bg-white border border-terruno-brown text-terruno-brown hover:bg-terruno-brown hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      edgeBtn:
        'bg-white border border-terruno-brown/30 text-terruno-brown hover:bg-terruno-brown hover:text-white active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm',
      activePage:
        'bg-terruno-brown text-white font-bold shadow-sm',
      inactivePage:
        'bg-white border border-terruno-brown/20 text-terruno-brown hover:bg-terruno-brown/10 active:scale-95',
      dots: 'text-terruno-brown/60',
    },
  }[variant];

  return (
    <nav
      aria-label="Paginación"
      className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 select-none ${className}`}
    >
      {/* Botón Primera Página */}
      {showEdges && (
        <button
          type="button"
          onClick={handleFirst}
          disabled={currentPage === 1}
          aria-label="Ir a la primera página"
          className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${variantStyles.edgeBtn}`}
        >
          <ChevronsLeft size={16} />
        </button>
      )}

      {/* Botón Anterior */}
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${variantStyles.navBtn}`}
      >
        <ChevronLeft size={16} />
        <span className="hidden xs:inline sm:inline">Anterior</span>
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1 sm:gap-1.5 mx-0.5">
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <span
                key={`dots-${index}`}
                className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-semibold ${variantStyles.dots}`}
              >
                &#8230;
              </span>
            );
          }

          const page = Number(pageNumber);
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Página ${page}`}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive ? variantStyles.activePage : variantStyles.inactivePage
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Botón Siguiente */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${variantStyles.navBtn}`}
      >
        <span className="hidden xs:inline sm:inline">Siguiente</span>
        <ChevronRight size={16} />
      </button>

      {/* Botón Última Página */}
      {showEdges && (
        <button
          type="button"
          onClick={handleLast}
          disabled={currentPage === totalPages}
          aria-label="Ir a la última página"
          className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${variantStyles.edgeBtn}`}
        >
          <ChevronsRight size={16} />
        </button>
      )}
    </nav>
  );
};

export default Pagination;
