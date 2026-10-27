// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiscountSettings } from '../settings/DiscountSettings';
import { discountService } from '../../services/discountService';

const setDiscountRates = vi.fn();
const refreshProducts = vi.fn().mockResolvedValue(undefined);
const showToast = vi.fn();

vi.mock('../context/AdminContext', () => ({
  useAdmin: () => ({
    discountRates: { efectivo: 0.10, transferencia: 0.10, credito: 0, debito: 0 },
    setDiscountRates,
    refreshProducts,
  }),
}));
vi.mock('../context/ToastContext', () => ({ useToast: () => ({ showToast }) }));
vi.mock('../../services/discountService', () => ({
  discountService: {
    saveDiscountPercents: vi.fn().mockResolvedValue(undefined),
    recalculateMethodPrices: vi.fn().mockResolvedValue(42),
  },
}));

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe('DiscountSettings', () => {
  it('saves the edited cash percentage', async () => {
    render(<DiscountSettings />);
    const cash = screen.getByLabelText(/Descuento en efectivo/) as HTMLInputElement;
    expect(cash.value).toBe('10');

    fireEvent.change(cash, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Guardar descuentos'));

    await waitFor(() => expect(discountService.saveDiscountPercents).toHaveBeenCalledWith({ efectivo: 5, transferencia: 10 }));
    expect(setDiscountRates).toHaveBeenCalledWith({ efectivo: 0.05, transferencia: 0.10, credito: 0, debito: 0 });
  });

  it('does not save an empty percentage as 0%', () => {
    render(<DiscountSettings />);
    fireEvent.change(screen.getByLabelText(/Descuento en efectivo/), { target: { value: '' } });
    fireEvent.click(screen.getByText('Guardar descuentos'));

    expect(discountService.saveDiscountPercents).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Completá'), 'error');
  });

  it('blocks recalculation while there are unsaved changes', () => {
    render(<DiscountSettings />);
    fireEvent.change(screen.getByLabelText(/Descuento en efectivo/), { target: { value: '5' } });
    expect((screen.getByText(/Recalcular precios en efectivo/) as HTMLButtonElement).disabled).toBe(true);
  });

  it('recalculates prices only after confirming and reloads the products', async () => {
    render(<DiscountSettings />);
    fireEvent.click(screen.getByText(/Recalcular precios en efectivo/));
    expect(discountService.recalculateMethodPrices).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Recalcular'));
    await waitFor(() => expect(discountService.recalculateMethodPrices).toHaveBeenCalledWith('efectivo'));
    expect(refreshProducts).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('42'), 'success');
  });
});
