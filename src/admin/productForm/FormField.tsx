import React from 'react';

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

export const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, error, onChange, placeholder, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-terruno-muted mb-1">{label}</label>
    <select id={name} name={name} value={value} onChange={onChange} className={inputClasses(!!error)}>
      {placeholder && <option value="" disabled={placeholder.disabled}>{placeholder.label}</option>}
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
