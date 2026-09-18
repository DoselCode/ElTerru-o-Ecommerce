import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from './lib/supabase';
import { Product, StoreInfo } from './types/product';
import { Navbar } from './components/navbar/Navbar';
import { Hero } from './components/sections/Hero';
import { FeaturedProduct } from './components/sections/FeaturedProduct';
import { Catalog } from './components/sections/Catalog';
import { About } from './components/sections/About';
import { Footer } from './components/sections/Footer';

// Admin Imports
import { AdminLayout } from './admin/AdminLayout';
import { Login } from './admin/Login';
import { Dashboard } from './admin/Dashboard';
import { POS } from './admin/POS';
import { Stock } from './admin/Stock';
import { Sales } from './admin/Sales';
import SettingsForm from './admin/SettingsForm';

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
          supabase.from('store_info').select('*').eq('id', 1).single(),
          supabase.from('products').select('*').eq('is_visible', true).order('id', { ascending: false })
        ]);

        const storeData = storeResponse.data;
        const productsData = productsResponse.data;

        if (storeData) {
          // Map snake_case database fields to camelCase StoreInfo format
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
        setFetchError('Error al cargar la tienda. Por favor, recargá la página.');
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
        <meta name="description" content={storeInfo.heroSubtitle || storeInfo.aboutParagraph1 || 'Tienda de vinos'} />
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
        <title>El Terruño - Almacén Gourmet & Vinos Boutique</title>
      </Helmet>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Storefront />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="stock" element={<Stock />} />
          <Route path="sales" element={<Sales />} />
          <Route path="settings" element={<SettingsForm />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
