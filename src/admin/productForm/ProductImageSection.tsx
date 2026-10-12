import React from 'react';
import { UploadSimple, Image as ImageIcon } from '@phosphor-icons/react';

interface ProductImageSectionProps {
  title: React.ReactNode;
  required: boolean;
  error?: string;
  preview: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductImageSection: React.FC<ProductImageSectionProps> = ({ title, required, error, preview, onChange }) => (
  <div className="space-y-4">
    {title}
    <div className="flex flex-col md:flex-row items-start gap-6">
      <div className="flex-1 w-full space-y-3">
        <label className="block text-sm font-medium text-terruno-muted">
          Seleccionar Imagen {required && '*'}
        </label>
        <label className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer bg-terruno-bg hover:bg-terruno-border/60 transition-all text-center min-h-[125px] ${error ? 'border-red-500' : 'border-terruno-border'}`}>
          <UploadSimple className="w-6 h-6 text-terruno-muted" />
          <span className="text-sm font-medium text-terruno-brown block">Subir de este equipo</span>
          <span className="text-[11px] text-terruno-muted">JPG, PNG, WebP</span>
          <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      <div className="flex flex-col items-center sm:items-start self-center md:self-start">
        <span className="text-xs font-medium text-terruno-muted mb-2">Vista Previa</span>
        {preview ? (
          <div className="w-32 h-32 rounded-xl border border-terruno-border overflow-hidden bg-terruno-bg shadow-xs">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-xl border border-terruno-border border-dashed bg-terruno-bg flex flex-col items-center justify-center text-terruno-muted text-center p-2">
            <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[10px]">Sin imagen</span>
          </div>
        )}
      </div>
    </div>
  </div>
);