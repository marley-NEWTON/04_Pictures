/* ============================================================
   04 Pictures Company — script.js
   All interactive behaviours: preloader, nav, cursor,
   language switcher, scroll reveal, counters, portfolio
   filter, back-to-top, particles, form, typing effect.
   ============================================================ */

'use strict';

/* ── Preloader ──────────────────────────────────────────────── */
const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
  // Give the loading bar animation time to complete (~2s),
  // then fade out the preloader
  setTimeout(() => {
    preloader.classList.add('loaded');
    // Remove from DOM after fade transition
    preloader.addEventListener('transitionend', () => {
      preloader.remove();
    }, { once: true });
  }, 2200);
});

/* ── Custom Cursor ──────────────────────────────────────────── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (!cursor || !follower) return;

  // Only on non-touch devices
  if (window.matchMedia('(hover: none)').matches) {
    cursor.style.display   = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower using requestAnimationFrame
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top  = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Enlarge cursor on interactive elements
  const interactiveEls = 'a, button, [role="button"], input, textarea, select, .portfolio-item, .service-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactiveEls)) {
      cursor.style.transform   = 'translate(-50%, -50%) scale(2.5)';
      follower.style.transform = 'translate(-50%, -50%) scale(0.5)';
      follower.style.opacity   = '0.3';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactiveEls)) {
      cursor.style.transform   = 'translate(-50%, -50%) scale(1)';
      follower.style.transform = 'translate(-50%, -50%) scale(1)';
      follower.style.opacity   = '0.6';
    }
  });
})();

/* ── Navbar: scroll behaviour & active link ─────────────────── */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll detection
  function onScroll() {
    // Add glass when scrolled
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    let current = '';
    sections.forEach(section => {
      const sectionTop    = section.offsetTop - (navbar.offsetHeight + 80);
      const sectionBottom = sectionTop + section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load

  // Smooth scroll when clicking nav links (handles offset for fixed navbar)
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
          const offset = navbar.offsetHeight;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });

  // Also handle all internal anchor links on the page
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.classList.contains('nav-link')) return; // already handled
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      closeMobileMenu();
    });
  });
})();

/* ── Mobile Hamburger Menu ──────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

function closeMobileMenu() {
  if (hamburger && navLinksEl) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinksEl.classList.remove('open');
  }
}

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navLinksEl.classList.toggle('open', isOpen);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinksEl.contains(e.target)) {
      closeMobileMenu();
    }
  });
}

/* ── Language Switcher ──────────────────────────────────────── */
(function initLanguageSwitcher() {
  const langToggle = document.getElementById('langToggle');
  const langLabel  = document.getElementById('langLabel');

  if (!langToggle) return;

  let currentLang = 'en'; // default English

  // Translate every element that has data-en / data-sw attributes
  function applyLanguage(lang) {
    const attr = 'data-' + lang;
    document.querySelectorAll('[' + attr + ']').forEach(el => {
      const translation = el.getAttribute(attr);
      if (!translation) return;

      // For input/textarea placeholders
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
        return;
      }
      // For select options (translate text)
      if (el.tagName === 'OPTION') {
        el.textContent = translation;
        return;
      }
      // Default: update inner text (preserve child elements for links/buttons
      // that only have text children)
      if (el.children.length === 0) {
        el.textContent = translation;
      } else {
        // If there are children, only update the first text node
        for (let node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = translation;
            break;
          }
        }
      }
    });

    // Update html lang attribute for accessibility / SEO
    document.documentElement.setAttribute('lang', lang === 'sw' ? 'sw' : 'en');

    // Update the lang label badge
    if (langLabel) {
      langLabel.textContent = lang === 'en' ? 'EN' : 'SW';
    }
  }

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'sw' : 'en';
    applyLanguage(currentLang);

    // Animate toggle
    langToggle.style.transform = 'scale(0.9)';
    setTimeout(() => { langToggle.style.transform = ''; }, 200);
  });
})();

/* ── Hero Particle System ───────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const COUNT = 40;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    // Random horizontal position
    p.style.left  = Math.random() * 100 + '%';
    p.style.bottom = '-2px';

    // Random size (1–3px)
    const size = Math.random() * 2 + 1;
    p.style.width  = size + 'px';
    p.style.height = size + 'px';

    // Random animation duration & delay
    const dur   = (Math.random() * 10 + 6).toFixed(1) + 's';
    const delay = (Math.random() * 12).toFixed(1) + 's';
    const drift = (Math.random() * 100 - 50).toFixed(0) + 'px';

    p.style.setProperty('--dur',   dur);
    p.style.setProperty('--delay', delay);
    p.style.setProperty('--drift', drift);
    p.style.animationDuration = dur;
    p.style.animationDelay    = delay;

    fragment.appendChild(p);
  }
  container.appendChild(fragment);
})();

/* ── Typing / Typewriter Effect (Hero Tag) ──────────────────── */
(function initTypingEffect() {
  // Apply a subtle char-by-char reveal to the hero subtitle
  const subtitle = document.querySelector('.hero-subtitle');
  if (!subtitle) return;

  const originalText = subtitle.textContent.trim();
  subtitle.textContent = '';
  subtitle.style.opacity = '1'; // Override CSS animation since we handle it

  let charIndex = 0;
  let started = false;

  function startTyping() {
    if (started) return;
    started = true;
    subtitle.style.borderRight = '2px solid var(--gold)';

    function typeNextChar() {
      if (charIndex < originalText.length) {
        subtitle.textContent += originalText[charIndex];
        charIndex++;
        setTimeout(typeNextChar, 28); // speed per char (ms)
      } else {
        // Remove cursor blink after typing completes
        setTimeout(() => {
          subtitle.style.borderRight = 'none';
        }, 1500);
      }
    }
    typeNextChar();
  }

  // Start after preloader and hero animations settle (~3s)
  setTimeout(startTyping, 3000);
})();

/* ── Animated Counters (Hero Stats) ─────────────────────────── */
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  if (!statNums.length) return;

  let counted = false;

  function animateCounters() {
    if (counted) return;

    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      counted = true;
      statNums.forEach(el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 2000; // ms
        const start = performance.now();

        function update(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }
        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  animateCounters(); // check immediately
})();

/* ── Scroll Reveal Animations ───────────────────────────────── */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Unobserve after revealing (one-shot)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
})();

/* ── Portfolio Filter ───────────────────────────────────────── */
(function initPortfolioFilter() {
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (!filterBtns.length || !portfolioItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Filter items with animation
      portfolioItems.forEach((item, idx) => {
        const category = item.getAttribute('data-category');
        const show = filter === 'all' || category === filter;

        if (show) {
          item.classList.remove('hidden-filter');
          // Stagger the reveal
          item.style.transitionDelay = (idx * 0.04) + 's';
          item.style.opacity = '';
          item.style.transform = '';
        } else {
          // Fade out first, then hide
          item.style.opacity   = '0';
          item.style.transform = 'scale(0.9)';
          setTimeout(() => {
            item.classList.add('hidden-filter');
          }, 300);
        }
      });
    });
  });
})();

/* ── Back to Top Button ─────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── Contact Form ───────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Basic client-side validation
    const name    = form.querySelector('[name="name"]');
    const email   = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');
    let valid = true;

    [name, email, message].forEach(field => {
      if (!field) return;
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e05252';
        valid = false;
      }
    });

    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#e05252';
      valid = false;
    }

    if (!valid) return;

    // Simulate form submission (replace with actual endpoint / emailjs / etc.)
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = submitBtn.getAttribute('data-en') === 'Send Message'
      ? 'Sending…'
      : 'Inatuma…';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Show success message
      if (success) {
        success.classList.remove('hidden');
        success.style.animation = 'fadeInUp 0.5s ease-out both';
      }
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;

      // Hide success after 5 seconds
      setTimeout(() => {
        if (success) success.classList.add('hidden');
      }, 5000);
    }, 1500);
  });
})();

/* ── Navbar Logo click scrolls to top ──────────────────────── */
document.querySelectorAll('.nav-logo, .footer-logo').forEach(logo => {
  logo.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ── Service Card Hover: tilt effect ───────────────────────── */
(function initCardTilt() {
  // Subtle 3D tilt on service cards (desktop only)
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top  + rect.height / 2;
      const offsetX = (e.clientX - centerX) / (rect.width / 2);
      const offsetY = (e.clientY - centerY) / (rect.height / 2);

      card.style.transform = `
        translateY(-6px)
        rotateY(${offsetX * 5}deg)
        rotateX(${-offsetY * 4}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── Reel card: pulsing glow on hover ──────────────────────── */
document.querySelectorAll('.reel-placeholder').forEach(reel => {
  reel.addEventListener('click', () => {
    // Placeholder: In production, open video modal or play video
    alert('🎬 Place your video embed here.\nReplace this placeholder with a <video> or YouTube iframe.');
  });
});

/* ── Portfolio: open lightbox placeholder ─────────────────── */
document.querySelectorAll('.portfolio-expand').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const item  = btn.closest('.portfolio-item');
    const title = item ? item.querySelector('.portfolio-title') : null;
    const name  = title ? title.textContent : 'Image';
    // Placeholder lightbox message
    alert('📷 Lightbox: ' + name + '\nReplace this with your actual image lightbox component.');
  });
});

/* ── Intersection Observer: hero stats section animates
      once — combine with counter init ──────────────────────── */

/* ── Dynamic year in footer copyright ──────────────────────── */
(function updateCopyrightYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-en]').forEach(el => {
    const en = el.getAttribute('data-en');
    const sw = el.getAttribute('data-sw');
    if (en && en.includes('© 2024')) {
      el.setAttribute('data-en', en.replace('2024', year));
    }
    if (sw && sw.includes('© 2024')) {
      el.setAttribute('data-sw', sw.replace('2024', year));
    }
    if (el.textContent.includes('© 2024')) {
      el.textContent = el.textContent.replace('2024', year);
    }
  });
})();

/* ── Hero section: parallax on mouse move ──────────────────── */
(function initHeroParallax() {
  const hero    = document.querySelector('.hero-section');
  const overlay = document.querySelector('.hero-overlay');
  if (!hero || !overlay) return;
  if (window.matchMedia('(hover: none)').matches) return;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;

    overlay.style.transform = `translate(${x * 20}px, ${y * 16}px) scale(1.06)`;
  });

  hero.addEventListener('mouseleave', () => {
    overlay.style.transform = '';
  });
})();

/* ── Section: add subtle border-top line as sections enter ─── */
(function initSectionDividers() {
  // Marks sections as in-view for styling hooks if needed
  const sections = document.querySelectorAll('section');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.1 });
  sections.forEach(s => obs.observe(s));
})();

/* ── Prevent right-click on placeholder images (optional) ──── */
document.querySelectorAll('.img-placeholder').forEach(el => {
  el.addEventListener('contextmenu', e => e.preventDefault());
});

/* ── Console branding ──────────────────────────────────────── */
console.log(
  '%c04 Pictures Company %c\nTurning Moments Into Visual Legacies.',
  'font-size:24px; font-weight:bold; color:#c9a84c; background:#000; padding:8px 16px;',
  'font-size:12px; color:#888; padding:4px 16px 8px;'
);