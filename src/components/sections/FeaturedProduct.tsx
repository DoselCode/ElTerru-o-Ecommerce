import React from 'react';
import { Product, StoreInfo } from '../../types/product';
import { ArrowRight, Star } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface FeaturedProductProps {
  product: Product;
  storeInfo: StoreInfo;
}

export const FeaturedProduct: React.FC<FeaturedProductProps> = ({ product, storeInfo }) => {
  const badgeText = product.badge?.trim() || 'BEST SELLER';
  const rawDiscount = product.discountBadge?.trim() || '15% OFF';
  const discountText = rawDiscount.toLowerCase().includes('esta semana')
    ? rawDiscount
    : `${rawDiscount} esta semana`;

  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 md:px-12 bg-[#F7F5EE] overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Tag Header */}
        <Reveal variant="fade-up" className="text-center mb-10 sm:mb-16">
          <span className="text-[#55633D] font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em]">
            — PRODUCTO DESTACADO —
          </span>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with concentric background rings, motion, and overlapping badges */}
          <div className="md:col-span-5 flex justify-center items-center relative py-6 sm:py-8">
            {/* Concentric Decorative Rings */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[540px] md:h-[540px] rounded-full border border-[#70232B]/10 pointer-events-none animate-pulse-ring" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[270px] h-[270px] sm:w-[370px] sm:h-[370px] md:w-[430px] md:h-[430px] rounded-full border border-[#70232B]/15 pointer-events-none" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[330px] md:h-[330px] rounded-full border border-[#70232B]/20 pointer-events-none" />

            {/* Main Animated Card Container (fade only: 'animate-float' ya controla el transform) */}
            <Reveal variant="fade" className="relative max-w-[250px] xs:max-w-[270px] sm:max-w-[310px] md:max-w-[340px] w-full animate-float z-10">
              {/* Product Image Card */}
              <div className="relative rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-2xl bg-white aspect-[3/4] sm:aspect-[4/5] border border-[#3D2C23]/10">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Top Right Badge: Best Seller */}
              <div className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 z-20 bg-[#70232B] text-white w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center p-1 sm:p-1.5 shadow-xl border-2 border-[#F7F5EE]">
                <Star size={12} className="fill-white text-white mb-0.5 sm:w-3.5 sm:h-3.5" />
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold tracking-wider uppercase text-center leading-tight">
                  {badgeText.includes(' ') ? (
                    badgeText.split(' ').map((word, i) => (
                      <React.Fragment key={i}>
                        {word}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))
                  ) : (
                    badgeText
                  )}
                </span>
              </div>

              {/* Bottom Left Badge: Offer Tag */}
              <div className="absolute -bottom-2.5 -left-2.5 sm:-bottom-4 sm:-left-4 z-20 bg-[#55633D] text-white px-3 py-1 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-bold shadow-xl border-2 border-[#F7F5EE] whitespace-nowrap">
                {discountText}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Details & CTA */}
          <div className="md:col-span-7 space-y-4 sm:space-y-6 text-[#3D2C23] text-center md:text-left">
            <Reveal variant="slide-right" delay={0}>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#70232B] leading-tight">
                {product.name}
              </h2>
              {product.year && (
                <p className="font-serif text-lg sm:text-2xl text-[#70232B]/80 mt-1">
                  {product.year}
                </p>
              )}
            </Reveal>

            <Reveal as="p" variant="fade-up" delay={90} className="text-sm sm:text-base text-[#3D2C23]/80 leading-relaxed max-w-xl mx-auto md:mx-0">
              {product.description}
            </Reveal>

            {/* Price section */}
            <Reveal variant="fade-up" delay={150} className="flex items-baseline justify-center md:justify-start gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <span className="font-serif text-2xl sm:text-4xl font-bold text-[#70232B]">
                ${product.price.toLocaleString('es-AR')}
              </span>
              {product.originalPrice && (
                <span className="line-through text-[#7C726A] text-sm sm:text-lg">
                  ${product.originalPrice.toLocaleString('es-AR')}
                </span>
              )}
              <span className="text-[#55633D] font-bold text-xs sm:text-sm bg-[#55633D]/10 px-2 sm:px-2.5 py-0.5 rounded-full">
                {rawDiscount}
              </span>
            </Reveal>

            {/* Product Metadata List */}
            <Reveal as="ul" variant="fade-up" delay={210} className="space-y-1.5 text-xs sm:text-sm text-[#7C726A] border-t border-b border-[#3D2C23]/10 py-3 sm:py-4 text-left max-w-md mx-auto md:mx-0">
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
                  <span>
                    <strong>Disponibilidad:</strong>{' '}
                    {product.stock === 0 ? (
                      <span className="text-red-500 font-semibold">Sin stock</span>
                    ) : (
                      `${product.stock} unidades disponibles`
                    )}
                  </span>
                </li>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

