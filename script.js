/* ═══════════════════════════════════════════════════
   FANZONE — INTERACTIONS
═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Nav scroll state ─────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile hamburger ─────────────────────────────
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  // Close menu when a link inside is clicked
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // ── Scroll-into-view animations ──────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => {
        el.classList.add('in-view');
        // Feature cards get their own class for CSS keyframe
        if (el.classList.contains('feature-card') ||
            el.classList.contains('step') ||
            el.classList.contains('deep-feature') ||
            el.classList.contains('ranks__track')) {
          el.classList.add('animated');
        }
      }, delay);
      io.unobserve(el);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-animate]').forEach(el => io.observe(el));

  // ── Animated counters ─────────────────────────────
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      counterIO.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-animate="counter"]').forEach(stat => {
    counterIO.observe(stat);
  });

  function animateCounter(statEl) {
    const numEl  = statEl.querySelector('.stat__number');
    const target = parseInt(statEl.dataset.target, 10);
    const delay  = parseInt(statEl.dataset.delay || '0', 10);
    if (!numEl || isNaN(target)) return;

    setTimeout(() => {
      const duration = 1800;
      const start    = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(ease * target);
        numEl.textContent = formatCount(current);
        if (progress < 1) requestAnimationFrame(tick);
        else numEl.textContent = formatCount(target);
      };
      requestAnimationFrame(tick);
    }, delay);
  }

  function formatCount(n) {
    if (n >= 1_000_000) return Math.round(n / 1_000_000) + 'M+';
    if (n >= 1_000)     return Math.round(n / 1_000) + 'K+';
    return n + '+';
  }

  // ── Particles in hero ──────────────────────────────
  const particleContainer = document.getElementById('particles');
  if (particleContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const x    = Math.random() * 100;
      const dur  = 8 + Math.random() * 12;
      const del  = Math.random() * 6;
      const size = 1 + Math.random() * 3;
      p.style.cssText = `
        left:${x}%;
        top:-10px;
        width:${size}px;
        height:${size}px;
        animation-duration:${dur}s;
        animation-delay:${del}s;
        animation-name:fade-in, confetti-fall;
        animation-timing-function:ease, linear;
        animation-fill-mode:both;
        opacity:0;
      `;
      particleContainer.appendChild(p);
    }
  }

  // ── Smooth anchor scroll ───────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Modals ────────────────────────────────────────
  const openModal  = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.add('open');
    document.body.style.overflow = 'hidden';
    m.querySelector('.modal__box').focus?.();
  };
  const closeModal = () => {
    document.querySelectorAll('.modal.open').forEach(m => {
      m.classList.remove('open');
    });
    document.body.style.overflow = '';
  };

  document.getElementById('termsLink')?.addEventListener('click', e => { e.preventDefault(); openModal('termsModal'); });
  document.getElementById('privacyLink')?.addEventListener('click', e => { e.preventDefault(); openModal('privacyModal'); });
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ── Goal celebration (easter egg — click the ball) ─
  const stadiumBall = document.querySelector('.stadium-ball');
  const celebration = document.getElementById('goalCelebration');
  const confettiCtn = document.getElementById('confettiContainer');
  let celebCooldown = false;

  const triggerCelebration = () => {
    if (celebCooldown) return;
    celebCooldown = true;

    // Confetti
    confettiCtn.innerHTML = '';
    const colors = ['#CCFF00','#FF4444','#4488FF','#FFD700','#FF8800','#AA44FF','#ffffff'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      const dur = 1.5 + Math.random() * 1.5;
      const del = Math.random() * 0.8;
      const x   = Math.random() * 100;
      c.style.cssText = `
        left:${x}vw;
        top:0;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        animation:confetti-fall ${dur}s ease ${del}s forwards;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        transform:rotate(${Math.random() * 360}deg);
      `;
      confettiCtn.appendChild(c);
    }

    celebration.classList.add('active');
    setTimeout(() => {
      celebration.classList.remove('active');
      setTimeout(() => { celebCooldown = false; }, 500);
    }, 2500);
  };

  stadiumBall?.addEventListener('click', triggerCelebration);

  // Auto-fire once when the user scrolls to the banner section
  const bannerEl = document.querySelector('.banner');
  if (bannerEl) {
    const bannerObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(triggerCelebration, 800);
          bannerObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    bannerObserver.observe(bannerEl);
  }

  // ── Live viewer counter animation ─────────────────
  const viewerEls = document.querySelectorAll('.phone__viewers');
  const liveCountEls = document.querySelectorAll('.phone__live-badge .phone__live-time');
  let viewerBase = 129000;

  setInterval(() => {
    viewerBase += Math.floor((Math.random() - 0.4) * 300);
    viewerBase = Math.max(100000, Math.min(200000, viewerBase));
    viewerEls.forEach(el => {
      el.textContent = `👁 ${Math.round(viewerBase / 1000)}K watching`;
    });
  }, 3000);

  // Live match clock
  let matchMinute = 78;
  let matchSeconds = 45;
  setInterval(() => {
    matchSeconds++;
    if (matchSeconds >= 60) { matchSeconds = 0; matchMinute++; }
    if (matchMinute > 90)   { matchMinute = 90; matchSeconds = 0; }
    const pad  = n => String(n).padStart(2, '0');
    const time = `${matchMinute}:${pad(matchSeconds)}`;
    document.querySelectorAll('.phone__live-time').forEach(el => { el.textContent = time; });
  }, 1000);

  // ── Countdown timers ───────────────────────────────
  // Simulated countdown for the predict screen
  let cdHours = 2, cdMinutes = 44, cdSecs = 59;
  setInterval(() => {
    cdSecs--;
    if (cdSecs < 0) { cdSecs = 59; cdMinutes--; }
    if (cdMinutes < 0) { cdMinutes = 59; cdHours--; }
    if (cdHours < 0) { cdHours = 0; cdMinutes = 0; cdSecs = 0; }
    const pad = n => String(n).padStart(2, '0');
    document.querySelectorAll('.phone__countdown-time').forEach(el => {
      el.textContent = `${pad(cdHours)}h : ${pad(cdMinutes)}m`;
    });
  }, 1000);

  // ── Feature cards stagger on load ─────────────────
  const featureCards = document.querySelectorAll('.feature-card');
  const featureIO = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => {
        e.target.style.animationDelay = '0ms';
        e.target.classList.add('animated');
        e.target.classList.add('in-view');
      }, parseInt(e.target.dataset.delay || '0', 10));
      featureIO.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  featureCards.forEach(c => featureIO.observe(c));

  // ── Steps stagger ─────────────────────────────────
  const steps = document.querySelectorAll('.step');
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => {
        e.target.classList.add('animated', 'in-view');
      }, parseInt(e.target.dataset.delay || '0', 10));
      stepIO.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  steps.forEach(s => stepIO.observe(s));

  // ── Deep features stagger ─────────────────────────
  const deepFeats = document.querySelectorAll('.deep-feature');
  const deepIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => {
        e.target.classList.add('animated', 'in-view');
      }, parseInt(e.target.dataset.delay || '0', 10));
      deepIO.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  deepFeats.forEach(f => deepIO.observe(f));

  // ── Ticker pause on hover ─────────────────────────
  const tickerInner = document.getElementById('tickerInner');
  const tickerEl    = document.querySelector('.ticker__track');
  if (tickerInner && tickerEl) {
    tickerEl.addEventListener('mouseenter', () => {
      tickerInner.style.animationPlayState = 'paused';
    });
    tickerEl.addEventListener('mouseleave', () => {
      tickerInner.style.animationPlayState = 'running';
    });
  }

  // ── Confidence bar animated on load ───────────────
  const confBar = document.querySelector('.phone__confidence-fill');
  if (confBar) {
    confBar.style.width = '0%';
    setTimeout(() => { confBar.style.width = '80%'; }, 1200);
  }

  // ── Active nav highlight ───────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const activeIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px -60% 0px' });

  sections.forEach(s => activeIO.observe(s));

});
