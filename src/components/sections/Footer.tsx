import React from 'react';
import { StoreInfo } from '../../types/product';
import { MapPin, Phone, Mail } from 'lucide-react';

interface FooterProps {
  storeInfo: StoreInfo;
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  return (
    <footer className="bg-[#3D2C23] text-white pt-16 pb-8 px-6 md:px-12 border-t border-[#70232B]/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/10">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={storeInfo.logo}
              alt={storeInfo.name}
              className="h-12 w-12 rounded-full object-contain bg-white/10 p-1"
            />
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
                {storeInfo.name}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#55633D] font-semibold">
                {storeInfo.tagline}
              </p>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed pt-2">
            Seleccionamos los mejores productos artesanales y vinos de autor. De nuestra tierra a tu mesa.
          </p>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-white relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-[2px] after:bg-[#55633D]">
            Contacto
          </h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={18} className="text-[#55633D] shrink-0 mt-0.5" />
              <span>{storeInfo.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={18} className="text-[#55633D] shrink-0" />
              <span>{storeInfo.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={18} className="text-[#55633D] shrink-0" />
              <span>{storeInfo.email}</span>
            </li>
          </ul>
        </div>

        {/* Hours Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-white relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-[2px] after:bg-[#55633D]">
            Horarios
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>{storeInfo.hoursWeekdays}</li>
            <li>{storeInfo.hoursSaturday}</li>
            <li>{storeInfo.hoursSunday}</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto pt-6 text-center text-xs text-white/50">
        <p>&copy; {new Date().getFullYear()} {storeInfo.name}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};
