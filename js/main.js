/**
 * Prime Outdoor Experts — Main JavaScript
 * Handles: sticky nav, mobile menu, dropdowns, scroll animations, FAQ accordion
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     STICKY HEADER
  -------------------------------------------------------------------------- */
  const header = document.querySelector('.site-header');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------------------
     MOBILE NAV HAMBURGER
  -------------------------------------------------------------------------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* --------------------------------------------------------------------------
     NAV DROPDOWNS — click, hover, and keyboard accessible
  -------------------------------------------------------------------------- */
  const navItems = document.querySelectorAll('.nav-item');

  function closeAllDropdowns(except) {
    navItems.forEach((item) => {
      if (item === except) return;
      item.classList.remove('dropdown-open');
      const link = item.querySelector('.nav-link');
      if (link) link.setAttribute('aria-expanded', 'false');
    });
  }

  navItems.forEach((item) => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.nav-dropdown');

    if (!dropdown || !link) return;

    // Make trigger keyboard-accessible
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');
    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');

    const open = () => {
      item.classList.add('dropdown-open');
      link.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      item.classList.remove('dropdown-open');
      link.setAttribute('aria-expanded', 'false');
    };

    const toggle = () => {
      const isOpen = item.classList.contains('dropdown-open');
      closeAllDropdowns();
      if (!isOpen) open(); else close();
    };

    // Click to toggle (works on touch + desktop)
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // Hover open/close (desktop only — enhances click)
    item.addEventListener('mouseenter', () => {
      closeAllDropdowns(item);
      open();
    });
    item.addEventListener('mouseleave', close);

    // Keyboard support
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') close();
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const insideNav = e.target.closest('.nav-item');
    if (!insideNav) closeAllDropdowns();
  });

  /* --------------------------------------------------------------------------
     FAQ ACCORDION
  -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.setAttribute('aria-expanded', 'false');
    const answerId = 'faq-answer-' + Math.random().toString(36).slice(2, 7);
    answer.id = answerId;
    btn.setAttribute('aria-controls', answerId);

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);

      // Close siblings
      if (isOpen) {
        faqItems.forEach((other) => {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     SCROLL ANIMATIONS (Intersection Observer) + Proof bar count-up
  -------------------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const fadeEls = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger count-up for proof stats
            if (entry.target.classList.contains('proof-stat') && entry.target.dataset.count) {
              animateCount(entry.target);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach((el) => {
      el.classList.add('visible');
      if (el.classList.contains('proof-stat') && el.dataset.count) animateCount(el);
    });
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
    const span = el.querySelector('.num span');
    if (!span) return;

    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 2);
      const current = target * easeOut;
      span.textContent = decimals ? current.toFixed(decimals) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
      else span.textContent = decimals ? target.toFixed(decimals) : target;
    }
    requestAnimationFrame(step);
  }

  /* --------------------------------------------------------------------------
     MOBILE STICKY BAR — hide when footer is visible
  -------------------------------------------------------------------------- */
  const stickyBar = document.querySelector('.mobile-sticky-bar');
  const footer = document.querySelector('.footer');

  if (stickyBar && footer && 'IntersectionObserver' in window) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stickyBar.style.display = entry.isIntersecting ? 'none' : '';
        });
      },
      { threshold: 0.1 }
    );
    footerObserver.observe(footer);
  }

  /* --------------------------------------------------------------------------
     CONTACT FORM — query string pre-fill
     e.g. /contact/?type=commercial
  -------------------------------------------------------------------------- */
  const typeSelect = document.querySelector('select[name="property_type"]');

  if (typeSelect) {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');

    if (typeParam === 'commercial') {
      // Select first commercial option
      for (const opt of typeSelect.options) {
        if (opt.value.toLowerCase().includes('hoa') || opt.value.toLowerCase().includes('commercial')) {
          opt.selected = true;
          break;
        }
      }
    } else if (typeParam === 'residential') {
      for (const opt of typeSelect.options) {
        if (opt.value.toLowerCase().includes('residential')) {
          opt.selected = true;
          break;
        }
      }
    }
  }

  /* --------------------------------------------------------------------------
     CONTACT FORM — client-side validation + pseudo-submit
  -------------------------------------------------------------------------- */
  const quoteForm = document.querySelector('.quote-form');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const requiredFields = quoteForm.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach((field) => {
        field.classList.remove('error');

        if (!field.value.trim()) {
          field.classList.add('error');
          field.style.borderColor = '#E53935';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (valid) {
        // TODO: Connect to form backend (Gravity Forms, Netlify Forms, Formspree, etc.)
        // For now, show a success message
        quoteForm.innerHTML = `
          <div style="text-align:center; padding: 48px 24px;">
            <div style="font-size:48px; margin-bottom:16px;">✅</div>
            <h3 style="margin-bottom:12px;">Request Received!</h3>
            <p style="color:#5A5A5A;">Thank you — we'll be in touch within 2 business hours.<br>
            For urgent inquiries, call <a href="tel:+14074434505" style="color:#A0C200; font-weight:700;">(407) 443-4505</a>.</p>
          </div>
        `;
      }
    });

    // Clear error styling on input
    quoteForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.style.borderColor = '';
        field.classList.remove('error');
      });
    });
  }

  /* --------------------------------------------------------------------------
     SMOOTH SCROLL for anchor links
  -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
