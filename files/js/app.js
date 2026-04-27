/* =====================================================
   HoloDisplay — script.js
   ===================================================== */

/* ---- Intro Loader ---- */
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro-loader');
  if (!intro) return;

  // Trigger fade-in of text/icon
  requestAnimationFrame(() => {
    intro.classList.add('show');
  });

  // Slide the loader away after 900ms for a quicker, snappier feel
  setTimeout(() => {
    intro.classList.add('hide');
    // Remove from DOM after transition finishes so it can't block clicks
    intro.addEventListener('transitionend', () => {
      intro.style.display = 'none';
    }, { once: true });
  }, 900);
});

/* ---- Sticky Nav ---- */
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ---- Scroll Reveal ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children inside grids
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Add stagger delays to grid children
document.querySelectorAll('.products-grid .product-card').forEach((el, i) => {
  el.dataset.delay = (i % 5) * 80;
});
document.querySelectorAll('.reviews-grid .review-card').forEach((el, i) => {
  el.dataset.delay = i * 100;
});
document.querySelectorAll('.ugc-grid .ugc-card').forEach((el, i) => {
  el.dataset.delay = i * 80;
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- FAQ Accordion ---- */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-question').forEach(q => {
    q.classList.remove('open');
    q.setAttribute('aria-expanded', 'false');
    q.nextElementSibling.classList.remove('open');
  });

  // Open the clicked one (if it wasn't open)
  if (!isOpen) {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    answer.classList.add('open');
  }
}

//* ---- Add to Cart Toast ---- */
const toast = document.getElementById('toast');
let toastTimer;

function addToCart(model) {
  clearTimeout(toastTimer);
  const toastText = getTranslation('toast');
  toast.textContent = `${toastText}`;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ---- UGC Play Button (visual feedback) ---- */
function playVideo(card) {
  const thumb = card.querySelector('.ugc-thumb');
  thumb.style.opacity = '0.6';
  thumb.querySelector('.play-btn').textContent = '⏸';
  setTimeout(() => {
    thumb.style.opacity = '1';
    thumb.querySelector('.play-btn').textContent = '▶';
  }, 1500);
}

/* ---- Active nav link highlight on scroll ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.style.color = isActive ? 'var(--cyan)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* =====================================================
   PRODUCT DATA — for modal
   ===================================================== */
const PRODUCTS = {
  'MS-16': {
    name: 'MS 42 cm 3D Fan',
    size: '42 cm',
    price: 23999,
    stars: '★★★★★',
    desc: 'Advanced LED technology to create vibrant, high-definition 3D visuals that are clear and bright.',
    specs: { Brand: 'MS', Uses: 'Business', 'Special Feature': '3d-Ready, Built-In 3d', Connectivity: 'Bluetooth, Wi-Fi', Resolution: '1024 x 768' }
  }
};

let modalCurrentProduct = null;
let modalQty = 1;

/** Pre-Order from hero / bento: add MS-16 to cart and open the new checkout flow */
function preOrderCheckout() {
  const p = PRODUCTS['MS-16'];
  if (!p) return;
  addToCartItem(p, 1);
  closeModal();
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay && cartOverlay.classList.contains('open')) {
    cartOverlay.classList.remove('open');
  }
  openCheckoutModal();
}

/* ---- Open Modal ---- */
function openModal(productId) {
  const p = PRODUCTS[productId];
  if (!p) return;
  modalCurrentProduct = productId;
  modalQty = 1;

  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-stars').textContent = p.stars;
  document.getElementById('modal-size').textContent = p.size;
  document.getElementById('modal-desc').textContent = p.desc;
  document.getElementById('modal-price').textContent = p.price.toLocaleString() + ' ' + getTranslation('currency');
  document.getElementById('modal-qty').textContent = '1';

  const img = document.getElementById('modal-img');
  // Clear any existing background image
  img.style.backgroundImage = 'none';

  // Set the product-specific image as a child element
  img.innerHTML = '';

    const imgElement = document.createElement('img');
    imgElement.src = 'assets/images/HGF.png';
    imgElement.alt = 'HoloDisplay Product Image';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    img.appendChild(imgElement);

  // Build specs grid
  const specsEl = document.getElementById('modal-specs');
  specsEl.innerHTML = Object.entries(p.specs).map(([k, v]) => `
    <div class="modal-spec-item">
      <span class="modal-spec-label">${k}</span>
      <span class="modal-spec-val">${v}</span>
    </div>
  `).join('');

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
  modalCurrentProduct = null;
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function changeQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('modal-qty').textContent = modalQty;
}

function addToCartFromModal() {
  if (!modalCurrentProduct) return;
  const p = PRODUCTS[modalCurrentProduct];
  addToCartItem(p, modalQty);
  closeModal();

  // Automatically open the cart to show the added product
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay && !cartOverlay.classList.contains('open')) {
    toggleCart();
  }
}

/* =====================================================
   CART STATE
   ===================================================== */
const cart = {}; // { productId: { product, qty } }

function addToCartItem(product, qty) {
  if (cart[product.name]) {
    cart[product.name].qty += qty;
  } else {
    cart[product.name] = { product, qty };
  }
  updateCartUI();

  // Add the bump animation class to the counter badge to draw attention
  const cartCountEl = document.getElementById('cart-count');
  const mobileCountEl = document.getElementById('mobile-cart-count');

  cartCountEl.classList.remove('bump');
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add('bump');

  if (mobileCountEl) {
    mobileCountEl.classList.remove('bump');
    void mobileCountEl.offsetWidth;
    mobileCountEl.classList.add('bump');
  }

  // Remove bump after animation completes
  setTimeout(() => {
    cartCountEl.classList.remove('bump');
    if (mobileCountEl) mobileCountEl.classList.remove('bump');
  }, 300);

  // Toast
  clearTimeout(toastTimer);
  const toastText = getTranslation('toast');
  toast.textContent = `${toastText}`;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function removeFromCart(productId) {
  delete cart[productId];
  updateCartUI();
  syncCheckoutIfOpen();
}

function changeCartQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].qty = Math.max(1, cart[productId].qty + delta);
  updateCartUI();
  syncCheckoutIfOpen();
}

function updateCartUI() {
  const totalItems = Object.values(cart).reduce((s, v) => s + v.qty, 0);
  document.getElementById('cart-count').textContent = totalItems;

  const mobileCount = document.getElementById('mobile-cart-count');
  if (mobileCount) mobileCount.textContent = totalItems;

  const itemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');

  const entries = Object.values(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    summaryEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    summaryEl.style.display = 'flex';

    itemsEl.innerHTML = entries.map(({ product, qty }) => {
      let imgStyle = "background-image:url('assets/images/HGF.png');background-size:cover;background-position:center;";
      const removeText = getTranslation('cart-remove');

      return `
      <div class="cart-item">
        <div class="cart-item-img" style="${imgStyle}"></div>
        <div class="cart-item-info">
          <span class="cart-item-name">${product.name}</span>
          <span class="cart-item-size">${product.size}</span>
          <div class="cart-item-controls">
            <button class="cart-item-qty-btn" onclick="changeCartQty('${product.name}', -1)">−</button>
            <span class="cart-item-qty">${qty}</span>
            <button class="cart-item-qty-btn" onclick="changeCartQty('${product.name}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${(product.price * qty).toLocaleString()} ${getTranslation('currency')}</span>
          <button class="cart-remove-btn" onclick="removeFromCart('${product.name}')">${removeText}</button>
        </div>
      </div>
    `;
    }).join('');

    const subtotal = entries.reduce((s, { product, qty }) => s + product.price * qty, 0);
    const currency = getTranslation('currency');
    document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString() + ' ' + currency;
    document.getElementById('cart-total').textContent = subtotal.toLocaleString() + ' ' + currency;
  }

  syncCheckoutIfOpen();
}

/* ---- Cart panel toggle ---- */
function toggleCart() {
  const overlay = document.getElementById('cart-overlay');
  const isOpen = overlay.classList.contains('open');
  if (isOpen) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateCartUI();
  }
}

// Close cart when clicking backdrop
document.getElementById('cart-overlay').addEventListener('click', function (e) {
  if (e.target === this || e.target === this.querySelector('.cart-overlay::before')) {
    // clicking the pseudo-element backdrop: just close if clicking outside the panel
    if (!e.target.closest('.cart-panel')) toggleCart();
  }
});

// Keyboard close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const checkoutOv = document.getElementById('checkout-modal-overlay');
    if (checkoutOv && checkoutOv.classList.contains('open')) {
      closeCheckoutModal();
      return;
    }
    closeModal();
    if (document.getElementById('cart-overlay').classList.contains('open')) toggleCart();
  }
});

// React to language change
window.addEventListener('languageChanged', () => {
    updateCartUI();
    if (modalCurrentProduct) {
        // Refresh modal price/tag if open (optional, but good for consistency)
        document.getElementById('modal-price').textContent = PRODUCTS[modalCurrentProduct].price.toLocaleString() + ' ' + getTranslation('currency');
    }
});


/* =====================================================
   CHECKOUT FLOW (holodisplay_checkout_flow)
   ===================================================== */
let checkoutDiscount = 0;

function getCheckoutCartSubtotal() {
  return Object.values(cart).reduce((s, { product, qty }) => s + product.price * qty, 0);
}

function getCheckoutTotalAfterDiscount() {
  return getCheckoutCartSubtotal() * (1 - checkoutDiscount);
}

function checkoutFmtMoney(amount) {
  const currency = getTranslation('currency');
  return amount.toLocaleString() + ' ' + currency;
}

function escapeHtmlAttr(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function checkoutSyncStep1FromCart() {
  const container = document.getElementById('checkout-line-items');
  if (!container) return;

  if (Object.keys(cart).length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = Object.values(cart).map(({ product, qty }) => {
    const lineTotal = product.price * qty;
    const nameEsc = escapeHtmlAttr(product.name);
    return `
      <div style="border:1px solid rgba(255,255,255,0.08);padding:16px;margin-bottom:16px;display:flex;gap:16px;align-items:center;">
        <div style="width:64px;height:64px;background:rgba(155,127,232,0.08);border:1px solid rgba(155,127,232,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;">
          <img src="assets/images/HGF.png" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'"/>
        </div>
        <div style="flex:1;min-width:0;">
          <p class="syne" style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px;">${product.name}</p>
          <p style="font-size:11px;color:#5a6e80;margin-bottom:6px;">${product.size}</p>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;border:1px solid rgba(255,255,255,0.1);">
              <button type="button" onclick="changeCartQty('${nameEsc}', -1)" style="background:none;border:none;color:#9b7fe8;padding:4px 10px;cursor:pointer;font-size:14px;font-weight:300;">−</button>
              <span style="font-family:'Syne',sans-serif;font-size:12px;font-weight:700;padding:0 8px;min-width:24px;text-align:center;color:#dce8f0;">${qty}</span>
              <button type="button" onclick="changeCartQty('${nameEsc}', 1)" style="background:none;border:none;color:#9b7fe8;padding:4px 10px;cursor:pointer;font-size:14px;font-weight:300;">+</button>
            </div>
            <span style="font-size:12px;color:#5a6e80;">× ${product.price.toLocaleString()} ${getTranslation('currency')}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p class="syne" style="font-size:16px;font-weight:700;color:#e8c547;">${checkoutFmtMoney(lineTotal)}</p>
          <p style="font-size:10px;color:#5a6e80;margin-top:2px;">excl. shipping</p>
        </div>
      </div>`;
  });

  container.innerHTML = lines.join('');
  checkoutUpdatePrices();
}

function checkoutUpdatePrices() {
  const sub = getCheckoutCartSubtotal();
  const total = getCheckoutTotalAfterDiscount();
  const elSub = document.getElementById('checkout-subtotal-1');
  const elTot = document.getElementById('checkout-total-1');
  if (elSub) elSub.textContent = checkoutFmtMoney(sub);
  if (elTot) elTot.textContent = checkoutFmtMoney(total);
}

function syncCheckoutIfOpen() {
  const o = document.getElementById('checkout-modal-overlay');
  if (!o || !o.classList.contains('open')) return;
  const s1 = document.getElementById('checkout-step1');
  if (s1 && s1.classList.contains('active')) {
    if (Object.keys(cart).length === 0) {
      closeCheckoutModal();
      alert(getTranslation('checkout-empty-alert'));
      return;
    }
    checkoutSyncStep1FromCart();
  }
}

function checkoutApplyPromo() {
  const input = document.getElementById('checkout-promo-input');
  const msg = document.getElementById('checkout-promo-msg');
  if (!input || !msg) return;
  const code = input.value.trim().toUpperCase();
  if (code === 'PROMO10') {
    checkoutDiscount = 0.10;
    msg.style.display = 'block';
    msg.textContent = getTranslation('checkout-promo-ok');
    msg.style.color = '#639922';
  } else if (code) {
    checkoutDiscount = 0;
    msg.style.display = 'block';
    msg.textContent = getTranslation('checkout-promo-bad');
    msg.style.color = '#E24B4A';
  } else {
    checkoutDiscount = 0;
    msg.style.display = 'none';
  }
  checkoutUpdatePrices();
}

function checkoutUpdateStepper(active) {
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('checkout-dot' + i);
    const lbl = document.getElementById('checkout-lbl' + i);
    if (!dot) continue;
    if (i < active) {
      dot.style.background = 'rgba(232,197,71,0.2)';
      dot.style.border = '1px solid rgba(232,197,71,0.4)';
      dot.style.color = '#e8c547';
      dot.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e8c547" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      if (lbl) lbl.style.color = 'rgba(232,197,71,0.5)';
    } else if (i === active) {
      dot.style.background = '#e8c547';
      dot.style.border = 'none';
      dot.style.color = '#000';
      dot.textContent = String(i);
      if (lbl) lbl.style.color = '#e8c547';
    } else {
      dot.style.background = 'rgba(255,255,255,0.06)';
      dot.style.border = '1px solid rgba(255,255,255,0.12)';
      dot.style.color = '#5a6e80';
      dot.textContent = String(i);
      if (lbl) lbl.style.color = '#5a6e80';
    }
  }
  for (let i = 1; i <= 2; i++) {
    const line = document.getElementById('checkout-line' + i);
    if (line) line.style.background = i < active ? 'rgba(232,197,71,0.3)' : 'rgba(255,255,255,0.08)';
  }
}

function checkoutGoStep(n) {
  if (n === 2 && Object.keys(cart).length === 0) {
    alert(getTranslation('checkout-empty-alert'));
    return;
  }
  if (n === 3) {
    const fn = (document.getElementById('checkout-fname') || {}).value || '';
    const ln = (document.getElementById('checkout-lname') || {}).value || '';
    const em = (document.getElementById('checkout-email') || {}).value || '';
    const ph = (document.getElementById('checkout-phone') || {}).value || '';
    if (!fn.trim() || !ln.trim() || !em.trim() || !ph.trim()) {
      alert(getTranslation('checkout-fill-alert'));
      return;
    }
    document.getElementById('checkout-confirm-name').textContent = fn.trim() + ' ' + ln.trim();
    document.getElementById('checkout-confirm-email').textContent = em.trim();
    document.getElementById('checkout-confirm-phone').textContent = ph.trim();

    const confirmLines = document.getElementById('checkout-confirm-lines');
    if (confirmLines) {
      let html = '';
      for (const [, item] of Object.entries(cart)) {
        const t = item.qty * item.product.price * (1 - checkoutDiscount);
        html += `<div style="display:flex;justify-content:space-between;font-size:12px;color:#dce8f0;margin-bottom:6px;">
          <span>${item.product.name} × ${item.qty}</span>
          <span style="color:#e8c547;" class="syne">${checkoutFmtMoney(t)}</span>
        </div>`;
      }
      confirmLines.innerHTML = html;
    }
    const total = getCheckoutTotalAfterDiscount();
    const ct = document.getElementById('checkout-confirm-total');
    if (ct) ct.textContent = checkoutFmtMoney(total);
  }

  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('checkout-step' + i);
    if (el) el.classList.toggle('active', i === n);
  }
  const stepper = document.getElementById('checkout-stepper');
  if (stepper) stepper.style.display = n === 4 ? 'none' : 'block';
  if (n <= 3) checkoutUpdateStepper(n);
}

function checkoutResetFlow() {
  checkoutDiscount = 0;
  const promoIn = document.getElementById('checkout-promo-input');
  const promoMsg = document.getElementById('checkout-promo-msg');
  if (promoIn) promoIn.value = '';
  if (promoMsg) promoMsg.style.display = 'none';
  const circle = document.getElementById('checkout-check-circle');
  if (circle) circle.style.transform = 'scale(0)';
  const stepper = document.getElementById('checkout-stepper');
  if (stepper) stepper.style.display = 'block';
  checkoutGoStep(1);
  checkoutSyncStep1FromCart();
}

function checkoutNewOrderAfterSuccess() {
  if (Object.keys(cart).length) { checkoutResetFlow(); }
  else { closeCheckoutModal(); }
}

function checkoutGoSuccess() {
  checkoutGoStep(4);
  const stepper = document.getElementById('checkout-stepper');
  if (stepper) stepper.style.display = 'none';
  setTimeout(() => {
    const c = document.getElementById('checkout-check-circle');
    if (c) c.style.transform = 'scale(1)';
  }, 100);

  const entries = Object.values(cart);
  const label = entries.map(e => e.product.name).join(', ') || 'HoloDisplay';
  const refEl = document.getElementById('checkout-order-ref');
  const prodEl = document.getElementById('checkout-success-product');
  if (prodEl) prodEl.textContent = label.length > 48 ? label.slice(0, 45) + '…' : label;
  if (refEl) refEl.textContent = '#HD-' + String(Math.floor(1000 + Math.random() * 9000));
}

function sendOrderEmail(customerName, customerEmail, customerPhone) {
  const cartData = [];
  for (const [, item] of Object.entries(cart)) {
    cartData.push(`${item.product.name} (${item.product.size}): ${item.qty} x ${item.product.price} ${getTranslation('currency')} = ${item.qty * item.product.price} ${getTranslation('currency')}`);
  }
  const totalAmount = getCheckoutTotalAfterDiscount();

  const templateParams = {
    to_email: 'ksantinirafik14@gmail.com',
    email: 'ksantinirafik14@gmail.com',
    customer_email: customerEmail,
    from_name: customerName,
    to_name: 'Store Manager',
    subject: `New Lead / Order from: ${customerName}`,
    message: `CUSTOMER DETAILS:\nName:  ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\n\nORDER SUMMARY:\n${cartData.join('\n')}\n\n${checkoutDiscount ? 'PROMO10 applied (10% off)\n' : ''}TOTAL VALUE: ${totalAmount.toLocaleString()} ${getTranslation('currency')}`
  };

  return emailjs.send('service_ad41xmi', 'template_t6h379o', templateParams);
}

function checkoutPlaceOrder() {
  if (Object.keys(cart).length === 0) {
    alert(getTranslation('checkout-empty-alert'));
    return;
  }
  const fn = (document.getElementById('checkout-fname') || {}).value.trim();
  const ln = (document.getElementById('checkout-lname') || {}).value.trim();
  const em = (document.getElementById('checkout-email') || {}).value.trim();
  const ph = (document.getElementById('checkout-phone') || {}).value.trim();
  if (!fn || !ln || !em || !ph) {
    alert(getTranslation('checkout-fill-alert'));
    return;
  }
  const customerName = fn + ' ' + ln;

  const finishSuccess = function () {
    for (const productId in cart) delete cart[productId];
    updateCartUI();
    checkoutGoSuccess();
  };

  if (typeof emailjs !== 'undefined' && emailjs.send) {
    sendOrderEmail(customerName, em, ph)
      .then(function () { finishSuccess(); })
      .catch(function (err) {
        console.error(err);
        alert(getTranslation('checkout-error'));
      });
  } else {
    alert('Email service not configured. In a live environment, this would send an order confirmation email.\n\nProceeding to clear cart for demo purposes.');
    finishSuccess();
  }
}

// Open checkout modal
function openCheckoutModal() {
  if (Object.keys(cart).length === 0) {
    alert(getTranslation('checkout-empty-alert'));
    return;
  }

  checkoutResetFlow();
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  modalOverlay.classList.remove('open');
  checkoutResetFlow();

  if (document.getElementById('cart-overlay').classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeCheckoutModalOutside(event) {
  if (event.target === document.getElementById('checkout-modal-overlay')) {
    closeCheckoutModal();
  }
}



// Initialise empty cart display
updateCartUI();



/* ---- Interactive Flashlight Hover ---- */
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.interactive-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});