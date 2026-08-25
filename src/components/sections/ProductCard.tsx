import React from 'react';
import { Product, StoreInfo } from '../../types/product';

interface ProductCardProps {
  product: Product;
  storeInfo: StoreInfo;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeInfo }) => {
  const handleConsult = () => {
    const text = `Hola ${storeInfo.name}! Me interesa consultar sobre: *${product.name}* ($${product.price.toLocaleString('es-AR')}). ¿Me podrías dar más detalles?`;
    const url = `https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <article
      onClick={handleConsult}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col cursor-pointer border border-[#3D2C23]/5 group"
    >
      {/* Image with category tag */}
      <div className="relative h-64 overflow-hidden bg-[#F7F5EE]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-[10px] font-semibold text-[#3D2C23] uppercase tracking-[0.15em] shadow-sm">
          {product.category}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-[#3D2C23] group-hover:text-[#70232B] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-[#7C726A] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-[#70232B]">
            ${product.price.toLocaleString('es-AR')}
          </span>
          <span className="text-xs font-semibold text-[#55633D] group-hover:underline">
            Consultar →
          </span>
        </div>
      </div>
    </article>
  );
};
