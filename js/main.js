/* ============================================================
   BAMBINIS — Guardería y Estancia Infantil — main.js
   ============================================================ */
(function () {
  'use strict';

  /* ── 1. Loader ─────────────────────────────────────────── */
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('out');
      document.body.classList.add('loaded');
      // Hero bg scale-in
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg) heroBg.classList.add('loaded');
      // Trigger hero text animations
      ['hero-badge','hero-sub','hero-ctas','hero-trust'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('in');
      });
    }, 700);
  });

  /* ── 2. Navbar scroll ──────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── 3. Hamburger ──────────────────────────────────────── */
  const burger  = document.getElementById('hamburger');
  const mobMenu = document.getElementById('mob-menu');

  burger.addEventListener('click', () => {
    const open = mobMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  mobMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── 4. Scroll Reveal (IntersectionObserver) ───────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── 5. Stat counter animation ─────────────────────────── */
  const statEls = document.querySelectorAll('[data-count]');
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(e.target);
        statObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });
  statEls.forEach(el => statObs.observe(el));

  function countUp(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix  || '';
    const prefix   = el.dataset.prefix  || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const dur      = 2000;
    const start    = performance.now();

    function ease(t) { return 1 - Math.pow(1 - t, 3); }

    (function tick(now) {
      const progress = Math.min((now - start) / dur, 1);
      const val = ease(progress) * target;
      el.textContent = prefix + (decimals > 0
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString('es-MX')) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ── 6. Marquee fill ────────────────────────────────────── */
  const marqueeInner = document.querySelector('.marquee-inner');
  if (marqueeInner) {
    const items = [
      'Guardería y Estancia Infantil', 'Niños de 2 a 10 Años', 'Horario Extendido 7:30–7:00',
      'Inscripciones Todo el Año', 'Fracc. Justo Sierra', 'Cupo Limitado',
      'Lactantes y Maternal', 'Alimentos Incluidos', 'Ciudad del Carmen, Campeche'
    ];
    const full = [...items, ...items, ...items, ...items];
    marqueeInner.innerHTML = full.map(t => `<span>${t}</span>`).join('');
  }

  /* ── 7. WhatsApp form ──────────────────────────────────── */
  const form = document.getElementById('wa-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name     = (document.getElementById('f-name')    || {}).value?.trim() || '';
      const interest = (document.getElementById('f-interest') || {}).value         || '';
      const message  = (document.getElementById('f-msg')     || {}).value?.trim()  || '';

      if (!name || !message) {
        showFormError('Por favor completa tu nombre y cuéntanos sobre tu hijo(a).');
        return;
      }

      const phone = '5219381079202';
      const text  = encodeURIComponent(
        `Hola Bambinis 🎈\n\nSoy *${name}*.\nMe interesa: *${interest}*.\n\n${message}`
      );
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
    });
  }

  function showFormError(msg) {
    let err = document.getElementById('form-error');
    if (!err) {
      err = document.createElement('p');
      err.id = 'form-error';
      err.style.cssText = 'color:#f87171;font-size:13px;margin-top:12px;text-align:center;';
      form.appendChild(err);
    }
    err.textContent = msg;
    setTimeout(() => { if (err) err.textContent = ''; }, 4000);
  }

  /* ── 7b. Gallery lightbox ──────────────────────────────── */
  (function initLightbox() {
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    if (!items.length || !lightbox) return;

    const itemsArr = Array.prototype.slice.call(items);
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    let lastFocused = null;
    let currentIndex = 0;

    function show(index) {
      currentIndex = (index + itemsArr.length) % itemsArr.length;
      const item = itemsArr[currentIndex];
      const thumb = item.querySelector('img');
      imgEl.src = item.getAttribute('data-full');
      imgEl.alt = thumb ? thumb.alt : '';
      captionEl.textContent = item.getAttribute('data-caption') || '';
      if (counterEl) counterEl.textContent = (currentIndex + 1) + ' / ' + itemsArr.length;
    }

    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      if (lastFocused) lastFocused.focus();
    }

    itemsArr.forEach((item, i) => item.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', () => show(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(currentIndex + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(currentIndex - 1);
      else if (e.key === 'ArrowRight') show(currentIndex + 1);
    });
  }());

  /* ── 8. Footer year ─────────────────────────────────────── */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── 9. Hero Canvas — Orbs + Sparks ────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const heroEl = document.getElementById('hero');
  if (!canvas || !heroEl) return;

  const ctx = canvas.getContext('2d');
  let raf = null, orbs = [], sparks = [], W = 0, H = 0;

  function resizeCanvas() {
    W = canvas.width  = heroEl.offsetWidth;
    H = canvas.height = heroEl.offsetHeight;
    spawnOrbs();
    spawnSparks();
  }

  /* Large ambient orb */
  class Orb {
    constructor(cold) { this.reset(cold ?? true); }
    reset(cold) {
      this.r  = Math.random() * 300 + 180;
      this.x  = cold ? Math.random() * W : (Math.random() > 0.5 ? -this.r : W + this.r);
      this.y  = cold ? Math.random() * H : Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.38;
      this.vy = (Math.random() - 0.5) * 0.32;
      const palette = [
        [ 34, 168, 229, 0.05 ],
        [ 16, 132, 196, 0.055],
        [255, 255, 255, 0.018],
        [126, 193,  68, 0.03 ],
        [240,  74,  66, 0.028],
      ];
      const [r,g,b,a] = palette[Math.floor(Math.random() * palette.length)];
      this.color = `rgba(${r},${g},${b},${a})`;
    }
    tick() {
      this.x += this.vx; this.y += this.vy;
      if (this.x - this.r > W + 60 || this.x + this.r < -60 ||
          this.y - this.r > H + 60 || this.y + this.r < -60) this.reset(false);
    }
    draw() {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, this.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
  }

  /* Small glowing spark that floats upward */
  class Spark {
    constructor(initY) { this._init(initY !== undefined ? initY : null); }
    _init(startY) {
      this.x    = Math.random() * W;
      this.y    = startY !== null ? startY : H + 5;
      this.vx   = (Math.random() - 0.5) * 0.55;
      this.vy   = -(Math.random() * 0.65 + 0.28);
      this.size = Math.random() * 1.7 + 0.45;
      this.life  = startY !== null ? Math.random() : 1;
      this.decay = Math.random() * 0.003 + 0.0014;
      this.hue   = Math.random() * 40 + 190;
    }
    tick() {
      this.x += this.vx; this.y += this.vy; this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this._init(null);
    }
    draw() {
      const a = this.life * 0.68;
      const r = this.size * 3.8;
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
      g.addColorStop(0, `hsla(${this.hue},100%,86%,${a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }
  }

  function spawnOrbs() {
    const count = W < 768 ? 5 : 10;
    orbs = Array.from({ length: count }, () => new Orb(true));
  }

  function spawnSparks() {
    const count = W < 768 ? 28 : 50;
    sparks = Array.from({ length: count }, () => new Spark(Math.random() * H));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';
    orbs.forEach(o => { o.tick(); o.draw(); });
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(drawFrame);
  }

  const visObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { if (!raf) drawFrame(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 });
  visObs.observe(heroEl);

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  /* ── 10. Cursor glow + sparks + mouse parallax ──────────── */
  let glowX = -999, glowY = -999;

  /* Parallax state */
  let pMouseX = 0, pMouseY = 0, pCurrX = 0, pCurrY = 0;
  const heroGridEl    = document.querySelector('.hero-grid');
  const heroContentEl = document.querySelector('.hero-content');
  const heroVigEl     = document.querySelector('.hero-vignette');

  heroEl.addEventListener('mousemove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    glowX   = e.clientX - rect.left;
    glowY   = e.clientY - rect.top;
    pMouseX = (e.clientX - rect.left) / rect.width  - 0.5;
    pMouseY = (e.clientY - rect.top)  / rect.height - 0.5;
  });

  heroEl.addEventListener('mouseleave', () => {
    glowX = -999; glowY = -999;
    pMouseX = 0;  pMouseY = 0;
  });

  function drawFrameWithCursor() {
    /* Smooth parallax lerp */
    pCurrX += (pMouseX - pCurrX) * 0.04;
    pCurrY += (pMouseY - pCurrY) * 0.04;
    if (heroGridEl)    heroGridEl.style.transform    = `translate(${-pCurrX * 32}px, ${-pCurrY * 20}px)`;
    if (heroContentEl) heroContentEl.style.transform = `translate(${pCurrX  * 14}px, ${pCurrY  * 10}px)`;
    if (heroVigEl)     heroVigEl.style.transform     = `translate(${-pCurrX * 10}px, ${-pCurrY *  6}px)`;

    /* Canvas drawing */
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen';

    orbs.forEach(o => { o.tick(); o.draw(); });
    sparks.forEach(s => { s.tick(); s.draw(); });

    /* Cursor spotlight */
    if (glowX > 0) {
      const cg = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 380);
      cg.addColorStop(0,   'rgba(34,168,229,0.14)');
      cg.addColorStop(0.4, 'rgba(34,168,229,0.05)');
      cg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(glowX, glowY, 380, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(drawFrameWithCursor);
  }

  visObs.disconnect();
  const visObs2 = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { if (!raf) drawFrameWithCursor(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0 });
  visObs2.observe(heroEl);
  if (document.visibilityState === 'visible') drawFrameWithCursor();

}());
