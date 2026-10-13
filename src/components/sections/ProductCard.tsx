import React, { useState } from 'react';
import { Package } from '@phosphor-icons/react';
import { Product, StoreInfo } from '../../types/product';

interface ProductCardProps {
  product: Product;
  storeInfo: StoreInfo;
  /** `viaKeyboard` permite devolver el foco a la card solo cuando se abrió con teclado. */
  onSelect?: (product: Product, viaKeyboard: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeInfo, onSelect }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const soldOut = (product.stock || 0) <= 0;
  const showImage = Boolean(product.image) && !imageFailed;

  return (
    <article
      // focus-visible: el anillo solo aparece al navegar con teclado, no después de un clic
      className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-terruno-brown/5 group outline-none ${onSelect ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-terruno-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-terruno-bg' : ''}`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      // detail === 0: "clic" generado por teclado
      onClick={(e) => onSelect?.(product, e.detail === 0)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(product, true);
        }
      }}
    >
      {/* Recuadro de proporción fija (4:3) igual para todas las cards; la foto entra completa
          (object-contain) para no cortar botellas ni frascos altos */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
        {showImage ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className={`absolute inset-0 w-full h-full object-contain object-center p-3 transition-transform duration-500 ${soldOut ? 'grayscale opacity-70' : 'group-hover:scale-105'}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-terruno-brown/25" aria-hidden>
            <Package size={40} weight="thin" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-semibold text-terruno-brown uppercase tracking-[0.12em] shadow-sm w-fit">
            {product.category}
          </div>
          {soldOut && (
            <div className="bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-semibold text-white uppercase tracking-[0.12em] shadow-sm w-fit">
              Agotado
            </div>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between space-y-2">
        <div className="space-y-1">
          <h3 className="font-serif text-sm sm:text-base font-bold text-terruno-brown group-hover:text-terruno-burgundy transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-terruno-subtle line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2 mt-auto">
          <span className="font-serif text-base sm:text-lg font-bold text-terruno-burgundy">
            ${product.price.toLocaleString('es-AR')}
          </span>
          {/* En celular toda la card abre el detalle; el botón solo se muestra desde tablet */}
          {onSelect && (
            <button
              type="button"
              className="hidden sm:inline-flex shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-terruno-burgundy text-[10px] font-semibold uppercase tracking-wider text-terruno-olive hover:text-terruno-burgundy transition-colors px-2.5 py-1 border border-terruno-olive/30 hover:border-terruno-burgundy/50 rounded-full bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product, e.detail === 0);
              }}
            >
              Ver detalle
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
