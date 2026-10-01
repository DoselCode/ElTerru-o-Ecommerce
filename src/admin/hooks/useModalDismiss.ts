import { useEffect, useCallback } from 'react';

interface UseModalDismissOptions {
  onClose: () => void;
  closeOnBackdrop?: boolean;
}

export const useModalDismiss = ({ onClose, closeOnBackdrop = false }: UseModalDismissOptions) => {
  // Manejador para la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // En una app con múltiples modales apilados se debería verificar cuál es el top-most.
        // Como acá abrimos uno a la vez por módulo/contexto, basta con frenar propagación
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Manejador para el click en el backdrop overlay
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose, closeOnBackdrop]
  );

  return { handleBackdropClick };
};
