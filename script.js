/* =====================================================
   HoloDisplay — script.js
   ===================================================== */

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
    q.nextElementSibling.classList.remove('open');
  });

  // Open the clicked one (if it wasn't open)
  if (!isOpen) {
    btn.classList.add('open');
    answer.classList.add('open');
  }
}

/* ---- Add to Cart Toast ---- */
const toast = document.getElementById('toast');
let toastTimer;

function addToCart(model) {
  clearTimeout(toastTimer);
  toast.textContent = `✅ ${model} ajouté au panier !`;
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
  document.getElementById('modal-price').textContent = p.price.toLocaleString() + ' DA';
  document.getElementById('modal-qty').textContent = '1';
  document.getElementById('modal-tag').textContent = 'Modèle HoloDisplay';

  const img = document.getElementById('modal-img');
  // Clear any existing background image
  img.style.backgroundImage = 'none';

  // Set the product-specific image as a child element
  img.innerHTML = '';

  if (productId === 'MS-16') {
    const imgElement = document.createElement('img');
    imgElement.src = 'holo fan.jpeg';
    imgElement.alt = 'MS Product Image';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    img.appendChild(imgElement);
  } else {
    // Fallback
    const imgElement = document.createElement('img');
    imgElement.src = 'holo fan.jpeg';
    imgElement.alt = 'Product Image';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'cover';
    img.appendChild(imgElement);
  }

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
  cartCountEl.classList.remove('bump');
  // Trigger reflow to restart animation
  void cartCountEl.offsetWidth;
  cartCountEl.classList.add('bump');

  // Remove bump after animation completes
  setTimeout(() => cartCountEl.classList.remove('bump'), 300);

  // Toast
  clearTimeout(toastTimer);
  toast.textContent = `✅ ${product.name} × ${qty} ajouté au panier !`;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function removeFromCart(productId) {
  delete cart[productId];
  updateCartUI();
}

function changeCartQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].qty = Math.max(1, cart[productId].qty + delta);
  updateCartUI();
}

function updateCartUI() {
  const totalItems = Object.values(cart).reduce((s, v) => s + v.qty, 0);
  document.getElementById('cart-count').textContent = totalItems;

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
      let imgStyle = "background-image:url('holo fan.jpeg');background-size:cover;background-position:center;";

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
          <span class="cart-item-price">${(product.price * qty).toLocaleString()} DA</span>
          <button class="cart-remove-btn" onclick="removeFromCart('${product.name}')">إزالة</button>
        </div>
      </div>
    `;
    }).join('');

    const subtotal = entries.reduce((s, { product, qty }) => s + product.price * qty, 0);
    document.getElementById('cart-subtotal').textContent = subtotal.toLocaleString() + ' DA';
    document.getElementById('cart-total').textContent = subtotal.toLocaleString() + ' DA';
  }
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
    closeModal();
    if (document.getElementById('cart-overlay').classList.contains('open')) toggleCart();
  }
});



// Open checkout modal
function openCheckoutModal() {
  if (Object.keys(cart).length === 0) {
    alert('سلة التسوق الخاصة بك فارغة!');
    return;
  }

  // Populate order details
  const orderDetailsContainer = document.getElementById('checkout-order-details');
  const checkoutTotalElement = document.getElementById('checkout-total');

  let orderHTML = '';
  let total = 0;

  for (const [productName, item] of Object.entries(cart)) {
    const itemTotal = item.qty * item.product.price;
    total += itemTotal;

    orderHTML += `
      <div class="order-details-item">
        <div>
          <strong>${item.product.name}</strong><br>
          <small>${item.product.size}</small><br>
          Quantity: ${item.qty}
        </div>
        <div style="text-align: right;">${itemTotal.toLocaleString()} DA</div>
      </div>
    `;
  }

  orderDetailsContainer.innerHTML = orderHTML;
  checkoutTotalElement.textContent = total.toLocaleString() + ' DA';

  // Show the modal
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Confirm purchase and send email
function confirmPurchase() {
  if (Object.keys(cart).length === 0) {
    alert('سلة التسوق الخاصة بك فارغة!');
    return;
  }

  // Gather customer info
  const customerName = document.getElementById('customer-name').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerPhone = document.getElementById('customer-phone').value;

  if (!customerName || !customerEmail || !customerPhone) {
    alert('يرجى ملء جميع بيانات الاتصال حتى نتمكن من الوصول إليك.');
    return;
  }

  // Check if emailjs is available
  if (typeof emailjs !== 'undefined' && emailjs.send) {
    // Prepare cart data for email
    const cartData = [];
    for (const [productName, item] of Object.entries(cart)) {
      cartData.push(`${item.product.name} (${item.product.size}): ${item.qty} x ${item.product.price} DA = ${item.qty * item.product.price} DA`);
    }

    const totalAmount = Object.values(cart).reduce((sum, item) => sum + (item.qty * item.product.price), 0);

    const templateParams = {
      to_email: 'ksantinirafik14@gmail.com',
      email: 'ksantinirafik14@gmail.com',     // Matches {{email}} in your dashboard snapshot for To Email
      customer_email: customerEmail,          // So you can use {{customer_email}} for Reply-To
      from_name: customerName,
      to_name: 'Store Manager',
      subject: `New Lead / Order from: ${customerName}`,
      message: `CUSTOMER DETAILS:\nName:  ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone}\n\nORDER SUMMARY:\n${cartData.join('\n')}\n\nTOTAL VALUE: ${totalAmount.toLocaleString()} DA`
    };

    emailjs.send('service_ad41xmi', 'template_t6h379o', templateParams)
      .then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
        alert('تم إرسال طلب الشراء! سنتصل بك قريباً.');
        // Clear cart and close modal
        closeCheckoutModal();
        // Reset cart UI
        for (const productId in cart) {
          delete cart[productId];
        }
        updateCartUI();
      }, function (error) {
        console.log('FAILED...', error);
        alert('حدث خطأ أثناء إرسال طلبك. يرجى الاتصال بنا مباشرة.');
      });
  } else {
    // Fallback if emailjs is not available
    alert('Email service not configured. In a live environment, this would send an order confirmation email.\n\nProceeding to clear cart for demo purposes.');
    // Clear cart and close modal
    closeCheckoutModal();
    // Reset cart UI
    for (const productId in cart) {
      delete cart[productId];
    }
    updateCartUI();
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modalOverlay = document.getElementById('checkout-modal-overlay');
  if (event.target === modalOverlay) {
    closeCheckoutModal();
  }
}



// Initialise empty cart display
updateCartUI();
