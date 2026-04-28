/**
 * Prime Outdoor Experts — Florida Heat
 * Interactive components: quote wizard, sticky CTAs, marquee, magnetic buttons
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Quote Wizard — 60-second estimator
  // ---------------------------------------------------------------------------
  const wizard = document.querySelector('[data-quote-wizard]');
  if (wizard) {
    const state = { type: null, size: null, freq: null };

    // Pricing matrix — keep in sync with /residential/ and /commercial-landscaping/ pages
    // Returns [low, high] in $/month
    function estimate({ type, size, freq }) {
      if (!type || !size || !freq) return null;

      // Residential weekly base
      const RESIDENTIAL = {
        small:  { weekly: [140, 220], biweekly: [80, 140] },   // <0.25 acre
        medium: { weekly: [220, 360], biweekly: [140, 220] },  // 0.25–0.5 acre
        large:  { weekly: [360, 600], biweekly: [220, 360] },  // 0.5+ acre
      };
      // Commercial monthly
      const COMMERCIAL = {
        small:  [500, 1500],   // small HOA / single retail
        medium: [1500, 4000],  // mid-size HOA / office park
        large:  [4000, 9000],  // large HOA / corporate campus
      };

      if (type === 'residential') {
        return RESIDENTIAL[size]?.[freq] ?? null;
      }
      // commercial — frequency baked into monthly
      return COMMERCIAL[size] ?? null;
    }

    function fmt(n) {
      return '$' + n.toLocaleString('en-US');
    }

    const resultEl = wizard.querySelector('[data-qw-result]');
    const priceEl = wizard.querySelector('[data-qw-price]');
    const ctaEl = wizard.querySelector('[data-qw-cta]');

    function update() {
      const range = estimate(state);
      if (!range) {
        resultEl.style.display = 'none';
        return;
      }
      const [lo, hi] = range;
      const unit = state.type === 'residential' && state.freq ? '/mo' : '/mo';
      priceEl.innerHTML = `${fmt(lo)} – ${fmt(hi)}<em>${unit}</em>`;
      resultEl.style.display = 'block';
      // Update CTA href to pre-fill contact form
      if (ctaEl) {
        const params = new URLSearchParams({
          type: state.type,
          property_size: state.size,
          ...(state.freq ? { frequency: state.freq } : {}),
          estimate: `${fmt(lo)}-${fmt(hi)}/mo`,
        });
        ctaEl.href = `/contact/?${params.toString()}`;
      }
    }

    // Show/hide frequency step based on residential vs commercial
    const freqStep = wizard.querySelector('[data-qw-step="freq"]');
    function syncSteps() {
      if (state.type === 'commercial') {
        freqStep.style.display = 'none';
        state.freq = 'monthly';
      } else if (state.type === 'residential') {
        freqStep.style.display = '';
        if (state.freq === 'monthly') state.freq = null;
      }
    }

    wizard.querySelectorAll('.qw-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const step = btn.dataset.qwStep;
        const value = btn.dataset.qwValue;
        wizard
          .querySelectorAll(`.qw-option[data-qw-step="${step}"]`)
          .forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        state[step] = value;
        syncSteps();
        update();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Marquee — duplicate items so the animation loops seamlessly
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.marquee-track').forEach((track) => {
    if (track.dataset.duplicated === 'true') return;
    track.innerHTML = track.innerHTML + track.innerHTML;
    track.dataset.duplicated = 'true';
  });

  // ---------------------------------------------------------------------------
  // Sticky floating CTAs — appear after scrolling past hero
  // ---------------------------------------------------------------------------
  const floatingCta = document.querySelector('.fh-floating-cta');
  const availability = document.querySelector('.fh-availability');
  if (floatingCta || availability) {
    let triggered = false;
    const onScroll = () => {
      const triggerY = window.innerHeight * 0.6;
      const visible = window.scrollY > triggerY;
      if (visible && !triggered) {
        floatingCta?.classList.add('visible');
        availability?.classList.add('visible');
        triggered = true;
      } else if (!visible && triggered) {
        floatingCta?.classList.remove('visible');
        availability?.classList.remove('visible');
        triggered = false;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------------------------------------------------------------------------
  // Magnetic buttons — cursor pull effect on hero CTAs
  // ---------------------------------------------------------------------------
  const magneticBtns = document.querySelectorAll('.btn-magnetic, .hero .btn-primary');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ---------------------------------------------------------------------------
  // Compute next-available label dynamically
  // ---------------------------------------------------------------------------
  const availabilityLabel = document.querySelector('[data-next-available]');
  if (availabilityLabel) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    // Skip Sunday (closed). Otherwise next business day
    let next = new Date(now);
    next.setDate(next.getDate() + 1);
    if (next.getDay() === 0) next.setDate(next.getDate() + 1);  // Sun → Mon
    const time = next.getHours() < 12 ? '10am' : '2pm';  // pleasant default
    availabilityLabel.textContent = `${days[next.getDay()]} ${time}`;
  }

  // ---------------------------------------------------------------------------
  // Stat counter animation (re-bind for new .stat-strip-num elements)
  // ---------------------------------------------------------------------------
  const statNums = document.querySelectorAll('.stat-strip-num[data-count]');
  if ('IntersectionObserver' in window && statNums.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
        const suffix = el.dataset.suffix || '';
        const span = el.querySelector('span') || el;
        const start = performance.now();
        const dur = 1400;
        function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          span.textContent = decimals ? val.toFixed(decimals) : Math.round(val);
          if (t < 1) requestAnimationFrame(step);
          else span.textContent = decimals ? target.toFixed(decimals) : target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    statNums.forEach((el) => obs.observe(el));
  }

  // ---------------------------------------------------------------------------
  // CURSOR-TILT PARALLAX — subtle 3D effect on cards (.section-dark .card, .path-card)
  // Updates --tilt-x and --tilt-y on each card based on cursor position.
  // Only active on devices with hover; respects prefers-reduced-motion.
  // ---------------------------------------------------------------------------
  if (
    'matchMedia' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.matchMedia('(hover: hover)').matches
  ) {
    const tiltSelectors = [
      '.section-dark .card',
      '.path-card',
      '.diff-item',
      '.gallery-item',
    ];
    const tiltCards = document.querySelectorAll(tiltSelectors.join(', '));

    const MAX_TILT = 6;       // degrees
    const MAX_LIFT = -4;      // pixels
    const SETTLE_MS = 260;

    tiltCards.forEach((card) => {
      card.classList.add('tilt-card');
      let raf = null;

      function onMove(e) {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width;   // 0..1
          const py = (e.clientY - rect.top) / rect.height;   // 0..1
          const tiltX = (px - 0.5) * 2 * MAX_TILT;           // -MAX..+MAX
          const tiltY = (0.5 - py) * 2 * MAX_TILT;
          card.style.setProperty('--tilt-x', tiltX.toFixed(2));
          card.style.setProperty('--tilt-y', tiltY.toFixed(2));
          card.style.setProperty('--tilt-lift', `${MAX_LIFT}px`);
        });
      }

      function onLeave() {
        if (raf) cancelAnimationFrame(raf);
        // Smooth settle back to 0
        card.style.transition = `transform ${SETTLE_MS}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        card.style.setProperty('--tilt-x', 0);
        card.style.setProperty('--tilt-y', 0);
        card.style.setProperty('--tilt-lift', '0px');
        setTimeout(() => { card.style.transition = ''; }, SETTLE_MS);
      }

      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  // ---------------------------------------------------------------------------
  // EDITORIAL HERO — cursor parallax on photo collage
  // Translates each photo by mouse offset using CSS variables --px / --py.
  // The CSS rule combines this with the photo's base rotation:
  //    transform: rotate(var(--rot)) translate(calc(var(--px)*1px + var(--tx)), ...)
  // ---------------------------------------------------------------------------
  const heroEditorial = document.querySelector('[data-hero-editorial]');
  if (
    heroEditorial &&
    'matchMedia' in window &&
    window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const photos = heroEditorial.querySelectorAll('.hero-photo[data-tilt]');
    // Each photo gets a different parallax weight for depth
    const weights = [
      { x:  -10, y:  -8 },  // photo 1 — top-right, deepest
      { x:   16, y:  12 },  // photo 2 — left, opposite direction
      { x:  -14, y: -14 },  // photo 3 — bottom-right
    ];
    let raf = null;
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };

    function tick() {
      // ease toward target for a smooth, lazy follow
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      photos.forEach((p, i) => {
        const w = weights[i] || weights[0];
        p.style.setProperty('--px', (current.x * w.x).toFixed(2));
        p.style.setProperty('--py', (current.y * w.y).toFixed(2));
      });
      if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }

    heroEditorial.addEventListener('mousemove', (e) => {
      const rect = heroEditorial.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5..0.5
      target.y = (e.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    heroEditorial.addEventListener('mouseleave', () => {
      target.x = 0;
      target.y = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  // ---------------------------------------------------------------------------
  // EDITORIAL HERO — fade out scroll cue once user scrolls
  // ---------------------------------------------------------------------------
  const scrollCue = document.querySelector('.hero-scroll-cue');
  if (scrollCue) {
    const onScrollFade = () => {
      const op = Math.max(0, 1 - window.scrollY / 240);
      scrollCue.style.opacity = op.toFixed(2);
    };
    window.addEventListener('scroll', onScrollFade, { passive: true });
    onScrollFade();
  }
})();
