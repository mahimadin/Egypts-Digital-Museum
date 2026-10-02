(function () {
  'use strict';

  const { ERAS, CATEGORIES, ARTIFACTS, EXHIBITIONS, ROUTES, MARQUEE, GLYPHS } = window.MUSEUM;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const eraById = Object.fromEntries(ERAS.map((e) => [e.id, e]));
  const artifactById = Object.fromEntries(ARTIFACTS.map((a) => [a.id, a]));
  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined && v !== false) node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of [].concat(children)) {
      if (c === null || c === undefined || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  }

  function fmtYear(y) {
    const n = Math.round(Math.abs(y));
    if (y < 0) return `${n} BCE`;
    if (y === 0) return '1 CE';
    return `${n} CE`;
  }

  function fmtRange(start, end) {
    return `${fmtYear(start)} to ${fmtYear(end)}`;
  }

  function parseDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function fmtDate(date, withYear = true) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: withYear ? 'numeric' : undefined });
  }

  function fmtDateRange(a, b) {
    const sameYear = a.getFullYear() === b.getFullYear();
    return `${fmtDate(a, !sameYear)} to ${fmtDate(b)}`;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function hash36(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h.toString(36).toUpperCase().padStart(6, '0').slice(-6);
  }

  function fallbackImage() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='750' viewBox='0 0 600 750'><rect width='600' height='750' fill='#12121b'/><path d='M300 250 170 470h260z' fill='none' stroke='#d9b455' stroke-width='6' stroke-linejoin='round'/><circle cx='300' cy='205' r='14' fill='#d9b455'/><text x='300' y='540' text-anchor='middle' font-family='monospace' font-size='20' fill='#9b9587' letter-spacing='4'>IMAGE UNAVAILABLE</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  function loadImage(img, src, focus) {
    img.classList.add('loading');
    img.style.objectPosition = focus || '';
    img.onload = () => img.classList.remove('loading');
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackImage();
    };
    img.src = src;
  }

  function transliterate(text) {
    const s = text.toLowerCase().replace(/[^a-z]/g, '');
    const out = [];
    let i = 0;
    while (i < s.length) {
      const two = s.slice(i, i + 2);
      if (GLYPHS[two] && ['sh', 'ch', 'kh', 'th', 'ph', 'qu'].includes(two)) {
        out.push({ letters: two, glyph: GLYPHS[two][0], sign: GLYPHS[two][1], sound: GLYPHS[two][2] });
        i += 2;
        continue;
      }
      let ch = s[i];
      let key = ch;
      if (ch === 'c' && 'eiy'.includes(s[i + 1] || '')) key = 's';
      if (i > 0 && s[i - 1] === ch) { i += 1; continue; }
      const g = GLYPHS[key];
      if (g) out.push({ letters: ch, glyph: g[0], sign: g[1], sound: g[2] });
      i += 1;
    }
    return out;
  }

  function initTheme() {
    const saved = localStorage.getItem('edm-theme');
    if (saved) document.documentElement.dataset.theme = saved;
    const toggle = () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('edm-theme', next);
      $('meta[name="theme-color"]').setAttribute('content', next === 'light' ? '#f4ecd9' : '#07070b');
      window.dispatchEvent(new Event('themechange'));
    };
    $('#themeBtn').addEventListener('click', toggle);
    $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggle));
  }

  function initLoader() {
    const loader = $('#loader');
    const start = performance.now();
    const finish = () => {
      const wait = Math.max(0, 1100 - (performance.now() - start));
      setTimeout(() => {
        loader.classList.add('done');
        document.dispatchEvent(new Event('museum:ready'));
      }, wait);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 3200);
  }

  function initHeader() {
    const header = $('.site-header');
    const nav = $('#nav');
    const burger = $('#burger');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const closeNav = () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('locked');
    };
    burger.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('locked', open);
    });
    $$('a', nav).forEach((a) => a.addEventListener('click', closeNav));
    window.addEventListener('resize', () => { if (window.innerWidth > 860) closeNav(); });

    const links = $$('[data-nav]', nav);
    const sections = links.map((a) => $('#' + a.dataset.nav)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('active', a.dataset.nav === entry.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  function initProgress() {
    const bar = $('#progress');
    const toTop = $('#toTop');
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  }

  function initHeroCanvas() {
    const canvas = $('#heroCanvas');
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1;
    let particles = [];
    let colors = {};
    const mouse = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let t = 0;
    let running = true;

    const verts = [[0, -1.15, 0], [1, 0.62, 1], [1, 0.62, -1], [-1, 0.62, -1], [-1, 0.62, 1]];
    const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 3], [3, 4], [4, 1]];

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      colors = {
        gold: cs.getPropertyValue('--gold').trim() || '#d9b455',
        teal: cs.getPropertyValue('--teal').trim() || '#37d6c3',
        light: document.documentElement.dataset.theme === 'light'
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(160, (w * h) / 9000));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.05 - Math.random() * 0.18,
        a: 0.2 + Math.random() * 0.6,
        p: Math.random() * Math.PI * 2
      }));
      readColors();
    }

    function project(v, ry, rx) {
      const [x0, y0, z0] = v;
      const cy = Math.cos(ry), sy = Math.sin(ry);
      let x = x0 * cy - z0 * sy;
      let z = x0 * sy + z0 * cy;
      const cx = Math.cos(rx), sx = Math.sin(rx);
      let y = y0 * cx - z * sx;
      z = y0 * sx + z * cx;
      const f = 3.4;
      const s = f / (f + z);
      return { x: x * s, y: y * s, z };
    }

    function rgba(hex, a) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }

    function drawGrid() {
      const horizon = h * 0.62;
      const vpx = w * 0.5 + eased.x * 40;
      ctx.save();
      ctx.strokeStyle = rgba(colors.teal, colors.light ? 0.16 : 0.12);
      ctx.lineWidth = 1;
      for (let i = -14; i <= 14; i++) {
        const bx = w * 0.5 + i * (w / 9);
        ctx.beginPath();
        ctx.moveTo(vpx + (bx - vpx) * 0.06, horizon);
        ctx.lineTo(bx, h + 40);
        ctx.stroke();
      }
      const rows = 12;
      const shift = (t * 0.25) % 1;
      for (let i = 0; i < rows; i++) {
        const k = (i + shift) / rows;
        const y = horizon + Math.pow(k, 2.2) * (h - horizon + 40);
        ctx.globalAlpha = Math.min(1, k * 1.4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
      const fade = ctx.createLinearGradient(0, horizon - 10, 0, horizon + 140);
      const bg = getComputedStyle(document.body).backgroundColor;
      fade.addColorStop(0, bg);
      fade.addColorStop(1, bg.replace('rgb(', 'rgba(').replace(')', ',0)'));
      ctx.fillStyle = fade;
      ctx.fillRect(0, horizon - 10, w, 150);
    }

    function drawParticles() {
      ctx.save();
      for (const p of particles) {
        p.x += p.vx + eased.x * 0.05;
        p.y += p.vy;
        p.p += 0.02;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        const a = p.a * (0.6 + 0.4 * Math.sin(p.p));
        ctx.fillStyle = rgba(colors.gold, colors.light ? a * 0.7 : a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawPyramid() {
      const narrow = w < 860;
      const cx = narrow ? w * 0.5 : w * 0.72;
      const cy = narrow ? h * 0.5 : h * 0.47;
      const size = narrow ? Math.min(w, h) * 0.36 : Math.min(w, h) * 0.3;
      const ry = t * 0.25 + eased.x * 0.5;
      const rx = 0.36 + eased.y * 0.25;
      const pts = verts.map((v) => project(v, ry, rx));
      const alpha = narrow ? 0.32 : 1;

      const levels = [0.2, 0.45, 0.7];
      ctx.save();
      ctx.lineWidth = 1;
      for (const k of levels) {
        const y = -1.15 + (0.62 + 1.15) * k;
        const half = k;
        const ring = [[half, y, half], [half, y, -half], [-half, y, -half], [-half, y, half]].map((v) => project(v, ry, rx));
        ctx.strokeStyle = rgba(colors.gold, 0.22 * alpha);
        ctx.beginPath();
        ring.forEach((p, i) => {
          const X = cx + p.x * size, Y = cy + p.y * size;
          if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        });
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.lineCap = 'round';
      for (const [a, b] of edges) {
        const A = pts[a], B = pts[b];
        const depth = (A.z + B.z) / 2;
        const near = 0.55 + (1 - (depth + 1) / 2) * 0.45;
        const X1 = cx + A.x * size, Y1 = cy + A.y * size;
        const X2 = cx + B.x * size, Y2 = cy + B.y * size;
        const grad = ctx.createLinearGradient(X1, Y1, X2, Y2);
        grad.addColorStop(0, rgba(colors.gold, 0.9 * near * alpha));
        grad.addColorStop(1, rgba(colors.teal, 0.7 * near * alpha));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.shadowColor = rgba(colors.gold, 0.6 * alpha);
        ctx.shadowBlur = narrow ? 0 : 14;
        ctx.beginPath();
        ctx.moveTo(X1, Y1);
        ctx.lineTo(X2, Y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      for (const p of pts) {
        ctx.fillStyle = rgba(colors.gold, 0.95 * alpha);
        ctx.beginPath();
        ctx.arc(cx + p.x * size, cy + p.y * size, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      const apex = pts[0];
      const glow = ctx.createRadialGradient(cx + apex.x * size, cy + apex.y * size, 0, cx + apex.x * size, cy + apex.y * size, 60);
      glow.addColorStop(0, rgba(colors.gold, 0.35 * alpha));
      glow.addColorStop(1, rgba(colors.gold, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx + apex.x * size - 60, cy + apex.y * size - 60, 120, 120);
      ctx.restore();

      const scan = ((t * 0.18) % 1);
      const sy = cy + (-1.15 + (0.62 + 1.15) * scan) * size * 0.9;
      const half = size * 1.15;
      const g2 = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
      g2.addColorStop(0, rgba(colors.teal, 0));
      g2.addColorStop(0.5, rgba(colors.teal, 0.35 * alpha));
      g2.addColorStop(1, rgba(colors.teal, 0));
      ctx.strokeStyle = g2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - half, sy);
      ctx.lineTo(cx + half, sy);
      ctx.stroke();
    }

    function frame() {
      if (!running) return;
      t += 1 / 60; // always advance time so pyramid rotates
      eased.x += (mouse.x - eased.x) * 0.04;
      eased.y += (mouse.y - eased.y) * 0.04;
      ctx.clearRect(0, 0, w, h);
      drawGrid();
      if (!reduced) drawParticles(); // respect reduced-motion for particles only
      drawPyramid();
      requestAnimationFrame(frame); // always keep the loop alive
    }

    const hero = $('#hero');
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = hero.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = 0; mouse.y = 0; });

    const io = new IntersectionObserver(([entry]) => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if (running && !wasRunning) requestAnimationFrame(frame);
    });
    io.observe(hero);

    window.addEventListener('resize', () => { resize(); });
    window.addEventListener('themechange', () => { readColors(); });
    resize();
    requestAnimationFrame(frame);
  }

  function initStats() {
    $('#statObjects').dataset.count = ARTIFACTS.length;
    $('#statEras').dataset.count = ERAS.length;
    $('#statExhibitions').dataset.count = EXHIBITIONS.length;
    const items = $$('#stats dd');
    const run = () => {
      items.forEach((dd) => {
        const target = Number(dd.dataset.count);
        const suffix = dd.dataset.suffix || '';
        if (reduced) { dd.textContent = target.toLocaleString() + suffix; return; }
        const t0 = performance.now();
        const dur = 1500;
        const tick = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          dd.textContent = Math.round(target * e).toLocaleString() + suffix;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    document.addEventListener('museum:ready', run, { once: true });
  }

  function initMarquee() {
    const track = $('#marquee');
    const items = [...MARQUEE, ...MARQUEE];
    items.forEach(([g, name, meaning]) => {
      track.append(el('span', { class: 'marquee-item' }, [
        el('span', { class: 'g', text: g }),
        el('span', { class: 'name', text: name }),
        el('span', { text: meaning })
      ]));
    });
  }

  function initSpotlight(openObject) {
    const img = $('#spotImg');
    const cap = $('#spotCap');
    const title = $('#spotTitle');
    const meta = $('#spotMeta');
    const text = $('#spotText');
    const tilt = $('#tilt');
    const card = $('.tilt-card', tilt);
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    let current = ARTIFACTS[dayOfYear % ARTIFACTS.length];

    function show(a) {
      current = a;
      loadImage(img, a.img.large, a.focus);
      img.alt = a.title;
      cap.textContent = a.museum;
      title.textContent = a.title;
      meta.textContent = `${eraById[a.era].name} · ${a.date} · ${a.material}`;
      text.textContent = a.summary;
    }
    show(current);

    $('#spotOpen').addEventListener('click', () => openObject(current.id));
    $('#spotShuffle').addEventListener('click', () => {
      let next;
      do next = ARTIFACTS[Math.floor(Math.random() * ARTIFACTS.length)];
      while (next.id === current.id);
      show(next);
    });

    if (reduced || window.matchMedia('(hover: none)').matches) return;
    tilt.addEventListener('pointermove', (e) => {
      const r = tilt.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(px - 0.5) * 16}deg) rotateX(${(0.5 - py) * 16}deg)`;
      card.style.setProperty('--gx', `${px * 100}%`);
      card.style.setProperty('--gy', `${py * 100}%`);
    });
    tilt.addEventListener('pointerleave', () => { card.style.transform = ''; });
  }

  const collection = {
    state: { q: '', era: '', cat: '', sort: 'chrono' },
    visible: [],
    listeners: []
  };

  function filtered() {
    const { q, era, cat, sort } = collection.state;
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = ARTIFACTS.filter((a) => {
      if (era && a.era !== era) return false;
      if (cat && a.category !== cat) return false;
      if (!words.length) return true;
      const hay = [a.title, a.material, a.museum, a.findspot, a.date, eraById[a.era].name, catById[a.category].name, ...a.tags].join(' ').toLowerCase();
      return words.every((wd) => hay.includes(wd));
    });
    if (sort === 'chrono') list.sort((a, b) => a.year - b.year);
    if (sort === 'chrono-desc') list.sort((a, b) => b.year - a.year);
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }

  function initCollection(openObject) {
    const grid = $('#grid');
    const empty = $('#empty');
    const count = $('#count');
    const search = $('#search');
    const eraSelect = $('#eraSelect');
    const sortSelect = $('#sortSelect');
    const chips = $('#chips');

    ERAS.forEach((e) => eraSelect.append(el('option', { value: e.id, text: e.name })));

    function renderChips() {
      chips.innerHTML = '';
      const base = ARTIFACTS.filter((a) => {
        if (collection.state.era && a.era !== collection.state.era) return false;
        return true;
      });
      const all = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(!collection.state.cat) }, ['All', el('span', { class: 'n', text: base.length })]);
      all.addEventListener('click', () => { collection.state.cat = ''; render(); });
      chips.append(all);
      CATEGORIES.forEach((c) => {
        const n = base.filter((a) => a.category === c.id).length;
        const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(collection.state.cat === c.id) }, [c.name, el('span', { class: 'n', text: n })]);
        b.addEventListener('click', () => { collection.state.cat = collection.state.cat === c.id ? '' : c.id; render(); });
        chips.append(b);
      });
    }

    function card(a) {
      const img = el('img', { alt: a.title, loading: 'lazy', decoding: 'async' });
      loadImage(img, a.img.card, a.focus);
      const node = el('button', { class: `card${a.featured ? ' featured' : ''}`, type: 'button', 'aria-label': `Open ${a.title}` }, [
        img,
        el('span', { class: 'card-tag', text: eraById[a.era].name }),
        el('span', { class: 'card-body' }, [
          el('span', { class: 'card-title', text: a.title }),
          el('span', { class: 'card-meta', text: `${a.date} · ${a.material.split(/,| with /)[0]}` })
        ]),
        el('span', { class: 'card-open', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' })
      ]);
      node.addEventListener('click', () => openObject(a.id, collection.visible.map((x) => x.id)));
      return node;
    }

    function render() {
      const list = filtered();
      collection.visible = list;
      renderChips();
      grid.innerHTML = '';
      empty.hidden = list.length > 0;
      count.textContent = `Showing ${list.length} of ${ARTIFACTS.length} objects`;
      const frag = document.createDocumentFragment();
      list.forEach((a) => frag.append(card(a)));
      grid.append(frag);
      const cards = $$('.card', grid);
      if (reduced) { cards.forEach((c) => c.classList.add('in')); return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const node = entry.target;
          setTimeout(() => node.classList.add('in'), (Array.from(grid.children).indexOf(node) % 6) * 60);
          io.unobserve(node);
        });
      }, { rootMargin: '0px 0px -5% 0px' });
      cards.forEach((c) => io.observe(c));
      collection.listeners.forEach((fn) => fn());
    }

    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { collection.state.q = search.value.trim(); render(); }, 120);
    });
    eraSelect.addEventListener('change', () => { collection.state.era = eraSelect.value; render(); });
    sortSelect.addEventListener('change', () => { collection.state.sort = sortSelect.value; render(); });
    $('#clearFilters').addEventListener('click', () => {
      collection.state = { q: '', era: '', cat: '', sort: 'chrono' };
      search.value = '';
      eraSelect.value = '';
      sortSelect.value = 'chrono';
      render();
    });

    collection.setEra = (id) => {
      collection.state.era = id;
      collection.state.cat = '';
      eraSelect.value = id;
      render();
      $('#collection').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    };
    collection.render = render;
    render();
  }

  function initModal() {
    const dialog = $('#modal');
    const img = $('#mImg');
    const fields = {
      era: $('#mEra'), title: $('#mTitle'), date: $('#mDate'), summary: $('#mSummary'),
      story: $('#mStory'), prov: $('#mProv'), facts: $('#mFacts'), glyphs: $('#mGlyphs'),
      source: $('#mSource'), related: $('#mRelated'), pos: $('#mPos'), route: $('#mRoute')
    };
    let list = [];
    let index = 0;
    let route = null;
    let returnFocus = null;

    function setHash(id) {
      history.replaceState(null, '', id ? `#object/${id}` : location.pathname + location.search);
    }

    function fill(a) {
      const era = eraById[a.era];
      loadImage(img, a.img.large, a.focus);
      img.alt = a.title;
      fields.era.textContent = `${era.name} · ${era.dynasties}`;
      fields.title.textContent = a.title;
      fields.date.textContent = a.date;
      fields.summary.textContent = a.summary;
      fields.story.textContent = a.story;
      fields.prov.innerHTML = '';
      const rows = [
        ['Material', a.material], ['Dimensions', a.dims], ['Found at', a.findspot],
        ['Now in', a.museum], ['Inventory', a.inventory], ['Category', catById[a.category].name]
      ];
      rows.forEach(([k, v]) => {
        if (!v) return;
        fields.prov.append(el('div', {}, [el('dt', { text: k }), el('dd', { text: v })]));
      });
      fields.facts.innerHTML = '';
      a.facts.forEach((f) => fields.facts.append(el('li', { text: f })));
      fields.glyphs.textContent = transliterate(a.title.split(/\s+/).sort((x, y) => y.length - x.length)[0]).map((g) => g.glyph).join('');
      fields.source.href = a.img.page;
      fields.source.textContent = `Photo: ${a.img.by}, ${a.img.license}`;
      fields.related.innerHTML = '';
      ARTIFACTS.filter((x) => x.era === a.era && x.id !== a.id).slice(0, 6).forEach((x) => {
        const thumb = el('img', { alt: '', loading: 'lazy' });
        loadImage(thumb, x.img.card, x.focus);
        const b = el('button', { type: 'button', title: x.title, 'aria-label': x.title }, [thumb]);
        b.addEventListener('click', () => open(x.id, ARTIFACTS.filter((y) => y.era === a.era).map((y) => y.id)));
        fields.related.append(b);
      });
      fields.pos.textContent = `${index + 1} / ${list.length}`;
      fields.route.hidden = !route;
      if (route) fields.route.textContent = `${route.title} · ${index + 1} of ${list.length}`;
      $('.modal-body', dialog).scrollTop = 0;
      const next = artifactById[list[(index + 1) % list.length]];
      if (next) { const pre = new Image(); pre.src = next.img.large; }
    }

    function open(id, ids, routeInfo) {
      list = ids && ids.length ? ids : ARTIFACTS.map((a) => a.id);
      if (!list.includes(id)) list = [id, ...list];
      index = list.indexOf(id);
      route = routeInfo || null;
      fill(artifactById[id]);
      if (!dialog.open) {
        returnFocus = document.activeElement;
        dialog.showModal();
        document.body.classList.add('locked');
      }
      setHash(id);
      $('#mClose').focus();
    }

    function step(d) {
      index = (index + d + list.length) % list.length;
      fill(artifactById[list[index]]);
      setHash(list[index]);
    }

    function cleanup() {
      document.body.classList.remove('locked');
      setHash('');
      if (returnFocus && returnFocus.focus) returnFocus.focus();
      returnFocus = null;
    }

    function close() {
      if (dialog.open) dialog.close();
      cleanup();
    }

    dialog.addEventListener('close', cleanup);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    $('#mClose').addEventListener('click', close);
    $('#mPrev').addEventListener('click', () => step(-1));
    $('#mNext').addEventListener('click', () => step(1));
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
    $('#mShare').addEventListener('click', async () => {
      const url = `${location.origin}${location.pathname}#object/${list[index]}`;
      try {
        await navigator.clipboard.writeText(url);
        toast('Link copied');
      } catch {
        toast(url);
      }
    });

    return open;
  }

  function initTimeline(openObject) {
    const scroller = $('#tlScroller');
    const track = $('#tlTrack');
    const inner = $('#tlInner');
    const yearOut = $('#tlYear');
    const eraOut = $('#tlEraName');
    let layout = [];
    let active = -1;

    function build() {
      inner.innerHTML = '';
      const cardW = Math.min(360, window.innerWidth * 0.78);
      const pad = scroller.clientWidth / 2;
      let x = 0;
      layout = ERAS.map((e) => {
        const dur = e.end - e.start;
        const w = Math.max(cardW + 28, 120 + Math.sqrt(dur) * 11);
        const item = { era: e, x, w };
        x += w;
        return item;
      });
      track.style.padding = `0 ${pad}px`;
      track.style.width = `${x + pad * 2}px`;
      inner.style.width = `${x}px`;
      inner.append(el('div', { class: 'tl-axis' }));

      layout.forEach((item) => {
        const e = item.era;
        const objs = ARTIFACTS.filter((a) => a.era === e.id).sort((a, b) => a.year - b.year);
        const seg = el('div', { class: 'tl-era-seg', style: `left:${item.x}px;width:${item.w}px` });
        seg.append(el('div', { class: 'tl-bar' }));
        const card = el('div', { class: 'tl-card' }, [
          el('span', { class: 'g', text: e.glyph }),
          el('h3', { text: e.name }),
          el('p', { class: 'tl-dates', text: `${fmtRange(e.start, e.end)} · ${e.dynasties}` }),
          el('p', { text: e.summary }),
          el('ul', { class: 'tl-events' }, e.events.map((ev) => el('li', { text: ev })))
        ]);
        if (objs.length) {
          const thumbs = el('div', { class: 'tl-thumbs' });
          objs.slice(0, 5).forEach((a) => {
            const im = el('img', { alt: '', loading: 'lazy' });
            loadImage(im, a.img.card, a.focus);
            const b = el('button', { type: 'button', title: a.title, 'aria-label': a.title }, [im]);
            b.addEventListener('click', () => openObject(a.id, objs.map((o) => o.id)));
            thumbs.append(b);
          });
          card.append(thumbs);
          const btn = el('button', { class: 'btn btn-ghost btn-small', type: 'button', text: `Explore ${objs.length} object${objs.length > 1 ? 's' : ''}` });
          btn.addEventListener('click', () => collection.setEra(e.id));
          card.append(btn);
        } else {
          card.append(el('p', { class: 'small', text: 'No objects from this era in the archive yet' }));
        }
        seg.append(card);
        seg.append(el('span', { class: 'tl-label', text: fmtYear(e.start) }));
        inner.append(seg);
      });

      for (let y = -4750; y <= 500; y += 250) {
        if (ERAS.some((e) => e.start === y)) continue;
        inner.append(el('div', { class: 'tl-tick', style: `left:${yearToX(y)}px` }));
      }
      inner.append(el('div', { class: 'tl-cursor' }));
      measure();
      update();
    }

    function measure() {
      const cards = $$('.tl-card', inner);
      const maxH = Math.max(0, ...cards.map((c) => c.offsetHeight));
      inner.style.setProperty('--axis', `${maxH + 30}px`);
    }

    function yearToX(year) {
      for (const item of layout) {
        const { era, x, w } = item;
        if (year >= era.start && year <= era.end) return x + ((year - era.start) / (era.end - era.start)) * w;
      }
      return year < ERAS[0].start ? 0 : layout[layout.length - 1].x + layout[layout.length - 1].w;
    }

    function xToYear(px) {
      for (const item of layout) {
        if (px >= item.x && px <= item.x + item.w) {
          return item.era.start + ((px - item.x) / item.w) * (item.era.end - item.era.start);
        }
      }
      return px < 0 ? ERAS[0].start : ERAS[ERAS.length - 1].end;
    }

    function trackX() {
      const sr = scroller.getBoundingClientRect();
      const ir = inner.getBoundingClientRect();
      return sr.left + sr.width / 2 - ir.left;
    }

    function update() {
      if (!layout.length) return;
      const px = trackX();
      const last = layout[layout.length - 1];
      yearOut.textContent = fmtYear(xToYear(px));
      let idx = layout.findIndex((it) => px >= it.x && px < it.x + it.w);
      if (idx < 0) idx = px < 0 ? 0 : layout.length - 1;
      if (idx !== active) {
        active = idx;
        $$('.tl-era-seg', inner).forEach((s, i) => s.classList.toggle('active', i === idx));
        eraOut.textContent = ERAS[idx].name;
      }
      const cursor = $('.tl-cursor', inner);
      if (cursor) cursor.style.left = `${Math.max(0, Math.min(px, last.x + last.w))}px`;
    }

    let navIdx = null;
    let settle;
    function goTo(i) {
      navIdx = Math.max(0, Math.min(layout.length - 1, i));
      const item = layout[navIdx];
      const sr = scroller.getBoundingClientRect();
      const ir = inner.getBoundingClientRect();
      const innerLeft = ir.left - sr.left + scroller.scrollLeft;
      const target = innerLeft + item.x + Math.min(item.w, 360) / 2 - sr.width / 2;
      scroller.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
    }

    let drag = null;
    scroller.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.target.closest('button, a')) return;
      drag = { x: e.clientX, left: scroller.scrollLeft, v: 0, last: e.clientX, t: performance.now() };
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add('dragging');
    });
    scroller.addEventListener('pointermove', (e) => {
      if (!drag) return;
      scroller.scrollLeft = drag.left - (e.clientX - drag.x);
      const now = performance.now();
      drag.v = (e.clientX - drag.last) / Math.max(1, now - drag.t);
      drag.last = e.clientX;
      drag.t = now;
    });
    const endDrag = () => {
      if (!drag) return;
      scroller.classList.remove('dragging');
      let v = drag.v * 16;
      drag = null;
      if (reduced) return;
      const glide = () => {
        if (Math.abs(v) < 0.4) return;
        scroller.scrollLeft -= v;
        v *= 0.94;
        requestAnimationFrame(glide);
      };
      glide();
    };
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('scroll', () => {
      update();
      clearTimeout(settle);
      settle = setTimeout(() => { navIdx = null; }, 200);
    }, { passive: true });
    const current = () => (navIdx === null ? active : navIdx);
    scroller.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
    });
    $('#tlPrev').addEventListener('click', () => goTo(current() - 1));
    $('#tlNext').addEventListener('click', () => goTo(current() + 1));

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    document.fonts.ready.then(measure);
    build();
    requestAnimationFrame(() => { scroller.scrollLeft = 120; update(); });
  }

  function initExhibitions(openObject) {
    const grid = $('#exhibitGrid');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookings = JSON.parse(localStorage.getItem('edm-bookings') || '{}');
    const timers = [];

    function status(ex) {
      const s = parseDate(ex.start), e = parseDate(ex.end);
      if (today > e) return 'past';
      if (today < s) return 'soon';
      if ((e - today) / 86400000 <= 21) return 'ending';
      return 'now';
    }

    const labels = { past: 'Archived', soon: 'Opening soon', ending: 'Closing soon', now: 'Now showing' };

    function countdown(target, node) {
      const units = [['days', 86400000], ['hrs', 3600000], ['min', 60000], ['sec', 1000]];
      const cells = units.map(([u]) => {
        const b = el('b', { text: '0' });
        node.append(el('div', {}, [b, el('small', { text: u })]));
        return b;
      });
      const tick = () => {
        let diff = Math.max(0, target - Date.now());
        units.forEach(([, ms], i) => {
          const v = Math.floor(diff / ms);
          diff -= v * ms;
          cells[i].textContent = String(v).padStart(2, '0');
        });
      };
      tick();
      timers.push(setInterval(tick, 1000));
    }

    EXHIBITIONS.forEach((ex) => {
      const st = status(ex);
      const s = parseDate(ex.start), e = parseDate(ex.end);
      const card = el('article', { class: `exhibit ${st}`, id: `ex-${ex.id}` });
      card.append(el('div', { class: 'exhibit-bg', style: `background-image:url("${ex.bg}")` }));
      card.append(el('span', { class: 'exhibit-status', text: labels[st] }));
      card.append(el('span', { class: 'exhibit-room', text: ex.room }));
      card.append(el('h3', { text: ex.title }));
      card.append(el('p', { text: ex.blurb }));
      card.append(el('p', { class: 'exhibit-dates', text: fmtDateRange(s, e) }));
      if (st === 'soon' || st === 'ending' || st === 'now') {
        const cd = el('div', { class: 'countdown', 'aria-label': st === 'soon' ? 'Opens in' : 'Closes in' });
        const target = st === 'soon' ? s.getTime() : e.getTime() + 86400000;
        countdown(target, cd);
        card.append(cd);
      }
      const objs = el('div', { class: 'exhibit-objects' });
      ex.objects.forEach((id) => {
        const a = artifactById[id];
        if (!a) return;
        const im = el('img', { alt: a.title, title: a.title, loading: 'lazy' });
        loadImage(im, a.img.card, a.focus);
        objs.append(im);
      });
      card.append(objs);
      const actions = el('div', { class: 'exhibit-actions' });
      const reserve = el('button', { class: 'btn btn-primary btn-small', type: 'button' });
      if (st === 'past') {
        reserve.textContent = 'Closed';
        reserve.disabled = true;
      } else if (bookings[ex.id]) {
        reserve.textContent = `Reserved for ${fmtDate(parseDate(bookings[ex.id].date))}`;
        reserve.classList.replace('btn-primary', 'btn-ghost');
      } else {
        reserve.textContent = 'Reserve a slot';
      }
      reserve.addEventListener('click', () => openBooking(ex, reserve));
      const see = el('button', { class: 'btn btn-ghost btn-small', type: 'button', text: 'See the objects' });
      see.addEventListener('click', () => openObject(ex.objects[0], ex.objects));
      actions.append(reserve, see);
      card.append(actions);
      grid.append(card);
    });

    const dialog = $('#booking');
    const form = $('#bookingForm');
    const done = $('#bookingDone');
    const note = $('#bNote');
    let currentEx = null;
    let currentBtn = null;

    function openBooking(ex, btn) {
      currentEx = ex;
      currentBtn = btn;
      form.hidden = false;
      done.hidden = true;
      note.textContent = '';
      note.classList.remove('error');
      $('#bTitle').textContent = ex.title;
      $('#bDates').textContent = `${ex.room} · ${fmtDateRange(parseDate(ex.start), parseDate(ex.end))}`;
      const s = parseDate(ex.start);
      const minDate = s > today ? s : today;
      const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dateInput = $('#bDate');
      dateInput.min = iso(minDate);
      dateInput.max = ex.end;
      dateInput.value = iso(minDate);
      $$('input', form).forEach((i) => i.removeAttribute('aria-invalid'));
      dialog.showModal();
      document.body.classList.add('locked');
      $('#bName').focus();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const date = $('#bDate'), count = $('#bCount'), name = $('#bName'), email = $('#bEmail');
      let bad = null;
      [date, count, name, email].forEach((i) => i.removeAttribute('aria-invalid'));
      if (!date.value || date.value < date.min || date.value > date.max) bad = [date, 'Pick a date while the room is open'];
      else if (!(count.value >= 1 && count.value <= 8)) bad = [count, 'Between one and eight visitors'];
      else if (name.value.trim().length < 2) bad = [name, 'Tell us who to hold the place for'];
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) bad = [email, 'That email does not look right'];
      if (bad) {
        bad[0].setAttribute('aria-invalid', 'true');
        bad[0].focus();
        note.textContent = bad[1];
        note.classList.add('error');
        return;
      }
      const code = `KMT-${hash36(currentEx.id + date.value + email.value.toLowerCase())}`;
      bookings[currentEx.id] = { date: date.value, count: Number(count.value), code };
      localStorage.setItem('edm-bookings', JSON.stringify(bookings));
      $('#bDoneText').textContent = `${name.value.trim()}, ${count.value} ${count.value > 1 ? 'places' : 'place'} held for ${currentEx.title} on ${fmtDate(parseDate(date.value))}.`;
      $('#bCode').textContent = code;
      form.hidden = true;
      done.hidden = false;
      $('#bDoneClose').focus();
      if (currentBtn) {
        currentBtn.textContent = `Reserved for ${fmtDate(parseDate(date.value))}`;
        currentBtn.classList.replace('btn-primary', 'btn-ghost');
      }
    });

    const closeBooking = () => {
      if (dialog.open) dialog.close();
      document.body.classList.remove('locked');
    };
    $('#bClose').addEventListener('click', closeBooking);
    $('#bDoneClose').addEventListener('click', closeBooking);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeBooking(); });
    dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeBooking(); } });
    dialog.addEventListener('close', () => document.body.classList.remove('locked'));
  }

  function initCartouche() {
    const input = $('#cartName');
    const stage = $('#cartStage');
    const legend = $('#cartLegend');
    const form = $('#cartoucheForm');
    let signs = [];

    const materials = {
      gold: { fill: '#14110a', stroke: '#d9b455', glyph: '#f3d27a', glow: 'rgba(217,180,85,0.5)', label: '#d9b455' },
      lapis: { fill: '#1b2f8a', stroke: '#d9b455', glyph: '#f3d27a', glow: 'rgba(53,86,224,0.6)', label: '#cfd8ff' },
      stone: { fill: '#cbb894', stroke: '#6e5a34', glyph: '#4a3b21', glow: 'rgba(0,0,0,0)', label: '#4a3b21' }
    };

    function opts() {
      const dir = form.elements.dir.value;
      const mat = materials[form.elements.mat.value];
      return { dir, mat };
    }

    function render() {
      const name = input.value.trim() || 'Nefertari';
      signs = transliterate(name);
      const { dir, mat } = opts();
      const glyphs = signs.map((s) => s.glyph);
      const size = 64;
      const gap = 10;
      const pad = 36;
      const n = Math.max(1, glyphs.length);
      let svg;
      if (dir === 'h') {
        const inner = n * size + (n - 1) * gap;
        const W = pad * 2 + inner + 34;
        const H = 150;
        const texts = glyphs.map((g, i) =>
          `<text class="cart-glyph" x="${pad + i * (size + gap) + size / 2}" y="${H / 2}" text-anchor="middle" dominant-baseline="central" font-size="${size}" fill="${mat.glyph}">${g}</text>`).join('');
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} written in hieroglyphs">
          <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <rect x="6" y="6" width="${W - 46}" height="${H - 12}" rx="${(H - 12) / 2}" fill="${mat.fill}" stroke="${mat.stroke}" stroke-width="5" filter="url(#glow)"/>
          <rect x="12" y="12" width="${W - 58}" height="${H - 24}" rx="${(H - 24) / 2}" fill="none" stroke="${mat.stroke}" stroke-width="1.5" opacity="0.6" stroke-dasharray="2 6"/>
          <line x1="${W - 20}" y1="18" x2="${W - 20}" y2="${H - 18}" stroke="${mat.stroke}" stroke-width="7" stroke-linecap="round"/>
          ${texts}
          <text x="${(W - 40) / 2}" y="${H - 4}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="3" fill="${mat.label}" opacity="0.9">${name.toUpperCase()}</text>
        </svg>`;
      } else {
        const inner = n * size + (n - 1) * gap;
        const W = 150;
        const H = pad * 2 + inner + 34;
        const texts = glyphs.map((g, i) =>
          `<text class="cart-glyph" x="${W / 2}" y="${pad + i * (size + gap) + size / 2}" text-anchor="middle" dominant-baseline="central" font-size="${size}" fill="${mat.glyph}">${g}</text>`).join('');
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${name} written in hieroglyphs">
          <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <rect x="6" y="6" width="${W - 12}" height="${H - 46}" rx="${(W - 12) / 2}" fill="${mat.fill}" stroke="${mat.stroke}" stroke-width="5" filter="url(#glow)"/>
          <rect x="12" y="12" width="${W - 24}" height="${H - 58}" rx="${(W - 24) / 2}" fill="none" stroke="${mat.stroke}" stroke-width="1.5" opacity="0.6" stroke-dasharray="2 6"/>
          <line x1="18" y1="${H - 20}" x2="${W - 18}" y2="${H - 20}" stroke="${mat.stroke}" stroke-width="7" stroke-linecap="round"/>
          ${texts}
        </svg>`;
      }
      stage.innerHTML = svg;
      legend.innerHTML = '';
      const seen = new Set();
      signs.forEach((s) => {
        const key = s.glyph;
        if (seen.has(key)) return;
        seen.add(key);
        legend.append(el('li', {}, [
          el('span', { class: 'g', text: s.glyph }),
          el('span', {}, [el('b', { text: s.letters.toUpperCase() }), ` ${s.sign}`])
        ]));
      });
    }

    async function download() {
      const name = input.value.trim() || 'Nefertari';
      const { dir, mat } = opts();
      const glyphs = signs.map((s) => s.glyph);
      const font = '"Noto Sans Egyptian Hieroglyphs"';
      try { await document.fonts.load(`64px ${font}`); } catch {}
      const scale = 2;
      const size = 96, gap = 16, pad = 54, bar = 50;
      const n = Math.max(1, glyphs.length);
      const inner = n * size + (n - 1) * gap;
      const W = dir === 'h' ? pad * 2 + inner + bar : 220;
      const H = dir === 'h' ? 220 : pad * 2 + inner + bar;
      const c = document.createElement('canvas');
      c.width = W * scale;
      c.height = H * scale;
      const ctx = c.getContext('2d');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#07070b';
      ctx.fillRect(0, 0, W, H);
      const rw = dir === 'h' ? W - bar - 20 : W - 20;
      const rh = dir === 'h' ? H - 20 : H - bar - 20;
      const r = Math.min(rw, rh) / 2;
      ctx.beginPath();
      ctx.roundRect(10, 10, rw, rh, r);
      ctx.fillStyle = mat.fill;
      ctx.shadowColor = mat.glow;
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 7;
      ctx.strokeStyle = mat.stroke;
      ctx.stroke();
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (dir === 'h') { ctx.moveTo(W - 26, 28); ctx.lineTo(W - 26, H - 28); }
      else { ctx.moveTo(28, H - 26); ctx.lineTo(W - 28, H - 26); }
      ctx.stroke();
      ctx.fillStyle = mat.glyph;
      ctx.font = `${size}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      glyphs.forEach((g, i) => {
        if (dir === 'h') ctx.fillText(g, pad + i * (size + gap) + size / 2, H / 2 - 4);
        else ctx.fillText(g, W / 2, pad + i * (size + gap) + size / 2);
      });
      c.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cartouche-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        toast('Cartouche saved');
      }, 'image/png');
    }

    input.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', (e) => e.preventDefault());
    $('#cartDownload').addEventListener('click', download);
    $('#cartCopy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(signs.map((s) => s.glyph).join(''));
        toast('Signs copied');
      } catch {
        toast('Could not copy on this browser');
      }
    });
    document.fonts.ready.then(render);
    render();
  }

  function initRoutes(openObject) {
    const grid = $('#routesGrid');
    ROUTES.forEach((r) => {
      const thumbs = el('div', { class: 'route-thumbs' });
      r.objects.slice(0, 5).forEach((id) => {
        const a = artifactById[id];
        const im = el('img', { alt: '', loading: 'lazy' });
        loadImage(im, a.img.card, a.focus);
        thumbs.append(im);
      });
      const btn = el('button', { class: 'btn btn-ghost btn-small', type: 'button', text: 'Start route' });
      btn.addEventListener('click', () => openObject(r.objects[0], r.objects, { title: r.title }));
      grid.append(el('article', { class: 'route', id: `route-${r.id}` }, [
        el('span', { class: 'g', text: r.glyph }),
        el('span', { class: 'route-meta', text: `${r.objects.length} objects · ${r.minutes} min` }),
        el('h3', { text: r.title }),
        el('p', { text: r.blurb }),
        thumbs,
        btn
      ]));
    });
    return (id) => {
      const r = ROUTES.find((x) => x.id === id);
      if (r) openObject(r.objects[0], r.objects, { title: r.title });
    };
  }

  function initPalette(openObject, startRoute) {
    const dialog = $('#palette');
    const input = $('#paletteInput');
    const list = $('#paletteList');
    let items = [];
    let selected = 0;

    const sections = [
      ['collection', 'Collection'], ['timeline', 'Timeline'], ['exhibitions', 'Exhibitions'],
      ['cartouche', 'Cartouche maker'], ['routes', 'Curated routes'], ['visit', 'Visit']
    ];

    const all = [
      ...ARTIFACTS.map((a) => ({ kind: 'object', label: a.title, sub: eraById[a.era].name, img: a.img.card, hay: `${a.title} ${a.tags.join(' ')} ${a.museum}`, run: () => openObject(a.id) })),
      ...ERAS.map((e) => ({ kind: 'era', label: e.name, glyph: e.glyph, hay: `${e.name} ${e.dynasties}`, run: () => collection.setEra(e.id) })),
      ...EXHIBITIONS.map((x) => ({ kind: 'room', label: x.title, glyph: '𓉐', hay: `${x.title} ${x.blurb}`, run: () => { const c = $(`#ex-${x.id}`); c.scrollIntoView({ behavior: 'smooth', block: 'center' }); c.style.borderColor = 'var(--gold)'; } })),
      ...ROUTES.map((r) => ({ kind: 'route', label: r.title, glyph: r.glyph, hay: r.title, run: () => startRoute(r.id) })),
      ...sections.map(([id, label]) => ({ kind: 'section', label, glyph: '𓏭', hay: label, run: () => $('#' + id).scrollIntoView({ behavior: 'smooth' }) }))
    ];

    function query(q) {
      const words = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [...all.filter((i) => i.kind === 'section').slice(0, 3), ...all.filter((i) => i.kind === 'object').slice(0, 5)];
      return all
        .map((i) => {
          const hay = i.hay.toLowerCase();
          const label = i.label.toLowerCase();
          let score = 0;
          for (const wd of words) {
            if (label.startsWith(wd)) score += 5;
            else if (label.includes(wd)) score += 3;
            else if (hay.includes(wd)) score += 1;
            else return null;
          }
          return { i, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .slice(0, 9)
        .map((x) => x.i);
    }

    function render() {
      items = query(input.value);
      selected = 0;
      list.innerHTML = '';
      if (!items.length) {
        list.append(el('li', { class: 'none', text: 'Nothing found in the archive' }));
        return;
      }
      items.forEach((it, idx) => {
        const li = el('li', { role: 'option', 'aria-selected': String(idx === 0) }, [
          it.img ? el('img', { src: it.img, alt: '' }) : el('span', { class: 'g', text: it.glyph }),
          el('span', { text: it.label }),
          it.sub ? el('span', { class: 'small', text: it.sub }) : null,
          el('span', { class: 'kind', text: it.kind })
        ]);
        li.addEventListener('click', () => pick(idx));
        li.addEventListener('mousemove', () => select(idx));
        list.append(li);
      });
    }

    function select(idx) {
      selected = idx;
      $$('li', list).forEach((li, i) => li.setAttribute('aria-selected', String(i === idx)));
      const li = list.children[idx];
      if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    }

    function closePalette() {
      if (dialog.open) dialog.close();
      document.body.classList.remove('locked');
    }

    function pick(idx) {
      const it = items[idx];
      if (!it) return;
      closePalette();
      setTimeout(it.run, 30);
    }

    function open() {
      if (dialog.open) return;
      input.value = '';
      render();
      dialog.showModal();
      document.body.classList.add('locked');
      input.focus();
    }

    input.addEventListener('input', render);
    $('#paletteForm').addEventListener('submit', (e) => { e.preventDefault(); pick(selected); });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(Math.min(items.length - 1, selected + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); select(Math.max(0, selected - 1)); }
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closePalette(); });
    dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closePalette(); } });
    dialog.addEventListener('close', () => document.body.classList.remove('locked'));
    $('#paletteBtn').addEventListener('click', open);
    $$('[data-open-palette]').forEach((b) => b.addEventListener('click', open));
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dialog.open ? closePalette() : open();
      }
    });
  }

  function initNewsletter() {
    const form = $('#newsletter');
    const email = $('#newsEmail');
    const note = $('#newsNote');
    if (localStorage.getItem('edm-newsletter')) {
      note.textContent = 'You are already on the list.';
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.classList.remove('error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        note.textContent = 'That email does not look right.';
        note.classList.add('error');
        email.setAttribute('aria-invalid', 'true');
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');
      localStorage.setItem('edm-newsletter', '1');
      note.textContent = 'Thanks. First note arrives with the next object.';
      email.value = '';
    });
  }

  function initReveal() {
    const targets = $$('.section-head, .exhibit, .route, .spotlight-grid > *, .visit-grid > *, .cartouche-copy, .cartouche-stage, .footer-grid > *');
    if (reduced) return;
    targets.forEach((t) => t.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t) => io.observe(t));
  }

  function initShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable;
      if (e.key === '/' && !typing && !$('dialog[open]')) {
        e.preventDefault();
        $('#search').focus();
      }
    });
  }

  function initHashRoute(openObject) {
    const apply = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (h.startsWith('object/')) {
        const id = h.slice(7);
        if (artifactById[id]) openObject(id);
      } else if (h.startsWith('era/')) {
        const id = h.slice(4);
        if (eraById[id]) collection.setEra(id);
      }
    };
    document.addEventListener('museum:ready', apply, { once: true });
    window.addEventListener('hashchange', apply);
  }

  function init() {
    initTheme();
    initLoader();
    initHeader();
    initProgress();
    initHeroCanvas();
    initStats();
    initMarquee();
    const openObject = initModal();
    initCollection(openObject);
    initSpotlight(openObject);
    initTimeline(openObject);
    initExhibitions(openObject);
    initCartouche();
    const startRoute = initRoutes(openObject);
    initPalette(openObject, startRoute);
    initNewsletter();
    initReveal();
    initShortcuts();
    initHashRoute(openObject);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
