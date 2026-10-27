import { insforge } from '../lib/insforge';
import { DEFAULT_DISCOUNT_RATES, DiscountRates } from '../admin/utils/posUtils';

/** Métodos de pago con descuento editable. */
export type DiscountMethod = 'efectivo' | 'transferencia';

/** Porcentajes tal como se guardan en `store_info` (10 = 10%). */
export type DiscountPercents = Record<DiscountMethod, number>;

const CACHE_KEY = 'terruno_discount_rates';

const readCache = (): DiscountRates | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? { ...DEFAULT_DISCOUNT_RATES, ...JSON.parse(cached) } : null;
  } catch {
    return null;
  }
};

const writeCache = (rates: DiscountRates) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // Sin cache el POS usa los porcentajes por defecto cuando no hay conexión
  }
};

const toRate = (pct: unknown, fallback: number) => {
  const n = Number(pct);
  return pct === null || pct === undefined || Number.isNaN(n) ? fallback : n / 100;
};

export const discountService = {
  /** Último valor conocido (o el 10%), para arrancar el POS sin esperar a la red. */
  getCachedDiscountRates: (): DiscountRates => readCache() ?? DEFAULT_DISCOUNT_RATES,

  /** Lee los porcentajes de `store_info`; sin conexión (o sin las columnas) usa el último valor conocido o el 10%. */
  getDiscountRates: async (): Promise<DiscountRates> => {
    let response;
    try {
      response = await insforge.database
        .from('store_info')
        .select('discount_efectivo, discount_transferencia')
        .eq('id', 1)
        .single();
    } catch {
      return discountService.getCachedDiscountRates();
    }
    const { data, error } = response;
    if (error || !data) return discountService.getCachedDiscountRates();

    const row = data as { discount_efectivo?: number | string | null; discount_transferencia?: number | string | null };
    const rates: DiscountRates = {
      ...DEFAULT_DISCOUNT_RATES,
      efectivo: toRate(row.discount_efectivo, DEFAULT_DISCOUNT_RATES.efectivo),
      transferencia: toRate(row.discount_transferencia, DEFAULT_DISCOUNT_RATES.transferencia),
    };
    writeCache(rates);
    return rates;
  },

  saveDiscountPercents: async (percents: DiscountPercents): Promise<void> => {
    const values = Object.values(percents);
    if (values.some(v => !Number.isFinite(v) || v < 0 || v > 100)) {
      throw new Error('El descuento debe estar entre 0 y 100%.');
    }
    const { error } = await insforge.database
      .from('store_info')
      .update({ discount_efectivo: percents.efectivo, discount_transferencia: percents.transferencia })
      .eq('id', 1);
    if (error) throw error;
    writeCache({ ...DEFAULT_DISCOUNT_RATES, efectivo: percents.efectivo / 100, transferencia: percents.transferencia / 100 });
  },
};
