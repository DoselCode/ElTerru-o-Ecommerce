// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { PaymentModal } from '../components/PaymentModal';
import type { OrderItem } from '../types';

const items: OrderItem[] = [{
  id: '1', code: '0001', name: 'Trucha Ahumada al Natural', category: 'DANKON', price: 12700,
  priceEfectivo: 11400, priceTransferencia: 12100, image: '', description: '', stock: 4, cartQty: 1,
}];

afterEach(cleanup);

describe('PaymentModal', () => {
  it('shows the rounded catalog price of each payment method and confirms the selected one', () => {
    const onConfirm = vi.fn();
    render(<PaymentModal items={items} onCancel={vi.fn()} onConfirm={onConfirm} />);

    expect(screen.getByText('$11.400,00', { selector: 'h2' })).toBeTruthy();

    fireEvent.click(screen.getByText(/Transferencia/));
    expect(screen.getByText('$12.100,00', { selector: 'h2' })).toBeTruthy();

    fireEvent.click(screen.getByText('Confirmar Cobro'));
    expect(onConfirm).toHaveBeenCalledWith('transferencia', '', true);
  });

  it('shows the real discount percentage of the cart instead of the nominal one', () => {
    render(<PaymentModal items={items} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    // 12700 -> 11400 es 10,2%, no 10%
    expect(screen.getByText(/Descuento del 10,2%/)).toBeTruthy();
    expect(screen.getByText(/Efectivo \(-10,2%\)/)).toBeTruthy();
    expect(screen.getByText(/Transferencia \(-4,7%\)/)).toBeTruthy();
  });

  it('charges the list price when "sin descuento" is checked', () => {
    const onConfirm = vi.fn();
    render(<PaymentModal items={items} onCancel={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByLabelText(/Cobrar sin descuento/));
    expect(screen.getByText('$12.700,00', { selector: 'h2' })).toBeTruthy();
    expect(screen.queryByText(/Descuento del/)).toBeNull();

    fireEvent.click(screen.getByText('Confirmar Cobro'));
    expect(onConfirm).toHaveBeenCalledWith('efectivo', '', false);
  });

  it('applies the configured rate to products without a per-method price', () => {
    const plain: OrderItem[] = [{ ...items[0], priceEfectivo: undefined, priceTransferencia: undefined, price: 10000 }];
    const rates = { efectivo: 0.05, transferencia: 0.10, credito: 0, debito: 0 };
    render(<PaymentModal items={plain} rates={rates} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('$9.500,00', { selector: 'h2' })).toBeTruthy();
    expect(screen.getByText(/Efectivo \(-5%\)/)).toBeTruthy();
  });

  it('hides the toggle for card payments', () => {
    render(<PaymentModal items={items} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByText(/Tarjeta Débito/));
    expect(screen.queryByLabelText(/Cobrar sin descuento/)).toBeNull();
  });
});
