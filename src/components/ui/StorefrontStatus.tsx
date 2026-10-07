import React from 'react';

export const StorefrontLoading: React.FC = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-6 bg-terruno-bg"
    role="status"
    aria-live="polite"
  >
    <img
      src="/logoterruno_circle.png"
      alt="El Terruño"
      className="w-24 h-24 rounded-full object-cover animate-pulse"
    />
    <div className="w-8 h-8 rounded-full border-4 border-terruno-border border-t-terruno-burgundy animate-spin" aria-hidden="true" />
    <p className="text-terruno-burgundy">Cargando tienda...</p>
  </div>
);

interface StorefrontErrorProps {
  message: string;
  onRetry: () => void;
}

export const StorefrontError: React.FC<StorefrontErrorProps> = ({ message, onRetry }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-terruno-bg p-6 text-center" role="alert">
    <img src="/logoterruno_circle.png" alt="El Terruño" className="w-20 h-20 rounded-full object-cover opacity-80" />
    <p className="text-terruno-brown max-w-md">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="px-6 py-3 rounded-xl bg-terruno-burgundy text-white hover:bg-terruno-burgundy-dark transition-colors"
    >
      Reintentar
    </button>
  </div>
);
