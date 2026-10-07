// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentModal } from '../components/PaymentModal';
import type { OrderItem } from '../types';

const items: OrderItem[] = [{
  id: '1', code: '0001', name: 'Trucha Ahumada al Natural', category: 'DANKON', price: 12700,
  priceEfectivo: 11400, priceTransferencia: 12100, image: '', description: '', stock: 4, cartQty: 1,
}];

describe('PaymentModal', () => {
  it('shows the rounded catalog price of each payment method and confirms the selected one', () => {
    const onConfirm = vi.fn();
    render(<PaymentModal items={items} onCancel={vi.fn()} onConfirm={onConfirm} />);

    expect(screen.getByText('$11.400,00', { selector: 'h2' })).toBeTruthy();

    fireEvent.click(screen.getByText(/Transferencia/));
    expect(screen.getByText('$12.100,00', { selector: 'h2' })).toBeTruthy();

    fireEvent.click(screen.getByText('Confirmar Cobro'));
    expect(onConfirm).toHaveBeenCalledWith('transferencia', '');
  });
});
