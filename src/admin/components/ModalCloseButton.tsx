import React from 'react';
import { X } from '@phosphor-icons/react';

interface ModalCloseButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
  iconSize?: number;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
  ariaLabel = 'Cerrar',
  className = '',
  iconSize = 24
}) => {
  return (
    <button
      type="button"
      className={`modal-close ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <X size={iconSize} aria-hidden="true" weight="bold" />
    </button>
  );
};
