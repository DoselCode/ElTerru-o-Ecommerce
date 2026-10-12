import React from 'react';
import { CheckCircle, PlusCircle } from '@phosphor-icons/react';
import { ModalCloseButton } from '../components/ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface ProductSavedModalProps {
  isEditing: boolean;
  productName: string;
  onClose: () => void;
  onGoToList: () => void;
  onCreateAnother: () => void;
}

export const ProductSavedModal: React.FC<ProductSavedModalProps> = ({ isEditing, productName, onClose, onGoToList, onCreateAnother }) => {
  const { handleBackdropClick } = useModalDismiss({ onClose, closeOnBackdrop: true });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" onClick={handleBackdropClick}>
      <div className="bg-white rounded-3xl relative p-6 sm:p-8 w-full max-w-md shadow-2xl border border-terruno-border text-center space-y-5 animate-in zoom-in-95 duration-200">
        <ModalCloseButton onClick={onClose} />
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-serif font-bold text-terruno-brown">
            {isEditing ? '¡Producto Actualizado!' : '¡Producto Creado con Éxito!'}
          </h3>
          <p className="text-sm text-terruno-muted leading-relaxed">
            El producto <strong className="text-terruno-brown">&ldquo;{productName}&rdquo;</strong> se guardó correctamente y ya está actualizado en el catálogo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onGoToList}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-terruno-burgundy text-white font-medium hover:bg-terruno-burgundy-light transition-all shadow-sm cursor-pointer"
          >
            Volver al listado
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-terruno-bg border border-terruno-border text-terruno-brown font-medium hover:bg-terruno-border/60 transition-all cursor-pointer"
            >
              Continuar editando
            </button>
          ) : (
            <button
              type="button"
              onClick={onCreateAnother}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-terruno-bg border border-terruno-border text-terruno-brown font-medium hover:bg-terruno-border/60 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-terruno-olive" />
              <span>Crear otro</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};