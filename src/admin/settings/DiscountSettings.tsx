import React, { useEffect, useState } from 'react';
import { ArrowsClockwise, CircleNotch, FloppyDisk } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { DiscountMethod, discountService } from '../../services/discountService';

const INPUT_CLASS = 'w-full p-3 rounded-xl border border-terruno-border bg-terruno-bg';
const METHODS: { key: DiscountMethod; label: string }[] = [
  { key: 'efectivo', label: 'efectivo' },
  { key: 'transferencia', label: 'transferencia' },
];

const toPercentText = (rate: number) => String(Math.round(rate * 1000) / 10);

/**
 * Descuentos por método de pago. El porcentaje es el respaldo para productos sin precio propio por
 * método; "Recalcular" reescribe ese precio en todos los productos con el porcentaje guardado.
 */
export const DiscountSettings: React.FC = () => {
  const { discountRates, setDiscountRates, refreshProducts } = useAdmin();
  const { showToast } = useToast();
  const saved = { efectivo: toPercentText(discountRates.efectivo), transferencia: toPercentText(discountRates.transferencia) };
  const [values, setValues] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState<DiscountMethod | null>(null);
  const [confirming, setConfirming] = useState<DiscountMethod | null>(null);

  useEffect(() => {
    setValues({ efectivo: toPercentText(discountRates.efectivo), transferencia: toPercentText(discountRates.transferencia) });
  }, [discountRates.efectivo, discountRates.transferencia]);

  const isDirty = values.efectivo !== saved.efectivo || values.transferencia !== saved.transferencia;
  const busy = saving || recalculating !== null;

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

  const handleRecalculate = async (method: DiscountMethod) => {
    setConfirming(null);
    setRecalculating(method);
    try {
      const count = await discountService.recalculateMethodPrices(method);
      await refreshProducts();
      showToast(`Se actualizó el precio en ${method} de ${count} productos`, 'success');
    } catch (err) {
      console.error('Error recalculating prices:', err);
      showToast(err instanceof Error && err.message ? err.message : 'Error al recalcular los precios', 'error');
    } finally {
      setRecalculating(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-terruno-muted">
        Se aplica a los productos que no tienen cargado su precio en efectivo o transferencia. Para cambiar también
        esos precios, guardá el porcentaje y usá "Recalcular".
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METHODS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label htmlFor={`discount_${key}`} className="block text-sm font-medium text-terruno-muted">Descuento en {label} (%)</label>
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
            <button
              type="button"
              disabled={busy || isDirty}
              title={isDirty ? 'Guardá los descuentos antes de recalcular' : undefined}
              onClick={() => setConfirming(key)}
              className="flex items-center gap-2 text-sm text-terruno-burgundy disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recalculating === key ? <CircleNotch className="w-4 h-4 animate-spin" /> : <ArrowsClockwise className="w-4 h-4" />}
              Recalcular precios en {label}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy || !isDirty}
          onClick={handleSave}
          className="flex items-center gap-2 bg-terruno-burgundy text-white px-6 py-2.5 rounded-xl hover:bg-terruno-burgundy-light transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {saving ? <CircleNotch className="w-5 h-5 animate-spin" /> : <FloppyDisk className="w-5 h-5" />}
          <span>Guardar descuentos</span>
        </button>
      </div>

      {confirming && (
        <ConfirmModal
          title="Recalcular precios"
          message={`Se va a reescribir el precio en ${confirming} de TODOS los productos: precio de lista menos ${saved[confirming]}%, redondeado a $100. ¿Continuar?`}
          confirmLabel="Recalcular"
          isDestructive
          onConfirm={() => handleRecalculate(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
};

export default DiscountSettings;
