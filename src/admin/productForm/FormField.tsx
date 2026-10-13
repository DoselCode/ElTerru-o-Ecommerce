import React, { useEffect, useRef, useState } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: 'text' | 'number';
  maxLength?: number;
  step?: string;
  max?: number;
  min?: number;
  integer?: boolean;
  rows?: number;
  placeholder?: string;
}

const inputClasses = (hasError: boolean) =>
  `w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${hasError ? 'border-red-500' : 'border-terruno-border'}`;

const sanitizeNumeric = (raw: string, isInteger: boolean, maxDigits?: number) => {
  let v = isInteger ? raw.replace(/\D/g, '') : raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
  if (!isInteger) v = v.replace(/^(\d*\.\d{0,2}).*$/, '$1');
  if (maxDigits && v.length > maxDigits) v = v.slice(0, maxDigits);
  return v;
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  error,
  onChange,
  type = 'text',
  maxLength,
  rows,
  max,
  min,
  integer,
  ...inputProps
}) => {
  const isNumeric = type === 'number';
  const isInteger = integer ?? (name === 'stock');
  const maxDigits = isNumeric && max ? String(max).length : maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isNumeric) {
      const clean = sanitizeNumeric(e.target.value, isInteger, maxDigits);
      if (max !== undefined && clean !== '' && Number(clean) > max) return;
      e.target.value = clean;
    }
    onChange(e);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-terruno-muted">{label}</label>
        {maxLength && !isNumeric && <span className="text-[11px] text-terruno-muted">{value.length}/{maxLength}</span>}
      </div>
      {rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={inputClasses(!!error)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-err` : undefined}
          {...inputProps}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          inputMode={isNumeric ? (isInteger ? 'numeric' : 'decimal') : undefined}
          maxLength={maxDigits}
          value={value}
          onChange={handleChange}
          className={inputClasses(!!error)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-err` : undefined}
          {...inputProps}
        />
      )}
      {error && <p id={`${name}-err`} role="alert" className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: { label: string; disabled?: boolean };
  options: { id: string; name: string }[];
}

/**
 * Combo con buscador. Reemplaza al <select> nativo, cuyo desplegable se abre hacia arriba
 * (y tapa la pantalla) cuando hay muchas opciones y el campo está abajo en la página.
 * La lista siempre se abre hacia abajo, con alto máximo y scroll propio.
 */
export const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, error, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const normalized = query.trim().toLowerCase();
  const filtered = normalized ? options.filter(o => o.name.toLowerCase().includes(normalized)) : options;
  // Ítem vacío ("Ninguno" o el placeholder) para poder limpiar la selección cuando es opcional
  const showEmpty = Boolean(placeholder) && !placeholder?.disabled && !normalized;
  const items = showEmpty ? [{ id: '', name: placeholder!.label }, ...filtered] : filtered;
  const selected = options.find(o => o.id === value);
  const buttonLabel = selected?.name ?? placeholder?.label ?? '';

  const close = () => { setOpen(false); setQuery(''); };

  const select = (id: string) => {
    // Misma forma que un cambio del <select> para no tocar los handlers del formulario
    onChange({ target: { name, value: id, type: 'select-one' } } as unknown as React.ChangeEvent<HTMLSelectElement>);
    close();
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    listRef.current?.scrollIntoView?.({ block: 'nearest' });
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => { setActive(0); }, [query, open]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, items.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) select(items[active].id); }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={open ? handleKeyDown : undefined}>
      <label htmlFor={name} className="block text-sm font-medium text-terruno-muted mb-1">{label}</label>
      <button
        type="button"
        id={name}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={!!error}
        onClick={() => (open ? close() : setOpen(true))}
        className={`${inputClasses(!!error)} flex items-center justify-between gap-2 text-left cursor-pointer ${selected ? '' : 'text-terruno-muted'}`}
      >
        <span className="truncate">{buttonLabel}</span>
        <span aria-hidden className="text-xs text-terruno-muted">▾</span>
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border border-terruno-border bg-white shadow-lg overflow-hidden">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..."
            aria-label={`Buscar ${label}`}
            className="w-full px-3 py-2 border-b border-terruno-border bg-white text-sm focus:outline-none"
          />
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {items.length === 0 && <li className="px-3 py-2 text-sm text-terruno-muted">Sin resultados</li>}
            {items.map((o, i) => (
              <li
                key={o.id || '__empty'}
                role="option"
                aria-selected={o.id === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(o.id)}
                className={`px-3 py-2 text-sm cursor-pointer ${i === active ? 'bg-terruno-bg' : ''} ${o.id === value ? 'font-semibold text-terruno-burgundy' : 'text-terruno-brown'}`}
              >
                {o.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
