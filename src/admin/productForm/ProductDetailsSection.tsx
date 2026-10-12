import React from 'react';
import { FormField } from './FormField';
import type { FormErrors, ProductFormValues } from './productFormUtils';

type FieldProps = (name: keyof ProductFormValues & string) => {
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

interface ProductDetailsSectionProps {
  form: ProductFormValues;
  errors: FormErrors;
  fieldProps: FieldProps;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  title: React.ReactNode;
}

export const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({ form, fieldProps, onChange, title }) => (
  <div className="space-y-4">
    {title}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Bodega / Productor (opcional)" placeholder="ej: Catena Zapata" maxLength={100} {...fieldProps('winery')} />
      <FormField label="Año / Cosecha (opcional)" placeholder="ej: 2021" maxLength={4} {...fieldProps('year')} />
    </div>
    <FormField label="Maridaje sugerido (opcional)" placeholder="ej: Carnes rojas, quesos duros y pastas con salsas intensas" maxLength={250} {...fieldProps('pairing')} />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Stock *" type="number" integer min={0} max={999999} placeholder="0" {...fieldProps('stock')} />
      <FormField label="Etiqueta Especial (opc.)" placeholder="ej: Novedad, Destacado" maxLength={30} {...fieldProps('badge')} />
      <FormField label="Desc. Etiqueta (autocompleta %)" placeholder="ej: -20%" maxLength={20} {...fieldProps('discount_badge')} />
    </div>

    <div className="flex items-center gap-2 mt-4">
      <input
        type="checkbox"
        id="is_visible"
        name="is_visible"
        checked={form.is_visible}
        onChange={onChange}
        className="w-4 h-4 text-terruno-burgundy bg-terruno-bg border-terruno-border rounded focus:ring-terruno-burgundy"
      />
      <label htmlFor="is_visible" className="text-sm font-medium text-terruno-brown">Visible en la tienda</label>
    </div>
  </div>
);
