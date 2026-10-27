import React, { useEffect, useState } from 'react';
import { CircleNotch, FloppyDisk } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { DiscountMethod, discountService } from '../../services/discountService';

const INPUT_CLASS = 'w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg';
const METHODS: { key: DiscountMethod; label: string }[] = [
  { key: 'efectivo', label: 'efectivo' },
  { key: 'transferencia', label: 'transferencia' },
];

const toPercentText = (rate: number) => String(Math.round(rate * 1000) / 10);

/**
 * Descuentos por método de pago. El porcentaje es el respaldo para productos sin precio propio por
 * método; el precio de cada producto se recalcula desde su formulario.
 */
export const DiscountSettings: React.FC = () => {
  const { discountRates, setDiscountRates } = useAdmin();
  const { showToast } = useToast();
  const saved = { efectivo: toPercentText(discountRates.efectivo), transferencia: toPercentText(discountRates.transferencia) };
  const [values, setValues] = useState(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues({ efectivo: toPercentText(discountRates.efectivo), transferencia: toPercentText(discountRates.transferencia) });
  }, [discountRates.efectivo, discountRates.transferencia]);

  const isDirty = values.efectivo !== saved.efectivo || values.transferencia !== saved.transferencia;

  const handleSave = async () => {
    if (!values.efectivo.trim() || !values.transferencia.trim()) {
      showToast('Completá los dos porcentajes (usá 0 para no aplicar descuento).', 'error');
      return;
    }
    const percents = { efectivo: Number(values.efectivo), transferencia: Number(values.transferencia) };
    setSaving(true);
    try {
      await discountService.saveDiscountPercents(percents);
      setDiscountRates({ ...discountRates, efectivo: percents.efectivo / 100, transferencia: percents.transferencia / 100 });
      showToast('Descuentos guardados', 'success');
    } catch (err) {
      console.error('Error saving discounts:', err);
      showToast(err instanceof Error && err.message ? err.message : 'Error al guardar los descuentos', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-terruno-muted">
        Se aplica a los productos que no tienen cargado su precio en efectivo o transferencia. Para actualizar el precio
        de un producto con el porcentaje nuevo, usá "Calcular con el descuento actual" en su ficha.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METHODS.map(({ key, label }) => (
          <div key={key}>
            <label htmlFor={`discount_${key}`} className="block text-sm font-medium text-terruno-muted mb-1">Descuento en {label} (%)</label>
            <input
              id={`discount_${key}`}
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={values[key]}
              onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={saving || !isDirty}
          onClick={handleSave}
          className="flex items-center gap-2 bg-terruno-burgundy text-white px-6 py-2.5 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {saving ? <CircleNotch className="w-5 h-5 animate-spin" /> : <FloppyDisk className="w-5 h-5" />}
          <span>Guardar descuentos</span>
        </button>
      </div>
    </div>
  );
};

export default DiscountSettings;
