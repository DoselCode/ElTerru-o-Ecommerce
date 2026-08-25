import React, { useState } from 'react';
import { initialStoreInfo, initialFeaturedProduct, initialProducts } from './data/initialData';
import { Product, StoreInfo } from './types/product';
import { Navbar } from './components/navbar/Navbar';
import { Hero } from './components/sections/Hero';
import { FeaturedProduct } from './components/sections/FeaturedProduct';
import { Catalog } from './components/sections/Catalog';
import { About } from './components/sections/About';
import { Footer } from './components/sections/Footer';

export const App: React.FC = () => {
  const [storeInfo] = useState<StoreInfo>(initialStoreInfo);
  const [featuredProduct] = useState<Product>(initialFeaturedProduct);
  const [products] = useState<Product[]>(initialProducts);

  return (
    <div className="min-h-screen bg-[#F7F5EE] text-[#3D2C23] font-sans selection:bg-[#70232B] selection:text-white">
      {/* Header / Navbar */}
      <Navbar storeInfo={storeInfo} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero storeInfo={storeInfo} />

        {/* Featured Product Section */}
        <FeaturedProduct product={featuredProduct} storeInfo={storeInfo} />

        {/* Catalog Section */}
        <Catalog products={products} storeInfo={storeInfo} />

        {/* About / Store Story Section */}
        <About storeInfo={storeInfo} />
      </main>

      {/* Footer */}
      <Footer storeInfo={storeInfo} />
    </div>
  );
};

export default App;
