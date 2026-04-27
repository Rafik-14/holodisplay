/* ============================================================
   HOLODISPLAY — micro-interactions.js
   Premium upgrades: Magnetic Buttons, Scroll-Reveal stagger,
   FAQ Accordion, Typing Effect, VanillaTilt 3D
   ============================================================ */

/* ─── 1. MAGNETIC BUTTONS ─── */
function initMagneticButtons() {
  const SELECTOR = '.btn-primary, .btn-nav, [data-magnetic]';
  const STRENGTH = 0.38; // pull strength (0 = none, 1 = full cursor pos)
  const RADIUS   = 80;   // pixels around button before effect kicks in

  document.querySelectorAll(SELECTOR).forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < RADIUS) {
        const pull = (1 - dist / RADIUS) * STRENGTH;
        btn.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ─── 2. SCROLL-REVEAL with cascade stagger ─── */
function initScrollReveal() {
  // Mark all bento cells for reveal with staggered delays
  document.querySelectorAll('.aether-grid .ab-cell').forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = Math.min(i * 80, 400);
  });

  document.querySelectorAll('.products-grid .product-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = Math.min(i * 80, 400);
  });

  document.querySelectorAll('.reviews-grid .review-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = Math.min(i * 100, 400);
  });

  document.querySelectorAll('.ugc-grid .ugc-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = Math.min(i * 80, 320);
  });

  // Also ensure hero text is revealed immediately on load
  const heroText = document.querySelector('.hero-text');
  if (heroText) {
    heroText.classList.add('reveal');
    setTimeout(() => heroText.classList.add('visible'), 200);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── 3. FAQ ACCORDION (replaces static + icon toggles to ×) ─── */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    // Inject icon span if not present
    if (!btn.querySelector('.faq-icon')) {
      const icon = document.createElement('span');
      icon.className = 'faq-icon';
      icon.textContent = '+';
      btn.appendChild(icon);
    }

    // Remove any inline onclick so we don't double-fire
    btn.removeAttribute('onclick');

    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-question').forEach(q => {
        q.classList.remove('open');
        const a = q.nextElementSibling;
        if (a) a.classList.remove('open');
        const ic = q.querySelector('.faq-icon');
        if (ic) ic.textContent = '+';
      });

      // Open clicked one
      if (!isOpen) {
        btn.classList.add('open');
        if (answer) answer.classList.add('open');
        const ic = btn.querySelector('.faq-icon');
        if (ic) ic.textContent = '+'; // CSS rotation handles visual change
      }
    });
  });
}

/* ─── 4. TYPING / TERMINAL EFFECT ─── */
function typeText(element, text, speed = 50, startDelay = 0) {
  let i = 0;
  element.textContent = '';
  element.classList.add('typing-text');

  setTimeout(() => {
    const interval = setInterval(() => {
      element.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        // Remove cursor after a beat
        setTimeout(() => element.classList.remove('typing-text'), 2500);
      }
    }, speed);
  }, startDelay);
}

function initTypingEffect() {
  // Target the "01 / HoloDisplay" section tag
  const sectionTag = document.querySelector('.section-tag');
  if (!sectionTag) return;

  const originalText = sectionTag.textContent.trim();

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeText(sectionTag, originalText, 55, 200);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(sectionTag);
}

/* ─── 5. VANILLA TILT — 3D tilt on hero bento card ─── */
function loadVanillaTilt() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js';
  script.onload = () => {
    const heroCell = document.querySelector('.ab-hero');
    if (heroCell && window.VanillaTilt) {
      VanillaTilt.init(heroCell, {
        max: 8,
        speed: 600,
        glare: true,
        'max-glare': 0.12,
        scale: 1.02,
        gyroscope: false,
        perspective: 900,
        easing: 'cubic-bezier(.03,.98,.52,.99)',
        reset: true
      });
    }
  };
  document.head.appendChild(script);
}

/* ─── 6. GLASSMORPHISM NAV — ensure always blurred ─── */
function initGlassNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  // Always apply glass immediately
  nav.style.backdropFilter = 'blur(12px)';
  nav.style.webkitBackdropFilter = 'blur(12px)';

  // Scrolled state handled by CSS class, but ensure it fires immediately
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── 7. RTL/LTR DIRECTION FIX ─── */
function initRTLFix() {
  // The HTML already has dir="rtl", but nav-links may need explicit alignment
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.style.direction = 'rtl';
  }

  // Ensure hero text reads correctly in RTL
  const heroText = document.querySelector('.hero-text');
  if (heroText) {
    heroText.style.textAlign = 'center';
  }

  // English-content blocks stay LTR
  document.querySelectorAll('.ab-specs-table, .ab-vis-val, .ab-review-stars').forEach(el => {
    el.setAttribute('dir', 'ltr');
  });
}

/* ─── 8. MINI-BENTO HOVER SPRINGS (hero cards) ─── */
function initMiniBentoSprings() {
  document.querySelectorAll('.mini-bento-card').forEach(card => {
    card.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.25s ease';

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.06) translateY(-2px)';
      card.style.boxShadow = '0 0 0 1px rgba(155,127,232,0.35), 0 8px 24px rgba(155,127,232,0.12)';
      card.style.borderColor = 'rgba(155,127,232,0.4)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.borderColor = '';
    });
  });
}

/* ─── INIT ALL ─── */
document.addEventListener('DOMContentLoaded', () => {
  initGlassNav();
  initScrollReveal();
  initMagneticButtons();
  initFAQ();
  initTypingEffect();
  initMiniBentoSprings();
  initRTLFix();

  // Tilt loads asynchronously after a short delay so it doesn't block paint
  setTimeout(loadVanillaTilt, 800);
});
