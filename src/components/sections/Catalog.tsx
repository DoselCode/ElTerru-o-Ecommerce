import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category, StoreInfo } from '../../types/product';
import { ProductCard } from './ProductCard';
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
    <section id="catalog" className="py-20 px-6 md:px-12 bg-[#F7F5EE]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[#55633D] font-semibold text-xs uppercase tracking-[0.25em]">
            ✧ NUESTRO CATÁLOGO ✧
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#70232B]">
            Explorá lo que tenemos
          </h2>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C726A]" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar un sabor..."
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-white border border-[#3D2C23]/15 text-[#3D2C23] placeholder-[#7C726A] focus:outline-none focus:border-[#70232B] focus:ring-2 focus:ring-[#70232B]/20 shadow-sm transition-all text-base"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#70232B] text-white shadow-md'
                    : 'bg-white border border-[#3D2C23]/15 text-[#3D2C23] hover:border-[#70232B] hover:text-[#70232B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-[#7C726A]">
            <p className="text-lg">No encontramos productos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} storeInfo={storeInfo} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-[#EBE6D8]/50">
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  disabled={currentPage === 1}
                  className="px-6 py-2 rounded-full border border-[#70232B] text-[#70232B] font-medium hover:bg-[#70232B] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  Anterior
                </button>
                <span className="text-[#8C7A70] font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 rounded-full border border-[#70232B] text-[#70232B] font-medium hover:bg-[#70232B] hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
