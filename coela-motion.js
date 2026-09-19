// Sistema de movimiento Coela — misma curva y mismo gesto en todas las páginas.
const EASE = 'cubic-bezier(.16,1,.3,1)';

export function wire(opts = {}) {
  const accent = opts.accent || '#35599F';
  const slow = opts.slow ? 1.4 : 1;

  intro(slow);
  reveals(slow);
  headerScroll();
  tiles(accent);
  navlinks();
  lang();
  return { accent, slow };
}

function intro(slow) {
  setTimeout(() => {
    const c = document.querySelector('[data-curtain]');
    if (c) c.style.transform = 'translateY(-101%)';
  }, 180 * slow);
  setTimeout(() => {
    const l = document.querySelector('[data-logo]');
    if (l) { l.style.opacity = '1'; l.style.transform = 'translateY(0)'; }
  }, 400 * slow);
  document.querySelectorAll('[data-word] > span').forEach((w, i) => {
    setTimeout(() => { w.style.transform = 'translateY(0)'; }, (620 + i * 100) * slow);
  });
}

export function revealEl(el, slow = 1) {
  const d = (+(el.dataset.delay || 0)) * slow;
  setTimeout(() => {
    if (el.dataset.reveal === 'mask') {
      el.style.clipPath = 'inset(0 0 0% 0)';
      const z = el.querySelector('[data-zoom]');
      if (z) z.style.transform = 'scale(1)';
    } else {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  }, d);
}

export function reveals(slow = 1, scope) {
  const root = scope || document;
  const nodes = Array.from(root.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window)) { nodes.forEach(n => revealEl(n, slow)); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { revealEl(e.target, slow); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  nodes.forEach(n => io.observe(n));
  setTimeout(() => nodes.forEach(n => revealEl(n, slow)), 3500);
}

function headerScroll() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const bar = document.querySelector('[data-filterbar]');
  const place = () => {
    const h = Math.round(header.offsetHeight);
    if (bar) bar.style.top = h + 'px';
    document.querySelectorAll('[data-sticky-offset]').forEach(el => {
      el.style.top = (h + (+el.dataset.stickyOffset || 0)) + 'px';
    });
  };
  place();
  window.addEventListener('resize', place);
  setTimeout(place, 600);
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const on = (window.scrollY || 0) > 40;
      header.style.padding = on ? '13px clamp(16px,3vw,44px)' : '22px clamp(16px,3vw,44px)';
      header.style.boxShadow = on ? '0 1px 0 rgba(22,22,22,.12)' : 'none';
      place();
    });
  }, { passive: true });
}

export function tiles(accent = '#35599F', scope) {
  const root = scope || document;
  root.querySelectorAll('[data-tile]').forEach(t => {
    if (t.dataset.wired) return;
    t.dataset.wired = '1';
    const rev = t.querySelector('[data-reverse]');
    const zoom = t.querySelector('[data-zoom]');
    const flip = t.querySelector('[data-flip]');
    const rule = t.querySelector('[data-rule]');
    t.addEventListener('mouseenter', () => {
      if (rev) rev.style.opacity = '1';
      if (zoom) zoom.style.transform = 'scale(1.05)';
      if (flip) { flip.style.opacity = '1'; flip.style.transform = 'translateY(0)'; }
      if (rule) rule.style.width = '100%';
    });
    t.addEventListener('mouseleave', () => {
      if (rev) rev.style.opacity = '0';
      if (zoom) zoom.style.transform = 'scale(1)';
      if (flip) { flip.style.opacity = '0'; flip.style.transform = 'translateY(-6px)'; }
      if (rule) rule.style.width = '0%';
    });
  });
  root.querySelectorAll('[data-icon]').forEach(ic => {
    if (ic.dataset.wired) return;
    ic.dataset.wired = '1';
    ic.addEventListener('mouseenter', () => { ic.style.transform = 'translateY(-2px)'; ic.style.stroke = accent; });
    ic.addEventListener('mouseleave', () => { ic.style.transform = 'translateY(0)'; ic.style.stroke = '#161616'; });
  });
  root.querySelectorAll('[data-arrowlink]').forEach(a => {
    if (a.dataset.wired) return;
    a.dataset.wired = '1';
    const ar = a.querySelector('[data-arrow]');
    a.addEventListener('mouseenter', () => { if (ar) ar.style.transform = 'translateX(7px)'; });
    a.addEventListener('mouseleave', () => { if (ar) ar.style.transform = 'translateX(0)'; });
  });
}

function navlinks() {
  document.querySelectorAll('[data-navlink]').forEach(a => {
    if (a.dataset.wired) return;
    a.dataset.wired = '1';
    const u = document.createElement('span');
    u.style.cssText = 'position:absolute;left:0;bottom:0;height:1px;width:100%;background:currentColor;transform:scaleX(0);transform-origin:left;transition:transform .55s ' + EASE;
    a.appendChild(u);
    a.addEventListener('mouseenter', () => { u.style.transform = 'scaleX(1)'; });
    a.addEventListener('mouseleave', () => {
      u.style.transformOrigin = 'right';
      u.style.transform = 'scaleX(0)';
      setTimeout(() => { u.style.transformOrigin = 'left'; }, 560);
    });
  });
}

function lang() {
  const btns = document.querySelectorAll('[data-lang]');
  if (!btns.length) return;
  const apply = l => {
    document.querySelectorAll('[data-es]').forEach(el => {
      const v = l === 'en' ? el.dataset.en : el.dataset.es;
      if (v) el.textContent = v;
    });
    btns.forEach(b => { b.style.color = b.dataset.lang === l ? '#161616' : 'rgba(22,22,22,.6)'; });
    try { localStorage.setItem('coela-lang', l); } catch (e) {}
  };
  btns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); apply(b.dataset.lang); }));
  let saved = null;
  try { saved = localStorage.getItem('coela-lang'); } catch (e) {}
  if (saved === 'en') apply('en');
}
