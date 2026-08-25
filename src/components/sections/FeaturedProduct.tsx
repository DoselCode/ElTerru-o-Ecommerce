import React from 'react';
import { Product, StoreInfo } from '../../types/product';
import { ArrowRight, Star } from 'lucide-react';

interface FeaturedProductProps {
  product: Product;
  storeInfo: StoreInfo;
}

export const FeaturedProduct: React.FC<FeaturedProductProps> = ({ product, storeInfo }) => {
  const handleWhatsAppConsult = () => {
    const text = `Hola ${storeInfo.name}! Quisiera consultar sobre el producto destacado: *${product.name} ${product.year ? product.year : ''}* ($${product.price.toLocaleString('es-AR')}). ¿Tienen disponibilidad?`;
    const url = `https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-[#F7F5EE]">
      <div className="max-w-6xl mx-auto">
        {/* Section Tag Header */}
        <div className="text-center mb-12">
          <span className="text-[#55633D] font-semibold text-xs uppercase tracking-[0.25em]">
            — PRODUCTO DESTACADO —
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image with badges */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative max-w-sm w-full">
              {/* Decorative Subtle Background Circle */}
              <div className="absolute inset-0 -m-6 rounded-full border border-[#70232B]/10 bg-[#70232B]/5 pointer-events-none" />

              {/* Main Card Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white aspect-[4/5]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Top Right Badge: Best Seller */}
                {product.badge && (
                  <div className="absolute top-4 right-4 bg-[#70232B] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center p-1 shadow-lg text-[9px] font-semibold text-center leading-tight">
                    <Star size={12} className="fill-white mb-0.5" />
                    <span>{product.badge}</span>
                  </div>
                )}

                {/* Bottom Left Badge: Offer Tag */}
                {product.discountBadge && (
                  <div className="absolute bottom-4 left-4 bg-[#55633D] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {product.discountBadge} esta semana
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Details & CTA */}
          <div className="md:col-span-7 space-y-6 text-[#3D2C23]">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#70232B] leading-tight">
                {product.name}
              </h2>
              {product.year && (
                <p className="font-serif text-2xl text-[#70232B]/80 mt-1">
                  {product.year}
                </p>
              )}
            </div>

            <p className="text-base text-[#3D2C23]/80 leading-relaxed max-w-xl">
              {product.description}
            </p>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-serif text-4xl font-bold text-[#70232B]">
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.originalPrice && (
                <span className="line-through text-[#7C726A] text-lg">
                  ${product.originalPrice.toLocaleString('es-AR')}
                </span>
              )}
              {product.discountBadge && (
                <span className="text-[#55633D] font-bold text-sm bg-[#55633D]/10 px-2.5 py-0.5 rounded-full">
                  {product.discountBadge}
                </span>
              )}
            </div>

            {/* Product Metadata List */}
            <ul className="space-y-1.5 text-sm text-[#7C726A] border-t border-b border-[#3D2C23]/10 py-4">
              {product.winery && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70232B]" />
                  <span><strong>Bodega:</strong> {product.winery}</span>
                </li>
              )}
              {product.pairing && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70232B]" />
                  <span><strong>Maridaje:</strong> {product.pairing}</span>
                </li>
              )}
              {product.stock !== undefined && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70232B]" />
                  <span><strong>Stock limitado:</strong> {product.stock} unidades disponibles</span>
                </li>
              )}
            </ul>

            {/* WhatsApp CTA Button */}
            <div className="pt-2">
              <button
                onClick={handleWhatsAppConsult}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#70232B] hover:bg-[#581B22] text-white font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Consultar por WhatsApp</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
