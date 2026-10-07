import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { StoreInfo } from '../types/product';

const SITE_URL = 'https://www.xn--elterruo-j3a.online/';

/** Meta tags SEO, Open Graph y Twitter de la landing, armados con los datos de store_info. */
export const StorefrontSeo: React.FC<{ storeInfo: StoreInfo }> = ({ storeInfo }) => {
  const title = `${storeInfo.name}${storeInfo.tagline ? ` | ${storeInfo.tagline}` : ''}`;
  const description = storeInfo.heroSubtitle || storeInfo.aboutParagraph1 || 'Tienda de vinos boutique';
  const image = storeInfo.heroBgImage || storeInfo.logo || '';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={SITE_URL} />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={storeInfo.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:locale" content="es_AR" />
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={storeInfo.name} />
      <meta name="twitter:description" content={storeInfo.heroSubtitle || ''} />
      <meta name="twitter:image" content={image} />
      {/* JSON-LD: Local Business */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": storeInfo.name,
        "description": storeInfo.heroSubtitle || '',
        "image": storeInfo.logo || '',
        "telephone": storeInfo.phone || '',
        "address": storeInfo.address || '',
        "url": SITE_URL
      })}</script>
    </Helmet>
  );
};
