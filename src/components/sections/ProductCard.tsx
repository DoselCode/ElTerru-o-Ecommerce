import React from 'react';
import { Product, StoreInfo } from '../../types/product';

interface ProductCardProps {
  product: Product;
  storeInfo: StoreInfo;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeInfo }) => {
  return (
    <article
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-terruno-brown/5 group"
    >
      {/* Image with category tag */}
      <div className="relative h-64 overflow-hidden bg-terruno-bg">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${product.stock === 0 ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] font-semibold text-terruno-brown uppercase tracking-[0.15em] shadow-sm w-fit">
            {product.category}
          </div>
          {product.stock === 0 && (
            <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] font-semibold text-white uppercase tracking-[0.15em] shadow-sm w-fit">
              Sin stock
            </div>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-bold text-terruno-brown group-hover:text-terruno-burgundy transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs sm:text-[13px] text-terruno-subtle line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-terruno-burgundy">
            ${product.price.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </article>
  );
};
