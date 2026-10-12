import React from 'react';
import { Leaf, Gift, Package, Wine, Drop, Cheese, Basket, Cookie } from '@phosphor-icons/react';

const ICON_RULES: Array<{ keywords: string[]; icon: React.ElementType }> = [
  { keywords: ['vino', 'malbec', 'cabernet', 'chardonnay'], icon: Wine },
  { keywords: ['aceite', 'aceto', 'vinagre', 'oliva'], icon: Drop },
  { keywords: ['queso', 'provoleta'], icon: Cheese },
  { keywords: ['fiambre', 'picada', 'salame', 'jamón'], icon: Basket },
  { keywords: ['mermelada', 'pasta', 'dulce', 'miel'], icon: Cookie },
  { keywords: ['regalo', 'combo', 'box'], icon: Gift },
  { keywords: ['almacén', 'almacen'], icon: Leaf },
];

export const getProductIcon = (name: string, category: string) => {
  const haystack = `${name || ''} ${category || ''}`.toLowerCase();
  const match = ICON_RULES.find(rule => rule.keywords.some(k => haystack.includes(k)));
  const Icon = match?.icon ?? Package;
  return <Icon weight="fill" />;
};
