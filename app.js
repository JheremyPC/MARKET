/* =========================================================
   PascoMarket · MVP demostrativo
   Catálogo + pedidos por WhatsApp + métricas en localStorage
   ========================================================= */
'use strict';

/* ---------------------------------------------------------
   1. CONFIGURACIÓN
   Los teléfonos son FICTICIOS (prefijo 51 900 000 ...).
   Formato: código de país + número, sin "+" ni espacios.
   Ej. real: '51987654321'. También puedes definir un teléfono
   de prueba desde la vista Métricas > Configuración de la demo.
   --------------------------------------------------------- */
const CONFIG = {
  adminPhone: '51900000000',          // Recibe a los comercios interesados en sumarse
  storageKey: 'pascomarket:v1',
  maxEvents: 3000,
  targets: {                          // Metas referenciales del piloto (%)
    interest: 50,
    conversion: 15,
    activation: 60,
    wtp: 40,
  },
};

const photo = (id, w = 480, h = w) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

/* ---------------------------------------------------------
   2. DATOS DE DEMOSTRACIÓN (ficticios)
   --------------------------------------------------------- */
const CATEGORIES = [
  { id: 'lacteos',   name: 'Lácteos',          emoji: '🧀' },
  { id: 'panaderia', name: 'Panadería',        emoji: '🥖' },
  { id: 'dulces',    name: 'Dulces',           emoji: '🍫' },
  { id: 'campo',     name: 'Del campo',        emoji: '🥔' },
  { id: 'granja',    name: 'Granja y trucha',  emoji: '🥚' },
  { id: 'artesania', name: 'Artesanía',        emoji: '🧶' },
  { id: 'bebidas',   name: 'Café y mates',     emoji: '☕' },
];

const MERCHANTS = [
  { id: 'huayllay', name: 'Quesería Huayllay', initials: 'QH', district: 'Huayllay',
    tagline: 'Quesos y lácteos frescos de ganaderos de la meseta de Bombón.',
    phone: '51900000101', hours: 'Lun–Sáb · 6:30–18:00', delivery: 'Reparto en Chaupimarca y Yanacancha', colors: ['#7A4FD6', '#36176F'] },
  { id: 'sanjuan', name: 'Panadería San Juan', initials: 'SJ', district: 'San Juan Pampa, Yanacancha',
    tagline: 'Pan serrano horneado en horno de leña cada madrugada.',
    phone: '51900000102', hours: 'Todos los días · 5:30–21:00', delivery: 'Recojo en tienda', colors: ['#9C7BE6', '#4C1D95'] },
  { id: 'pasquena', name: 'Dulcería La Pasqueña', initials: 'LP', district: 'Chaupimarca',
    tagline: 'Tortas, galletas y chocolates para cada celebración.',
    phone: '51900000103', hours: 'Lun–Dom · 9:00–20:00', delivery: 'Pedidos con 24 h de anticipación', colors: ['#5F2EB8', '#24104F'] },
  { id: 'agroandino', name: 'Agro Andino Pasco', initials: 'AA', district: 'Yanacancha',
    tagline: 'Papa, choclo y verduras directo de chacras pasqueñas.',
    phone: '51900000104', hours: 'Lun–Sáb · 7:00–17:00', delivery: 'Reparto martes y viernes', colors: ['#B7A3EE', '#5F2EB8'] },
  { id: 'vicco', name: 'Biohuerto Vicco', initials: 'BV', district: 'Vicco',
    tagline: 'Canastas de verduras agroecológicas cultivadas en altura.',
    phone: '51900000105', hours: 'Mié–Dom · 8:00–16:00', delivery: 'Entrega semanal en Cerro de Pasco', colors: ['#8B63DD', '#36176F'] },
  { id: 'rancas', name: 'Granja Rancas', initials: 'GR', district: 'Rancas, Simón Bolívar',
    tagline: 'Huevos de corral y trucha de laguna, frescos cada semana.',
    phone: '51900000106', hours: 'Lun–Sáb · 7:00–18:00', delivery: 'Reparto en Simón Bolívar y Yanacancha', colors: ['#6D3FCB', '#2D1363'] },
  { id: 'warmi', name: 'Tejidos Warmi', initials: 'TW', district: 'Chaupimarca',
    tagline: 'Asociación de tejedoras: lana de oveja y alpaca hecha a mano.',
    phone: '51900000107', hours: 'Lun–Sáb · 9:00–19:00', delivery: 'Envíos a todo Pasco', colors: ['#A68BEA', '#4C1D95'] },
  { id: 'puna', name: 'Café & Mates de la Puna', initials: 'CP', district: 'Yanacancha',
    tagline: 'Café de Oxapampa y hierbas aromáticas de la sierra pasqueña.',
    phone: '51900000108', hours: 'Lun–Sáb · 8:00–20:00', delivery: 'Recojo y reparto en el centro', colors: ['#7A4FD6', '#24104F'] },
];

const PRODUCTS = [
  { id: 'p01', m: 'huayllay', cat: 'lacteos', name: 'Queso fresco andino', unit: '1 kg', price: 18, img: '1486297678162-eb2a19b0a32d',
    desc: 'Queso fresco de leche entera, elaborado artesanalmente cada mañana. Ideal con papa sancochada o en el desayuno.', tags: 'queso lacteo desayuno' },
  { id: 'p02', m: 'huayllay', cat: 'lacteos', name: 'Yogurt de fresa', unit: 'Botella 1 L', price: 9.5, img: '1488477181946-6428a0291777',
    desc: 'Yogurt batido con trozos de fresa natural, sin conservantes. Mantener refrigerado.', tags: 'yogur yogurt fresa bebida' },
  { id: 'p03', m: 'huayllay', cat: 'lacteos', name: 'Leche fresca de vaca', unit: '1 L', price: 4.5, img: '1550583724-b2692b85b150',
    desc: 'Leche entera del día, pasteurizada en planta artesanal. Perfecta para el desayuno familiar.', tags: 'leche lacteo' },
  { id: 'p04', m: 'sanjuan', cat: 'panaderia', name: 'Pan serrano de leña', unit: 'Bolsa x 6', price: 3, img: '1509440159596-0249088772ff',
    desc: 'Pan de trigo con corteza crocante, horneado en horno de leña. Sale caliente desde las 6:00 a. m.', tags: 'pan serrano desayuno' },
  { id: 'p05', m: 'sanjuan', cat: 'panaderia', name: 'Cachitos de mantequilla', unit: 'Bolsa x 6', price: 4.8, img: '1555507036-ab1f4038808a',
    desc: 'Cachitos hojaldrados con mantequilla, suaves por dentro y dorados por fuera.', tags: 'cachito croissant pan mantequilla' },
  { id: 'p06', m: 'sanjuan', cat: 'panaderia', name: 'Pan de molde integral', unit: '500 g', price: 7.5, img: '1549931319-a545dcf3bc73',
    desc: 'Pan integral rebanado con harina de trigo y salvado. Sin preservantes.', tags: 'pan molde integral' },
  { id: 'p07', m: 'pasquena', cat: 'dulces', name: 'Torta de chocolate', unit: 'Entera · 12 porciones', price: 45, img: '1578985545062-69928b1d9587',
    desc: 'Bizcocho húmedo de chocolate con fudge y crema. Se prepara por encargo con 24 h de anticipación.', tags: 'torta pastel cumpleaños chocolate postre' },
  { id: 'p08', m: 'pasquena', cat: 'dulces', name: 'Galletas artesanales con chispas', unit: 'Bolsa x 12', price: 8, img: '1558961363-fa8fdf82db35',
    desc: 'Galletas de mantequilla con chispas de chocolate, horneadas el mismo día.', tags: 'galletas chocolate postre' },
  { id: 'p09', m: 'pasquena', cat: 'dulces', name: 'Chocolate artesanal 70%', unit: 'Tableta 100 g', price: 12, img: '1606312619070-d48b4c652a52',
    desc: 'Chocolate oscuro elaborado con cacao peruano. Ideal para regalar.', tags: 'chocolate cacao regalo' },
  { id: 'p10', m: 'agroandino', cat: 'campo', name: 'Papa amarilla', unit: 'Saco 5 kg', price: 16, img: '1518977676601-b53f82aba655',
    desc: 'Papa amarilla seleccionada, harinosa y perfecta para causa, puré o papa a la huancaína.', tags: 'papa tuberculo verdura' },
  { id: 'p11', m: 'agroandino', cat: 'campo', name: 'Choclo serrano', unit: 'Atado x 6', price: 7, img: '1551754655-cd27e38d2076',
    desc: 'Choclo tierno de grano grande, cosechado en la semana. Acompáñalo con queso fresco.', tags: 'choclo maiz verdura' },
  { id: 'p12', m: 'agroandino', cat: 'campo', name: 'Zanahoria fresca', unit: '2 kg', price: 5, img: '1598170845058-32b9d6a5da37',
    desc: 'Zanahoria dulce y crocante, lavada y lista para tus sopas y guisos.', tags: 'zanahoria verdura' },
  { id: 'p13', m: 'vicco', cat: 'campo', name: 'Canasta de verduras', unit: 'Aprox. 4 kg', price: 25, img: '1597362925123-77861d3fbac7',
    desc: 'Selección semanal de verduras agroecológicas: tomate, zanahoria, pimiento, cebolla y más.', tags: 'canasta verduras organico' },
  { id: 'p14', m: 'vicco', cat: 'campo', name: 'Mix de verduras para sopa', unit: '1.5 kg', price: 9, img: '1590779033100-9f60a05a013d',
    desc: 'Verduras picadas y listas para tu caldo o sopa de la semana.', tags: 'sopa verduras mix' },
  { id: 'p15', m: 'vicco', cat: 'campo', name: 'Trigo pelado', unit: '1 kg', price: 6.5, img: '1574323347407-f5e1ad6d020b',
    desc: 'Trigo andino pelado y seleccionado, ideal para mazamorra o sopa de trigo.', tags: 'trigo cereal grano' },
  { id: 'p16', m: 'rancas', cat: 'granja', name: 'Filete de trucha', unit: '1 kg', price: 28, img: '1519708227418-c8fd9a32b7a2',
    desc: 'Trucha de laguna fileteada y limpia, lista para freír o a la plancha.', tags: 'trucha pescado' },
  { id: 'p17', m: 'rancas', cat: 'granja', name: 'Huevos de corral', unit: '15 unidades', price: 9, img: '1582722872445-44dc5f7e3c8f',
    desc: 'Huevos de gallinas criadas al aire libre, con yema intensa.', tags: 'huevos corral' },
  { id: 'p18', m: 'rancas', cat: 'granja', name: 'Huevos rosados', unit: 'Bandeja x 30', price: 17, img: '1506976785307-8732e854ad03',
    desc: 'Bandeja completa de huevos frescos para negocios o familias grandes.', tags: 'huevos bandeja' },
  { id: 'p19', m: 'warmi', cat: 'artesania', name: 'Poncho tejido a mano', unit: 'Talla única', price: 95, img: '1434389677669-e08b4cac3105',
    desc: 'Poncho de lana tejido a palitos por artesanas de la asociación. Abrigador para el frío pasqueño.', tags: 'poncho tejido ropa lana' },
  { id: 'p20', m: 'warmi', cat: 'artesania', name: 'Chullo de lana de oveja', unit: 'Unidad', price: 25, img: '1576871337632-b9aef4c17ab9',
    desc: 'Chullo tejido con lana de oveja. Disponible en varios colores; consulta stock.', tags: 'chullo gorro tejido lana' },
  { id: 'p21', m: 'warmi', cat: 'artesania', name: 'Jabones artesanales de muña', unit: 'Pack x 3', price: 15, img: '1600857544200-b2f666a9a2ec',
    desc: 'Jabones naturales con aceite esencial de muña y glicerina vegetal.', tags: 'jabon muña regalo' },
  { id: 'p22', m: 'puna', cat: 'bebidas', name: 'Café de Oxapampa en grano', unit: '250 g', price: 22, img: '1447933601403-0c6688de566e',
    desc: 'Café de altura de la selva central de Pasco, tostado medio. También molido a pedido.', tags: 'cafe oxapampa grano' },
  { id: 'p23', m: 'puna', cat: 'bebidas', name: 'Infusión de muña', unit: 'Caja x 25 sobres', price: 6, img: '1544787219-7f47ccb76574',
    desc: 'Hierba andina digestiva y aromática, secada de forma natural.', tags: 'muña mate te infusion' },
  { id: 'p24', m: 'puna', cat: 'bebidas', name: 'Té helado de hierbas', unit: 'Botella 500 ml', price: 4, img: '1556679343-c7306c1976bc',
    desc: 'Bebida refrescante de hierbas andinas con limón, endulzada con panela.', tags: 'te bebida helado' },
];

const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
const merchantById = byId(MERCHANTS);
const categoryById = byId(CATEGORIES);
const productById = byId(PRODUCTS);

/* ---------------------------------------------------------
   3. UTILIDADES
   --------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const money = (n) => `S/ ${n.toFixed(2)}`;
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const avatarStyle = (m) => `--a1:${m.colors[0]};--a2:${m.colors[1]}`;
const mediaHTML = (p, w, h) => {
  const c = categoryById[p.cat];
  return `<div class="media" data-emoji="${c.emoji}">
    <img src="${photo(p.img, w, h)}" alt="${esc(p.name)}" loading="lazy" decoding="async"
      onload="this.classList.add('is-loaded')" onerror="this.parentNode.classList.add('is-fallback')">
  </div>`;
};

function session(key, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch { /* sessionStorage no disponible */ }
  return value;
}

/* ---------------------------------------------------------
   4. ALMACENAMIENTO DE MÉTRICAS (localStorage)
   --------------------------------------------------------- */
const Store = (() => {
  let data = null;
  let memSid = null;
  const fresh = () => ({ version: 1, visitorId: uid(), createdAt: Date.now(), events: [], settings: { testPhone: '' } });

  function get() {
    if (data) return data;
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      data = raw ? JSON.parse(raw) : fresh();
    } catch { data = fresh(); }
    if (!Array.isArray(data.events)) data.events = [];
    if (!data.settings) data.settings = { testPhone: '' };
    return data;
  }
  function save() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(data)); } catch { /* modo privado o lleno */ }
  }
  function sessionId() {
    let sid = session('pm_sid') || memSid;
    if (!sid) { sid = uid(); memSid = sid; session('pm_sid', sid); }
    return sid;
  }
  return {
    get, save, sessionId,
    isNewSession: () => !(session('pm_sid') || memSid),
    track(type, payload = {}) {
      const d = get();
      d.events.push({ type, ts: Date.now(), sid: sessionId(), ...payload });
      if (d.events.length > CONFIG.maxEvents) d.events.splice(0, d.events.length - CONFIG.maxEvents);
      save();
      if (state.route === 'metricas') renderMetrics(false);
    },
    reset() { data = fresh(); save(); },
    get settings() { return get().settings; },
  };
})();

/* ---------------------------------------------------------
   5. ESTADO DE LA INTERFAZ
   --------------------------------------------------------- */
const state = {
  route: 'catalogo',
  q: '',
  cat: 'all',
  merchant: null,
  sort: 'relevance',
  detail: null,   // { pid, qty }
};

/* ---------------------------------------------------------
   6. CATÁLOGO
   --------------------------------------------------------- */
const haystack = Object.fromEntries(PRODUCTS.map((p) => {
  const m = merchantById[p.m];
  return [p.id, norm(`${p.name} ${p.unit} ${p.tags} ${m.name} ${m.district} ${categoryById[p.cat].name}`)];
}));

function filteredProducts() {
  const tokens = norm(state.q).split(/\s+/).filter(Boolean);
  const q = tokens.join(' ');
  let list = PRODUCTS.filter((p) =>
    (state.cat === 'all' || p.cat === state.cat) &&
    (!state.merchant || p.m === state.merchant) &&
    tokens.every((t) => haystack[p.id].includes(t)));

  const score = (p) => {
    const n = norm(p.name);
    return n.startsWith(q) ? 3 : n.includes(q) ? 2 : 1;
  };
  switch (state.sort) {
    case 'price-asc': list = [...list].sort((a, b) => a.price - b.price); break;
    case 'price-desc': list = [...list].sort((a, b) => b.price - a.price); break;
    case 'name': list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'es')); break;
    default: if (q) list = [...list].sort((a, b) => score(b) - score(a));
  }
  return list;
}

function renderChips() {
  const count = (cat) => PRODUCTS.filter((p) => (cat === 'all' || p.cat === cat) && (!state.merchant || p.m === state.merchant)).length;
  const items = [{ id: 'all', name: 'Todos', emoji: '✨' }, ...CATEGORIES];
  $('#categoryChips').innerHTML = items.map((c) => `
    <button type="button" class="chip" data-cat="${c.id}" aria-pressed="${state.cat === c.id}">
      <span aria-hidden="true">${c.emoji}</span>${esc(c.name)}<span class="chip__count">${count(c.id)}</span>
    </button>`).join('');
}

function cardHTML(p, i) {
  const m = merchantById[p.m];
  const c = categoryById[p.cat];
  return `<article class="card" style="--i:${Math.min(i, 12)}">
    <div class="media" data-emoji="${c.emoji}">
      <img src="${photo(p.img, 480)}" alt="${esc(p.name)}" loading="lazy" decoding="async"
        onload="this.classList.add('is-loaded')" onerror="this.parentNode.classList.add('is-fallback')">
      <span class="badge">${esc(c.name)}</span>
    </div>
    <div class="card__body">
      <p class="card__merchant">${esc(m.name)}</p>
      <h3 class="card__name"><button type="button" class="card__link" data-view="${p.id}">${esc(p.name)}</button></h3>
      <p class="card__unit">${esc(p.unit)}</p>
      <div class="card__foot">
        <p class="price"><span>S/</span>${p.price.toFixed(2)}</p>
        <button type="button" class="btn-order" data-order="${p.id}" aria-label="Pedir ${esc(p.name)} por WhatsApp">${icon('wa')}<span>Pedir</span></button>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const list = filteredProducts();
  $('#productGrid').innerHTML = list.map(cardHTML).join('');
  $('#emptyState').hidden = list.length > 0;
  $('#emptyTitle').textContent = state.q ? `No encontramos “${state.q.trim()}”` : 'Sin productos en este filtro';

  const n = list.length;
  const what = `${n} ${n === 1 ? 'producto' : 'productos'}`;
  $('#resultsCount').innerHTML = state.q.trim()
    ? `<strong>${what}</strong> para “${esc(state.q.trim())}”`
    : `Mostrando <strong>${what}</strong>`;

  const m = state.merchant && merchantById[state.merchant];
  $('#activeFilters').innerHTML = m
    ? `<span class="active-filter">${icon('store')} ${esc(m.name)}<button type="button" data-clear-merchant aria-label="Quitar filtro de comercio">${icon('x')}</button></span>`
    : '';
  renderChips();
}

/* Búsqueda: filtra en vivo y registra la consulta cuando el usuario deja de escribir */
let searchTimer = null;
let lastLoggedQuery = '';
function logSearch() {
  const q = norm(state.q);
  if (q.length < 2 || q === lastLoggedQuery) return;
  lastLoggedQuery = q;
  Store.track('search', { q, results: filteredProducts().length });
}

function resetFilters() {
  state.q = ''; state.cat = 'all'; state.merchant = null; state.sort = 'relevance';
  $('#searchInput').value = '';
  $('#searchClear').hidden = true;
  $('#sortSelect').value = 'relevance';
  renderCatalog();
}

/* ---------------------------------------------------------
   7. WHATSAPP
   --------------------------------------------------------- */
function phoneFor(merchant) {
  return Store.settings.testPhone || (merchant ? merchant.phone : CONFIG.adminPhone);
}

function openWhatsApp(phone, text) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  const win = window.open(url, '_blank');
  if (win) win.opener = null; else window.location.href = url;
}

function orderProduct(pid, qty = 1, source = 'card') {
  const p = productById[pid];
  const m = merchantById[p.m];
  const total = p.price * qty;
  const text = [
    `Hola, ${m.name} 👋`,
    'Te escribo desde PascoMarket (demo). Me interesa:',
    `• Producto: ${p.name}`,
    `• Presentación: ${p.unit}`,
    `• Cantidad: ${qty}`,
    `• Precio: ${money(p.price)} c/u${qty > 1 ? ` (total referencial ${money(total)})` : ''}`,
    '¿Está disponible? ¿Cómo coordinamos la entrega?',
  ].join('\n');

  Store.track('order', { pid, mid: m.id, qty, source, kind: 'product' });
  openWhatsApp(phoneFor(m), text);
  toast(`Abriendo WhatsApp de ${m.name}…`, 'wa');
  if (source === 'detail') closeDialog($('#productDialog'));
  maybeAskSurvey();
}

function contactMerchant(mid) {
  const m = merchantById[mid];
  const text = `Hola, ${m.name} 👋\nTe encontré en PascoMarket (demo). Quisiera consultar por sus productos disponibles.`;
  Store.track('order', { mid, qty: 0, source: 'merchant', kind: 'contact' });
  openWhatsApp(phoneFor(m), text);
  toast(`Abriendo WhatsApp de ${m.name}…`, 'wa');
  maybeAskSurvey();
}

function joinPilot() {
  const text = 'Hola 👋 Tengo un negocio en Cerro de Pasco y me interesa participar en el piloto de PascoMarket.\nMi negocio es: ';
  Store.track('join');
  openWhatsApp(phoneFor(null), text);
  toast('Abriendo WhatsApp del equipo PascoMarket…', 'wa');
}

/* ---------------------------------------------------------
   8. DIÁLOGOS
   --------------------------------------------------------- */
function openDialog(dlg) {
  if (dlg.open) return;
  document.documentElement.classList.add('is-locked');
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  dlg.scrollTop = 0;
}

function closeDialog(dlg) {
  if (!dlg.open || dlg.classList.contains('is-closing')) return;
  const done = () => {
    dlg.classList.remove('is-closing');
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    if (!$$('dialog[open]').length) document.documentElement.classList.remove('is-locked');
  };
  if (reduceMotion()) return done();
  dlg.classList.add('is-closing');
  let finished = false;
  const finish = () => { if (!finished) { finished = true; done(); } };
  dlg.addEventListener('animationend', finish, { once: true });
  setTimeout(finish, 350);
}

function openProduct(pid) {
  const p = productById[pid];
  if (!p) return;
  const m = merchantById[p.m];
  const c = categoryById[p.cat];
  state.detail = { pid, qty: 1 };

  $('#productDetail').innerHTML = `
    <div class="detail">
      <div class="detail__media">${mediaHTML(p, 900, 760)}</div>
      <div class="detail__body">
        <div class="detail__tags">
          <span class="pill">${c.emoji} ${esc(c.name)}</span>
          <span class="pill pill--demo">Dato demo</span>
        </div>
        <h2 class="detail__title" id="detailTitle">${esc(p.name)}</h2>
        <p class="detail__desc">${esc(p.desc)}</p>
        <div class="detail__merchant">
          <span class="avatar avatar--sm" style="${avatarStyle(m)}">${m.initials}</span>
          <div>
            <strong>${esc(m.name)}</strong>
            <span class="meta-line">${icon('pin')}${esc(m.district)}</span>
          </div>
          <button type="button" class="btn btn--soft" data-merchant-products="${m.id}">Ver tienda</button>
        </div>
        <div class="detail__buy">
          <div>
            <p class="detail__price"><span>S/</span>${p.price.toFixed(2)}</p>
            <p class="detail__unit">${esc(p.unit)}</p>
          </div>
          <div class="qty" role="group" aria-label="Cantidad">
            <button type="button" data-qty="-1" aria-label="Quitar uno">${icon('minus')}</button>
            <output id="qtyValue" aria-live="polite">1</output>
            <button type="button" data-qty="1" aria-label="Agregar uno">${icon('plus')}</button>
          </div>
        </div>
        <p class="detail__total">Total referencial: <b id="qtyTotal">${money(p.price)}</b></p>
        <button type="button" class="btn btn--primary btn--block btn--lg" data-order-detail>${icon('wa')}Solicitar por WhatsApp</button>
        <p class="note">${icon('info')}<span>Se abrirá WhatsApp con un mensaje listo para ${esc(m.name)}. Precio, pago y entrega se coordinan directamente con el comercio: PascoMarket no procesa pedidos ni pagos.</span></p>
      </div>
    </div>`;
  updateQty(0);
  openDialog($('#productDialog'));
  Store.track('view', { pid, mid: m.id });
}

function updateQty(delta) {
  if (!state.detail) return;
  const p = productById[state.detail.pid];
  state.detail.qty = Math.min(20, Math.max(1, state.detail.qty + delta));
  const out = $('#qtyValue');
  out.textContent = state.detail.qty;
  $('#qtyTotal').textContent = money(p.price * state.detail.qty);
  $('[data-qty="-1"]').disabled = state.detail.qty <= 1;
  $('[data-qty="1"]').disabled = state.detail.qty >= 20;
  if (delta) { out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump'); }
}

/* Encuesta de disposición de pago: una vez por sesión, tras el primer clic de pedido */
function maybeAskSurvey() {
  if (session('pm_survey')) return;
  session('pm_survey', 'asked');
  setTimeout(() => openDialog($('#surveyDialog')), 1300);
}

const SURVEY_LABELS = {
  yes3: 'Sí, hasta S/ 3', yes5: 'Sí, hasta S/ 5', no: 'No, prefiere recoger',
  yes: 'Sí pagaría', maybe: 'Tal vez', 'no-m': 'No pagaría',
};

/* ---------------------------------------------------------
   9. COMERCIOS
   --------------------------------------------------------- */
function renderMerchants() {
  $('#merchantGrid').innerHTML = MERCHANTS.map((m, i) => {
    const items = PRODUCTS.filter((p) => p.m === m.id);
    return `<article class="m-card" style="--i:${i}">
      <div class="m-card__head">
        <span class="avatar" style="${avatarStyle(m)}">${m.initials}</span>
        <div>
          <h2 class="m-card__name">${esc(m.name)}</h2>
          <p class="meta-line">${icon('pin')}${esc(m.district)} · ${items.length} productos</p>
        </div>
      </div>
      <p class="m-card__tagline">${esc(m.tagline)}</p>
      <div class="m-card__thumbs">
        ${items.slice(0, 3).map((p) => `
          <button type="button" class="thumb" data-view="${p.id}" aria-label="Ver ${esc(p.name)}">
            ${mediaHTML(p, 240)}
            <span class="thumb__price">${money(p.price)}</span>
          </button>`).join('')}
      </div>
      <div class="m-card__info">
        <span class="meta-line">${icon('clock')}${esc(m.hours)}</span>
        <span class="meta-line">${icon('truck')}${esc(m.delivery)}</span>
      </div>
      <div class="m-card__actions">
        <button type="button" class="btn btn--ghost" data-merchant-products="${m.id}">Ver productos</button>
        <button type="button" class="btn btn--primary" data-contact="${m.id}">${icon('wa')}WhatsApp</button>
      </div>
    </article>`;
  }).join('');
}

function showMerchantProducts(mid) {
  state.merchant = mid; state.cat = 'all'; state.q = '';
  $('#searchInput').value = '';
  $('#searchClear').hidden = true;
  closeDialog($('#productDialog'));
  if (state.route !== 'catalogo') { location.hash = 'catalogo'; route(); }
  renderCatalog();
  requestAnimationFrame(() => $('#results').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }));
}

/* ---------------------------------------------------------
   10. MÉTRICAS
   --------------------------------------------------------- */
function computeMetrics() {
  const events = Store.get().events;
  const visitSids = new Set();
  const querySids = new Set();
  const orderSids = new Set();
  const merchantsWithOrders = new Set();
  const productOrders = {};
  const searches = {};
  const misses = {};
  const survey = { consumer: { yes: 0, total: 0 }, merchant: { yes: 0, maybe: 0, no: 0, total: 0 } };
  const counts = { visits: 0, searches: 0, views: 0, orders: 0, joins: 0, surveys: 0 };

  for (const e of events) {
    switch (e.type) {
      case 'visit': visitSids.add(e.sid); counts.visits++; break;
      case 'search':
        counts.searches++; querySids.add(e.sid);
        searches[e.q] = (searches[e.q] || 0) + 1;
        if (e.results === 0) misses[e.q] = (misses[e.q] || 0) + 1;
        break;
      case 'view': counts.views++; querySids.add(e.sid); break;
      case 'order':
        counts.orders++; orderSids.add(e.sid);
        if (e.mid) merchantsWithOrders.add(e.mid);
        if (e.pid) productOrders[e.pid] = (productOrders[e.pid] || 0) + 1;
        break;
      case 'join': counts.joins++; break;
      case 'survey': {
        counts.surveys++;
        const s = survey[e.audience];
        if (!s) break;
        s.total++;
        if (e.audience === 'consumer' && e.answer !== 'no') s.yes++;
        if (e.audience === 'merchant') s[e.answer] = (s[e.answer] || 0) + 1;
        break;
      }
      default: break;
    }
  }

  const visits = visitSids.size;
  const inVisits = (set) => [...set].filter((sid) => visitSids.has(sid)).length;
  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null);
  const sessionsWithQuery = inVisits(querySids);
  const sessionsWithOrder = inVisits(orderSids);
  const wtpYes = survey.consumer.yes + survey.merchant.yes;
  const wtpTotal = survey.consumer.total + survey.merchant.total;

  return {
    events, counts, visits, sessionsWithQuery, sessionsWithOrder, merchantsWithOrders,
    productOrders, searches, misses, survey, wtpYes, wtpTotal,
    interest: pct(sessionsWithQuery, visits),
    conversion: pct(sessionsWithOrder, visits),
    activation: pct(merchantsWithOrders.size, MERCHANTS.length),
    wtp: pct(wtpYes, wtpTotal),
  };
}

function statusHTML(value, target) {
  if (value === null) return `<span class="status status--na">${icon('dash')}Sin datos</span>`;
  return value >= target
    ? `<span class="status status--ok">${icon('check')}En meta</span>`
    : `<span class="status status--low">${icon('down')}Bajo la meta</span>`;
}

function renderMetrics(animate = true) {
  const M = computeMetrics();
  const T = CONFIG.targets;
  $('#view-metricas').classList.toggle('is-static', !animate);
  const kpis = [
    { key: 'interest', label: 'Interés', value: M.interest,
      raw: `${M.sessionsWithQuery} de ${M.visits} visitas buscaron o consultaron un producto`,
      def: 'Sesiones con al menos una búsqueda o consulta de producto ÷ visitas.' },
    { key: 'conversion', label: 'Conversión', value: M.conversion,
      raw: `${M.sessionsWithOrder} de ${M.visits} visitas hicieron clic para pedir por WhatsApp`,
      def: 'Sesiones con al menos un clic en “Pedir” o “WhatsApp” ÷ visitas.' },
    { key: 'activation', label: 'Activación', value: M.activation,
      raw: `${M.merchantsWithOrders.size} de ${MERCHANTS.length} comercios recibieron al menos una solicitud`,
      def: 'Comercios con ≥ 1 clic de pedido ÷ comercios publicados en el catálogo.' },
    { key: 'wtp', label: 'Disposición de pago', value: M.wtp,
      raw: `${M.wtpYes} de ${M.wtpTotal} respuestas pagarían (consumidores ${M.survey.consumer.yes}/${M.survey.consumer.total} · comercios ${M.survey.merchant.yes}/${M.survey.merchant.total})`,
      def: 'Respuestas “sí pagaría” ÷ total de respuestas. Consumidores: costo de delivery. Comercios: suscripción mensual.' },
  ];

  $('#kpis').innerHTML = kpis.map((k, i) => `
    <article class="kpi" style="--i:${animate ? i : 0};${animate ? '' : 'animation:none'}">
      <div class="kpi__head">
        <h2 class="kpi__label">${k.label}</h2>
        ${statusHTML(k.value, T[k.key])}
      </div>
      <p class="kpi__value">${k.value === null ? '—' : `<span data-count="${k.value}">${k.value}</span><small>%</small>`}</p>
      <p class="kpi__raw">${k.raw}</p>
      <div class="meter" aria-hidden="true">
        <span class="meter__fill" style="width:${Math.min(100, k.value || 0)}%"></span>
        <span class="meter__target" style="left:${T[k.key]}%"></span>
      </div>
      <div class="meter__legend"><span>0%</span><span>Meta ${T[k.key]}%</span><span>100%</span></div>
      <p class="kpi__def">${k.def}</p>
    </article>`).join('');

  const counters = [
    ['Visitas', M.counts.visits],
    ['Búsquedas', M.counts.searches],
    ['Productos consultados', M.counts.views],
    ['Clics en pedir', M.counts.orders],
    ['Comercios interesados', M.counts.joins],
    ['Respuestas de encuesta', M.counts.surveys],
  ];
  $('#counters').innerHTML = counters.map(([label, v]) =>
    `<div class="counter"><span class="counter__value">${v}</span><span class="counter__label">${label}</span></div>`).join('');

  renderFunnel(M);
  renderWeek(M);
  renderTopProducts(M);
  renderSearches(M);
  renderLog(M);

  const ms = M.survey.merchant;
  $('#merchantTally').innerHTML = ms.total
    ? `Respuestas registradas: <b>${ms.total}</b> · Sí <b>${ms.yes}</b> · Tal vez <b>${ms.maybe}</b> · No <b>${ms.no}</b>`
    : 'Aún no hay respuestas de comerciantes.';

  renderPhoneStatus();

  if (animate) $$('#kpis [data-count]').forEach(countUp);
}

function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion() || target === 0) { el.textContent = target; return; }
  const start = performance.now();
  const dur = 800;
  const step = (now) => {
    const t = Math.min(1, Math.max(0, (now - start) / dur));
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderFunnel(M) {
  const rows = [
    ['Visitas', M.visits],
    ['Buscaron o consultaron', M.sessionsWithQuery],
    ['Hicieron clic en pedir', M.sessionsWithOrder],
  ];
  $('#funnel').innerHTML = M.visits === 0
    ? '<p class="panel-empty">Aún no hay visitas registradas.</p>'
    : rows.map(([label, v]) => {
      const w = Math.round((v / M.visits) * 100);
      return `<div class="f-row">
        <div class="f-row__top"><span class="f-row__label">${label}</span><span class="f-row__value"><b>${v}</b> · ${w}%</span></div>
        <div class="bar-track" tabindex="0" data-tip="${label}: ${v} sesiones (${w}%)">
          <span class="bar-fill" style="width:${w}%"></span>
        </div>
      </div>`;
    }).join('');
}

function renderWeek(M) {
  const days = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    days.push({ date: d, key: d.toDateString(), count: 0 });
  }
  const index = Object.fromEntries(days.map((d) => [d.key, d]));
  M.events.forEach((e) => {
    if (e.type !== 'visit') return;
    const d = index[new Date(e.ts).toDateString()];
    if (d) d.count++;
  });
  const max = Math.max(...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  $('#weekTotal').textContent = `Últimos 7 días · ${total} ${total === 1 ? 'visita' : 'visitas'}`;
  const peakIdx = max > 0 ? days.findIndex((d) => d.count === max) : -1;

  $('#weekChart').innerHTML = days.map((d, i) => {
    const h = max ? Math.round((d.count / max) * 100) : 0;
    const label = d.date.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '');
    const full = d.date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' });
    return `<div class="col${i === 6 ? ' is-today' : ''}" tabindex="0" data-tip="${full}: ${d.count} ${d.count === 1 ? 'visita' : 'visitas'}">
      <div class="col__plot">
        <span class="col__bar" style="height:${h}%"></span>
        ${i === peakIdx ? `<span class="col__peak" style="bottom:${h}%">${d.count}</span>` : ''}
      </div>
      <span class="col__label">${i === 6 ? 'Hoy' : label}</span>
    </div>`;
  }).join('');
}

function renderTopProducts(M) {
  const top = Object.entries(M.productOrders).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!top.length) {
    $('#topProducts').innerHTML = '<p class="panel-empty">Cuando alguien toque “Pedir”, el producto aparecerá aquí.</p>';
    return;
  }
  const max = top[0][1];
  $('#topProducts').innerHTML = top.map(([pid, n]) => {
    const p = productById[pid];
    if (!p) return '';
    const w = Math.round((n / max) * 100);
    return `<div class="rank-row">
      <span class="rank-row__name">${esc(p.name)}<small>${esc(merchantById[p.m].name)}</small></span>
      <span class="rank-row__count">${n}</span>
      <div class="bar-track" tabindex="0" data-tip="${esc(p.name)}: ${n} ${n === 1 ? 'clic' : 'clics'}"><span class="bar-fill" style="width:${w}%"></span></div>
    </div>`;
  }).join('');
}

function renderSearches(M) {
  const top = Object.entries(M.searches).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const miss = Object.entries(M.misses).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!top.length) {
    $('#topSearches').innerHTML = '<p class="panel-empty">Aún no hay búsquedas registradas.</p>';
    return;
  }
  const tags = (list, cls = '') => `<div class="tags">${list.map(([q, n]) => `<span class="tag ${cls}">${esc(q)} <b>×${n}</b></span>`).join('')}</div>`;
  $('#topSearches').innerHTML = `
    <p class="tags-label">Más buscado</p>${tags(top)}
    ${miss.length ? `<p class="tags-label">Sin resultados · oportunidad</p>${tags(miss, 'tag--miss')}` : ''}`;
}

function describeEvent(e) {
  const p = e.pid && productById[e.pid];
  const m = e.mid && merchantById[e.mid];
  switch (e.type) {
    case 'visit': return 'Nueva visita';
    case 'search': return `Buscó “${esc(e.q)}”${e.results === 0 ? ' · sin resultados' : ` · ${e.results} resultados`}`;
    case 'filter': return `Filtró por ${esc(categoryById[e.cat] ? categoryById[e.cat].name : 'Todos')}`;
    case 'view': return `Consultó <b>${esc(p ? p.name : 'producto')}</b>`;
    case 'order': return e.kind === 'contact'
      ? `Clic en WhatsApp de <b>${esc(m ? m.name : 'comercio')}</b>`
      : `Clic en pedir <b>${esc(p ? p.name : 'producto')}</b> × ${e.qty}`;
    case 'join': return 'Comercio interesado en sumarse';
    case 'survey': return `Encuesta ${e.audience === 'merchant' ? 'comerciante' : 'consumidor'}: ${esc(SURVEY_LABELS[e.audience === 'merchant' && e.answer === 'no' ? 'no-m' : e.answer] || e.answer)}`;
    default: return esc(e.type);
  }
}

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 45) return 'ahora';
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return new Date(ts).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

function renderLog(M) {
  const last = M.events.slice(-10).reverse();
  $('#eventLog').innerHTML = last.length
    ? last.map((e) => `<li><span class="log__dot log__dot--${e.type}"></span><span class="log__text">${describeEvent(e)}</span><time class="log__time" datetime="${new Date(e.ts).toISOString()}">${timeAgo(e.ts)}</time></li>`).join('')
    : '<li class="panel-empty">Sin actividad todavía.</li>';
}

function renderPhoneStatus() {
  const tp = Store.settings.testPhone;
  $('#testPhone').placeholder = 'Ej. 51987654321';
  if (document.activeElement !== $('#testPhone')) $('#testPhone').value = tp || '';
  $('#phoneStatus').innerHTML = tp
    ? `${icon('check')}<span>Todos los pedidos se enviarán a <b>+${esc(tp)}</b>.</span>`
    : `${icon('info')}<span>Usando los números ficticios de cada comercio (51 900 000 1xx). WhatsApp no podrá entregarlos.</span>`;
}

function exportData() {
  const d = Store.get();
  const M = computeMetrics();
  const payload = {
    exportedAt: new Date().toISOString(),
    note: 'PascoMarket MVP demostrativo · datos locales',
    indicators: { interest: M.interest, conversion: M.conversion, activation: M.activation, willingnessToPay: M.wtp, targets: CONFIG.targets },
    counts: M.counts,
    visitorId: d.visitorId,
    events: d.events,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pascomarket-metricas-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Archivo JSON descargado', 'download');
}

/* ---------------------------------------------------------
   11. TOAST Y TOOLTIP
   --------------------------------------------------------- */
let toastTimer = null;
function toast(msg, ic = 'check') {
  const el = $('#toast');
  el.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

function setupTooltip() {
  const tip = $('#tooltip');
  const show = (target) => {
    tip.textContent = target.dataset.tip;
    const r = target.getBoundingClientRect();
    const x = Math.min(window.innerWidth - 12, Math.max(12, r.left + r.width / 2));
    tip.style.left = `${x}px`;
    tip.style.top = `${r.top}px`;
    tip.classList.add('is-visible');
    const tr = tip.getBoundingClientRect();
    if (tr.left < 8) tip.style.left = `${x + (8 - tr.left)}px`;
    if (tr.right > window.innerWidth - 8) tip.style.left = `${x - (tr.right - window.innerWidth + 8)}px`;
  };
  const hide = () => tip.classList.remove('is-visible');
  const view = $('#view-metricas');
  view.addEventListener('pointerover', (e) => { const t = e.target.closest('[data-tip]'); if (t) show(t); });
  view.addEventListener('pointerout', (e) => { if (e.target.closest('[data-tip]')) hide(); });
  view.addEventListener('focusin', (e) => { const t = e.target.closest('[data-tip]'); if (t) show(t); });
  view.addEventListener('focusout', hide);
  window.addEventListener('scroll', hide, { passive: true });
}

/* ---------------------------------------------------------
   12. NAVEGACIÓN
   --------------------------------------------------------- */
const ROUTES = ['catalogo', 'comercios', 'metricas'];
function route() {
  const r = location.hash.slice(1);
  const next = ROUTES.includes(r) ? r : 'catalogo';
  const changed = next !== state.route;
  state.route = next;
  $$('.view').forEach((v) => { v.hidden = v.dataset.view !== next; });
  $$('[data-route]').forEach((a) => {
    if (a.dataset.route === next) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (next === 'metricas') renderMetrics(true);
  if (changed) window.scrollTo(0, 0);
  document.title = {
    catalogo: 'PascoMarket · Catálogo local de Cerro de Pasco (Demo)',
    comercios: 'Comercios · PascoMarket (Demo)',
    metricas: 'Métricas del MVP · PascoMarket (Demo)',
  }[next];
}

/* ---------------------------------------------------------
   13. EVENTOS
   --------------------------------------------------------- */
function bindEvents() {
  // Búsqueda
  const input = $('#searchInput');
  input.addEventListener('input', () => {
    state.q = input.value;
    $('#searchClear').hidden = !input.value;
    renderCatalog();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(logSearch, 1000);
  });
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(searchTimer);
    logSearch();
    input.blur();
    $('#results').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });
  $('#searchClear').addEventListener('click', () => {
    input.value = ''; state.q = '';
    $('#searchClear').hidden = true;
    renderCatalog();
    input.focus();
  });
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key === '/' && !typing && state.route === 'catalogo' && !$('dialog[open]')) {
      e.preventDefault();
      input.focus();
    }
  });

  // Filtros y orden
  $('#categoryChips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-cat]');
    if (!chip || chip.dataset.cat === state.cat) return;
    state.cat = chip.dataset.cat;
    Store.track('filter', { cat: state.cat });
    renderCatalog();
    const active = $(`#categoryChips [data-cat="${state.cat}"]`);
    const strip = $('#categoryChips');
    const offset = active.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollTo({ left: strip.scrollLeft + offset - (strip.clientWidth - active.offsetWidth) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
  });
  $('#sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; renderCatalog(); });
  $('#emptyReset').addEventListener('click', resetFilters);

  // Acciones delegadas (tarjetas, comercios, detalle)
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-order], [data-view], [data-contact], [data-merchant-products], [data-clear-merchant], [data-qty], [data-order-detail], [data-close]');
    if (!t) return;
    if (t.dataset.order) orderProduct(t.dataset.order, 1, 'card');
    else if (t.dataset.view) openProduct(t.dataset.view);
    else if (t.dataset.contact) contactMerchant(t.dataset.contact);
    else if (t.dataset.merchantProducts) showMerchantProducts(t.dataset.merchantProducts);
    else if (t.hasAttribute('data-clear-merchant')) { state.merchant = null; renderCatalog(); }
    else if (t.dataset.qty) updateQty(Number(t.dataset.qty));
    else if (t.hasAttribute('data-order-detail')) orderProduct(state.detail.pid, state.detail.qty, 'detail');
    else if (t.hasAttribute('data-close')) closeDialog(t.closest('dialog'));
  });

  // Cierre de diálogos: clic en el fondo o tecla Esc
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) closeDialog(dlg); });
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dlg); });
  });

  // Encuesta al consumidor
  $('#surveyDialog').addEventListener('click', (e) => {
    const opt = e.target.closest('[data-survey]');
    if (!opt) return;
    Store.track('survey', { audience: 'consumer', answer: opt.dataset.survey });
    closeDialog($('#surveyDialog'));
    toast('¡Gracias! Tu respuesta nos ayuda a mejorar');
  });
  $('#surveySkip').addEventListener('click', () => closeDialog($('#surveyDialog')));

  // Comercios: sumarse al piloto
  $('#joinBtn').addEventListener('click', joinPilot);

  // Métricas: encuesta a comerciantes
  $$('[data-msurvey]').forEach((b) => b.addEventListener('click', () => {
    Store.track('survey', { audience: 'merchant', answer: b.dataset.msurvey });
    toast(`Respuesta registrada: ${b.textContent.trim()}`);
  }));

  // Métricas: teléfono de prueba
  $('#phoneForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let digits = $('#testPhone').value.replace(/\D/g, '');
    if (/^9\d{8}$/.test(digits)) digits = `51${digits}`;   // celular peruano sin código de país
    if (!/^\d{10,15}$/.test(digits)) {
      toast('Ingresa un número válido, ej. 51987654321', 'info');
      $('#testPhone').focus();
      return;
    }
    Store.settings.testPhone = digits;
    Store.save();
    $('#testPhone').value = digits;
    renderPhoneStatus();
    toast(`Pedidos dirigidos a +${digits}`, 'phone');
  });
  $('#clearPhone').addEventListener('click', () => {
    Store.settings.testPhone = '';
    Store.save();
    $('#testPhone').value = '';
    renderPhoneStatus();
    toast('Usando teléfonos demo de cada comercio', 'info');
  });

  $('#exportBtn').addEventListener('click', exportData);
  $('#resetBtn').addEventListener('click', () => {
    if (!window.confirm('¿Reiniciar todas las métricas guardadas en este navegador? Esta acción no se puede deshacer.')) return;
    const phone = Store.settings.testPhone;
    Store.reset();
    Store.settings.testPhone = phone;   // conserva la configuración
    Store.save();
    session('pm_survey', '');
    Store.track('visit');               // la sesión actual cuenta como primera visita
    renderMetrics(true);
    toast('Métricas reiniciadas', 'trash');
  });

  // Navegación
  window.addEventListener('hashchange', route);
  const topbar = $('#topbar');
  const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------
   14. INICIO
   --------------------------------------------------------- */
function init() {
  $('#statMerchants').textContent = MERCHANTS.length;
  $('#statProducts').textContent = PRODUCTS.length;
  $('#statCategories').textContent = CATEGORIES.length;

  if (Store.isNewSession()) Store.track('visit');   // una visita por sesión del navegador

  renderCatalog();
  renderMerchants();
  bindEvents();
  setupTooltip();
  route();
}

document.addEventListener('DOMContentLoaded', init);
