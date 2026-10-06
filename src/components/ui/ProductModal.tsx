import React, { useEffect, useRef } from "react";
import { Product, StoreInfo } from "../../types/product";

interface ProductModalProps {
  product: Product | null;
  storeInfo: StoreInfo;
  onClose: () => void;
}

const buildWhatsAppUrl = (product: Product, storeInfo: StoreInfo) => {
  const phone = storeInfo.whatsappNumber.replace(/\D/g, "");
  const details = [
    product.winery && `Bodega: ${product.winery}`,
    product.year && `Año: ${product.year}`,
  ].filter(Boolean).join(" - ");

  const message =
    `Hola ${storeInfo.name}! Me interesa pedir: *${product.name}*` +
    (details ? ` (${details})` : "") +
    ` - $${product.price.toLocaleString("es-AR")}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const ProductModal: React.FC<ProductModalProps> = ({ product, storeInfo, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }
    if (!product && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="product-modal-title"
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-full max-w-3xl rounded-2xl p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent border-0 outline-none"
    >
      {product && (
        <div className="relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-terruno-brown/5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            autoFocus
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center
                       rounded-full bg-white/90 text-xl shadow hover:bg-gray-100 text-terruno-brown border border-terruno-brown/10 transition-colors"
          >
            &times;
          </button>

          {/* Image Area */}
          <div className="md:w-1/2 bg-terruno-bg flex items-center justify-center relative overflow-hidden h-64 md:h-auto">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className={`w-full h-full object-cover ${product.stock === 0 ? 'grayscale opacity-70' : ''}`}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-terruno-subtle">
                Sin imagen
              </div>
            )}
            
            {/* Category / Stock Badges */}
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

          {/* Detail Area */}
          <div className="md:w-1/2 flex flex-col gap-4 p-6 sm:p-8">
            <div>
              <h2 id="product-modal-title" className="font-serif text-2xl font-bold text-terruno-brown leading-snug">
                {product.name}
              </h2>

              {(product.winery || product.year) && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-terruno-subtle">
                  {product.winery && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-terruno-olive">Bodega:</span>
                      <span>{product.winery}</span>
                    </div>
                  )}
                  {product.year && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-terruno-olive">Año:</span>
                      <span>{product.year}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-grow">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-terruno-brown/80">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-4 border-t border-terruno-brown/10">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-2xl font-bold text-terruno-burgundy">
                  ${product.price.toLocaleString("es-AR")}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                    product.stock !== 0
                      ? "bg-terruno-olive/10 text-terruno-olive"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {product.stock !== 0 ? "Disponible" : "Sin stock"}
                </span>
              </div>

              {storeInfo && (
                product.stock !== 0 ? (
                  <a
                    href={buildWhatsAppUrl(product, storeInfo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-terruno-olive px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-terruno-olive/90 transition-colors"
                  >
                    Pedir por WhatsApp
                  </a>
                ) : (
                  <button
                    disabled
                    className="block w-full rounded-xl bg-terruno-bg px-4 py-3.5 text-center text-sm font-semibold text-terruno-subtle border border-terruno-brown/10 cursor-not-allowed"
                  >
                    Producto no disponible
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};
