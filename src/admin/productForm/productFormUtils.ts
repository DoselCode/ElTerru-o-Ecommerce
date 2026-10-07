import type { ProductRow } from '../../types/product';

export interface ProductFormValues {
  code: string;
  name: string;
  year: string;
  category: string;
  category_id: string;
  provider_id: string;
  supplier: string;
  price: string;
  price_efectivo: string;
  price_transferencia: string;
  original_price: string;
  discount_badge: string;
  badge: string;
  description: string;
  winery: string;
  pairing: string;
  stock: string;
  is_visible: boolean;
  image: string;
}

export type FormErrors = Record<string, string>;

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  code: '',
  name: '',
  year: '',
  category: 'Vinos',
  category_id: '',
  provider_id: '',
  supplier: '',
  price: '',
  price_efectivo: '',
  price_transferencia: '',
  original_price: '',
  discount_badge: '',
  badge: '',
  description: '',
  winery: '',
  pairing: '',
  stock: '0',
  is_visible: true,
  image: '',
};

export const CATEGORIES = ['Vinos', 'Almacén', 'Fiambres', 'Regalos'];

export const productFormFromRow = (row: ProductRow): ProductFormValues => ({
  code: row.code || '',
  name: row.name || '',
  year: row.year || '',
  category: row.category || 'Vinos',
  category_id: row.category_id || '',
  provider_id: row.provider_id || '',
  supplier: row.supplier || '',
  price: row.price ? String(row.price) : '',
  price_efectivo: row.price_efectivo ? String(row.price_efectivo) : '',
  price_transferencia: row.price_transferencia ? String(row.price_transferencia) : '',
  original_price: row.original_price ? String(row.original_price) : '',
  discount_badge: row.discount_badge || '',
  badge: row.badge || '',
  description: row.description || '',
  winery: row.winery || '',
  pairing: row.pairing || '',
  stock: row.stock != null ? String(row.stock) : '0',
  is_visible: row.is_visible ?? true,
  image: row.image || '',
});

const trimmedOrNull = (value: string) => (value.trim() ? value.trim() : null);
const numberOrNull = (value: string) => (value ? Number(value) : null);

/** Convierte el formulario (todo strings) al payload de la BD: vacíos a null y números parseados. */
export const productFormToPayload =(form: ProductFormValues, image: string) => ({
  code: trimmedOrNull(form.code),
  name: form.name.trim(),
  year: trimmedOrNull(form.year),
  category: form.category || 'Vinos',
  category_id: form.category_id || null,
  provider_id: form.provider_id || null,
  supplier: trimmedOrNull(form.supplier),
  price: Number(form.price),
  price_efectivo: numberOrNull(form.price_efectivo),
  price_transferencia: numberOrNull(form.price_transferencia),
  original_price: numberOrNull(form.original_price),
  discount_badge: trimmedOrNull(form.discount_badge),
  badge: trimmedOrNull(form.badge),
  description: form.description.trim(),
  winery: trimmedOrNull(form.winery),
  pairing: trimmedOrNull(form.pairing),
  stock: parseInt(form.stock) || 0,
  is_visible: form.is_visible,
  image,
});

/** Mantiene el badge de descuento sincronizado con el precio original cuando el badge es un porcentaje. */
export const withAutoDiscountBadge = (prev: ProductFormValues, next: ProductFormValues, changedField: string): ProductFormValues => {
  if (changedField !== 'price' && changedField !== 'original_price') return next;

  const price = parseFloat(next.price);
  const original = parseFloat(next.original_price);
  if (original > 0 && price > 0 && original > price) {
    return { ...next, discount_badge: `-${Math.round(((original - price) / original) * 100)}%` };
  }
  const badgeIsPercentage = prev.discount_badge.startsWith('-') && prev.discount_badge.endsWith('%');
  if (changedField === 'original_price' && !(original > 0) && badgeIsPercentage) {
    return { ...next, discount_badge: '' };
  }
  return next;
};

const isPositiveNumber = (value: string) => value.trim() !== '' && Number(value) > 0;

/** Devuelve un mapa campo → mensaje; queda vacío si el formulario es válido. */
export const validateProductForm =(form: ProductFormValues, hasImage: boolean, isEditing: boolean): FormErrors => {
  const errors: FormErrors = {};
  const name = form.name.trim();
  const description = form.description.trim();

  if (!name) errors.name = 'El nombre del producto es obligatorio.';
  else if (name.length < 2) errors.name = 'El nombre debe contener al menos 2 caracteres.';
  else if (name.length > 100) errors.name = 'El nombre no puede superar los 100 caracteres.';

  if (!form.category_id) errors.category_id = 'Seleccioná una categoría.';
  // if (!form.category) errors.category = 'Seleccioná una categoría.';

  if (form.code.trim() && !/^\d{1,6}$/.test(form.code.trim())) errors.code = 'El código debe ser numérico (ej: 0125).';

  if (!form.price.trim()) errors.price = 'El precio es obligatorio.';
  else if (!isPositiveNumber(form.price)) errors.price = 'Ingresá un precio válido mayor a 0.';
  else if (Number(form.price) > 999999999) errors.price = 'El precio excede el límite permitido.';

  for (const field of ['price_efectivo', 'price_transferencia'] as const) {
    if (form[field].trim() && !isPositiveNumber(form[field])) errors[field] = 'Ingresá un precio válido mayor a 0 o dejalo vacío.';
  }

  if (form.original_price.trim()) {
    const original = Number(form.original_price);
    if (!(original > 0)) errors.original_price = 'El precio original debe ser mayor a 0.';
    else if (original <= Number(form.price)) errors.original_price = 'El precio original debe ser mayor al precio con descuento.';
    else if (original > 999999999) errors.original_price = 'El precio original excede el límite permitido.';
  }

  if (!form.stock.trim()) {
    errors.stock = 'El stock es obligatorio (usá 0 si no hay stock).';
  } else {
    const stock = Number(form.stock);
    if (!Number.isInteger(stock) || stock < 0) errors.stock = 'El stock debe ser un número entero mayor o igual a 0.';
    else if (stock > 999999) errors.stock = 'El stock no puede superar las 999.999 unidades.';
  }

  if (form.year.trim()) {
    const maxYear = new Date().getFullYear() + 2;
    const year = Number(form.year.trim());
    if (!/^\d{4}$/.test(form.year.trim()) || year < 1900 || year > maxYear) {
      errors.year = `Ingresá un año válido de 4 dígitos (1900 - ${maxYear}).`;
    }
  }

  if (!description) errors.description = 'La descripción del producto es obligatoria.';
  else if (description.length < 5) errors.description = 'La descripción debe tener al menos 5 caracteres.';
  else if (description.length > 1000) errors.description = 'La descripción no puede superar los 1000 caracteres.';

  if (form.supplier.trim().length > 60) errors.supplier = 'El proveedor no puede superar los 60 caracteres.';
  if (form.winery.trim().length > 100) errors.winery = 'La bodega no puede superar los 100 caracteres.';
  if (form.pairing.trim().length > 250) errors.pairing = 'El maridaje no puede superar los 250 caracteres.';
  if (form.badge.trim().length > 30) errors.badge = 'La etiqueta no puede superar los 30 caracteres.';
  if (form.discount_badge.trim().length > 20) errors.discount_badge = 'El badge de descuento no puede superar los 20 caracteres.';

  if (!hasImage) {
    errors.image = isEditing ? 'El producto debe tener una imagen asignada.' : 'Debés subir una imagen del producto.';
  }

  return errors;
};

