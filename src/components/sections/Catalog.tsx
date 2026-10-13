import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Category, StoreInfo } from '../../types/product';
import { ProductCard } from './ProductCard';
import { Reveal } from '../ui/Reveal';
import { Pagination } from '../ui/Pagination';
import { ProductModal } from '../ui/ProductModal';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface CatalogProps {
  products: Product[];
  storeInfo: StoreInfo;
}

const CATEGORIES: Category[] = ['Todos', 'Vinos', 'Almacén', 'Fiambres', 'Regalos'];

export const Catalog: React.FC<CatalogProps> = ({ products, storeInfo }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const itemsPerPage = 8; // 2 filas de 4 en pantallas grandes, 4 filas de 2 en celular

  const openedWithKeyboard = useRef(false);

  const handleSelect = (product: Product, viaKeyboard: boolean) => {
    openedWithKeyboard.current = viaKeyboard;
    setSelectedProduct(product);
  };

  // El <dialog> devuelve el foco a la card al cerrarse; si se abrió con el mouse, se quita
  // para que la card no quede marcada hasta hacer clic en otro lado.
  const handleClose = () => {
    setSelectedProduct(null);
    if (!openedWithKeyboard.current) {
      requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
    }
  };

  // Reset pagination to page 1 if user searches or changes category
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product.isVisible) return false;

      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
          (product.providers?.name || '').toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section id="catalog" className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 bg-terruno-bg">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <Reveal variant="fade-up" className="text-center space-y-2.5">
          <span className="text-terruno-olive font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em]">
            — NUESTRO CATÁLOGO —
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-terruno-burgundy">
            Explorá lo que tenemos
          </h2>
        </Reveal>

        {/* Search Bar */}
        <Reveal variant="fade-up" delay={80} className="max-w-md mx-auto">
          <div className="relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-terruno-subtle" size={18} />
            <label htmlFor="catalog-search" className="sr-only">Buscar productos</label>
            <input
              id="catalog-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un sabor, categoría o proveedor..."
              maxLength={100}
              aria-label="Buscar productos en el catálogo"
              className="w-full pl-11 pr-5 py-2.5 sm:py-3 rounded-full bg-white border border-terruno-brown/15 text-terruno-brown placeholder-terruno-subtle focus:outline-none focus:border-terruno-burgundy focus:ring-2 focus:ring-terruno-burgundy/20 shadow-sm transition-all text-sm"
            />
          </div>
        </Reveal>

        {/* Category Filters */}
        <Reveal variant="fade-up" delay={120} className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isActive}
                aria-label={`Filtrar por ${cat}`}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-terruno-burgundy text-white shadow-sm'
                    : 'bg-white border border-terruno-brown/15 text-terruno-brown hover:border-terruno-burgundy hover:text-terruno-burgundy'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </Reveal>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-terruno-subtle">
            <p className="text-base">No encontramos productos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2">
              {currentProducts.map((product, i) => (
                <Reveal
                  key={`${product.id}-${currentPage}`}
                  variant="scale-in"
                  delay={(i % 4) * 60 + Math.floor(i / 4) * 40}
                  className="h-full"
                >
                  <ProductCard product={product} storeInfo={storeInfo} onSelect={handleSelect} />
                </Reveal>
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div className="pt-6 border-t border-terruno-border/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="footer"
                hideOnSinglePage={false}
              />
            </div>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        storeInfo={storeInfo}
        onClose={handleClose}
      />
    </section>
  );
};


