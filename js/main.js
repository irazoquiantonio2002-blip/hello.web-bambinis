/* ======================================================================
   BAMBINIS — Guardería y Estancia Infantil — Interacciones
   Preloader · Partículas · Typewriter · Scroll reveal · Nav · Contador ·
   Lightbox de galería · Formulario a WhatsApp
   ====================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ---------------- Preloader ---------------- */
  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) { startTypewriter(); return; }

    document.body.classList.add('no-scroll');

    var minTime = new Promise(function (resolve) { setTimeout(resolve, 900); });
    var loaded = new Promise(function (resolve) {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', function () { resolve(); }, { once: true });
    });

    Promise.all([minTime, loaded]).then(function () {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('no-scroll');
      document.body.classList.add('is-loaded');
      startTypewriter();
    });
  }

  /* ---------------- Typewriter (hero) ---------------- */
  function startTypewriter() {
    var el = document.getElementById('typewriter-text');
    if (!el) return;
    var text = 'es una aventura para crecer.';

    if (reducedMotion) { el.textContent = text; return; }

    var i = 0;
    (function type() {
      el.textContent = text.slice(0, i);
      if (i <= text.length) {
        i++;
        setTimeout(type, 40 + Math.random() * 45);
      }
    })();
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur,.reveal-mask');
    if (!items.length) return;

    items.forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      if (delay) el.style.transitionDelay = (delay * 90) + 'ms';
    });

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // threshold 0 + a small negative bottom margin: fires as soon as an element
    // starts entering the viewport, regardless of the element's own height
    // (a fixed % threshold would never fire for elements taller than the viewport).
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Header: scroll state + active link ---------------- */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 30); }
    onScroll();
    window.addEventListener('scroll', debounce(onScroll, 20), { passive: true });

    var sections = document.querySelectorAll('main section[id]');
    var links = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').replace('#', '')] = l; });

    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* ---------------- Mobile navigation ---------------- */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var panel = document.getElementById('mobile-nav');
    if (!toggle || !panel) return;

    panel.querySelectorAll('.mobile-nav-link').forEach(function (link, i) {
      link.style.setProperty('--i', i);
    });

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
    }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      document.body.classList.add('no-scroll');
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) close(); else open();
    });
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
    });
  }

  /* ---------------- Animated stat counters ---------------- */
  function initCounters() {
    var counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-target')) || 0;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';

      if (reducedMotion) { el.textContent = prefix + target + suffix; return; }

      var duration = 1300, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });

    counters.forEach(function (c) { io.observe(c); });
  }

  /* ---------------- Hero particle network ---------------- */
  function initParticles() {
    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    var hero = canvas.closest('.hero');
    if (!hero) return;
    var ctx = canvas.getContext('2d');

    var particles = [], w = 0, h = 0, dpr = 1, running = false;
    var mouse = { x: null, y: null };
    var colors = ['#1084C4', '#7EC144', '#0C6699', '#F04A42', '#22A8E5'];

    function resize() {
      var rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.max(rect.width, 1) * dpr;
      h = canvas.height = Math.max(rect.height, 1) * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      var count = Math.round((rect.width * rect.height) / 16000);
      count = Math.max(26, Math.min(count, 85));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25 * dpr,
          vy: (Math.random() - 0.5) * 0.25 * dpr,
          r: (Math.random() * 1.6 + 0.8) * dpr,
          c: colors[i % colors.length]
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var linkDist = 130 * dpr;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.x !== null) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < 160 * dpr) { p.x += (dx / d) * 0.4; p.y += (dy / d) * 0.4; }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = p.c;
        ctx.fill();
        ctx.globalAlpha = 1;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var ddx = p.x - q.x, ddy = p.y - q.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < linkDist) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(16,132,196,' + (0.22 * (1 - dist / linkDist)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      if (running) requestAnimationFrame(draw);
    }

    function start() { if (!running && !reducedMotion) { running = true; requestAnimationFrame(draw); } }
    function stop() { running = false; }

    resize();
    if (reducedMotion) { draw(); return; }

    start();
    window.addEventListener('resize', debounce(resize, 200));
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.isIntersecting ? start() : stop(); });
      }, { threshold: 0 });
      io.observe(hero);
    }
  }

  /* ---------------- Hero: parallax de scroll (imagen + manchas) ---------------- */
  function initHeroParallax() {
    if (reducedMotion) return;
    var hero = document.querySelector('.hero');
    var visual = document.querySelector('.hero-visual');
    var blobs = document.querySelectorAll('.hero-blob');
    if (!hero || !visual) return;

    var inView = true, ticking = false;

    function apply() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
      var maxShift = window.innerWidth < 720 ? 22 : 60;
      var shift = progress * maxShift;
      visual.style.setProperty('--parallax-y', shift.toFixed(1) + 'px');
      blobs.forEach(function (b, i) {
        b.style.transform = 'translateY(' + (shift * (0.35 + i * 0.18)).toFixed(1) + 'px)';
      });
    }

    function onScroll() {
      if (!inView || ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', debounce(onScroll, 150));

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView) onScroll();
        });
      }, { threshold: 0 });
      io.observe(hero);
    }
  }

  /* ---------------- Tilt 3D: imagen del hero y tarjetas de servicio (solo mouse fino) ---------------- */
  function attachTilt(el, maxDeg) {
    var raf = null, latestEvent = null;

    function apply() {
      raf = null;
      if (!latestEvent) return;
      var rect = el.getBoundingClientRect();
      var px = (latestEvent.clientX - rect.left) / rect.width - 0.5;
      var py = (latestEvent.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--tilt-x', (py * -maxDeg).toFixed(2) + 'deg');
      el.style.setProperty('--tilt-y', (px * maxDeg).toFixed(2) + 'deg');
    }

    el.addEventListener('mouseenter', function () { el.classList.add('is-tilting'); });
    el.addEventListener('mousemove', function (e) {
      latestEvent = e;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    el.addEventListener('mouseleave', function () {
      el.classList.remove('is-tilting');
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      latestEvent = null;
    });
  }

  function initTilt() {
    if (reducedMotion || !isFinePointer) return;
    var visual = document.querySelector('.hero-visual');
    if (visual) attachTilt(visual, 8);
    document.querySelectorAll('.service-card').forEach(function (card) { attachTilt(card, 5); });
  }

  /* ---------------- Botones magnéticos (solo mouse fino) ---------------- */
  function initMagnetic() {
    if (reducedMotion || !isFinePointer) return;
    var els = document.querySelectorAll('.magnetic');
    if (!els.length) return;

    els.forEach(function (el) {
      var raf = null, latestEvent = null;
      var strength = 0.3;

      function apply() {
        raf = null;
        if (!latestEvent) return;
        var rect = el.getBoundingClientRect();
        var mx = latestEvent.clientX - (rect.left + rect.width / 2);
        var my = latestEvent.clientY - (rect.top + rect.height / 2);
        el.style.transform = 'translate(' + (mx * strength).toFixed(1) + 'px,' + (my * strength - 3).toFixed(1) + 'px)';
      }

      el.addEventListener('mousemove', function (e) {
        latestEvent = e;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('mouseleave', function () {
        latestEvent = null;
        el.style.transform = '';
      });
    });
  }

  /* ---------------- Shimmer mientras cargan las imágenes diferidas ---------------- */
  function initImageShimmer() {
    var imgs = document.querySelectorAll('main img[loading="lazy"]');
    imgs.forEach(function (img) {
      if (img.complete) return;
      img.classList.add('is-loading');
      function done() { img.classList.remove('is-loading'); }
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }

  /* ---------------- Gallery lightbox ---------------- */
  function initLightbox() {
    var items = document.querySelectorAll('.gallery-item');
    var lightbox = document.getElementById('lightbox');
    if (!items.length || !lightbox) return;

    var imgEl = document.getElementById('lightbox-img');
    var captionEl = document.getElementById('lightbox-caption');
    var closeBtn = document.getElementById('lightbox-close');
    var lastFocused = null;

    function open(item) {
      lastFocused = document.activeElement;
      var thumb = item.querySelector('img');
      imgEl.src = item.getAttribute('data-full');
      imgEl.alt = thumb ? thumb.alt : '';
      captionEl.textContent = item.getAttribute('data-caption') || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      closeBtn.focus();
    }
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (item) { item.addEventListener('click', function () { open(item); }); });
    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
    });
  }

  /* ---------------- Contact form → WhatsApp ---------------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var alertBox = document.getElementById('form-alert');
    var nameEl = document.getElementById('name');
    var phoneEl = document.getElementById('phone');
    var specialtyEl = document.getElementById('specialty');
    var messageEl = document.getElementById('message');

    var WHATSAPP_NUMBER = '5219381079202';

    var SPECIALTY_NAMES = {
      informes: 'Información General / Inscripción',
      lactantes: 'Lactantes y Maternal',
      tardes: 'Guardería por las Tardes',
      'consejo-tecnico': 'Cobertura por Consejo Técnico / Suspensión',
      horario: 'Ajustar un Horario Especial',
      'no-se': 'aún no sé, quiero información'
    };

    function showAlert(msg) {
      alertBox.textContent = msg;
      alertBox.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var specialtyName = SPECIALTY_NAMES[specialtyEl.value];
      if (!specialtyName) {
        showAlert('Selecciona una opción para continuar.');
        return;
      }

      var text = 'Hola Bambinis, mi nombre es ' + nameEl.value.trim() +
        ' (tel. ' + phoneEl.value.trim() + '). Me interesa: ' + specialtyName + '. ' +
        messageEl.value.trim();

      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank', 'noopener');

      alertBox.hidden = true;
      form.reset();
    });
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', debounce(function () {
      btn.classList.toggle('is-visible', window.scrollY > 700);
    }, 80), { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Init ---------------- */
  initPreloader();
  initReveal();
  initHeader();
  initMobileNav();
  initCounters();
  initParticles();
  initHeroParallax();
  initTilt();
  initMagnetic();
  initImageShimmer();
  initLightbox();
  initContactForm();
  initBackToTop();
  initYear();

})();
