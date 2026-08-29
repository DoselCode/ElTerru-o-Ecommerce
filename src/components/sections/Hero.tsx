import React from 'react';
import { StoreInfo } from '../../types/product';
import { MapPin } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface HeroProps {
  storeInfo: StoreInfo;
}

export const Hero: React.FC<HeroProps> = ({ storeInfo }) => {
  return (
    <section
      id="home"
      className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center text-center px-4 sm:px-6 py-14 sm:py-24 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(247, 245, 238, 0.5) 0%, rgba(247, 245, 238, 0.8) 60%, rgba(247, 245, 238, 1) 100%), url('${storeInfo.heroBgImage}')`
      }}
    >
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Location Badge */}
        <Reveal variant="fade-up" delay={0}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#70232B]/30 backdrop-blur-sm text-[#70232B] text-[11px] sm:text-xs font-extralight uppercase tracking-[0.15em] sm:tracking-[0.18em]">
            <MapPin size={13} className="text-[#70232B]" />
            <span>{storeInfo.heroBadge}</span>
          </div>
        </Reveal>

        {/* Main Title */}
        <Reveal as="h1" variant="fade-up" delay={80} className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold text-[#70232B] tracking-tight leading-[1.15] sm:leading-[1.1]">
          {storeInfo.heroTitle}
        </Reveal>

        {/* Subtitle */}
        <Reveal as="p" variant="fade-up" delay={160} className="text-sm sm:text-lg md:text-xl text-[#3D2C23]/80 max-w-2xl mx-auto font-normal leading-relaxed px-2">
          {storeInfo.heroSubtitle}
        </Reveal>

        {/* CTA Button */}
        <Reveal variant="fade-up" delay={240} className="pt-2 sm:pt-4">
          <a
            href="#catalog"
            className="inline-block w-full sm:w-auto px-8 py-3 sm:py-3.5 rounded-full bg-[#55633D] hover:bg-[#445030] text-white font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Ver Catálogo
          </a>
        </Reveal>
      </div>
    </section>
  );
};
