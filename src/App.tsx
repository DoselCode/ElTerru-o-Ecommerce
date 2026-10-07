import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStorefrontData } from './hooks/useStorefrontData';
import { Navbar } from './components/navbar/Navbar';
import { Hero } from './components/sections/Hero';
import { FeaturedProduct } from './components/sections/FeaturedProduct';
import { Catalog } from './components/sections/Catalog';
import { About } from './components/sections/About';
import { Footer } from './components/sections/Footer';
import { StorefrontSeo } from './components/StorefrontSeo';
import { StorefrontError, StorefrontLoading } from './components/ui/StorefrontStatus';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// El panel admin se carga bajo demanda para no sumarlo al bundle de la tienda
const AdminLayout = lazy(() => import('./admin/views/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Login       = lazy(() => import('./admin/Login').then(m => ({ default: m.Login })));
const Dashboard   = lazy(() => import('./admin/components/Dashboard').then(m => ({ default: m.Dashboard })));
const POS         = lazy(() => import('./admin/components/POS').then(m => ({ default: m.POS })));
const Stock       = lazy(() => import('./admin/components/Stock').then(m => ({ default: m.Stock })));
const Sales       = lazy(() => import('./admin/components/Sales').then(m => ({ default: m.Sales })));
const SettingsForm = lazy(() => import('./admin/views/SettingsForm'));
const ProductForm  = lazy(() => import('./admin/views/ProductForm'));

const AdminFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F5EE' }}>
    <p style={{ color: '#6B2D3E', fontFamily: 'sans-serif' }}>Cargando panel...</p>
  </div>
);

const Storefront: React.FC = () => {
  const { storeInfo, products, featuredProduct, loading, fetchError, refetch } = useStorefrontData();

  if (loading) return <StorefrontLoading />;
  if (fetchError) return <StorefrontError message={fetchError} onRetry={refetch} />;
  if (!storeInfo) return <StorefrontError message="No pudimos cargar la información de la tienda." onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-terruno-bg text-terruno-brown font-sans selection:bg-terruno-burgundy selection:text-white">
      <StorefrontSeo storeInfo={storeInfo} />
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
        <Route path="/" element={<ErrorBoundary variant="public"><Storefront /></ErrorBoundary>} />

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
