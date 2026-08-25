import React from 'react';
import { StoreInfo } from '../../types/product';
import { MapPin } from 'lucide-react';

interface HeroProps {
  storeInfo: StoreInfo;
}

export const Hero: React.FC<HeroProps> = ({ storeInfo }) => {
  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center justify-center text-center px-4 py-20 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(247, 245, 238, 0.45) 0%, rgba(247, 245, 238, 0.75) 60%, rgba(247, 245, 238, 1) 100%), url('${storeInfo.heroBgImage}')`
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Location Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#70232B]/30 bg-[#F7F5EE]/60 backdrop-blur-sm text-[#70232B] text-xs font-semibold uppercase tracking-[0.18em]">
          <MapPin size={14} className="text-[#70232B]" />
          <span>{storeInfo.heroBadge}</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold text-[#70232B] tracking-tight leading-[1.1]">
          {storeInfo.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-[#3D2C23]/80 max-w-2xl mx-auto font-normal leading-relaxed">
          {storeInfo.heroSubtitle}
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <a
            href="#catalog"
            className="inline-block px-8 py-3.5 rounded-full bg-[#55633D] hover:bg-[#445030] text-white font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Ver Catálogo
          </a>
        </div>
      </div>
    </section>
  );
};
