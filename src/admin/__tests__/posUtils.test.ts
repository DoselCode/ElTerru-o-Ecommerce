import { describe, it, expect } from 'vitest';
import { EMPTY_REGISTER, Order, OrderItem, RegisterState } from '../types';
import { calculateTotals, formatMoney, getNextTicketNumber, getRegisterSummary, getUnitPrice, padNumber, sumByMethod } from '../utils/posUtils';

const order = (overrides: Partial<Order>): Order => ({
  id: crypto.randomUUID(), client: 'Consumidor Final', total: 0, neto: 0, iva: 0, descuento: 0,
  paymentMethod: 'efectivo', date: '2026-09-28', status: 'pagado', items: [],
  ...overrides,
});

const item = (overrides: Partial<OrderItem>): OrderItem => ({
  id: '1', code: '0001', name: 'Trucha Ahumada al Natural', category: 'DANKON', price: 12700,
  image: '', description: '', stock: 4, cartQty: 1, ...overrides,
});

describe('posUtils', () => {
  it('formatea montos en pesos argentinos', () => {
    expect(formatMoney(2100)).toBe('$2.100,00');
    expect(padNumber(29022, 8)).toBe('00029022');
  });

  it('calcula el próximo número de ticket', () => {
    expect(getNextTicketNumber([])).toBe(1);
    expect(getNextTicketNumber([order({ ticketNumber: 7 }), order({}), order({ ticketNumber: 3 })])).toBe(8);
  });

  describe('precios por método de pago', () => {
    const trucha = item({ priceEfectivo: 11400, priceTransferencia: 12100 });

    it('usa el precio redondeado del catálogo cuando existe', () => {
      expect(getUnitPrice(trucha, 'efectivo')).toBe(11400);
      expect(getUnitPrice(trucha, 'transferencia')).toBe(12100);
      expect(getUnitPrice(trucha, 'tarjeta')).toBe(12700);
      expect(getUnitPrice(trucha, 'mercadopago')).toBe(12700);
    });

    it('aplica el porcentaje cuando el producto no tiene precio por método', () => {
      const sinPrecios = item({});
      expect(getUnitPrice(sinPrecios, 'efectivo')).toBeCloseTo(11430);
      expect(getUnitPrice(sinPrecios, 'transferencia')).toBeCloseTo(12065);
    });

    it('calcula subtotal, descuento e IVA sobre el total cobrado', () => {
      const totals = calculateTotals([{ ...trucha, cartQty: 2 }], 'efectivo', 0.21);
      expect(totals.subtotal).toBe(25400);
      expect(totals.total).toBe(22800);
      expect(totals.descuento).toBe(2600);
      expect(totals.neto + totals.iva).toBeCloseTo(22800);
      expect(totals.iva).toBeCloseTo(22800 - 22800 / 1.21);
    });
  });

  it('suma por método ignorando ventas anuladas', () => {
    const totals = sumByMethod([
      order({ total: 1000, paymentMethod: 'efectivo' }),
      order({ total: 500, paymentMethod: 'tarjeta' }),
      order({ total: 700, paymentMethod: 'mercadopago' }),
      order({ total: 9999, paymentMethod: 'efectivo', status: 'anulada' }),
    ]);
    expect(totals).toEqual({ efectivo: 1000, transferencia: 0, tarjeta: 500, mercadopago: 700 });
  });

  it('resume la caja solo con las ventas posteriores a la apertura', () => {
    const reg: RegisterState = {
      ...EMPTY_REGISTER,
      status: 'abierta',
      efectivoInicial: 32300,
      openedAt: '2026-09-28T11:55:00.000Z',
      movimientos: [
        { id: 'a', type: 'egreso', amount: 1000, reason: 'Flete', createdAt: '2026-09-28T13:00:00.000Z' },
      ],
    };
    const orders = [
      order({ total: 5000, createdAt: '2026-09-28T10:00:00.000Z' }),
      order({ total: 100000, createdAt: '2026-09-28T12:00:00+00:00' }),
      order({ total: 32700, paymentMethod: 'tarjeta', createdAt: '2026-09-28T14:00:00.000Z' }),
      order({ total: 8000, status: 'anulada', createdAt: '2026-09-28T15:00:00.000Z' }),
    ];

    const s = getRegisterSummary(reg, orders);
    expect(s.sessionOrders).toHaveLength(2);
    expect(s.totalFacturado).toBe(132700);
    expect(s.totalEnCaja).toBe(32300 + 132700 - 1000);
    expect(s.efectivoEnCajon).toBe(32300 + 100000 - 1000);
    expect(s.cantidadMovimientos).toBe(3);
  });
});
