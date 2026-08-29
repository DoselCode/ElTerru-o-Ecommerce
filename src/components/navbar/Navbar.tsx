import React, { useState } from 'react';
import { StoreInfo } from '../../types/product';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  storeInfo: StoreInfo;
}

export const Navbar: React.FC<NavbarProps> = ({ storeInfo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#3D2C23]/10 py-3 px-4 sm:px-6 md:px-12 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2.5 sm:gap-3 group" onClick={closeMenu}>
          <img
            src={storeInfo.logo}
            alt={storeInfo.name}
            className="h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain rounded-full shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-[#70232B] group-hover:text-[#581B22] transition-colors leading-tight">
              {storeInfo.name}
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#55633D] font-semibold">
              {storeInfo.tagline}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm md:text-base font-medium text-[#3D2C23]">
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#3D2C23] hover:text-[#70232B] hover:bg-[#3D2C23]/5 transition-colors focus:outline-none"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#3D2C23]/10 mt-3 pt-3 pb-4 px-2 space-y-2 animate-fade-in bg-[#F7F5EE]">
          <a
            href="#home"
            onClick={closeMenu}
            className="block px-4 py-2.5 rounded-xl text-base font-medium text-[#3D2C23] hover:bg-[#70232B]/10 hover:text-[#70232B] transition-colors"
          >
            Inicio
          </a>
          <a
            href="#about"
            onClick={closeMenu}
            className="block px-4 py-2.5 rounded-xl text-base font-medium text-[#3D2C23] hover:bg-[#70232B]/10 hover:text-[#70232B] transition-colors"
          >
            El Local
          </a>
          <a
            href="#catalog"
            onClick={closeMenu}
            className="block px-4 py-2.5 rounded-xl text-base font-medium text-[#3D2C23] hover:bg-[#70232B]/10 hover:text-[#70232B] transition-colors"
          >
            Catálogo
          </a>
        </div>
      )}
    </header>
  );
};

