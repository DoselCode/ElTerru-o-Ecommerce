import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, StoreInfo } from '../../types/product';
import { ProductCard } from './ProductCard';
import { Reveal } from '../ui/Reveal';
import { Pagination } from '../ui/Pagination';
import { Search } from 'lucide-react';

interface CatalogProps {
  products: Product[];
  storeInfo: StoreInfo;
}

const CATEGORIES: Category[] = ['Todos', 'Vinos', 'Almacén', 'Fiambres', 'Regalos'];

export const Catalog: React.FC<CatalogProps> = ({ products, storeInfo }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 productos por página (2 filas de 3 en pantallas grandes)

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
        product.category.toLowerCase().includes(query);

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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-terruno-subtle" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un sabor..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
              {currentProducts.map((product, i) => (
                <Reveal
                  key={`${product.id}-${currentPage}`}
                  variant="scale-in"
                  delay={(i % 3) * 70 + Math.floor(i / 3) * 40}
                  className="h-full"
                >
                  <ProductCard product={product} storeInfo={storeInfo} />
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
    </section>
  );
};
