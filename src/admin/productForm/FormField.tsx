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
  rows?: number;
  placeholder?: string;
}

const inputClasses = (hasError: boolean) =>
  `w-full p-3 rounded-xl border bg-terruno-bg focus:outline-none focus:ring-2 focus:ring-terruno-burgundy/20 focus:border-terruno-burgundy transition-all ${hasError ? 'border-red-500' : 'border-terruno-border'}`;

export const FormField: React.FC<FormFieldProps> = ({ label, name, value, error, onChange, type = 'text', maxLength, rows, ...inputProps }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label htmlFor={name} className="block text-sm font-medium text-terruno-muted">{label}</label>
      {maxLength && <span className="text-[11px] text-terruno-muted">{value.length}/{maxLength}</span>}
    </div>
    {rows ? (
      <textarea id={name} name={name} rows={rows} maxLength={maxLength} value={value} onChange={onChange} className={inputClasses(!!error)} {...inputProps} />
    ) : (
      <input id={name} type={type} name={name} maxLength={maxLength} value={value} onChange={onChange} className={inputClasses(!!error)} {...inputProps} />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
