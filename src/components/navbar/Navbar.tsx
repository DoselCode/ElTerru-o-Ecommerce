import React from 'react';
import { StoreInfo } from '../../types/product';

interface NavbarProps {
  storeInfo: StoreInfo;
}

export const Navbar: React.FC<NavbarProps> = ({ storeInfo }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F5EE]/90 backdrop-blur-md border-b border-[#3D2C23]/10 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <img
            src={storeInfo.logo}
            alt={storeInfo.name}
            className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-full shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-tight text-[#70232B] group-hover:text-[#581B22] transition-colors">
              {storeInfo.name}
            </span>
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#55633D] font-semibold">
              {storeInfo.tagline}
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 md:gap-10 text-sm md:text-base font-medium text-[#3D2C23]">
          <a
            href="#home"
            className="hover:text-[#70232B] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#70232B] hover:after:w-full after:transition-all"
          >
            Inicio
          </a>
          <a
            href="#about"
            className="hover:text-[#70232B] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#70232B] hover:after:w-full after:transition-all"
          >
            El Local
          </a>
          <a
            href="#catalog"
            className="hover:text-[#70232B] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#70232B] hover:after:w-full after:transition-all"
          >
            Catálogo
          </a>
        </nav>
      </div>
    </header>
  );
};
