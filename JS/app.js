// ---- CURSOR ----
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  rx += (e.clientX - rx) * 0.12;
  ry += (e.clientY - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
});
setInterval(() => { }, 16);

// Grow ring on hover
document.querySelectorAll('a, button, .product-card, .category-card, .nav-icon').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '60px';
    ring.style.height = '60px';
    cursor.style.transform = 'translate(-50%,-50%) scale(0.4)';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '36px';
    ring.style.height = '36px';
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });
});

// ---- NAV SCROLL ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

// ---- PRODUCTS DATA ----
const products = [
  { id: 1, name: 'The Wool Overcoat', category: 'Outerwear', price: 8900, original: null, badge: 'New', image: 'Images/wool_overcoat.png' },
  { id: 2, name: 'Linen Wrap Dress', category: 'Women\'s', price: 3400, original: 4200, badge: 'Sale', image: 'Images/wrap_dress.png' },
  { id: 3, name: 'Tailored Trousers', category: 'Men\'s', price: 4200, original: null, badge: null, image: 'Images/tailored_trousers.png' },
  { id: 4, name: 'Cashmere Turtleneck', category: 'Knitwear', price: 5600, original: null, badge: 'New', image: 'Images/wool_overcoat.png' },
  { id: 5, name: 'Raw Denim Jacket', category: 'Outerwear', price: 6800, original: null, badge: null, image: 'Images/denim_jacket.png' },
  { id: 6, name: 'Silk Midi Skirt', category: 'Women\'s', price: 3100, original: 3900, badge: 'Sale', image: 'Images/wrap_dress.png' },
  { id: 7, name: 'Organic Cotton Tee', category: 'Basics', price: 1200, original: null, badge: null, image: 'Images/tailored_trousers.png' },
  { id: 8, name: 'Merino Cardigan', category: 'Knitwear', price: 4800, original: null, badge: 'New', image: 'Images/denim_jacket.png' },
];

function formatPrice(p) {
  return '₱' + p.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

// ---- RENDER PRODUCTS ----
const grid = document.getElementById('productsGrid');
products.forEach(p => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
        <div class="product-img">
          <div class="product-img-inner">
            <img src="${p.image}" class="product-visual-img" style="width:100%; height:100%; object-fit:cover;">
          </div>
          ${p.badge ? `<div class="product-badge ${p.badge === 'New' ? 'new' : ''}">${p.badge}</div>` : ''}
          <div class="product-actions">
            <button class="quick-add" onclick="addToCart(${p.id})">Add to Cart</button>
            <button class="wishlist-btn" onclick="wishlist(${p.id})">♡</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-meta">
            <span class="product-category">${p.category}</span>
            <span class="product-price">
              ${p.original ? `<span class="original">${formatPrice(p.original)}</span>` : ''}
              ${formatPrice(p.price)}
            </span>
          </div>
        </div>
      `;
  grid.appendChild(card);
});

// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card').forEach(c => observer.observe(c));

// ---- CART ----
let cart = [];

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  updateCart();
  showToast(product.name);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else updateCart();
}

function updateCart() {
  const countEl = document.getElementById('cartCount');
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = totalItems;
  countEl.style.display = totalItems > 0 ? 'flex' : 'none';

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotal').textContent = formatPrice(total);

  const itemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">◻</div><div class="cart-empty-text">Your cart is empty</div></div>`;
    return;
  }
  itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-img" style="background: var(--surface2); display:flex; align-items:center; justify-content:center;">
            <img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${item.category}</div>
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
              </div>
              <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
              <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
            </div>
          </div>
        </div>
      `).join('');
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function checkout() {
  if (cart.length === 0) { showToastMsg('Your cart is empty!'); return; }
  showToastMsg('Checkout coming soon!');
}

function wishlist(id) {
  const p = products.find(x => x.id === id);
  showToastMsg(`${p.name} saved to wishlist ♡`);
}

// ---- TOAST ----
let toastTimeout;
function showToast(name) {
  document.getElementById('toastMsg').textContent = name + ' added to your cart.';
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}
function showToastMsg(msg) {
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// ---- NEWSLETTER ----
function subscribeNewsletter() {
  const v = document.getElementById('emailInput').value;
  if (!v || !v.includes('@')) { showToastMsg('Please enter a valid email.'); return; }
  document.getElementById('emailInput').value = '';
  showToastMsg('Welcome to the inner circle! ✦');
}

// ---- LAZY CURSOR RAF ----
function animateCursor() {
  rx += (parseFloat(cursor.style.left) - rx) * 0.12;
  ry += (parseFloat(cursor.style.top) - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();
