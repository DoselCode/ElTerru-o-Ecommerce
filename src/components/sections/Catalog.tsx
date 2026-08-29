import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, StoreInfo } from '../../types/product';
import { ProductCard } from './ProductCard';
import { Reveal } from '../ui/Reveal';
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
  const itemsPerPage = 9; // 3 rows of 3 products on large screens

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
    <section id="catalog" className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#F7F5EE]">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Header */}
        <Reveal variant="fade-up" className="text-center space-y-2.5">
          <span className="text-[#55633D] font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em]">
            — NUESTRO CATÁLOGO —
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#70232B]">
            Explorá lo que tenemos
          </h2>
        </Reveal>

        {/* Search Bar */}
        <Reveal variant="fade-up" delay={80} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C726A]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un sabor..."
              className="w-full pl-11 pr-5 py-2.5 sm:py-3 rounded-full bg-white border border-[#3D2C23]/15 text-[#3D2C23] placeholder-[#7C726A] focus:outline-none focus:border-[#70232B] focus:ring-2 focus:ring-[#70232B]/20 shadow-sm transition-all text-sm"
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
                    ? 'bg-[#70232B] text-white shadow-sm'
                    : 'bg-white border border-[#3D2C23]/15 text-[#3D2C23] hover:border-[#70232B] hover:text-[#70232B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </Reveal>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-[#7C726A]">
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
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 pt-6 border-t border-[#EBE6D8]/50">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  disabled={currentPage === 1}
                  className="px-5 py-1.5 rounded-full border border-[#70232B] text-[#70232B] text-xs sm:text-sm font-medium hover:bg-[#70232B] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Anterior
                </button>
                <span className="text-xs sm:text-sm text-[#8C7A70] font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  disabled={currentPage === totalPages}
                  className="px-5 py-1.5 rounded-full border border-[#70232B] text-[#70232B] text-xs sm:text-sm font-medium hover:bg-[#70232B] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
