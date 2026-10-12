import React from 'react';

interface PaginatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Cuántos números de página mostrar en el rango central. Default: 5 */
  windowSize?: number;
}

/**
 * Paginador reutilizable.
 * Muestra: [<] [1] ... [n-2] [n-1] [n] [n+1] [n+2] ... [last] [>]
 */
export const Paginator: React.FC<PaginatorProps> = ({ page, totalPages, onPageChange, windowSize = 5 }) => {
  if (totalPages <= 1) return null;

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  const pages: (number | '...')[] = [];
  if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }

  return (
    <div className="paginator">
      <button
        className="paginator-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="paginator-ellipsis">…</span>
          : <button
              key={p}
              className={`paginator-btn${p === page ? ' paginator-btn--active' : ''}`}
              onClick={() => onPageChange(p as number)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
      )}

      <button
        className="paginator-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </div>
  );
};

/** Hook helper para calcular la página y el slice de datos */
export function usePaginator<T>(items: T[], pageSize: number) {
  const [page, setPage] = React.useState(1);

  // Resetear a página 1 cuando cambia la lista (filtros, búsqueda, etc.)
  React.useEffect(() => { setPage(1); }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { page: safePage, totalPages, setPage, slice };
}
