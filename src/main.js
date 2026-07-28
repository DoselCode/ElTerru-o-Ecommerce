import './style.css'
import { products } from './products.js'

// State
let cart = JSON.parse(localStorage.getItem('terruno_cart')) || [];
let currentFilter = 'Todos';
let currentPage = 1;
let currentSearchQuery = '';
const ITEMS_PER_PAGE = 6;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('search-input');
const toastContainer = document.getElementById('toast-container');
const clearCartBtn = document.getElementById('clear-cart-btn');

// Phone Number for WhatsApp (Replace with real number)
const OWNER_PHONE = "+5493525518649"; // Example: +54 9 3525 (Jesús María)

// Listeners for filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    currentPage = 1;
    renderProducts();
  });
});

// Listener for Search
searchInput.addEventListener('input', (e) => {
  currentSearchQuery = e.target.value.toLowerCase();
  currentPage = 1;
  renderProducts();
});

// Render Products
function renderProducts() {
  // Filter & Search
  const filteredProducts = products.filter(p => {
    const matchCategory = currentFilter === 'Todos' || p.category === currentFilter;
    const matchSearch = currentSearchQuery === '' || 
                        p.name.toLowerCase().includes(currentSearchQuery) || 
                        p.description.toLowerCase().includes(currentSearchQuery);
    return matchCategory && matchSearch;
  });
  
  // Paginate
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Render Grid
  if (paginatedProducts.length === 0) {
    productsGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color: var(--text-secondary);">No hay productos en esta categoría.</p>';
  } else {
    productsGrid.innerHTML = paginatedProducts.map(p => `
      <article class="product-card">
        <div class="product-image" style="background-image: url('${p.image}')">
          <span class="product-category">${p.category}</span>
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <p>${p.description}</p>
          <div class="product-footer">
            <span class="price">$${p.price.toLocaleString('es-AR')}</span>
            <button class="add-to-cart" data-id="${p.id}">Agregar</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Add listeners to buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      addToCart(id);
      
      const product = products.find(p => p.id === id);
      showToast(`¡${product.name} agregado al carrito!`);
    });
  });

  // Render Pagination
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  paginationContainer.innerHTML = html;
  
  // Attach listeners
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentPage = parseInt(e.target.dataset.page);
      renderProducts();
      // Scroll smoothly to top of catalog
      document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Cart Logic
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
}

function updateQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem('terruno_cart', JSON.stringify(cart));
}

function updateCartUI() {
  saveCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.innerText = totalItems;
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalPrice.innerText = `$${totalPrice.toLocaleString('es-AR')}`;
  
  checkoutBtn.disabled = cart.length === 0;
  clearCartBtn.style.display = cart.length === 0 ? 'none' : 'block';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <span class="cart-item-price">$${item.price.toLocaleString('es-AR')}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn minus" data-id="${item.id}">-</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(parseInt(e.target.dataset.id), -1));
    });
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => updateQuantity(parseInt(e.target.dataset.id), 1));
    });
  }
}

// Generate WhatsApp Message
function checkoutWhatsApp() {
  if (cart.length === 0) return;
  
  let msg = `*¡Hola El Terruño!* Quiero hacer el siguiente pedido:\n\n`;
  
  cart.forEach(item => {
    msg += `- ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString('es-AR')})\n`;
  });
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  msg += `\n*Total estimado: $${total.toLocaleString('es-AR')}*\n\n`;
  msg += `Por favor confirmame disponibilidad y opciones de pago. ¡Gracias!`;
  
  const encodedMsg = encodeURIComponent(msg);
  window.open(`https://wa.me/${OWNER_PHONE}?text=${encodedMsg}`, '_blank');
}

// Sidebar UI Logic
function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
}

function closeCartPanel() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
}

cartToggle.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartPanel);
cartOverlay.addEventListener('click', closeCartPanel);
checkoutBtn.addEventListener('click', checkoutWhatsApp);

clearCartBtn.addEventListener('click', () => {
  if (cart.length > 0) {
    if(confirm("¿Estás seguro de que querés vaciar el carrito?")) {
      cart = [];
      updateCartUI();
      showToast("El carrito fue vaciado");
    }
  }
});

// Toast Notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
    </span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Init
renderProducts();
updateCartUI();
