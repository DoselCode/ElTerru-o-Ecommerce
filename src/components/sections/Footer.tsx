import React from 'react';
import { StoreInfo } from '../../types/product';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface FooterProps {
  storeInfo: StoreInfo;
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  return (
    <footer
      className="bg-[#3D2C23] text-white pt-12 sm:pt-16 px-4 sm:px-6 md:px-12 border-t border-[#70232B]/30 relative z-10"
      style={{
        paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))'
      }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 pb-10 sm:pb-12 border-b border-white/10">
        {/* Brand Column */}
        <Reveal variant="fade-up" delay={0} className="space-y-4 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={storeInfo.logo}
              alt={storeInfo.name}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-contain bg-white/10 p-1"
            />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                {storeInfo.name}
              </h3>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#55633D] font-semibold">
                {storeInfo.tagline}
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed pt-1 max-w-sm">
            Seleccionamos los mejores productos artesanales y vinos de autor. De nuestra tierra a tu mesa.
          </p>
        </Reveal>

        {/* Contact Column */}
        <Reveal variant="fade-up" delay={90} className="space-y-3 sm:space-y-4">
          <h4 className="font-serif text-base sm:text-lg font-bold text-white relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-[2px] after:bg-[#55633D]">
            Contacto
          </h4>
          <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-[#55633D] shrink-0 mt-0.5" />
              <span>{storeInfo.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-[#55633D] shrink-0" />
              <span>{storeInfo.phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-[#55633D] shrink-0" />
              <span>{storeInfo.email}</span>
            </li>
          </ul>
        </Reveal>

        {/* Hours Column */}
        <Reveal variant="fade-up" delay={180} className="space-y-3 sm:space-y-4">
          <h4 className="font-serif text-base sm:text-lg font-bold text-white relative inline-block after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-8 after:h-[2px] after:bg-[#55633D]">
            Horarios
          </h4>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/70">
            <li>{storeInfo.hoursWeekdays}</li>
            <li>{storeInfo.hoursSaturday}</li>
            <li>{storeInfo.hoursSunday}</li>
          </ul>
        </Reveal>
      </div>

      {/* Bottom Bar */}
      <Reveal variant="fade" delay={0} className="max-w-6xl mx-auto pt-6 text-center text-[11px] sm:text-xs text-white/50">
        <p>&copy; {new Date().getFullYear()} {storeInfo.name}. Todos los derechos reservados.</p>
      </Reveal>
    </footer>
  );
};
