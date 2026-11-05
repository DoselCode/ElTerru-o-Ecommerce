/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import type { Product, StoreInfo } from '../../../types/product';
import { Catalog } from '../Catalog';

vi.mock('../ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => <div data-testid="card">{product.name}</div>,
}));
vi.mock('../../ui/ProductModal', () => ({ ProductModal: () => null }));
vi.mock('../../ui/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const product = (name: string, stock: number): Product => ({
  id: name,
  code: name,
  name,
  category: 'Vinos',
  price: 1000,
  image: '',
  description: '',
  stock,
  isVisible: true,
});

const cardNames = () => screen.getAllByTestId('card').map((el) => el.textContent);

describe('Catalog', () => {
  afterEach(() => cleanup());

  it('muestra los productos sin stock al final, manteniendo el orden del resto', () => {
    const products = [
      product('A', 0),
      product('B', 5),
      product('C', 0),
      product('D', 2),
    ];
    render(<Catalog products={products} storeInfo={{ name: 'Test' } as StoreInfo} />);

    expect(cardNames()).toEqual(['B', 'D', 'A', 'C']);
  });

  it('manda los sin stock a las últimas páginas', () => {
    const products = [
      ...Array.from({ length: 4 }, (_, i) => product(`agotado-${i}`, 0)),
      ...Array.from({ length: 8 }, (_, i) => product(`disponible-${i}`, 3)),
    ];
    render(<Catalog products={products} storeInfo={{ name: 'Test' } as StoreInfo} />);

    expect(cardNames().every((name) => name?.startsWith('disponible'))).toBe(true);
  });
});
