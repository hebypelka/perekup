// Интерфейс: экраны, страницы, модалки, связь с Telegram.

const $ = s => document.querySelector(s);
const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const I = {
  rub: ico('<path d="M8 20V4h6a4 4 0 0 1 0 8H6M6 16h8"/>'),
  star: ico('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  sun: ico('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  ads: ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>'),
  garage: ico('<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-8h10v8M7 16h10"/>'),
  tag: ico('<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'),
  user: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  phone: ico('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  back: ico('<path d="M15 18l-6-6 6-6"/>'),
  x: ico('<path d="M18 6L6 18M6 6l12 12"/>'),
  check: ico('<path d="M20 6L9 17l-5-5"/>'),
  search: ico('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'),
  doc: ico('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>'),
  wrench: ico('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>'),
  engine: ico('<path d="M4 10h2V7h4V5h4v2h3l2 3h2v6h-2l-2 2H8l-2-2H4z"/><path d="M2 11v4"/>'),
  gear: ico('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
  susp: ico('<path d="M8 3h8M12 3v2M8 7l8 2-8 2 8 2-8 2 8 2M12 19v2M8 21h8"/>'),
  body: ico('<path d="M3 16v-3l2-5h14l2 5v3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 13h14"/>'),
  bolt: ico('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  seat: ico('<path d="M7 3h5l1 10h5l1 7H8z"/><path d="M8 20l-1 2M18 20l1 2"/>'),
  gauge: ico('<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>'),
  crash: ico('<path d="M2 18v-2l2-4h7l2 4v2z"/><path d="M14 9l2-2M17 12l3-1M15 5l1-3"/>'),
  people: ico('<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14a5 5 0 0 1 7 5"/>'),
  taxi: ico('<path d="M9 4h6v3H9z"/><path d="M3 17v-4l2-5h14l2 5v4z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>'),
  siren: ico('<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 21h14M12 3v2M4 8l1.5 1M20 8l-1.5 1"/>'),
  bank: ico('<path d="M3 21h18M5 21V10M19 21V10M9 21v-8M15 21v-8M2 10l10-6 10 6z"/>'),
  lock: ico('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  cash: ico('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>'),
  shine: ico('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  help: ico('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>'),
  plus: ico('<path d="M12 5v14M5 12h14"/>'),
  cal: ico('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  box: ico('<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
  eye: ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
};
const UI = { whLetter: 'A', adsMode: 'cars', lotPct: {}, tab: 'ads', f: { cls: '', brand: '', max: 0, sort: 'new' }, page: null, modal: null, offerPct: {}, sellPct: 100 };
const tgApp = window.Telegram && window.Telegram.WebApp;
const hasTg = !!(tgApp && tgApp.initData !== undefined && tgApp.platform && tgApp.platform !== 'unknown');

function hap(kind) {
  try {
    if (!hasTg || !tgApp.HapticFeedback) { if (navigator.vibrate && S && S.sound !== false) navigator.vibrate(kind === 'err' ? [30, 40, 30] : kind === 'ok' ? [20, 30, 40] : 12); return; }
    if (kind === 'ok' || kind === 'err' || kind === 'warn') tgApp.HapticFeedback.notificationOccurred(kind === 'ok' ? 'success' : kind === 'err' ? 'error' : 'warning');
    else tgApp.HapticFeedback.impactOccurred(kind || 'light');
  } catch (e) { }
}
function toast(t, err) {
  const el = $('#toast'); el.innerHTML = `<div class="${err ? 'err' : ''}">${t}</div>`;
  hap(err ? 'err' : 'light'); if (err) sfx('err');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.innerHTML = '', 2400);
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function personAva(name, lg) {
  let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const letter = String(name).replace(/^[^A-Za-zА-Яа-яЁё]+/, '')[0] || '?';
  return `<div class="avatar ${lg ? 'lg' : ''}" style="background:hsl(${h},38%,38%)">${esc(letter.toUpperCase())}</div>`;
}
const specLine = (c, md) => [md.body === 'moto' ? Math.round(c.kmShown / 1000) + ' тыс. км' : km(c.kmShown), md.engine + ' (' + md.hp + ' л.с.)', BODY_NAMES[md.body]].join(' · ');
function daysAgo(d) { const n = S.day - d; return n <= 0 ? 'сегодня' : n === 1 ? 'вчера' : n + ' ' + plural(n, 'день', 'дня', 'дней') + ' назад'; }

// ---------- общий рендер ----------
function render() {
  renderTop(); renderTabs();
  const v = $('#view');
  v.innerHTML = UI.tab === 'ads' ? viewAds() : UI.tab === 'garage' ? viewGarage() : UI.tab === 'sale' ? viewSale() : UI.tab === 'wh' ? viewWarehouse() : viewMe();
  if (UI.page) renderPage();
  if (UI.modal) renderModal();
  syncBack();
}
function commit() { checkAch(); save(); render(); }

function renderTop() {
  $('#top').innerHTML = `
    <button class="me-mini" data-a="tab" data-k="me" aria-label="Профиль">${avatarSvg(S.me, true)}</button>
    <div class="pill money"><div class="ic">${I.rub}</div><span>${Math.abs(S.money) >= 1e6 ? (S.money < 0 ? '−' : '') + (Math.abs(S.money) / 1e6).toFixed(2).replace('.', ',') + ' млн ₽' : money(S.money)}</span></div>
    <div class="pill rep"><div class="ic">${I.star}</div><span>${S.rep}</span></div>
    <button class="daybtn" data-a="day">${I.sun}<span>День ${S.day}</span>›</button>`;
}
function renderTabs() {
  const offers = S.garage.reduce((n, g) => n + (g.sale ? g.offers.filter(o => !o.caught).length : 0), 0);
  const t = (k, n, ic, badge) => `<button class="tab ${UI.tab === k ? 'on' : ''}" data-a="tab" data-k="${k}">${ic}<span>${n}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</button>`;
  $('#tabs').innerHTML = t('ads', 'Объявления', I.ads) + t('garage', 'Гараж', I.garage, S.garage.length ? S.garage.length + '/' + S.slots : '') +
    t('sale', 'Продажа', I.tag, offers) + t('wh', 'Работа', I.box, S.wh.last !== S.day && whDay(S.day).coef > 1 ? '🔥' : '') + t('me', 'Профиль', I.user, tasksReady());
}

// ---------- объявления ----------
function filtered() {
  const f = UI.f;
  let a = S.listings.filter(l => !l.gone || l.deal);
  if (f.cls) a = a.filter(l => MODELS[l.car.m].cls === f.cls);
  if (f.brand) a = a.filter(l => MODELS[l.car.m].brand === f.brand);
  if (f.max) a = a.filter(l => l.ask <= f.max);
  const by = { new: (x, y) => y.posted - x.posted || y.id - x.id, cheap: (x, y) => x.ask - y.ask, rich: (x, y) => y.ask - x.ask,
    year: (x, y) => y.car.year - x.car.year, km: (x, y) => x.car.kmShown - y.car.kmShown }[f.sort];
  return a.sort(by);
}
function viewAds() {
  const f = UI.f, list = filtered();
  const opt = (v, n, cur) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${n}</option>`;
  const sb = (k, n, cnt) => `<button class="${(UI.adsMode || 'cars') === k ? 'on' : ''}" data-a="adsmode" data-k="${k}">${n}${cnt ? ` <span class="cnt">${cnt}</span>` : ''}</button>`;
  const seg = `<div class="seg three">${sb('cars', 'Машины')}${sb('auc', 'Аукцион', S.auc.filter(x => !x.done).length)}${sb('lots', 'Гаражи', S.lots.filter(x => !x.gone).length)}</div>`;
  if (UI.adsMode === 'lots') return `<div class="screen-title h">Объявления</div>${seg}${viewLots()}`;
  if (UI.adsMode === 'auc') return `<div class="screen-title h">Объявления</div>${seg}${viewAuction()}`;
  const ev = curEvent();
  return `
  <div class="screen-title h">Объявления</div>${ev ? `<div class="evbanner"><b>📈 ${esc(ev.n)}</b> · ещё ${S.event.until - S.day + 1} дн.<span>${esc(ev.t)}</span></div>` : ''}${seg}
  <div class="filters">
    <div class="sel"><select data-f="cls">${opt('', 'Все классы', f.cls)}${Object.entries(CLASSES).map(([k, n]) => opt(k, n, f.cls)).join('')}</select></div>
    <div class="sel"><select data-f="brand">${opt('', 'Все марки', f.brand)}${BRANDS.map(b => opt(b, b, f.brand)).join('')}</select></div>
    <div class="sel"><select data-f="max">${[[0, 'Любая цена'], [200000, 'до 200 тыс.'], [500000, 'до 500 тыс.'], [1000000, 'до 1 млн'], [2000000, 'до 2 млн'], [5000000, 'до 5 млн'], [10000000, 'до 10 млн']].map(([v, n]) => opt(v, n, f.max)).join('')}</select></div>
    <div class="sel"><select data-f="sort">${[['new', 'Сначала новые'], ['cheap', 'Дешевле'], ['rich', 'Дороже'], ['year', 'Год: новее'], ['km', 'Пробег: меньше']].map(([v, n]) => opt(v, n, f.sort)).join('')}</select></div>
  </div>
  <div class="found">Найдено <b>${list.length}</b> ${plural(list.length, 'объявление', 'объявления', 'объявлений')}</div>
  ${list.length ? list.map(adCard).join('') : `<div class="empty"><div class="big">🔍</div>Ничего не нашлось. Поменяй фильтры или жми «День ›» — завтра будут новые.</div>`}`;
}
function adCard(l) {
  const c = l.car, md = MODELS[c.m];
  const est = flipEstimate(c), profit = Math.round((est.sell - est.repair - (l.deal || l.ask)) / 1000) * 1000;
  const tags = [];
  if (l.urgent) tags.push('<span class="tag hot">Срочно</span>');
  if (l.deal) tags.push('<span class="tag ok">Договорились</span>');
  if (c.tune) tags.push('<span class="tag tune">Тюнинг</span>');
  const price = l.deal || l.ask, mr = marketRef(c), diff = Math.round((1 - price / mr) * 100);
  return `<div class="card ${l.gone && !l.deal ? 'dim' : ''}" data-a="ad" data-id="${l.id}">
    <div class="${sceneClass(c)}"><div class="tags">${tags.join('')}</div>${carPic(c)}</div>
    <div class="info">
      <div class="price">${money(price)}${price < l.ask0 ? `<s>${money(l.ask0)}</s>` : ''}</div>
      <div class="ttl">${esc(carName(c))}, ${c.year}</div>
      <div class="meta">${specLine(c, md)}</div>
      <div class="meta">${esc(l.city)} · ${daysAgo(l.posted)}</div>
      <div class="mkt">Рыночная цена ~ ${money(mr)}${Math.abs(diff) >= 3 ? ` · <b class="${diff > 0 ? 'lo' : 'hi'}">${diff > 0 ? 'ниже' : 'выше'} рынка на ${Math.abs(diff)}%</b>` : ' · <b>по рынку</b>'}</div>
      <div class="act"><div class="chip ${profit > 0 ? 'green' : 'red'}">Навар ~ ${profit > 0 ? '+' : ''}${money(profit)}</div>
        <button class="btn small" data-a="call" data-id="${l.id}">${I.phone}Позвонить</button></div>
    </div>
  </div>`;
}

// ---------- страница объявления ----------
function pageListing(l) {
  const c = l.car, md = MODELS[c.m], k = c.k;
  const est = flipEstimate(c), price = l.deal || l.ask, profit = Math.round((est.sell - est.repair - price) / 1000) * 1000;
  const st = SELLERS[l.seller];
  const kmLine = k.auto && c.km - c.kmShown > 15000 ? `<dd class="bad">${km(c.kmShown)} → по автотеке ${km(c.km)}</dd>` : `<dd>${km(c.kmShown)}</dd>`;
  const own = k.auto ? `<dd class="${c.owners > c.ownersSaid ? 'bad' : ''}">${c.owners}${c.owners > c.ownersSaid ? ' (в объявлении ' + c.ownersSaid + ')' : ''}</dd>` : `<dd>${c.ownersSaid} (со слов продавца)</dd>`;
  const acc = k.auto ? `<dd class="${c.acc ? 'bad' : 'good'}">${c.acc ? c.acc + ' по автотеке' : 'не найдены'}</dd>` : `<dd>${c.accSaid ? 'были' : 'нет (со слов продавца)'}</dd>`;
  const iss = foundIssues(l);
  const insp = inspectPrice(l);
  return `
  <button class="back" data-a="close">${I.back}Объявления</button>
  <div class="${sceneClass(c)}"><div class="tags">${l.urgent ? '<span class="tag hot">Срочно</span>' : ''}<span class="tag">${I.eye}${40 + (l.id * 37) % 800 + (S.day - l.posted) * 23}</span></div>${carPic(c)}</div>
  <div class="big-title">${esc(carName(c))}, ${c.year}</div>
  <div class="row" style="justify-content:space-between">
    <div class="price-big">${money(price)}</div>
    ${price < l.ask0 ? `<div class="sub" style="text-decoration:line-through">${money(l.ask0)}</div>` : ''}
  </div>
  <div class="sub">${esc(l.city)} · ${daysAgo(l.posted)} · продаёт ${esc(l.sname)}</div>
  <div class="panel flat">
    <dl class="specs">
      <dt>Пробег</dt>${kmLine}
      <dt>Двигатель</dt><dd>${md.engine}, ${md.hp} л.с.</dd>
      <dt>Коробка</dt><dd>${md.box}</dd>
      <dt>Привод</dt><dd>${md.drive}</dd>
      <dt>Кузов</dt><dd>${BODY_NAMES[md.body]}${PHOTOS[c.m] ? '' : ', ' + COLORS[c.color].n}</dd>
      <dt>Владельцев</dt>${own}
      <dt>ДТП</dt>${acc}
      ${k.auto && c.taxi ? '<dt>Такси</dt><dd class="bad">работала в такси</dd>' : ''}
    </dl>
  </div>
  <div class="desc">${esc(l.text)}</div>

  <div class="panel" style="margin-top:28px"><div class="title-plate h">Проверки</div>
    <div class="checks">
      ${checkBtn(k.auto, 'auto', 'Автотека', PRICES.autoteka, I.doc, l.id)}
      ${checkBtn(k.probiv, 'probiv', 'Пробить по базам', PRICES.probiv, I.search, l.id)}
      ${checkBtn(k.insp, 'insp', 'Подборщик', insp, I.wrench, l.id)}
    </div>
    <div class="note">Автотека — пробег, ДТП, владельцы. Базы — залог, розыск, запреты. Подборщик — состояние узлов.</div>
  </div>

  <div class="panel" style="margin-top:28px"><div class="title-plate h">Найденные проблемы</div>
    ${iss.length ? `<div class="issues">${iss.map(x => `<div class="issue"><i>${I[x.icon] || I.wrench}</i>${x.n}</div>`).join('')}</div>`
      : `<div class="empty-issues">${k.auto || k.probiv || k.insp ? 'Пока ничего не нашёл. Чисто? Или плохо искал...' : 'Сначала проверь машину — иначе купишь кота в мешке.'}</div>`}
  </div>

  <div class="grid3" style="margin:14px 0">
    <div class="plate beige"><small>Цена</small><b>${money(price)}</b></div>
    <div class="plate blue"><small>Рыночная</small><b>${money(marketRef(c))}</b></div>
    <div class="plate ${profit > 0 ? 'green' : 'red'}"><small>Доход ~</small><b>${profit > 0 ? '+' : ''}${money(profit)}</b></div>
  </div>
  ${l.gone && !l.deal ? `<button class="btn block gray" disabled>Продавец не берёт трубку</button>`
    : l.deal ? `<button class="btn block green" data-a="buy" data-id="${l.id}">${I.cash}Встретиться и купить</button>`
      : `<button class="btn block" data-a="call" data-id="${l.id}">${I.phone}Позвонить продавцу</button>`}
  <div class="note">Возможный доход — если починить всё, что известно, и продать по рынку. Чем больше проверок, тем точнее.</div>`;
}
function checkBtn(done, what, name, cost, icon, id) {
  return done ? `<button class="btn small green" data-a="report" data-w="${what}" data-id="${id}">${I.check}${name}</button>`
    : `<button class="btn small" data-a="check" data-w="${what}" data-id="${id}">${icon}${name}<span class="cost">${money(cost)}</span></button>`;
}
function doCheck(l, what) {
  const cost = what === 'insp' ? inspectPrice(l) : PRICES[what === 'auto' ? 'autoteka' : 'probiv'];
  if (!canPay(cost)) return toast('Не хватает денег', true);
  pay(cost); l.car.k[what] = true; hap('medium'); track('check');
  commit();
  openReport(l.car, what);
}

// ---------- отчёты ----------
function autotekaData(c) {
  if (c.rep) return c.rep;
  const a = Math.max(1, YEAR_NOW - c.year), n = clamp(Math.round(a / 1.6), 2, 7);
  const src = ['ТО у дилера', 'Техосмотр', 'Объявление на сайте', 'Полис ОСАГО', 'Ремонт в сервисе', 'Диагностика', 'Смена владельца'];
  const rec = []; let prev = 0;
  for (let i = 1; i <= n; i++) {
    const y = Math.min(YEAR_NOW, c.year + Math.round(a * i / n));
    const k = Math.max(prev + 500, Math.round(c.km * (i / n) * rnd(0.86, 1) / 100) * 100);
    rec.push({ y, km: i === n ? Math.min(k, c.km) : Math.min(k, c.km), s: pick(src) }); prev = k;
  }
  const dmg = ['Столкновение: передний бампер, капот', 'Наезд на препятствие: левое крыло', 'Боковой удар: передняя и задняя двери',
    'Парковка: задний бампер', 'Столкновение: фара, крыло, лонжерон', 'Опрокидывание: крыша, стойки'];
  const accs = []; for (let i = 0; i < c.acc; i++) accs.push({ y: ri(c.year, YEAR_NOW), t: pick(dmg) });
  c.rep = { rec, accs: accs.sort((x, y) => x.y - y.y) };
  return c.rep;
}
function openReport(c, what) { UI.modal = { type: 'report', c, what }; hap('light'); render(); }
function modalReport(m) {
  const c = m.c, md = MODELS[c.m];
  let body = '';
  if (m.what === 'auto') {
    const r = autotekaData(c);
    body = `<div class="title-plate h">Автотека</div><div class="report">
      <div style="text-align:center;font-weight:800">${esc(carName(c))}, ${c.year}</div>
      <h4>Пробег</h4>${r.rec.map(x => `<div class="rec ${x.km > c.kmShown + 5000 ? 'bad' : ''}"><span>${x.y} · ${x.s}</span><b>${km(x.km)}</b></div>`).join('')}
      ${c.km - c.kmShown > 15000 ? `<div class="warn">⚠️ Пробег скручен: заявлено ${km(c.kmShown)}, а в истории уже было ${km(c.km)}.</div>` : `<div class="rec good"><span>Скрутка</span><b>не обнаружена</b></div>`}
      <h4>Владельцы</h4><div class="rec ${c.owners > 3 ? 'bad' : ''}"><span>Записей в ПТС</span><b>${c.owners}</b></div>
      ${c.taxi ? `<div class="rec bad"><span>Такси / каршеринг</span><b>да, ${ri(2, 5)} года</b></div>` : `<div class="rec good"><span>Такси / каршеринг</span><b>нет</b></div>`}
      <h4>ДТП</h4>${r.accs.length ? r.accs.map(x => `<div class="rec bad"><span>${x.y}</span><b>${x.t}</b></div>`).join('') : `<div class="rec good"><span>Расчёты по ДТП</span><b>не найдены</b></div>`}
    </div>`;
  } else if (m.what === 'probiv') {
    const L = c.legal, row = (n, bad, t) => `<div class="rec ${bad ? 'bad' : 'good'}"><span>${n}</span><b>${t}</b></div>`;
    body = `<div class="title-plate h">Проверка по базам</div><div class="report">
      <div style="text-align:center;font-weight:800">${esc(carName(c))}, ${c.year}</div>
      <h4>Результаты</h4>
      ${row('Розыск МВД', L.wanted, L.wanted ? '🚨 В УГОНЕ' : 'не числится')}
      ${row('Залог (реестр ФНП)', L.zalog, L.zalog ? 'залог ' + money(L.zalog) : 'нет')}
      ${row('Ограничения ГИБДД', L.limit, L.limit ? 'запрет на регистрацию' : 'нет')}
      ${row('Штрафы', L.limit, L.limit ? money(L.limit) : 'нет')}
      ${L.wanted ? '<div class="warn">Если купишь — машину изымут, деньги не вернут.</div>' : ''}
    </div>`;
  } else {
    body = `<div class="title-plate h">Осмотр подборщиком</div><div class="report">
      <div style="text-align:center;font-weight:800">${esc(carName(c))}, ${c.year}</div><h4>Состояние узлов</h4>
      ${PARTS.map(p => `<div class="rec ${c.wear[p.k] > 50 ? 'bad' : c.wear[p.k] < 20 ? 'good' : ''}"><span>${p.n}</span><b>износ ${c.wear[p.k]}%</b></div>`).join('')}
      <div class="note">Толщиномер: ${c.acc ? 'есть перекрас, ' + (c.acc > 1 ? 'несколько элементов' : 'один элемент') : 'всё в родной краске'}.</div>
    </div>`;
  }
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button>${body}
    <button class="btn block" style="margin-top:12px" data-a="mclose">Понятно</button></div>`;
}

// ---------- звонок и торг ----------
function openCall(l) { callSeller(l); UI.modal = { type: 'call', l }; if (!UI.offerPct[l.id]) UI.offerPct[l.id] = 85; hap('medium'); save(); render(); }
function modalCall(m) {
  const l = m.l, st = SELLERS[l.seller], c = l.car, md = MODELS[c.m];
  const disc = Math.round((1 - l.ask / l.ask0) * 100);
  const est = flipEstimate(c), price = l.deal || l.ask, profit = Math.round((est.sell - est.repair - price) / 1000) * 1000;
  const iss = foundIssues(l);
  const pct = UI.offerPct[l.id], offer = roundPrice(l.ask * pct / 100);
  let actions;
  if (l.gone && !l.deal) actions = `<button class="btn block gray" data-a="mclose">Положить трубку</button>`;
  else if (l.deal) actions = `<button class="btn block green" data-a="buy" data-id="${l.id}">${I.cash}Встретиться и купить за ${money(l.deal)}</button>`;
  else actions = `
    <div class="offer-box">
      <div class="sub" style="text-align:center">Ваше предложение</div>
      <div class="val" id="offv">${money(offer)}</div>
      <input type="range" min="50" max="100" value="${pct}" data-a="offpct" data-id="${l.id}">
      <div class="row">
        <button class="btn green" data-a="offer" data-id="${l.id}">${I.check}Предложить</button>
        <button class="btn dark" data-a="cash" data-id="${l.id}" ${l.cash ? 'disabled' : ''}>${I.cash}Наличка сразу</button>
      </div>
      <div class="note" style="text-align:center">Терпение продавца: <span class="hearts">${'<b style="color:var(--y)">●</b>'.repeat(Math.max(0, l.patience))}${'<b style="color:#3a4b5e">●</b>'.repeat(Math.max(0, st.patience - l.patience))}</span></div>
    </div>`;
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button>
    <div class="callhead">${personAva(l.sname, true)}<div><b>${esc(l.sname)}</b><span class="sub">${esc(carName(c))}, ${c.year} · звонок</span></div></div>
    <div class="chat" id="chat">${l.chat.map(x => `<div class="bub ${x.w}">${esc(x.t)}</div>`).join('')}</div>
    <div class="grid2" style="margin:12px 0">
      <div class="plate blue"><small>Скидка ${disc}% · рынок</small><b>${money(marketRef(c))}</b></div>
      <div class="plate ${profit > 0 ? 'green' : 'red'}"><small>Возможный доход</small><b>${profit > 0 ? '+' : ''}${money(profit)}</b></div>
    </div>
    <div class="panel flat" style="margin:8px 0 12px;padding:10px">
      <div class="h" style="font-size:13px;margin-bottom:8px">Найденные проблемы</div>
      ${iss.length ? `<div class="issues">${iss.map(x => `<button class="issue ${l.pointed.includes(x.id) ? 'used' : ''}" data-a="point" data-id="${l.id}" data-k="${x.id}"><i>${I[x.icon] || I.wrench}</i>${x.n}</button>`).join('')}</div>
        <div class="note">Жми на проблему — предъяви её продавцу и выбей скидку.</div>`
      : `<div class="empty-issues">Нечего предъявить. Проверь машину: автотека, базы, подборщик.</div>`}
    </div>
    ${actions}
    <div class="sub" style="text-align:center;margin-top:8px">Цена сейчас: <b>${money(price)}</b></div>
  </div>`;
}

function doBuy(l) {
  const err = buyListing(l);
  if (err) return toast(err, true);
  hap('ok'); sfx('cash'); UI.modal = null; UI.page = null; UI.tab = 'garage';
  toast('Машина в гараже!');
  commit();
}

// ---------- гараж ----------
function viewGarage() {
  const sp = slotPrice();
  return `
  <div class="screen-title h">Ваш гараж</div>
  <div class="row" style="justify-content:space-between;margin:6px 0">
    <div class="sub">Мест занято: <b style="color:#fff">${S.garage.length} из ${S.slots}</b> · аренда ${money(700 * S.slots)}/день</div>
    ${S.slots < 8 ? `<button class="btn small dark" data-a="slot">${I.plus}Место <span class="cost">${money(sp)}</span></button>` : ''}
  </div>
  ${garageBanner()}
  ${S.garage.length ? S.garage.map(garageCard).join('') : `<div class="empty"><div class="big">🅿️</div>Гараж пустой. Иди в объявления, найди тачку, проверь и выбей цену.<br><br><button class="btn" data-a="tab" data-k="ads">${I.ads}К объявлениям</button></div>`}
  <div class="panel"><div class="sec-title">Улучшения гаража</div>${UPGRADES.map(upRow).join('')}</div>`;
}
function garageBanner() {
  const room = up('room'), names = ['Голый бетон', 'Покрашенные стены', 'Плитка и свет', 'Лофт с диваном'];
  const have = UPGRADES.filter(u => up(u.k) && u.k !== 'room').map(u => u.lv ? u.lv[up(u.k) - 1] : u.n);
  return `<div class="gbanner room${room} ${up('sign') ? 'sign' : ''} ${up('lift') ? 'lift' : ''}">
    ${up('sign') || up('salon') ? `<div class="gsign">${up('salon') ? 'АВТОСАЛОН ' : ''}PEREKUP</div>` : ''}
    <div class="ginfo"><b>${names[room]}</b><span>${have.length ? have.join(' · ') : 'Пока ничего нет, кроме ведра и тряпки'}</span></div></div>`;
}
function upRow(u) {
  const lv = up(u.k), p = upPrice(u), max = u.price.length;
  const name = u.lv ? (lv ? u.lv[lv - 1] : u.n) : u.n;
  const next = u.lv && lv < max ? u.lv[lv] : null;
  return `<div class="uprow"><div style="flex:1;min-width:0"><b>${esc(next && lv ? next : name)}</b>${max > 1 ? `<span class="lvl">${lv}/${max}</span>` : ''}<div class="sub">${esc(u.t)}</div></div>
    ${p == null ? '<span class="chip green">Есть</span>' : u.minLv && level().i < u.minLv ? `<span class="chip">🔒 ${LEVELS[u.minLv][1]}</span>` : `<button class="btn small" data-a="upgrade" data-k="${u.k}">${money(p)}</button>`}</div>`;
}

// ---------- гаражи с сюрпризом ----------
// ---------- аукцион ----------
function viewAuction() {
  return `<div class="sub" style="margin:10px 0 4px">Машины лизинговых компаний, банков и страховых. Отчёт открытый — всё видно сразу. Вопрос только в том, кто даст больше. Торги сегодня, завтра новые лоты. Комиссия площадки ${AUC_FEE * 100}%.</div>
  ${S.auc.map(aucCard).join('')}`;
}
function aucCard(a) {
  const c = a.car, md = MODELS[c.m], T = AUC_TYPES[a.type], d = a.done;
  const res = d ? (d.who === 'p' ? 'Ушла тебе' : d.who ? 'Ушла: ' + d.who : 'Никто не поднял') : '👥 Участников: ' + a.bots.length;
  return `<div class="card ${d ? 'dim' : ''}" data-a="auclot" data-id="${a.id}">
    <div class="${sceneClass(c)}"><div class="tags"><span class="tag">🔨 ${esc(T.n)}</span>${d ? `<span class="tag ${d.who === 'p' ? 'ok' : 'hot'}">${d.who ? 'Продано' : 'Не продано'}</span>` : ''}</div>${carPic(c)}</div>
    <div class="info">
      <div class="price">${d && d.who ? money(d.price) : 'Старт ' + money(a.start)}</div>
      <div class="ttl">${esc(carName(c))}, ${c.year}</div>
      <div class="meta">${specLine(c, md)}</div>
      <div class="mkt">Рыночная цена ~ ${money(marketRef(c))}</div>
      <div class="act"><div class="chip">${esc(res)}</div>${d ? '' : `<button class="btn small" data-a="auclot" data-id="${a.id}">Смотреть лот</button>`}</div>
    </div></div>`;
}
function modalAucLot(m) {
  const a = S.auc.find(x => x.id === m.id);
  if (!a) return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="sec-title">Лот снят</div></div>`;
  const c = a.car, md = MODELS[c.m], T = AUC_TYPES[a.type], est = flipEstimate(c);
  const be = roundPrice(Math.max(0, est.sell - est.repair) / (1 + AUC_FEE));
  const full = S.garage.length >= S.slots;
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">${esc(T.n)}</div>
    <div class="${sceneClass(c)}">${carPic(c)}</div>
    <div class="big-title">${esc(carName(c))}, ${c.year}</div><div class="sub">${specLine(c, md)}</div>
    <div class="desc">${esc(T.t)}</div>
    <div class="report" style="margin-top:10px">
      <h4>Отчёт площадки</h4>
      <div class="rec ${c.km > 200000 ? 'bad' : ''}"><span>Пробег (проверен)</span><b>${km(c.km)}</b></div>
      <div class="rec ${c.owners > 3 ? 'bad' : ''}"><span>Владельцев</span><b>${c.owners}</b></div>
      <div class="rec ${c.acc ? 'bad' : 'good'}"><span>ДТП</span><b>${c.acc || 'нет'}</b></div>
      ${c.taxi ? '<div class="rec bad"><span>Такси</span><b>работала</b></div>' : ''}
      <div class="rec good"><span>Залоги и запреты</span><b>нет, юридически чистая</b></div>
      <h4>Состояние узлов</h4>
      ${PARTS.map(p => `<div class="rec ${c.wear[p.k] > 50 ? 'bad' : c.wear[p.k] < 20 ? 'good' : ''}"><span>${p.n}</span><b>износ ${c.wear[p.k]}%</b></div>`).join('')}
    </div>
    <div class="grid3" style="margin:12px 0">
      <div class="plate beige"><small>Старт</small><b>${money(a.start)}</b></div>
      <div class="plate blue"><small>После ремонта</small><b>${money(roundPrice(est.sell))}</b></div>
      <div class="plate green"><small>Окупится до</small><b>${money(be)}</b></div>
    </div>
    <div class="note">«Окупится до» — если выиграешь дешевле, сделаешь ремонт в сервисе и продашь по рынку, будешь в плюсе. Чинить самому ещё выгоднее.</div>
    ${a.done ? `<button class="btn block gray" disabled>Торги завершены</button>`
      : full ? `<button class="btn block gray" disabled>В гараже нет места</button>`
      : `<button class="btn block green" data-a="aucenter" data-id="${a.id}">🔨 Войти в торги · ${a.bots.length} ${plural(a.bots.length, 'участник', 'участника', 'участников')}</button>`}
  </div>`;
}
// Живые торги: таймер, участники перебивают, каждая ставка продлевает время
let AUC = null;
const AUC_T0 = 12000, AUC_RESET = 6000;
function aucDelay() { const d = rnd(700, 3000); return d > AUC.t - 250 ? Math.max(100, AUC.t - rnd(300, 1000)) : d; }
function aucJump(a, n) { return a.leader == null ? a.start + aucStep(a.start) * (n - 1) : a.price + aucStep(a.price) * n; }
function enterAuction(a) {
  if (S.garage.length >= S.slots) return toast('В гараже нет места', true);
  if (!aucCanPay(a, a.start)) return toast('Не хватает даже на стартовую ставку с комиссией', true);
  aucStart(a);
  AUC = { a, t: AUC_T0, over: false, log: [{ w: 'sys', t: 'Лот открыт. Стартовая цена ' + money(a.start) }], shown: 0 };
  AUC.next = rnd(1500, 3500);
  UI.modal = { type: 'auc' }; hap('medium'); render();
  AUC.timer = setInterval(aucTick, 100);
}
function aucTick() {
  if (!AUC || AUC.over) return;
  AUC.t -= 100; AUC.next -= 100;
  if (AUC.next <= 0 && AUC.t > 0) {
    const i = aucBotMove(AUC.a);
    if (i >= 0) { AUC.log.push({ w: 's', t: AUC.a.bots[i].n + ': ' + money(AUC.a.price) }); AUC.t = Math.max(AUC.t, AUC_RESET); sfx('bid'); hap('light'); }
    AUC.next = aucDelay();
  }
  if (AUC.t <= 0) return aucEnd();
  aucPaint();
}
function aucPlayerBid(n) {
  const a = AUC.a;
  if (AUC.over || a.leader === 'p') return;
  const x = n > 1 ? aucJump(a, n) : aucNext(a);
  if (!aucCanPay(a, x)) return toast('Не хватает денег с учётом комиссии', true);
  aucBid(a, 'p', x); AUC.log.push({ w: 'p', t: 'Ты: ' + money(x) });
  AUC.t = Math.max(AUC.t, AUC_RESET); AUC.next = aucDelay();
  sfx('bid'); hap('medium'); aucPaint();
}
function aucEnd(silent) {
  clearInterval(AUC.timer); AUC.over = true;
  AUC.res = aucFinish(AUC.a);
  sfx('hammer'); if (AUC.res.who === 'p') { sfx('cash'); hap('ok'); } else hap('warn');
  checkAch(); save();
  if (!silent) render();
}
function aucPaint() {
  const el = id => document.getElementById(id), a = AUC.a;
  if (!el('aucp')) return;
  const st = el('aucst');
  st.textContent = AUC.t > 4000 ? 'Идут торги' : AUC.t > 2000 ? 'Раз…' : 'Два…'; st.className = 'auc-status' + (AUC.t <= 4000 ? ' hot' : '');
  el('auct').style.width = clamp(AUC.t / AUC_T0, 0, 1) * 100 + '%';
  el('aucp').textContent = money(a.leader == null ? a.start : a.price);
  el('aucl').textContent = a.leader == null ? 'ставок пока нет' : a.leader === 'p' ? 'Лидируешь ты 💪' : 'Лидирует: ' + a.bots[a.leader].n;
  el('aucl').className = 'auc-lead' + (a.leader === 'p' ? ' me' : '');
  const lead = a.leader === 'p', x1 = aucNext(a), x5 = aucJump(a, 5);
  const b1 = el('aucb1'), b5 = el('aucb5');
  b1.textContent = lead ? 'Ты лидер' : 'Ставка ' + money(x1); b1.disabled = lead || !aucCanPay(a, x1);
  b5.textContent = lead ? 'Ждём…' : '+5 шагов: ' + money(x5); b5.disabled = lead || !aucCanPay(a, x5);
  const cur = a.leader == null ? a.start : a.price;
  el('aucn').textContent = 'С комиссией ' + money(cur + aucFee(cur)) + ' · на счету ' + money(S.money);
  if (AUC.shown !== AUC.log.length) {
    const lg = el('auclog'); lg.innerHTML = AUC.log.slice(-30).map(x => `<div class="bub ${x.w}">${esc(x.t)}</div>`).join(''); lg.scrollTop = lg.scrollHeight;
    AUC.shown = AUC.log.length;
  }
}
function modalAuc() {
  if (!AUC) return '';
  const a = AUC.a, c = a.car, T = AUC_TYPES[a.type];
  const head = `<div class="row"><div class="${sceneClass(c)}" style="width:38%;flex:none">${carPic(c)}</div>
    <div style="flex:1;min-width:0"><b>${esc(carName(c))}, ${c.year}</b><div class="sub">${esc(T.n)}</div></div></div>`;
  if (AUC.over) {
    const r = AUC.res, fee = aucFee(r.price);
    return `<div class="panel"><div class="title-plate h">${r.who === 'p' ? '🔨 Продано тебе!' : '🔨 Продано'}</div>${head}
      ${r.who === 'p' ? `<div class="grid2" style="margin:12px 0"><div class="plate beige"><small>Ставка</small><b>${money(r.price)}</b></div><div class="plate red"><small>Комиссия</small><b>${money(fee)}</b></div></div>
        <div class="note">Машина уже в гараже. Почини и продай дороже.</div><button class="btn block green" data-a="aucgarage">${I.garage}В гараж</button>`
      : `<div class="warn" style="margin:12px 0">${r.who ? 'Ушла к «' + esc(r.who) + '» за ' + money(r.price) + '.' : 'Никто не сделал ставку — лот снят.'}</div>
        <button class="btn block" data-a="mclose">Ладно, в следующий раз</button>`}</div>`;
  }
  return `<div class="panel auc">${head}
    <div class="auc-status" id="aucst"></div>
    <div class="auc-time"><i id="auct"></i></div>
    <div class="auc-price" id="aucp"></div><div class="auc-lead" id="aucl"></div>
    <div class="chat auc-log" id="auclog"></div>
    <div class="grid2" style="margin-top:10px"><button class="btn green" id="aucb1" data-a="aucbid" data-k="1"></button><button class="btn dark" id="aucb5" data-a="aucbid" data-k="5"></button></div>
    <div class="note" id="aucn" style="text-align:center"></div>
    <button class="btn block gray" style="margin-top:6px" data-a="mclose">Выйти из торгов</button></div>`;
}

// ---------- бизнесы ----------
function viewBiz() {
  const own = BIZ.filter(b => bizLv(b.k));
  const daily = own.reduce((s, b) => s + bizIncome(b), 0), earned = own.reduce((s, b) => s + S.biz[b.k].earned, 0);
  return `<div class="panel" style="margin-top:10px"><div class="grid2">
      <div class="plate green"><small>Доход в день ~</small><b>${money(daily)}</b></div>
      <div class="plate beige"><small>Принесли всего</small><b>${money(earned)}</b></div></div>
    <div class="note">Деньги приходят каждое утро сами. Бывают поломки и проверки, а бывает, что везёт. Каждый бизнес ещё и помогает перекупу.</div></div>
  ${BIZ.map(bizCard).join('')}`;
}
function bizCard(b) {
  const lv = bizLv(b.k), x = S.biz[b.k], avg = (b.inc[0] + b.inc[1]) / 2;
  const lock = b.minLv && level().i < b.minLv && !lv, p = lv < BIZ_MAX ? bizPrice(b, lv) : null;
  const sell = `<button class="btn gray" data-a="bizsell" data-k="${b.k}">Продать</button>`;
  return `<div class="panel biz ${lv ? 'own' : ''}">
    <div class="row"><div class="biz-ic">${b.ic}</div><div style="flex:1;min-width:0"><b>${esc(b.n)}</b>${lv ? `<span class="lvl">ур. ${lv} из ${BIZ_MAX}</span>` : ''}<div class="sub">${esc(b.t)}</div></div></div>
    <div class="grid2" style="margin-top:10px">
      <div class="plate green"><small>Доход в день ~</small><b>${money(roundPrice(avg * BIZ_MUL[Math.max(1, lv)]))}</b></div>
      <div class="plate ${lv ? 'beige' : 'blue'}"><small>${lv ? 'Принёс всего' : 'Окупится'}</small><b>${lv ? money(x.earned) : 'за ~' + Math.ceil(b.price / avg) + ' дн.'}</b></div>
    </div>
    <div class="perk">⭐ ${esc(b.perk)}</div>
    ${lock ? `<button class="btn block gray" disabled>🔒 С уровня «${LEVELS[b.minLv][1]}»</button>`
      : p == null ? `<div class="row"><span class="chip green" style="flex:1;text-align:center">Максимальный уровень</span>${sell}</div>`
      : `<div class="row"><button class="btn ${lv ? '' : 'green'}" style="flex:1" data-a="biz" data-k="${b.k}">${lv ? 'Расширить' : 'Купить'} <span class="cost">${money(p)}</span></button>${lv ? sell : ''}</div>
        ${lv ? `<div class="note">На ${lv + 1} уровне доход ~${money(roundPrice(avg * BIZ_MUL[lv + 1]))} в день.</div>` : ''}`}
  </div>`;
}

function viewLots() {
  return `<div class="sub" style="margin:10px 0 4px">Гараж продают целиком, с тем, что внутри. Видно только силуэт. Можно торговаться. Повезёт — заберёшь тачку за копейки, не повезёт — ржавое корыто.</div>
  ${S.lots.filter(x => !x.gone).map(lotCard).join('')}`;
}
function lotCard(lot) {
  const T = LOT_TYPES[lot.type];
  return `<div class="card" data-a="lot" data-id="${lot.id}">
    <div class="scene lotscene">${carSvg(lot.car).replace('<svg class="car"', '<svg class="car sil"')}<div class="tags"><span class="tag">ещё ${Math.max(1, lot.until - S.day + 1)} дн.</span>${lot.deal ? '<span class="tag ok">Договорились</span>' : ''}</div></div>
    <div class="info">
      <div class="price">${money(lot.deal || lot.ask)}${(lot.deal || lot.ask) < lot.ask0 ? `<s>${money(lot.ask0)}</s>` : ''}</div>
      <div class="ttl">${esc(T.n)}</div>
      <div class="meta">${esc(T.t)}</div>
      <div class="meta">${lot.hints.map(esc).join(' ')}</div>
      <div class="meta">${esc(lot.city)} · продаёт ${esc(lot.seller)}</div>
      <div class="act"><div class="chip">Внутри — сюрприз</div><button class="btn small" data-a="lot" data-id="${lot.id}">${I.phone}Торговаться</button></div>
    </div></div>`;
}
function modalLot(m) {
  const lot = S.lots.find(x => x.id === m.id);
  if (!lot) return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="sec-title">Лот снят</div></div>`;
  const pct = UI.lotPct[lot.id] || 80, offer = roundPrice(lot.ask * pct / 100);
  const act = lot.gone ? '<button class="btn block gray" data-a="mclose">Положить трубку</button>'
    : lot.deal ? `<button class="btn block green" data-a="buylot" data-id="${lot.id}">${I.cash}Купить за ${money(lot.deal)} и открыть ворота</button>`
    : `<div class="offer-box"><div class="sub" style="text-align:center">Ваше предложение</div><div class="val" id="lotv">${money(offer)}</div>
        <input type="range" min="40" max="100" value="${pct}" data-a="lotpct" data-id="${lot.id}">
        <button class="btn block green" data-a="lotoffer" data-id="${lot.id}">${I.check}Предложить</button>
        <div class="note" style="text-align:center">Терпение: <span class="hearts">${'<b style="color:var(--y)">●</b>'.repeat(Math.max(0, lot.patience))}</span></div></div>`;
  const chat = lot.chat.length ? lot.chat : [{ w: 's', t: 'Алло. Гараж продаю как есть, внутрь не пускаю — замок заржавел. Сколько дашь?' }];
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button>
    <div class="callhead">${personAva(lot.seller, true)}<div><b>${esc(lot.seller)}</b><span class="sub">${esc(LOT_TYPES[lot.type].n)}</span></div></div>
    <div class="chat" id="chat">${chat.map(x => `<div class="bub ${x.w}">${esc(x.t)}</div>`).join('')}</div>
    <div style="margin-top:12px">${act}</div></div>`;
}
function modalReveal(m) {
  const g = gItem(m.uid); if (!g) return '';
  const c = g.car, md = MODELS[c.m], mp = marketRef(c), luck = trueValue(c) - g.paid;
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="sec-title">Открываем ворота…</div>
    <div class="${sceneClass(c)} reveal">${carPic(c)}</div>
    <div class="big-title">${esc(carName(c))}, ${c.year}</div><div class="sub">${specLine(c, md)}</div>
    <div class="grid2" style="margin:12px 0">
      <div class="plate beige"><small>Заплатил</small><b>${money(g.paid)}</b></div>
      <div class="plate blue"><small>Рыночная цена</small><b>${money(mp)}</b></div>
    </div>
    <div class="warn" style="background:${luck > 0 ? '#8bd43a18' : '#e5463b18'};color:${luck > 0 ? 'var(--green)' : '#ffb4aa'}">${luck > g.paid * 0.3 ? 'Джекпот! Такое бывает раз в сто гаражей.' : luck > 0 ? 'Неплохо, в плюс.' : 'Не повезло. Будем чинить и выкручиваться.'} Осмотри машину в гараже — там видно состояние.</div>
    <button class="btn block green" data-a="mclose">В гараж</button></div>`;
}
function garageCard(g) {
  const c = g.car, md = MODELS[c.m];
  const mp = marketPrice(g), profit = mp - g.paid - g.spent;
  const tags = [];
  if (g.sale) tags.push(`<span class="tag ok">На продаже</span>`);
  if (c.legal.zalog || c.legal.limit) tags.push('<span class="tag hot">Документы!</span>');
  if (c.twisted) tags.push('<span class="tag hot">Скручен</span>');
  if ((g.orders || []).length) tags.push('<span class="tag">📦 Запчасть едет</span>');
  return `<div class="card mine" data-a="car" data-uid="${c.uid}">
    <div class="${sceneClass(c)}"><div class="tags">${tags.join('')}</div>${carPic(c)}</div>
    <div class="info">
      <div class="ttl" style="font-weight:600">${esc(carName(c))}, ${c.year}</div>
      <div class="meta">${specLine(c, md)} · ${g.sale ? g.offers.filter(o => !o.caught).length + ' предлож.' : 'в гараже ' + (S.day - g.boughtDay + 1) + ' дн.'}</div>
      <div class="grid2" style="margin-top:8px">
        <div class="plate beige"><small>Вложено</small><b>${money(g.paid + g.spent)}</b></div>
        <div class="plate ${profit > 0 ? 'green' : 'red'}"><small>Рынок ~</small><b>${money(mp)}</b></div>
      </div>
      <button class="btn block small green" style="margin-top:8px" data-a="car" data-uid="${c.uid}">${I.wrench}Открыть</button>
    </div>
  </div>`;
}

function pageCar(g) {
  const c = g.car, md = MODELS[c.m], k = c.k;
  const pic = p => I[p.icon].replace('<svg ', '<svg class="pi" ');
  const tile = p => {
    const w = c.wear[p.k];
    if (!k.insp) return `<div class="part">${pic(p)}<b>${p.n}</b><small>износ: ?</small></div>`;
    return `<div class="part ${w > 50 ? 'bad' : w > 20 ? 'need' : ''}">
      ${pic(p)}
      <b>${p.n}</b><small>износ ${w}%</small><div class="bar"><i style="width:${w}%;background-position:${-w}px 0"></i></div>
      ${ordered(g, p.k) ? `<button class="btn small gray" disabled>📦 Едет ${Math.max(1, ordered(g, p.k).at - S.day)} дн.</button>`
        : `<button class="btn small ${w > 20 ? '' : 'gray'}" data-a="fix" data-uid="${c.uid}" data-k="${p.k}" ${w <= 3 || g.sale ? 'disabled' : ''}>Ремонт</button>`}</div>`;
  };
  const mp = marketPrice(g);
  const L = c.legal;
  return `
  <button class="back" data-a="close">${I.back}Гараж</button>
  <div class="${sceneClass(c)}">${carPic(c)}</div>
  <div class="big-title">${esc(carName(c))}, ${c.year}</div><div class="sub">${specLine(c, md)}</div>
  <div class="panel"><div class="title-plate h">Ремонт</div>
    <div class="repair">${PARTS.slice(0, 3).map(tile).join('')}</div>
    <div class="repair" style="margin-top:8px">${PARTS.slice(3).map(tile).join('')}</div>
    ${!k.insp ? `<button class="btn block" style="margin-top:12px" data-a="inspect" data-uid="${c.uid}">${I.eye}Осмотреть машину (бесплатно)</button>` : ''}
    <div class="grid3" style="margin-top:12px">
      <div class="plate blue"><small>Купил за</small><b>${money(g.paid)}</b></div>
      <div class="plate red"><small>Ремонт</small><b>−${money(g.spent)}</b></div>
      <div class="plate green"><small>Рынок</small><b>${money(mp)}</b></div>
    </div>
  </div>

  <div class="panel" style="margin-top:28px"><div class="title-plate h">Документы</div>
    <div class="grid2">
      ${k.auto ? `<button class="btn small green" data-a="report" data-w="auto" data-uid="${c.uid}">${I.check}Автотека</button>` : `<button class="btn small" data-a="owncheck" data-w="auto" data-uid="${c.uid}">${I.doc}Автотека <span class="cost">${money(PRICES.autoteka)}</span></button>`}
      ${k.probiv ? `<button class="btn small green" data-a="report" data-w="probiv" data-uid="${c.uid}">${I.check}Базы</button>` : `<button class="btn small" data-a="owncheck" data-w="probiv" data-uid="${c.uid}">${I.search}Пробить <span class="cost">${money(PRICES.probiv)}</span></button>`}
    </div>
    ${k.probiv && L.zalog ? `<button class="btn block red" style="margin-top:10px" data-a="zalog" data-uid="${c.uid}">${I.bank}Погасить залог ${money(L.zalog)}</button>` : ''}
    ${k.probiv && L.limit ? `<button class="btn block red" style="margin-top:10px" data-a="limit" data-uid="${c.uid}">${I.lock}Снять ограничения ${money(L.limit + 1500)}</button>` : ''}
    ${k.probiv && L.wanted ? `<div class="warn">🚨 Машина в угоне. Скоро за ней приедут. Продай быстрее... или прими потерю.</div>` : ''}
    ${!k.probiv ? '<div class="note">Покупатели часто пробивают машину. С залогом или запретом её не купят.</div>' : ''}
  </div>

  <div class="panel" style="margin-top:28px"><div class="title-plate h">Подготовка</div>
    <div class="grid2">
      <button class="btn small ${c.clean ? 'green' : ''}" data-a="wash" data-uid="${c.uid}" ${c.clean ? 'disabled' : ''}>${I.shine}${c.clean ? 'Блестит' : 'Мойка + полировка'} ${c.clean ? '' : `<span class="cost">${washPrice() ? money(washPrice()) : 'своя мойка'}</span>`}</button>
      <button class="btn small red" data-a="twist" data-uid="${c.uid}" ${c.twisted || g.sale ? 'disabled' : ''}>${I.gauge}${c.twisted ? 'Уже скручен' : 'Скрутить пробег'} ${c.twisted ? '' : `<span class="cost">${money(PRICES.twist)}</span>`}</button>
    </div>
    <div class="note">Скрутка поднимает цену, но покупатель с автотекой спалит — и репутация в минус.</div>
  </div>

  <div class="panel" style="margin-top:28px"><div class="title-plate h">Продажа</div>
    ${g.sale ? `<div class="kv"><span>Выставлена за</span><b>${money(g.sale.price)}</b></div>
      <div class="kv"><span>Предложений</span><b>${g.offers.filter(o => !o.caught).length}</b></div>
      <div class="row" style="margin-top:10px"><button class="btn green" data-a="tab" data-k="sale">${I.tag}Предложения</button><button class="btn gray" data-a="unlist" data-uid="${c.uid}">Снять</button></div>`
      : `<button class="btn block green" data-a="sell" data-uid="${c.uid}">${I.tag}Выставить на доску объявлений</button>
      <button class="btn block dark" style="margin-top:10px" data-a="quick" data-uid="${c.uid}">${I.cash}${bizLv('razbor') ? 'Сдать на свою разборку' : 'Слить перекупу сейчас'} за ${money(quickPrice(c))}</button>`}
  </div>`;
}

function modalFix(m) {
  const g = m.g, c = g.car, p = PARTS.find(x => x.k === m.pk);
  const diy = repairCost(c, p.k, true), pro = repairCost(c, p.k, false);
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">${p.n}</div>
    <div style="text-align:center;margin-bottom:10px">Износ <b>${c.wear[p.k]}%</b>. Как чиним?</div>
    <button class="btn block" data-a="dofix" data-diy="1">${I.wrench}Сам в гараже <span class="cost">${money(diy)}</span></button>
    <div class="note">Дёшево${up('lift') ? ', с подъёмником почти как в сервисе' : ', но не идеально'}. Шанс накосячить: ${Math.round(diyFail() * 100)}%.</div>
    <button class="btn block ozon" style="margin-top:6px" data-a="ozonfix">${I.box}Запчасть с Ozon <span class="cost">${money(ozonCost(c, p.k))}</span></button>
    <div class="note">Ещё дешевле, но едет 1–3 дня, ставишь сам. Иногда пересорт: заказал фару — пришёл чехол на айфон.</div>
    <button class="btn block green" style="margin-top:6px" data-a="dofix" data-diy="0">${I.check}В сервис <span class="cost">${money(pro)}</span></button>
    <div class="note">Дорого, зато как новое.</div></div>`;
}

function modalSell(m) {
  const g = m.g, c = g.car, mp = marketPrice(g), pct = UI.sellPct, price = roundPrice(mp * pct / 100);
  const profit = price - g.paid - g.spent;
  const speed = pct <= 92 ? ['⚡ Уйдёт быстро', 'green'] : pct <= 105 ? ['👌 Нормальная цена', 'blue'] : pct <= 118 ? ['🐢 Будет висеть', 'beige'] : ['🥶 Никто не позвонит', 'red'];
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">Выставить на продажу</div>
    <div style="text-align:center;font-weight:800">${esc(carName(c))}, ${c.year}</div>
    <div class="sub" style="text-align:center">Рыночная цена ~ ${money(mp)}</div>
    <div class="offer-box" style="margin-top:10px">
      <div class="val" id="sellv">${money(price)}</div>
      <input type="range" min="70" max="140" value="${pct}" data-a="sellpct">
      <div class="grid2"><div class="plate ${speed[1]}" id="sells"><small>Спрос</small><b>${speed[0]}</b></div>
        <div class="plate ${profit >= 0 ? 'green' : 'red'}" id="sellp"><small>Навар</small><b>${profit >= 0 ? '+' : ''}${money(profit)}</b></div></div>
    </div>
    <button class="btn block green" style="margin-top:12px" data-a="dolist">${I.tag}Выставить</button>
    <div class="note">Покупатели звонят по утрам — жми «День ›» и смотри вкладку «Продажа».</div></div>`;
}

// ---------- продажа ----------
function viewSale() {
  const onSale = S.garage.filter(g => g.sale), idle = S.garage.filter(g => !g.sale);
  return `<div class="screen-title h">Доска объявлений</div>
  ${onSale.length ? onSale.map(saleBlock).join('') : `<div class="empty"><div class="big">🏷️</div>Ничего не выставлено. Открой машину в гараже и нажми «Выставить на доску».</div>`}
  ${idle.length ? `<div class="panel flat"><div class="h" style="font-size:13px;margin-bottom:6px">В гараже, не выставлены</div>
    ${idle.map(g => `<div class="kv" data-a="car" data-uid="${g.car.uid}"><span>${esc(carName(g.car))}</span><b style="color:var(--y)">открыть ›</b></div>`).join('')}</div>` : ''}`;
}
function saleBlock(g) {
  const c = g.car;
  const offs = g.offers;
  return `<div class="panel">
    <div class="row" data-a="car" data-uid="${c.uid}">
      <div class="${sceneClass(c)}" style="width:42%;flex:none">${carPic(c)}</div>
      <div style="flex:1;min-width:0"><b>${esc(carName(c))}</b><div class="sub">${c.year} · ${km(c.kmShown)}</div>
        <div class="price-big" style="font-size:19px">${money(g.sale.price)}</div><div class="sub">висит ${S.day - g.sale.day + 1} дн.</div></div>
    </div>
    ${offs.length ? offs.map(o => offerCard(g, o)).join('') : `<div class="note" style="margin-top:10px">Пока тишина. Новые звонки — на следующий день. Если долго висит — снизь цену.</div>`}
  </div>`;
}
function offerCard(g, o) {
  if (o.caught) return `<div class="offer bad">${personAva(o.name)}<div><div class="who">${esc(o.name)}</div><p>${esc(o.text)}</p>
    <button class="btn small gray" data-a="dismiss" data-uid="${g.car.uid}" data-o="${o.id}">Ну и ладно</button></div></div>`;
  return `<div class="offer">${personAva(o.name)}<div>
    <div class="who">${esc(o.name)}<b>${money(o.offer)}</b></div><p>${esc(o.text)}</p>
    <div class="row">
      <button class="btn green" data-a="accept" data-uid="${g.car.uid}" data-o="${o.id}">Продать</button>
      ${o.agreed ? '' : `<button class="btn" data-a="counter" data-uid="${g.car.uid}" data-o="${o.id}">Торг</button>`}
      <button class="btn gray" data-a="reject" data-uid="${g.car.uid}" data-o="${o.id}">Нет</button>
    </div></div></div>`;
}
function modalCounter(m) {
  const g = m.g, o = m.o, lo = o.offer, hi = Math.max(g.sale.price, lo + 1000);
  if (UI.counterX == null) UI.counterX = roundPrice((lo + hi) / 2);
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">Торг с покупателем</div>
    <div class="callhead">${personAva(o.name, true)}<div><b>${esc(o.name)}</b><span class="sub">покупатель</span></div></div>
    <div class="chat"><div class="bub s">${esc(o.text)}</div></div>
    <div class="offer-box" style="margin-top:10px">
      <div class="sub" style="text-align:center">Ваша цена</div>
      <div class="val" id="cntv">${money(UI.counterX)}</div>
      <input type="range" min="${lo}" max="${hi}" step="1000" value="${UI.counterX}" data-a="cntx">
      <div class="note" style="text-align:center">Терпение покупателя: <span class="hearts">${'<b style="color:var(--y)">●</b>'.repeat(o.patience)}</span></div>
      <button class="btn block green" data-a="docounter">${I.check}Предложить</button>
    </div></div>`;
}

// ---------- профиль ----------
function viewMe() {
  const lv = level(), pr = lv.next ? (S.stats.profit - lv.cur) / (lv.next - lv.cur) : 1;
  return `<div class="screen-title">${esc(meName())}</div>
  <div class="panel">
    <div class="dossier"><button class="me-big" data-a="avatar">${avatarSvg(S.me)}</button>
      <div><div class="kv"><span>Уровень</span><b class="g">${lv.title}</b></div>
        ${lv.next ? `<div class="kv"><span>До следующего</span><b>${money(lv.next - S.stats.profit)}</b></div><div class="progress"><i style="width:${clamp(pr, 0, 1) * 100}%"></i></div>` : '<div class="kv"><span>Ты на вершине</span><b>🏆</b></div>'}
        <div class="kv"><span>Репутация</span><b>${S.rep}/100</b></div><div class="progress"><i style="width:${S.rep}%;background:linear-gradient(90deg,#f6c21c,#ffe36b)"></i></div></div>
    </div>
    <div style="margin-top:10px">
      <div class="kv"><span>Машин куплено</span><b>${S.stats.bought}</b></div>
      <div class="kv"><span>Машин продано</span><b>${S.stats.sold}</b></div>
      <div class="kv"><span>Заработано всего</span><b class="${S.stats.profit >= 0 ? 'g' : ''}">${money(S.stats.profit)}</b></div>
      <div class="kv"><span>Лучший навар</span><b>${money(S.stats.best)}</b></div>
      <div class="kv"><span>Спалился на скрутке</span><b>${S.stats.caught}</b></div>
      <div class="kv"><span>День карьеры</span><b>${S.day}</b></div>
    </div>
  </div>
  ${viewTasks()}${viewBank()}${viewAch()}
  <div class="panel flat"><div class="h" style="font-size:13px;margin-bottom:4px">Журнал</div>
    <div class="log">${S.log.slice(0, 25).map(x => `<div><span>Д${x.d}</span>${esc(x.t)}</div>`).join('')}</div></div>
  <div class="grid2"><button class="btn dark" data-a="help">${I.help}Как играть</button><button class="btn red" data-a="reset">Начать заново</button></div>
  <button class="btn block dark" style="margin-top:10px" data-a="avatar">${I.user}Изменить персонажа</button>
  <button class="btn block dark" style="margin-top:10px" data-a="sound">${S.sound === false ? '🔇 Звук выключен' : '🔊 Звук и вибрация включены'}</button>
  <button class="btn block dark" style="margin-top:10px" data-a="credits">Фото машин: авторы</button>
  <div class="note" style="margin-top:14px;text-align:center">Perekup 0.6 · сохраняется сам: в Telegram и на телефоне</div>`;
}
function viewTasks() {
  return `<div class="panel"><div class="sec-title">Задания дня</div>${S.daily.tasks.map((x, i) => `<div class="task ${x.claimed ? 'done' : ''}">
    <div style="flex:1;min-width:0"><b>${esc(taskText(x))}</b><div class="bar"><i style="width:${Math.min(1, x.got / x.need) * 100}%"></i></div>
      <span class="sub">${Math.min(x.got, x.need)}/${x.need} · награда ${money(x.reward)}</span></div>
    ${x.claimed ? '<span class="chip green">Получено</span>' : x.got >= x.need ? `<button class="btn small green" data-a="claim" data-k="${i}">Забрать</button>` : ''}</div>`).join('')}
    <div class="note">Новые задания каждое утро.</div></div>`;
}
function viewBank() {
  const L = S.loan, max = loanMax();
  if (L) return `<div class="panel"><div class="sec-title">Банк</div>
    <div class="kv"><span>Кредит</span><b>${money(L.sum)}</b></div><div class="kv"><span>Осталось вернуть</span><b>${money(L.left)}</b></div>
    <div class="kv"><span>Платёж каждый день</span><b>${money(L.daily)}</b></div>
    <button class="btn block" style="margin-top:8px" data-a="repay">Погасить всё сейчас</button>
    <div class="note">Если долго сидеть в минусе — позвонят коллекторы, репутация упадёт.</div></div>`;
  const sums = [...new Set([max / 4, max / 2, max].map(roundPrice))];
  return `<div class="panel"><div class="sec-title">Банк</div>
    <div class="sub">Кредит на ${LOAN_DAYS} дней, переплата ${LOAN_RATE * 100}%. Платёж списывается каждое утро. Чем выше уровень, тем больше дают.</div>
    <div class="grid3" style="margin-top:10px">${sums.map(v => `<button class="btn small dark" data-a="loan" data-k="${v}">${money(v)}</button>`).join('')}</div></div>`;
}
function viewAch() {
  const got = ACH.filter(a => S.ach[a.k]).length;
  return `<div class="panel"><div class="sec-title">Достижения <span class="sub">${got} из ${ACH.length}</span></div>
    <div class="achs">${ACH.map(a => `<div class="ach ${S.ach[a.k] ? 'on' : ''}"><b>${S.ach[a.k] ? '🏆' : '🔒'} ${esc(a.n)}</b><small>${esc(a.t)}</small></div>`).join('')}</div></div>`;
}
function modalHelp() {
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">Как стать перекупом</div>
    <div class="log" style="font-size:14px">
      <div>🔍 <b>Ищи</b> в объявлениях тачки дешевле рынка. Зелёный «Навар» — примерный доход.</div>
      <div>📄 <b>Проверяй</b>: автотека покажет скрученный пробег, ДТП и такси, пробив по базам — залог и угон, подборщик — состояние узлов.</div>
      <div>📞 <b>Звони и торгуйся</b>. Тыкай в найденные проблемы — продавец скинет цену. Не наглей: у него кончится терпение.</div>
      <div>🔧 <b>Чини</b> в гараже: сам дёшево, в сервисе дорого, но как новое. Помой — плюс к цене.</div>
      <div>🏷️ <b>Продавай</b> на доске. Покупатели звонят по утрам — жми «День ›». Торгуйся с ними.</div>
      <div>☀️ Каждый день — аренда гаража. Объявления уходят: кто не успел, тот опоздал.</div>
      <div>😈 Можно скрутить пробег. Но если спалят — репутация в минус, и покупателей станет меньше.</div>
      <div>📦 <b>Склад Ozon</b>: кончились деньги — выйди на смену на СЦ Волхонское. Ромашка (буквы A–K), приёмка, аллея или грузчик. Коэффициент и спидометр как в жизни.</div>
      <div>🔒 <b>Гаражи с сюрпризом</b> — во вкладке объявлений: покупаешь гараж целиком, внутри случайная тачка.</div>
      <div>🔨 <b>Аукцион</b> — там же. Машины банков, лизинга и страховых, всё проверено. Торги вживую: перебивай ставки, пока не стукнул молоток.</div>
      <div>🏪 <b>Бизнесы</b> — во вкладке «Работа»: шаурмичная, мойка, ПВЗ, СТО, таксопарк. Приносят деньги каждое утро и помогают перекупу.</div>
      <div>🛠 <b>Улучшения</b> — во вкладке «Гараж»: инструменты, подъёмник, покраска, мойка, вывеска, ремонт помещения.</div>
      <div>📋 <b>Задания дня</b>, <b>банк</b> и <b>достижения</b> — в профиле. Следи за событиями рынка: на санкциях и моде на ретро можно поднять.</div>
      <div>🧍 <b>Персонаж</b>: нажми на человечка слева сверху — имя, причёска, шмот.</div>
    </div>
    <button class="btn block" style="margin-top:12px" data-a="mclose">Погнали</button></div>`;
}
function modalCredits() {
  const rows = MODELS.map(md => (PHOTOS[md.id] || []).map(p => `<div><a href="${p.p}" target="_blank" rel="noopener">${esc(md.brand + ' ' + md.name)}</a> — ${esc(p.by)}, ${esc(p.l)}</div>`).join('')).join('');
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">Фото машин</div>
    <div class="note" style="margin-bottom:8px">Все фото — с Wikimedia Commons под свободными лицензиями. Спасибо авторам!</div>
    <div class="log credits">${rows}</div></div>`;
}
function modalDay(m) {
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="title-plate h">День ${S.day}</div>
    ${m.ev.map(e => `<div class="ev"><div>${esc(e.t)}${e.s ? `<small>${esc(e.s)}</small>` : ''}</div>${e.v != null ? `<b class="${e.v < 0 ? 'neg' : 'pos'}">${e.v < 0 ? '' : '+'}${money(e.v)}</b>` : ''}</div>`).join('')}
    <div class="ev"><div><b>На счету</b></div><b class="${S.money < 0 ? 'neg' : 'pos'}">${money(S.money)}</b></div>
    ${S.money < 0 ? '<div class="warn">Ты в минусе! Продай что-нибудь, пока коллекторы не приехали.</div>' : ''}
    <button class="btn block green" style="margin-top:12px" data-a="mclose">${I.sun}Работаем</button></div>`;
}
function modalConfirm(m) {
  return `<div class="panel"><div class="title-plate h">${esc(m.title)}</div><div style="text-align:center;margin:4px 0 12px">${m.text}</div>
    <div class="row"><button class="btn gray" data-a="mclose">Отмена</button><button class="btn ${m.danger ? 'red' : 'green'}" data-a="confirm">${esc(m.ok)}</button></div></div>`;
}
function confirmBox(title, text, ok, fn, danger) { UI.modal = { type: 'confirm', title, text, ok, fn, danger }; render(); }

// ---------- страница и модалки ----------
function renderPage() {
  const p = $('#page');
  let html = '';
  if (UI.page.type === 'ad') { const l = S.listings.find(x => x.id === UI.page.id); if (!l) { UI.page = null; p.className = ''; return; } html = pageListing(l); }
  else { const g = gItem(UI.page.uid); if (!g) { UI.page = null; p.className = ''; return; } html = pageCar(g); }
  let inner = p.querySelector('.inner');
  if (!inner || p.dataset.key !== UI.page.type + (UI.page.id || UI.page.uid)) {
    p.innerHTML = '<div class="inner"></div>'; inner = p.querySelector('.inner'); p.dataset.key = UI.page.type + (UI.page.id || UI.page.uid);
    p.className = ''; void p.offsetWidth; p.className = 'on';
  }
  inner.innerHTML = html;
}
function renderModal() {
  const m = UI.modal, el = $('#modal');
  const fn = { report: modalReport, call: modalCall, fix: modalFix, sell: modalSell, counter: modalCounter, help: modalHelp, credits: modalCredits, avatar: modalAvatar, lot: modalLot, reveal: modalReveal, auclot: modalAucLot, auc: modalAuc, day: modalDay, confirm: modalConfirm }[m.type];
  let sheet = el.querySelector('.sheet');
  const fresh = !sheet || el.dataset.type !== m.type;
  if (fresh) { el.innerHTML = '<div class="sheet"></div>'; sheet = el.querySelector('.sheet'); el.dataset.type = m.type; }
  sheet.innerHTML = fn(m);
  el.className = 'on';
  if (m.type === 'auc' && AUC && !AUC.over) aucPaint();
  const chat = $('#chat'); if (chat) chat.scrollTop = chat.scrollHeight;
}
function closeModal() {
  if (AUC) { if (!AUC.over) { aucEnd(true); toast(AUC.res.who === 'p' ? 'Ты вышел, но лот остался за тобой' : 'Ты вышел из торгов'); } AUC = null; }
  UI.modal = null; UI.counterX = null; const el = $('#modal'); el.className = ''; el.innerHTML = ''; el.dataset.type = ''; syncBack(); }
function closePage() { UI.page = null; const p = $('#page'); p.className = ''; p.innerHTML = ''; p.dataset.key = ''; render(); }
function syncBack() {
  if (!hasTg || !tgApp.BackButton) return;
  try { (UI.modal || UI.page) ? tgApp.BackButton.show() : tgApp.BackButton.hide(); } catch (e) { }
}
function goBack() { if (UI.modal) { closeModal(); render(); } else if (UI.page) closePage(); }

// ---------- события ----------
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]');
  if (!t) { if (e.target.id === 'modal' && UI.modal && UI.modal.type !== 'confirm' && UI.modal.type !== 'auc') { closeModal(); render(); } return; }
  const a = t.dataset.a, id = +t.dataset.id, uid = +t.dataset.uid;
  const L = () => S.listings.find(x => x.id === id), G = () => gItem(uid);
  if (a === 'offpct' || a === 'sellpct' || a === 'cntx' || a === 'lotpct') return;
  e.stopPropagation();
  switch (a) {
    case 'tab': UI.tab = t.dataset.k; UI.page = null; $('#page').className = ''; $('#page').innerHTML = ''; closeModal(); hap('light'); render(); $('#view').scrollTop = 0; break;
    case 'ad': UI.page = { type: 'ad', id }; hap('light'); render(); break;
    case 'car': UI.page = { type: 'car', uid }; hap('light'); render(); break;
    case 'close': closePage(); break;
    case 'mclose': { const wasHelp = UI.modal && UI.modal.type === 'help'; closeModal(); if (wasHelp && !S.me) openAvatar(); else render(); break; }
    case 'call': { const l = L(); if (l.gone && !l.deal) { toast('Продавец не берёт трубку', true); break; } openCall(l); break; }
    case 'check': doCheck(L(), t.dataset.w); break;
    case 'report': openReport(uid ? G().car : L().car, t.dataset.w); break;
    case 'point': { const l = L(); pointIssue(l, t.dataset.k); hap(l.gone ? 'err' : 'medium'); commit(); break; }
    case 'cash': cashTrick(L()); hap('light'); commit(); break;
    case 'offer': {
      const l = L(), x = l.ask * UI.offerPct[id] / 100, r = offerPrice(l, x);
      UI.offerPct[id] = clamp(Math.round(x / l.ask * 100) + 2, 50, 100);
      hap(r === 'deal' ? 'ok' : r === 'hangup' ? 'err' : 'medium'); if (r === 'deal') sfx('coin'); commit(); break;
    }
    case 'buy': doBuy(L()); break;
    case 'inspect': G().car.k.insp = true; hap('medium'); commit(); break;
    case 'owncheck': { const err = checkOwn(G(), t.dataset.w); if (err) return toast(err, true); commit(); openReport(G().car, t.dataset.w); break; }
    case 'fix': UI.modal = { type: 'fix', g: G(), pk: t.dataset.k }; render(); break;
    case 'dofix': { const err = repair(UI.modal.g, UI.modal.pk, t.dataset.diy === '1'); closeModal(); if (err) toast(err, err === 'Не хватает денег'); else { toast('Готово! 🔧'); hap('ok'); } commit(); break; }
    case 'ozonfix': { const err = orderOzon(UI.modal.g, UI.modal.pk); closeModal(); if (err) toast(err, true); else { toast('Заказал на Ozon 📦 Жди доставку'); hap('ok'); } commit(); break; }
    case 'credits': UI.modal = { type: 'credits' }; render(); break;
    case 'claim': claimTask(+t.dataset.k); hap('ok'); commit(); break;
    case 'loan': { const v = +t.dataset.k; confirmBox('Взять кредит?', `Получишь <b>${money(v)}</b>, вернёшь <b>${money(Math.round(v * (1 + LOAN_RATE)))}</b> за ${LOAN_DAYS} дней.`, 'Беру', () => { const err = takeLoan(v); err ? toast(err, true) : (toast('Деньги на счёте'), sfx('coin')); }); break; }
    case 'repay': { const err = repayLoan(); err ? toast(err, true) : (toast('Кредит закрыт'), sfx('coin')); commit(); break; }
    case 'sound': S.sound = S.sound === false; if (S.sound) sfx('coin'); commit(); break;
    case 'adsmode': UI.adsMode = t.dataset.k; hap('light'); render(); $('#view').scrollTop = 0; break;
    case 'lot': UI.modal = { type: 'lot', id }; hap('medium'); render(); break;
    case 'lotoffer': { const lot = S.lots.find(x => x.id === id), r = lotOffer(lot, lot.ask * (UI.lotPct[id] || 80) / 100);
      UI.lotPct[id] = clamp(Math.round((UI.lotPct[id] || 80) + 3), 40, 100); hap(r === 'deal' ? 'ok' : r === 'gone' ? 'err' : 'medium');
      commit(); break; }
    case 'buylot': { const lot = S.lots.find(x => x.id === id), uid = lot.car.uid, err = buyLot(lot); if (err) return toast(err, true);
      hap('ok'); sfx('door'); UI.modal = { type: 'reveal', uid }; commit(); break; }
    case 'upgrade': { const err = buyUpgrade(t.dataset.k); err ? toast(err, true) : (toast('Гараж прокачан'), hap('ok')); commit(); break; }
    case 'auclot': UI.modal = { type: 'auclot', id }; hap('light'); render(); break;
    case 'aucenter': enterAuction(S.auc.find(x => x.id === id)); break;
    case 'aucbid': aucPlayerBid(+t.dataset.k); break;
    case 'aucgarage': closeModal(); UI.tab = 'garage'; UI.page = null; render(); break;
    case 'workmode': UI.workMode = t.dataset.k; hap('light'); render(); $('#view').scrollTop = 0; break;
    case 'biz': { const b = BIZ.find(x => x.k === t.dataset.k), lv = bizLv(b.k), p = bizPrice(b, lv);
      confirmBox(lv ? 'Расширить бизнес?' : 'Купить бизнес?', `«${esc(b.n)}» ${lv ? 'до ' + (lv + 1) + ' уровня ' : ''}за <b>${money(p)}</b>. Доход станет ~${money(roundPrice((b.inc[0] + b.inc[1]) / 2 * BIZ_MUL[lv + 1]))} в день.`, lv ? 'Расширить' : 'Купить',
        () => { const err = buyBiz(b.k); err ? toast(err, true) : (toast(lv ? 'Бизнес расширен' : 'Бизнес твой! ' + b.ic), sfx('cash')); }); break; }
    case 'bizsell': { const b = BIZ.find(x => x.k === t.dataset.k), p = bizSellPrice(b.k);
      confirmBox('Продать бизнес?', `«${esc(b.n)}» заберут за <b>${money(p)}</b> — это 60% от вложенного.`, 'Продать', () => { sellBiz(b.k); toast('Продано за ' + money(p)); sfx('cash'); }, true); break; }
    case 'avatar': openAvatar(); break;
    case 'av': { const d = UI.modal.draft, k = t.dataset.k; d[k] = ['skin', 'hairC', 'topC'].includes(k) ? +t.dataset.v : t.dataset.v; hap('light');
      $('#avprev').innerHTML = avatarSvg(d); t.parentNode.querySelectorAll('.on').forEach(x => x.classList.remove('on')); t.classList.add('on'); break; }
    case 'avsave': { const d = UI.modal.draft; d.name = d.name.trim(); S.me = d; closeModal(); toast(d.name ? 'Здарова, ' + d.name + '!' : 'Персонаж сохранён'); hap('ok'); commit(); break; }
    case 'wash': { const err = wash(G()); err ? toast(err, true) : toast('Блестит как у кота яйца ✨'); commit(); break; }
    case 'twist': { const g = G(); confirmBox('Скрутить пробег?', `Сейчас ${km(g.car.kmShown)}. Станет примерно вдвое меньше. Если покупатель пробьёт автотеку — спалишься.`, 'Крутим', () => { const err = twist(g); err ? toast(err, true) : toast('Пробег: ' + km(g.car.kmShown) + ' 😈'); }, true); break; }
    case 'zalog': { const err = clearZalog(G()); err ? toast(err, true) : toast('Залог погашен'); commit(); break; }
    case 'limit': { const err = clearLimit(G()); err ? toast(err, true) : toast('Ограничения сняты'); commit(); break; }
    case 'sell': UI.sellPct = 100; UI.modal = { type: 'sell', g: G() }; render(); break;
    case 'dolist': { const g = UI.modal.g; listForSale(g, marketPrice(g) * UI.sellPct / 100); closeModal(); toast('Объявление опубликовано!'); hap('ok'); commit(); break; }
    case 'unlist': unlist(G()); toast('Снято с продажи'); commit(); break;
    case 'quick': { const g = G(), p = quickPrice(g.car); confirmBox('Слить перекупу?', `Заберёт прямо сейчас за <b>${money(p)}</b>. Навар: ${money(p - g.paid - g.spent)}.`, 'Сливаю', () => { quickSell(g); UI.page = null; $('#page').className = ''; toast('Продано за ' + money(p)); hap('ok'); }); break; }
    case 'slot': { const p = slotPrice(); confirmBox('Ещё одно место?', `Купить место в гараже за <b>${money(p)}</b>? Аренда вырастет на 700 ₽ в день.`, 'Купить', () => { const err = buySlot(); err ? toast(err, true) : toast('Место куплено'); }); break; }
    case 'accept': {
      const g = G(), o = g.offers.find(x => x.id === +t.dataset.o);
      const profit = finishSale(g, o.offer, o.name); hap('ok'); sfx('cash');
      toast((profit >= 0 ? 'Продано! Навар ' : 'Продано. Минус ') + money(Math.abs(profit)), profit < 0);
      if (UI.page && UI.page.uid === uid) { UI.page = null; $('#page').className = ''; }
      commit(); break;
    }
    case 'reject': case 'dismiss': { const g = G(); g.offers = g.offers.filter(x => x.id !== +t.dataset.o); commit(); break; }
    case 'counter': { const g = G(); UI.counterX = null; UI.modal = { type: 'counter', g, o: g.offers.find(x => x.id === +t.dataset.o) }; render(); break; }
    case 'docounter': {
      const m = UI.modal, r = counterOffer(m.g, m.o, UI.counterX);
      closeModal();
      toast(r === 'ok' ? 'Покупатель согласен!' : r === 'left' ? 'Покупатель ушёл' : 'Покупатель назвал свой максимум', r === 'left');
      commit(); break;
    }
    case 'day': { const ev = nextDay(); save(); UI.modal = { type: 'day', ev }; hap('medium'); render(); break; }
    case 'help': UI.modal = { type: 'help' }; render(); break;
    case 'reset': confirmBox('Начать заново?', 'Весь прогресс сотрётся: деньги, гараж, уровень.', 'Стереть', () => { resetGame(); UI.page = null; UI.tab = 'ads'; }, true); break;
    case 'confirm': { const fn = UI.modal.fn; closeModal(); fn(); commit(); break; }
  }
});
document.addEventListener('input', e => {
  const t = e.target, a = t.dataset.a;
  if (a === 'offpct') {
    const l = S.listings.find(x => x.id === +t.dataset.id); UI.offerPct[l.id] = +t.value;
    $('#offv').textContent = money(roundPrice(l.ask * t.value / 100));
  } else if (a === 'sellpct') {
    UI.sellPct = +t.value; renderModal();
  } else if (a === 'lotpct') {
    UI.lotPct[+t.dataset.id] = +t.value; const lot = S.lots.find(x => x.id === +t.dataset.id); $('#lotv').textContent = money(roundPrice(lot.ask * t.value / 100));
  } else if (a === 'avname') {
    UI.modal.draft.name = t.value;
  } else if (a === 'cntx') {
    UI.counterX = +t.value; $('#cntv').textContent = money(UI.counterX);
  }
});
document.addEventListener('change', e => {
  const f = e.target.dataset.f; if (!f) return;
  UI.f[f] = f === 'max' ? +e.target.value : e.target.value; render();
});

// ---------- запуск ----------
(async function boot() {
  if (hasTg) {
    try {
      tgApp.ready(); tgApp.expand();
      if (tgApp.isVersionAtLeast('6.1')) { tgApp.setHeaderColor('#0e1620'); tgApp.setBackgroundColor('#0e1620'); }
      if (tgApp.isVersionAtLeast('7.7')) tgApp.disableVerticalSwipes();
      if (tgApp.isVersionAtLeast('7.10')) tgApp.setBottomBarColor && tgApp.setBottomBarColor('#0f161f');
      tgApp.BackButton.onClick(goBack);
    } catch (e) { }
  }
  await load();
  render();
  if (!S.seenHelp) { S.seenHelp = true; save(); UI.modal = { type: 'help' }; render(); }
  else if (!S.me) openAvatar();
})();
