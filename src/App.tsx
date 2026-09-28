import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { insforge } from './lib/insforge';
import { Product, StoreInfo } from './types/product';
import { Navbar } from './components/navbar/Navbar';
import { Hero } from './components/sections/Hero';
import { FeaturedProduct } from './components/sections/FeaturedProduct';
import { Catalog } from './components/sections/Catalog';
import { About } from './components/sections/About';
import { Footer } from './components/sections/Footer';

// PERF-01: Lazy-load all admin modules — storefront visitors won't download this code
const AdminLayout = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Login       = lazy(() => import('./admin/Login').then(m => ({ default: m.Login })));
const Dashboard   = lazy(() => import('./admin/Dashboard').then(m => ({ default: m.Dashboard })));
const POS         = lazy(() => import('./admin/POS').then(m => ({ default: m.POS })));
const Stock       = lazy(() => import('./admin/Stock').then(m => ({ default: m.Stock })));
const Sales       = lazy(() => import('./admin/Sales').then(m => ({ default: m.Sales })));
const SettingsForm = lazy(() => import('./admin/SettingsForm'));
const ProductForm  = lazy(() => import('./admin/ProductForm'));

const AdminFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F5EE' }}>
    <p style={{ color: '#6B2D3E', fontFamily: 'sans-serif' }}>Cargando panel...</p>
  </div>
);

const Storefront: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [storeResponse, productsResponse] = await Promise.all([
          insforge.database.from('store_info').select('*').eq('id', 1).single(),
          insforge.database.from('products').select('*').eq('is_visible', true).order('id', { ascending: false })
        ]);

        const storeData = storeResponse.data;
        const productsData = productsResponse.data;

        if (storeData) {
          setStoreInfo({
            name: storeData.name,
            tagline: storeData.tagline,
            logo: storeData.logo,
            phone: storeData.phone,
            whatsappNumber: storeData.whatsapp_number,
            email: storeData.email,
            address: storeData.address,
            hoursWeekdays: storeData.hours_weekdays,
            hoursSaturday: storeData.hours_saturday,
            hoursSunday: storeData.hours_sunday,
            heroBadge: storeData.hero_badge,
            heroTitle: storeData.hero_title,
            heroSubtitle: storeData.hero_subtitle,
            heroBgImage: storeData.hero_bg_image,
            aboutTitle: storeData.about_title,
            aboutQuote: storeData.about_quote,
            aboutQuoteAuthor: storeData.about_quote_author,
            aboutParagraph1: storeData.about_paragraph_1,
            aboutParagraph2: storeData.about_paragraph_2,
            aboutParagraph3: storeData.about_paragraph_3,
            aboutMainImage: storeData.about_main_image,
            aboutSubImage: storeData.about_sub_image,
            statYears: storeData.stat_years,
            statProducers: storeData.stat_producers,
            statProducts: storeData.stat_products,
            instagramUrl: storeData.instagram_url,
            showPhone: storeData.show_phone,
            showWhatsapp: storeData.show_whatsapp,
            showEmail: storeData.show_email,
            showAddress: storeData.show_address,
            showInstagram: storeData.show_instagram,
          } as StoreInfo);
        }

        if (productsData) {
          const mappedProducts = productsData.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            year: p.year,
            category: p.category,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            discountBadge: p.discount_badge,
            badge: p.badge,
            image: p.image,
            description: p.description,
            winery: p.winery,
            pairing: p.pairing,
            stock: p.stock,
            isFeatured: p.is_featured,
            isVisible: p.is_visible,
          }));
          setProducts(mappedProducts);

          const featured = mappedProducts.find(p => p.isFeatured) || null;
          setFeaturedProduct(featured);
        }
      } catch (err: any) {
        console.error('Error loading storefront:', err);
        setFetchError('Ocurrió un error al cargar la tienda. Intentá de nuevo más tarde.');
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-terruno-bg"><p>Cargando tienda...</p></div>;
  }

  if (fetchError) {
    return <div className="min-h-screen flex items-center justify-center bg-terruno-bg"><p className="text-red-600">{fetchError}</p></div>;
  }

  if (!storeInfo) {
    return <div className="min-h-screen flex items-center justify-center bg-terruno-bg"><p>Cargando tienda...</p></div>;
  }

  return (
    <div className="min-h-screen bg-terruno-bg text-terruno-brown font-sans selection:bg-terruno-burgundy selection:text-white">
      <Helmet>
        <title>{storeInfo.name}{storeInfo.tagline ? ` | ${storeInfo.tagline}` : ''}</title>
        <meta name="description" content={storeInfo.heroSubtitle || storeInfo.aboutParagraph1 || 'Tienda de vinos boutique'} />
        <link rel="canonical" href="https://www.xn--elterruo-j3a.online/" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={storeInfo.name} />
        <meta property="og:title" content={`${storeInfo.name}${storeInfo.tagline ? ` | ${storeInfo.tagline}` : ''}`} />
        <meta property="og:description" content={storeInfo.heroSubtitle || storeInfo.aboutParagraph1 || 'Tienda de vinos boutique'} />
        <meta property="og:image" content={storeInfo.heroBgImage || storeInfo.logo || ''} />
        <meta property="og:url" content="https://www.xn--elterruo-j3a.online/" />
        <meta property="og:locale" content="es_AR" />
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={storeInfo.name} />
        <meta name="twitter:description" content={storeInfo.heroSubtitle || ''} />
        <meta name="twitter:image" content={storeInfo.heroBgImage || storeInfo.logo || ''} />
        {/* JSON-LD: Local Business */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": storeInfo.name,
          "description": storeInfo.heroSubtitle || '',
          "image": storeInfo.logo || '',
          "telephone": storeInfo.phone || '',
          "address": storeInfo.address || '',
          "url": "https://www.xn--elterruo-j3a.online/"
        })}</script>
      </Helmet>
      <Navbar storeInfo={storeInfo} />
      <main>
        <Hero storeInfo={storeInfo} />
        <About storeInfo={storeInfo} />
        {featuredProduct && <FeaturedProduct product={featuredProduct} storeInfo={storeInfo} />}
        <Catalog products={products} storeInfo={storeInfo} />
      </main>
      <Footer storeInfo={storeInfo} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>El Terruño - Almacén Gourmet &amp; Vinos Boutique</title>
      </Helmet>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Storefront />} />

        {/* Admin Routes — lazy loaded, isolated from storefront bundle */}
        <Route path="/admin/login" element={
          <Suspense fallback={<AdminFallback />}><Login /></Suspense>
        } />
        <Route path="/admin" element={
          <Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense>
        }>
          <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
          <Route path="pos" element={<Suspense fallback={null}><POS /></Suspense>} />
          <Route path="stock" element={<Suspense fallback={null}><Stock /></Suspense>} />
          <Route path="sales" element={<Suspense fallback={null}><Sales /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={null}><SettingsForm /></Suspense>} />
          <Route path="products/new" element={<Suspense fallback={null}><ProductForm /></Suspense>} />
          <Route path="products/edit/:id" element={<Suspense fallback={null}><ProductForm /></Suspense>} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
