import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { ProductForm } from './admin/ProductForm';
import { SettingsForm } from './admin/SettingsForm';

const Storefront: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch store info
      const { data: storeData } = await supabase
        .from('store_info')
        .select('*')
        .eq('id', 1)
        .single();

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
        } as StoreInfo);
      }

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

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

      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading || !storeInfo) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F5EE]"><p>Cargando tienda...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#3D2C23] font-sans selection:bg-[#70232B] selection:text-white">
      <Navbar storeInfo={storeInfo} />
      <main>
        <Hero storeInfo={storeInfo} />
        {featuredProduct && <FeaturedProduct product={featuredProduct} storeInfo={storeInfo} />}
        <Catalog products={products} storeInfo={storeInfo} />
        <About storeInfo={storeInfo} />
      </main>
      <Footer storeInfo={storeInfo} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Storefront />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="settings" element={<SettingsForm />} />
      </Route>
    </Routes>
  );
};

export default App;
