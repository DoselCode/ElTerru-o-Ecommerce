import React from 'react';
import { StoreInfo } from '../../types/product';
import { Reveal } from '../ui/Reveal';

interface AboutProps {
  storeInfo: StoreInfo;
}

export const About: React.FC<AboutProps> = ({ storeInfo }) => {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-terruno-bg border-t border-terruno-brown/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Image Composition */}
          <Reveal variant="slide-left" className="lg:col-span-6 max-w-md mx-auto lg:max-w-none w-full pb-4 sm:pb-6 lg:pb-0">
            <div className="relative">
              {/* Main Photo (Rounded rectangle with warm tone) */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-terruno-cream aspect-[4/5]">
                <img
                  src={storeInfo.aboutMainImage}
                  alt="Fundadoras de El Terruño"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping Sub Image */}
              <div className="absolute -bottom-3 -right-1 sm:-bottom-8 sm:-right-8 w-36 sm:w-56 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden border-4 border-terruno-bg shadow-xl">
                <img
                  src={storeInfo.aboutSubImage}
                  alt="Interior del almacén El Terruño"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Right Column: Narrative & Stats */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-terruno-brown">
            {/* Header label */}
            <Reveal as="span" variant="fade-up" delay={0} className="text-terruno-olive font-semibold text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] block text-center lg:text-left">
              — NUESTRA HISTORIA —
            </Reveal>

            {/* Main Title */}
            <Reveal as="h2" variant="fade-up" delay={80} className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-terruno-burgundy leading-tight text-center lg:text-left">
              {storeInfo.aboutTitle}
            </Reveal>

            {/* Quote Block */}
            <Reveal variant="fade-up" delay={160} className="border-l-2 border-terruno-burgundy pl-3.5 sm:pl-4 py-1 space-y-1">
              <p className="font-serif italic text-base sm:text-lg lg:text-xl text-terruno-burgundy/90 leading-snug sm:leading-normal">
                "{storeInfo.aboutQuote}"
              </p>
              <p className="text-[11px] sm:text-xs text-terruno-subtle font-medium uppercase tracking-wider">
                — {storeInfo.aboutQuoteAuthor}
              </p>
            </Reveal>

            {/* Paragraphs */}
            <Reveal variant="fade-up" delay={220} className="space-y-3 sm:space-y-4 text-sm sm:text-base text-terruno-brown/80 leading-relaxed font-normal pt-1 sm:pt-2">
              <p>{storeInfo.aboutParagraph1}</p>
              <p>{storeInfo.aboutParagraph2}</p>
              <p>{storeInfo.aboutParagraph3}</p>
            </Reveal>

            {/* Stats Row */}
            <div className="pt-4 sm:pt-6 border-t border-terruno-brown/10 grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <Reveal variant="fade-up" delay={0}>
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-terruno-burgundy block">
                  {storeInfo.statYears}
                </span>
                <span className="text-[10px] sm:text-xs text-terruno-subtle font-medium leading-snug block mt-0.5 sm:mt-1">
                  Años de historia
                </span>
              </Reveal>
              <Reveal variant="fade-up" delay={90}>
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-terruno-burgundy block">
                  {storeInfo.statProducers}
                </span>
                <span className="text-[10px] sm:text-xs text-terruno-subtle font-medium leading-snug block mt-0.5 sm:mt-1">
                  Productores locales
                </span>
              </Reveal>
              <Reveal variant="fade-up" delay={180}>
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-terruno-burgundy block">
                  {storeInfo.statProducts}
                </span>
                <span className="text-[10px] sm:text-xs text-terruno-subtle font-medium leading-snug block mt-0.5 sm:mt-1">
                  Productos en catálogo
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
