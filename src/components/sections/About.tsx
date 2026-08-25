import React from 'react';
import { StoreInfo } from '../../types/product';

interface AboutProps {
  storeInfo: StoreInfo;
}

export const About: React.FC<AboutProps> = ({ storeInfo }) => {
  return (
    <section id="about" className="py-24 px-6 md:px-12 bg-[#F7F5EE] border-t border-[#3D2C23]/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Composition */}
          <div className="lg:col-span-6">
            <div className="relative">
              {/* Main Photo (Rounded rectangle with warm tone) */}
              <div className="rounded-3xl overflow-hidden shadow-2xl bg-[#E8DFC8] aspect-[4/5]">
                <img
                  src={storeInfo.aboutMainImage}
                  alt="Fundadoras de El Terruño"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlapping Sub Image */}
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 w-44 sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden border-4 border-[#F7F5EE] shadow-xl">
                <img
                  src={storeInfo.aboutSubImage}
                  alt="Interior del almacén El Terruño"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Stats */}
          <div className="lg:col-span-6 space-y-6 text-[#3D2C23]">
            {/* Header label */}
            <span className="text-[#55633D] font-semibold text-xs uppercase tracking-[0.25em] block">
              — NUESTRA HISTORIA —
            </span>

            {/* Main Title */}
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#70232B] leading-tight">
              {storeInfo.aboutTitle}
            </h2>

            {/* Quote Block */}
            <div className="border-l-2 border-[#70232B] pl-4 py-1 space-y-1">
              <p className="font-serif italic text-lg sm:text-xl text-[#70232B]/90">
                "{storeInfo.aboutQuote}"
              </p>
              <p className="text-xs text-[#7C726A] font-medium uppercase tracking-wider">
                — {storeInfo.aboutQuoteAuthor}
              </p>
            </div>

            {/* Paragraphs */}
            <div className="space-y-4 text-base text-[#3D2C23]/80 leading-relaxed font-normal pt-2">
              <p>{storeInfo.aboutParagraph1}</p>
              <p>{storeInfo.aboutParagraph2}</p>
              <p>{storeInfo.aboutParagraph3}</p>
            </div>

            {/* Stats Row */}
            <div className="pt-6 border-t border-[#3D2C23]/10 grid grid-cols-3 gap-4">
              <div>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#70232B] block">
                  {storeInfo.statYears}
                </span>
                <span className="text-xs text-[#7C726A] font-medium leading-snug block mt-1">
                  Años de historia
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#70232B] block">
                  {storeInfo.statProducers}
                </span>
                <span className="text-xs text-[#7C726A] font-medium leading-snug block mt-1">
                  Productores locales
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#70232B] block">
                  {storeInfo.statProducts}
                </span>
                <span className="text-xs text-[#7C726A] font-medium leading-snug block mt-1">
                  Productos en catálogo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
