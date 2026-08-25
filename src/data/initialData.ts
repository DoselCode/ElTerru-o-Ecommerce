import { Product, StoreInfo } from '../types/product';

export const initialStoreInfo: StoreInfo = {
  name: "El Terruño",
  tagline: "ALMACÉN GOURMET & VINOS BOUTIQUE",
  logo: "/logoterruno_circle.png",
  phone: "+54 9 3525 518649",
  whatsappNumber: "+5493525518649",
  email: "hola@elterruno.com.ar",
  address: "Av. Juan B. Justo 1234, Jesús María, Córdoba",
  hoursWeekdays: "Lun a Vie: 9:00 - 13:00 / 17:00 - 21:00",
  hoursSaturday: "Sábados: 9:00 - 14:00",
  hoursSunday: "Domingos y Feriados: Cerrado",

  heroBadge: "JESÚS MARÍA, CÓRDOBA",
  heroTitle: "Sabores con Historia y Raíz",
  heroSubtitle: "De Jesús María a tu mesa. Seleccionamos los mejores productos artesanales y vinos de autor para crear experiencias inolvidables.",
  heroBgImage: "/hero_bg.jpg",

  aboutTitle: "Dos amigas, un sueño de raíces",
  aboutQuote: "Queríamos que cada producto tenga una historia detrás, una mano que lo hizo con amor.",
  aboutQuoteAuthor: "Lorena & Valentina, fundadoras",
  aboutParagraph1: "El Terruño nació en 2018 de la amistad entre Lorena Gómez y Valentina Roldán, dos cordobesas que compartían el mismo amor por los sabores auténticos y los productores artesanales de la región.",
  aboutParagraph2: "Lo que empezó como una pequeña vinoteca de barrio en el corazón de Jesús María fue creciendo con cada visita a bodegas, tambos y caseríos de Córdoba, San Juan y Mendoza. Hoy, El Terruño es un almacén donde cada etiqueta y cada tarro tiene nombre propio.",
  aboutParagraph3: "Trabajamos directamente con más de 30 productores locales, sin intermediarios. Porque creemos que el verdadero lujo es saber de dónde viene lo que comemos y tomamos.",
  aboutMainImage: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80",
  aboutSubImage: "/local_store.jpg",
  statYears: "7+",
  statProducers: "30+",
  statProducts: "200+"
};

export const initialFeaturedProduct: Product = {
  id: 1,
  name: "Malbec Reserva",
  year: "2021",
  category: "Vinos",
  price: 2422,
  originalPrice: 2850,
  discountBadge: "15% OFF",
  badge: "BEST SELLER",
  image: "/wine_malbec.jpg",
  description: "Nacido en los viñedos de Luján de Cuyo a 1.050 metros de altura. Crianza de 12 meses en roble francés. En boca es amplio, con taninos sedosos y un final largo con recuerdos de violeta y vainilla.",
  winery: "Clos de los Siete, Mendoza",
  pairing: "carnes rojas, quesos estacionados",
  stock: 24,
  isFeatured: true,
  isVisible: true
};

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Malbec Reserva 2021",
    category: "Vinos",
    price: 2850,
    image: "/wine_malbec.jpg",
    description: "Valle de Luján de Cuyo. Notas de ciruela y especias finas.",
    isVisible: true
  },
  {
    id: 2,
    name: "Tabla de Fiambres Artesanales",
    category: "Fiambres",
    price: 3200,
    image: "/salami.jpg",
    description: "Selección de salames, quesos y jamón crudo de origen.",
    isVisible: true
  },
  {
    id: 3,
    name: "Aceite de Oliva Extra Virgen",
    category: "Almacén",
    price: 1450,
    image: "/olive_oil.jpg",
    description: "Blend Arauco y Arbequina. Cosecha temprana, San Juan.",
    isVisible: true
  },
  {
    id: 4,
    name: "Queso de Oveja Curado",
    category: "Fiambres",
    price: 11000,
    image: "/cheese.jpg",
    description: "Queso curado de pasta dura. Sabor intenso y textura quebradiza.",
    isVisible: true
  },
  {
    id: 5,
    name: "Escabeche de Jabalí Artesanal",
    category: "Almacén",
    price: 6800,
    image: "/olive_oil.jpg",
    description: "Receta familiar. Carne tierna macerada con hierbas serranas.",
    isVisible: true
  },
  {
    id: 6,
    name: "Caja Experiencia: Noche de Fuegos",
    category: "Regalos",
    price: 45000,
    image: "/gift_box.jpg",
    description: "Incluye Malbec Reserva, Salame, Queso de campo y provoleta.",
    isVisible: true
  }
];
