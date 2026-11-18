(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const folders = { home: 'Homepage', skills: 'Skills', projects: 'Projects', volunteering: 'Volunteering', contact: 'Contact' };
  const subs = { zora: 'ZORA', vaulte: 'VAULTÉ', bestsecret: 'BestSecret audit' };
  const sheet = $('#sheet'), crumbs = $('#crumbs');
  let current = '', lastSub = 'zora';

  function counters(root) {
    $$('[data-to]', root).forEach(el => {
      const to = +el.dataset.to, dec = +el.dataset.dec || 0, t0 = performance.now();
      const fmt = n => (el.dataset.sep ? Math.round(n).toLocaleString('en-US') : n.toFixed(dec)) + (el.dataset.suffix || '');
      if (calm) return (el.textContent = fmt(to));
      (function tick(t) {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  function route() {
    let id = decodeURIComponent(location.hash.slice(1)) || 'home', folder, sub = null;
    if (id === 'front') id = 'home'; // old shared links
    folder = id;
    if (subs[id]) { folder = 'projects'; sub = id; }
    else if (folder === 'projects') sub = lastSub;
    if (!folders[folder]) folder = 'home';
    if (sub) lastSub = sub;
    const changed = folder !== current;
    $$('.page').forEach(p => p.hidden = p.id !== 'p-' + folder);
    $$('#folders button').forEach(b => { const on = b.dataset.go === folder; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    if (sub) {
      $$('#p-projects .entry').forEach(e => e.hidden = e.id !== 'e-' + sub);
      $$('#subs button').forEach(b => { const on = b.dataset.sub === sub; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
    }
    const trail = [['Archive', '#home'], [folders[folder], '#' + folder]];
    if (sub) trail.push([subs[sub], '#' + sub]);
    crumbs.innerHTML = trail.map((t, i) => i === trail.length - 1 ? `<li aria-current="page">${t[0]}</li>` : `<li><a href="${t[1]}">${t[0]}</a></li>`).join('');
    if (changed) {
      current = folder;
      sheet.classList.remove('turn'); void sheet.offsetWidth; if (!calm) sheet.classList.add('turn');
      scrollTo({ top: 0, behavior: 'auto' });
    }
    counters($('#p-' + folder));
    document.title = folders[folder] + ' | Shanice C Sagonda';
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go],[data-sub]');
    if (!b) return;
    location.hash = b.dataset.go || b.dataset.sub;
  });
  $$('[role=tablist]').forEach(list => list.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    const tabs = $$('[role=tab]', list), i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const n = tabs[(i + d + tabs.length) % tabs.length];
    n.focus(); n.click();
  }));
  $$('.shot img').forEach(img => { const hide = () => { img.style.display = 'none'; }; img.addEventListener('error', hide); if (img.complete && !img.naturalWidth) hide(); });
  addEventListener('hashchange', route);
  route();

  // Skills: dots that morph cube, pyramid, sphere
  const cv = $('#morph'), ctx = cv.getContext('2d'), N = 150;
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const byY = a => a.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
  const cube = byY(Array.from({ length: N }, (_, i) => {
    const f = i % 6, s = f & 1 ? -.8 : .8, u = (rnd(i * 2) * 2 - 1) * .8, v = (rnd(i * 2 + 1) * 2 - 1) * .8, a = f >> 1;
    return a === 0 ? [s, u, v] : a === 1 ? [u, s, v] : [u, v, s];
  }));
  const C = [[-.9, .8, -.9], [.9, .8, -.9], [.9, .8, .9], [-.9, .8, .9]];
  const pyr = byY(Array.from({ length: N }, (_, i) => {
    let a = rnd(i * 3), b = rnd(i * 3 + 1);
    if (i % 5 === 0) return [(a * 2 - 1) * .9, .8, (b * 2 - 1) * .9];
    if (a + b > 1) { a = 1 - a; b = 1 - b; }
    const B = C[i % 4], D = C[(i + 1) % 4], A = [0, -.9, 0];
    return [0, 1, 2].map(k => A[k] + a * (B[k] - A[k]) + b * (D[k] - A[k]));
  }));
  const sph = byY(Array.from({ length: N }, (_, i) => {
    const y = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - y * y), t = i * 2.39996;
    return [r * Math.cos(t) * .9, y * .9, r * Math.sin(t) * .9];
  }));
  const shapes = [cube, pyr, sph], ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  let t0 = performance.now(), live = true;
  function draw(now) {
    const T = calm ? 0 : Math.max(0, (now - t0) / 1000), seg = 3.2, k = Math.floor(T / seg) % 3, ph = (T % seg) / seg;
    const m = ph < .55 ? 0 : ease((ph - .55) / .45), A = shapes[k], B = shapes[(k + 1) % 3];
    const ay = T * .7, ax = .5, W = cv.width, c = W / 2;
    ctx.clearRect(0, 0, W, W);
    for (let i = 0; i < N; i++) {
      const x = A[i][0] + (B[i][0] - A[i][0]) * m, y = A[i][1] + (B[i][1] - A[i][1]) * m, z = A[i][2] + (B[i][2] - A[i][2]) * m;
      const x1 = x * Math.cos(ay) + z * Math.sin(ay), z1 = -x * Math.sin(ay) + z * Math.cos(ay);
      const y1 = y * Math.cos(ax) - z1 * Math.sin(ax), z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
      ctx.globalAlpha = .35 + (z2 + 1.2) * .3;
      ctx.beginPath(); ctx.arc(c + x1 * c * .62, c + y1 * c * .62, 3 + z2 * 1.2, 0, 6.3); ctx.fillStyle = '#111'; ctx.fill();
    }
  }
  new IntersectionObserver(es => { live = es[0].isIntersecting; }).observe(cv);
  (function loop(now) { if (live) draw(now); if (!calm) requestAnimationFrame(loop); })(performance.now());
  if (calm) draw(0);
})();
