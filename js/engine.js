// Экономика и правила: генерация объявлений, оценка машин, торг, ремонт, продажа, смена дня, сохранение.

const YEAR_NOW = 2026;
const START_MONEY = 350000;
const PRICES = { autoteka: 990, probiv: 450, wash: 3000, twist: 8000 };
const LEVELS = [
  [0, 'Новичок с Авито'], [300000, 'Начинающий перекуп'], [1000000, 'Барыга с района'], [3000000, 'Автоподборщик'],
  [8000000, 'Хозяин площадки'], [20000000, 'Король авторынка'], [50000000, 'Автомагнат'],
];

// ---------- мелочи ----------
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function wpick(arr, wf) {
  const ws = arr.map(wf), sum = ws.reduce((s, w) => s + w, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
}
function roundPrice(n) {
  const step = n < 100000 ? 1000 : n < 1000000 ? 5000 : 10000;
  return Math.max(step, Math.round(n / step) * step);
}
const money = n => (n < 0 ? '−' : '') + Math.round(Math.abs(n)).toLocaleString('ru-RU') + ' ₽';
const km = n => Math.round(n).toLocaleString('ru-RU') + ' км';

// ---------- состояние ----------
let S = null;

function newGame() {
  S = {
    v: 1, day: 1, money: START_MONEY, rep: 50, slots: 2, nextId: 1,
    listings: [], garage: [], log: [],
    stats: { bought: 0, sold: 0, profit: 0, best: 0, caught: 0 },
    savedAt: 0, seenHelp: false,
    wh: newWh(),
  };
  for (let i = 0; i < 14; i++) S.listings.push(genListing(ri(0, 2)));
  S.up = {}; S.lots = []; refreshLots();
  addLog('Начал карьеру перекупа с ' + money(START_MONEY) + ' в кармане.');
}

function newWh() { return { last: 0, shifts: 0, earned: 0, best: 0, seed: ri(1, 1e6) }; }
function addLog(t) { S.log.unshift({ d: S.day, t }); if (S.log.length > 60) S.log.length = 60; }
function level() {
  let i = 0; while (i + 1 < LEVELS.length && S.stats.profit >= LEVELS[i + 1][0]) i++;
  return { i, title: LEVELS[i][1], next: LEVELS[i + 1] ? LEVELS[i + 1][0] : null, cur: LEVELS[i][0] };
}

// ---------- оценка ----------
function age(car) { return Math.max(0.5, YEAR_NOW - car.year); }

// Цена машины, если смотреть на неё вот так (view: пробег, износ узлов, ДТП, владельцы, такси)
function valueOf(car, v) {
  const md = MODELS[car.m], a = age(car);
  let base = car.tune || md.priceNew * Math.max(0.08, Math.pow(0.87, a));
  if (md.classic && a > 22) base *= 1 + Math.min(2, (a - 22) * 0.06);
  const exp = a * (md.body === 'moto' ? 5000 : 16000);
  const mf = clamp(1 + (exp - v.km) / (exp + 80000) * 0.3, 0.55, 1.12);
  let wearLoss = 0;
  for (const p of PARTS) wearLoss += p.share * (v.wear[p.k] || 0) / 100 * 1.3;
  const cond = Math.max(0.22, 1 - wearLoss);
  const hist = Math.pow(0.92, v.acc) * Math.pow(0.985, Math.max(0, v.owners - 2)) * (v.taxi ? 0.88 : 1);
  return base * mf * cond * hist;
}
// База для расчёта ремонта: цена «целой» машины этого года и пробега
function partBase(car) {
  const full = {}; PARTS.forEach(p => full[p.k] = 0);
  return valueOf(car, { km: car.km, wear: full, acc: 0, owners: 1, taxi: false });
}
// Рыночная цена «как на Авито»: такая же машина того же года и пробега в среднем состоянии
function marketRef(car) {
  const w = {}; PARTS.forEach(p => w[p.k] = 18);
  return roundPrice(valueOf(car, { km: car.kmShown, wear: w, acc: 0, owners: Math.min(car.ownersSaid, 3), taxi: false }));
}
function trueView(car) { return { km: car.km, wear: car.wear, acc: car.acc, owners: car.owners, taxi: car.taxi }; }
function trueValue(car) { return valueOf(car, trueView(car)); }

// Как машину видит продавец в своём объявлении (то, что он «сказал»)
function saidView(car) {
  const w = {}; PARTS.forEach(p => w[p.k] = car.declared[p.k] ? car.wear[p.k] : 10);
  return { km: car.kmShown, wear: w, acc: car.accSaid, owners: car.ownersSaid, taxi: car.taxiSaid };
}
// Что знает игрок
function knownView(car) {
  const k = car.k, w = {};
  PARTS.forEach(p => w[p.k] = k.insp ? car.wear[p.k] : car.declared[p.k] ? car.wear[p.k] : 15);
  return {
    km: k.auto ? car.km : car.kmShown, wear: w,
    acc: k.auto ? car.acc : car.accSaid, owners: k.auto ? car.owners : car.ownersSaid, taxi: k.auto ? car.taxi : car.taxiSaid,
  };
}
// Как машину оценит покупатель: износ видит вживую, историю — только если пробьёт
function buyerView(car, checked) {
  return checked ? trueView(car)
    : { km: car.kmShown, wear: car.wear, acc: 0, owners: Math.min(car.owners, 2), taxi: false };
}
const up = k => (S && S.up && S.up[k]) || 0;
function partMul(pk) { return (pk === 'body' && up('paint') ? 0.5 : 1) * (pk === 'electric' && up('scanner') ? 0.6 : 1); }
function repairCost(car, pk, diy) {
  const p = PARTS.find(x => x.k === pk);
  return roundPrice((p.share * partBase(car) * car.wear[pk] / 100 * (diy ? 0.35 * (1 - 0.1 * up('tools')) : 0.85) + (diy ? 500 : 2500)) * partMul(pk));
}

// Примерно за сколько уйдёт, если сделать весь известный ремонт сервисом
function flipEstimate(car) {
  const v = knownView(car), fixed = Object.assign({}, v, { wear: {} });
  let cost = 0;
  PARTS.forEach(p => { fixed.wear[p.k] = 0; if (v.wear[p.k] > 20) cost += p.share * partBase(car) * v.wear[p.k] / 100 * 0.85; else fixed.wear[p.k] = v.wear[p.k]; });
  return { sell: valueOf(car, fixed), repair: cost };
}

// ---------- генерация ----------
function genCar(opt = {}) {
  const lvl = S ? level().i : 0;
  const md = wpick(MODELS, m => (opt.cls && !opt.cls.includes(m.cls) ? 0 : m.weight) * (m.priceNew > 6000000 ? 0.35 + lvl * 0.25 : 1));
  const year = ri(md.from, Math.min(md.to, YEAR_NOW));
  const a = Math.max(0.5, YEAR_NOW - year);
  const taxi = ['econ', 'mid', 'biz'].includes(md.cls) && md.body !== 'moto' && chance(0.13);
  const perYear = md.body === 'moto' ? rnd(1500, 7000) : taxi ? rnd(40000, 75000) : rnd(8000, 26000);
  const kmReal = Math.min(999000, Math.round(a * perYear / 100) * 100 + ri(0, 3000));
  const careful = chance(md.classic ? 0.35 : 0.15); // гаражное хранение, бережный хозяин
  const wear = {};
  for (const p of PARTS) {
    let w = (a * rnd(1.5, 4.5) + kmReal / 10000 * rnd(0.8, 2.2)) * rnd(0.4, 1.25) * (careful ? 0.45 : 1) * 0.45 * (opt.wear || 1);
    if (chance(0.08)) w += rnd(15, 35) * (opt.wear || 1); // «сюрприз»
    wear[p.k] = Math.round(clamp(w, 0, 95));
  }
  let acc = 0; for (let i = 0; i < 3; i++) if (chance(0.1 + Math.min(0.15, a * 0.01))) acc++;
  const owners = Math.min(9, 1 + Math.floor(a / rnd(2.5, 7)));
  const color = wpick(COLORS.map((c, i) => i), i => COLORS[i].w);
  return {
    uid: S ? S.nextId++ : 0, m: md.id, year, color, km: kmReal, kmShown: kmReal, owners, ownersSaid: owners,
    acc, accSaid: acc, taxi, taxiSaid: taxi, wear, declared: {},
    legal: { zalog: 0, limit: 0, wanted: false }, k: { auto: false, probiv: false, insp: false },
    scene: pick(['garage', 'street', 'yard', 'snow', 'sunset']), twisted: false, clean: false, ph: ri(0, 5),
  };
}

function genListing(ageDays) {
  const car = genCar(), md = MODELS[car.m];
  // кто продаёт — зависит от машины
  const st = wpick(SELLERS, s => ({
    ded: md.classic || car.year < 2005 ? 4 : 1, baryga: 3, wife: 2, taxi: car.taxi ? 6 : 0.5,
    boss: md.cls === 'prem' || md.cls === 'biz' ? 4 : 0.3, student: md.cls === 'econ' || md.cls === 'sport' ? 2.5 : 0.6,
    salon: car.year >= 2015 ? 3 : 0.2,
    ozon: md.cls === 'econ' || md.cls === 'mid' || md.cls === 'comm' ? 1.2 : 0.3, den: 0.12, yan: 0.12,
  })[s.k]);
  // что продавец «забыл» сказать
  for (const p of PARTS) car.declared[p.k] = car.wear[p.k] > 40 && chance(st.honesty);
  if (chance(st.twist) && car.km > 60000) car.kmShown = Math.round(car.km * rnd(0.4, 0.72) / 1000) * 1000;
  if (!chance(st.honesty)) car.ownersSaid = Math.max(1, car.owners - ri(1, 3));
  if (!chance(st.honesty)) car.accSaid = 0;
  if (!chance(st.honesty)) car.taxiSaid = false;
  const est = valueOf(car, saidView(car));
  if (chance(st.k === 'baryga' ? 0.12 : 0.06)) car.legal.zalog = roundPrice(est * rnd(0.2, 0.6));
  if (chance(0.1)) car.legal.limit = roundPrice(rnd(3000, 45000));
  if (chance(st.k === 'baryga' ? 0.06 : 0.015)) car.legal.wanted = true;

  const urgent = chance(0.09);
  let ask = est * rnd(st.ask[0], st.ask[1]) * (urgent ? 0.82 : 1);
  let floor = est * rnd(st.floor[0], st.floor[1]) * (urgent ? 0.88 : 1);
  if (car.legal.wanted) { ask *= 0.75; floor *= 0.7; } // краденое всегда подозрительно дёшево
  ask = roundPrice(ask); floor = Math.min(ask, roundPrice(floor));

  const lines = [];
  const bad = PARTS.filter(p => car.declared[p.k]);
  if (bad.length === 0) lines.push(...shuffle(AD_GOOD).slice(0, ri(1, 3)));
  else { lines.push(...bad.map(p => AD_BAD[p.k])); if (chance(0.5)) lines.push(pick(AD_GOOD)); }
  if (car.ownersSaid === 1) lines.push('Один владелец по ПТС.');
  if (car.taxiSaid) lines.push('Работала в такси, обслуживалась в парке.');
  if (car.accSaid > 0) lines.push('Были мелкие ДТП, всё восстановлено.');
  lines.push(st.k === 'den' ? 'Продаю, всё равно прав нет. Найти меня можно на ромашке 🌼' : st.k === 'yan' ? 'Принимал сам, брака нет 😎 Смотреть после приёмки.'
    : st.k === 'ozon' ? pick(AD_OZON) : pick(AD_TAIL));

  return {
    id: S ? S.nextId++ : Math.random(), car, seller: SELLERS.indexOf(st), sname: pick(st.name), city: pick(CITIES),
    posted: (S ? S.day : 1) - (ageDays || 0), expires: (S ? S.day : 1) + (urgent ? ri(0, 1) : ri(1, 5)),
    ask, ask0: ask, floor, patience: st.patience, pointed: [], cash: false, deal: 0, called: false, gone: false,
    urgent, text: lines.join(' '), chat: [],
  };
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- проверки ----------
function canPay(sum) { return S.money >= sum; }
function pay(sum) { S.money -= sum; }
function inspectPrice(l) { return roundPrice(Math.min(15000, 2500 + l.ask * 0.002) * (up('scanner') ? 0.5 : 1)); }

// Проблемы, которые игрок нашёл и может предъявить продавцу
function foundIssues(l) {
  const c = l.car, k = c.k, out = [];
  if (k.auto) {
    if (c.km - c.kmShown > 15000) out.push({ id: 'km', icon: 'gauge', n: 'Скручен пробег', t: 'По автотеке пробег ' + km(c.km) + ', а не ' + km(c.kmShown) });
    if (c.acc > c.accSaid) out.push({ id: 'acc', icon: 'crash', n: 'Скрытые ДТП', t: 'В истории ' + c.acc + ' ДТП' });
    if (c.owners > c.ownersSaid) out.push({ id: 'own', icon: 'people', n: 'Больше владельцев', t: 'На деле ' + c.owners + ' владельцев' });
    if (c.taxi && !c.taxiSaid) out.push({ id: 'taxi', icon: 'taxi', n: 'Бывшее такси', t: 'Машина работала в такси' });
  }
  if (k.probiv) {
    if (c.legal.wanted) out.push({ id: 'wanted', icon: 'siren', n: 'В угоне!', t: 'Машина числится в розыске' });
    if (c.legal.zalog) out.push({ id: 'zalog', icon: 'bank', n: 'Залог в банке', t: 'Висит залог на ' + money(c.legal.zalog) });
    if (c.legal.limit) out.push({ id: 'limit', icon: 'lock', n: 'Ограничения', t: 'Штрафы и запрет на регистрацию' });
  }
  if (k.insp) for (const p of PARTS) if (c.wear[p.k] > 35 && !c.declared[p.k]) out.push({ id: p.k, icon: p.icon, n: p.n, t: p.n + ': износ ' + c.wear[p.k] + '%' });
  return out;
}

// ---------- торг ----------
function say(l, who, t) {
  if (l.special === 'yan' && who === 's' && l.chat.length) t = pick(YAN_EPIC) + ' ' + t;
  l.chat.push({ w: who, t });
}

function callSeller(l) {
  const st = SELLERS[l.seller];
  if (!l.called) { l.called = true; say(l, 's', l.special === 'yan' ? 'Здарова! Да, продаю свою ласточку. Только сразу: это не просто семёрка, это семёрка Яна с приёмки.' : pick(st.hello)); }
}

function pointIssue(l, id) {
  const c = l.car, est = valueOf(c, saidView(c));
  const iss = foundIssues(l).find(x => x.id === id);
  if (!iss || l.pointed.includes(id) || l.gone) return;
  l.pointed.push(id);
  say(l, 'p', pointLine(id, c));
  let d = 0;
  if (id === 'wanted') { say(l, 's', '...'); say(l, 'sys', 'Продавец бросил трубку. Объявление снято.'); l.gone = true; l.patience = 0; return; }
  if (id === 'zalog') { c.legal.zalog = 0; say(l, 's', 'Ой... ну да, кредит. Ладно, закрою залог сам перед сделкой, не переживай.'); return; }
  if (id === 'limit') { c.legal.limit = 0; say(l, 's', 'Штрафы? Да там копейки, оплачу до сделки.'); return; }
  if (id === 'km') d = est - valueOf(c, Object.assign(saidView(c), { km: c.km }));
  else if (id === 'acc') d = est * (1 - Math.pow(0.92, c.acc - c.accSaid));
  else if (id === 'own') d = est * (1 - Math.pow(0.985, c.owners - c.ownersSaid)) + est * 0.015;
  else if (id === 'taxi') d = est * 0.12;
  else { const p = PARTS.find(x => x.k === id); d = p.share * partBase(c) * c.wear[id] / 100 * 0.9; }
  d = roundPrice(Math.max(1000, d));
  const st = SELLERS[l.seller];
  if (st.k === 'salon' || st.k === 'boss') d = roundPrice(d * 0.7);
  l.ask = Math.max(roundPrice(l.ask0 * 0.55), l.ask - d);
  l.floor = Math.min(l.ask, Math.max(roundPrice(l.floor * 0.5), l.floor - roundPrice(d * 0.9)));
  say(l, 's', pick(['Хорошо, раз вы знаете про это, скину ' + money(d) + '.', 'Ну... было дело. Ладно, минус ' + money(d) + '.',
    'Эх, глазастый. Давай ' + money(l.ask) + ' и разойдёмся.', 'Ладно-ладно, уступлю ' + money(d) + '. Но это последнее!']));
}
function pointLine(id, c) {
  return ({
    km: 'Я пробил по автотеке: пробег-то скручен, там ' + km(c.km) + '.', acc: 'В автотеке ДТП, а у вас написано «не бита».',
    own: 'Владельцев там больше, чем вы говорите.', taxi: 'Машина-то из такси, это видно по истории.',
    wanted: 'Слушайте, а машина-то в розыске числится...', zalog: 'На машине висит залог в банке, вы в курсе?',
    limit: 'На ней ограничения ГИБДД и штрафы.',
  })[id] || ('Подборщик нашёл проблему: ' + PARTS.find(p => p.k === id).n.toLowerCase() + ', износ ' + c.wear[id] + '%.');
}

function cashTrick(l) {
  if (l.cash || l.gone) return;
  l.cash = true;
  say(l, 'p', 'Деньги наличкой, приеду через час. Скинете за скорость?');
  const d = roundPrice(l.ask * rnd(0.02, 0.04));
  l.ask -= d; l.floor = Math.min(l.ask, l.floor - roundPrice(d * 0.5));
  say(l, 's', pick(['Наличкой? Ну ладно, ' + money(l.ask) + '.', 'Давай так: ' + money(l.ask) + ', и приезжай быстрее.']));
}

// Предложение цены. Возвращает 'deal' | 'counter' | 'no' | 'hangup'
function offerPrice(l, x) {
  if (l.gone || l.deal) return;
  x = roundPrice(x);
  say(l, 'p', 'Отдадите за ' + money(x) + '?');
  if (x >= l.ask) { l.deal = l.ask; say(l, 's', 'По рукам! Приезжайте, оформим.'); return 'deal'; }
  const span = Math.max(1, l.ask - l.floor);
  if (x >= l.floor + span * 0.65) { l.deal = x; say(l, 's', pick(['Эх... Ладно, забирай за ' + money(x) + '.', 'Ну ты и торгаш. Договорились!'])); return 'deal'; }
  if (x >= l.floor) {
    l.patience--;
    const c = roundPrice((x + l.ask) / 2);
    l.ask = Math.max(c, l.floor);
    if (l.patience <= 0) { l.deal = l.ask; say(l, 's', 'Всё, последняя цена ' + money(l.ask) + '. Берёшь — приезжай.'); return 'deal'; }
    say(l, 's', pick(['Давай ' + money(l.ask) + ', и то из уважения.', 'Не, за столько не могу. ' + money(l.ask) + ' — и по рукам.', 'Встретимся посередине: ' + money(l.ask) + '.']));
    return 'counter';
  }
  l.patience -= x < l.floor * 0.85 ? 2 : 1;
  if (l.patience <= 0) {
    l.gone = true;
    say(l, 's', pick(['Ты издеваешься? Всё, не звони сюда больше.', 'Перекупам не продаю! *гудки*', 'Иди на завод работай. *бросил трубку*']));
    return 'hangup';
  }
  const hint = roundPrice(l.floor * rnd(1.02, 1.08));
  say(l, 's', x < l.floor * 0.85 ? pick(['Ты чё, угараешь? Ещё раз такое скажешь — положу трубку.', 'Это шутка такая? Нет.'])
    : pick(['Нет, это мало. Меньше ' + money(hint) + ' даже не предлагай.', 'Ну нет. Ближе к ' + money(hint) + ' давай.']));
  return 'no';
}

function buyListing(l) {
  const price = l.deal;
  if (!price || l.gone) return 'Сначала договоритесь о цене';
  if (S.garage.length >= S.slots) return 'В гараже нет места';
  if (!canPay(price)) return 'Не хватает денег';
  pay(price);
  const c = l.car;
  S.garage.push({ car: c, paid: price, spent: 0, boughtDay: S.day, sale: null, offers: [] });
  S.listings = S.listings.filter(x => x !== l);
  S.stats.bought++;
  addLog('Купил ' + carName(c) + ' за ' + money(price) + '.');
  return null;
}

// ---------- гараж ----------
function gItem(uid) { return S.garage.find(g => g.car.uid === uid); }
function repair(g, pk, diy) {
  const c = g.car, cost = repairCost(c, pk, diy);
  if (!canPay(cost)) return 'Не хватает денег';
  pay(cost); g.spent += cost;
  if (diy) {
    const fail = chance(diyFail());
    c.wear[pk] = fail ? Math.round(c.wear[pk] * 0.8) : Math.round(c.wear[pk] * (up('lift') ? rnd(0.06, 0.14) : rnd(0.2, 0.35)));
    return fail ? 'Руки из жопы: починил так себе' : null;
  }
  c.wear[pk] = ri(0, 3);
  return null;
}
// Запчасть с Ozon: дешевле, но едет 1–3 дня и бывает пересорт. Ставишь сам.
function ozonCost(car, pk) {
  const p = PARTS.find(x => x.k === pk);
  return roundPrice(p.share * partBase(car) * car.wear[pk] / 100 * 0.2 + 199);
}
function orderOzon(g, pk) {
  const cost = ozonCost(g.car, pk);
  if (!canPay(cost)) return 'Не хватает денег';
  pay(cost); g.spent += cost;
  (g.orders = g.orders || []).push({ pk, at: S.day + ri(1, 3), wrong: chance(0.15) });
  return null;
}
const ordered = (g, pk) => (g.orders || []).find(o => o.pk === pk);
function deliverOrders(ev) {
  for (const g of S.garage) for (const o of (g.orders || []).slice()) {
    if (o.at > S.day) continue;
    const pn = PARTS.find(x => x.k === o.pk).n;
    if (o.wrong) {
      o.wrong = chance(0.05); o.at = S.day + ri(1, 2);
      ev.push({ t: '📦 Ozon: пересорт!', s: 'Ждал «' + pn + '» для ' + carName(g.car) + ', а в коробке — ' + pick(WH.junk) + '. Перезаказал бесплатно.' });
      continue;
    }
    const fail = chance(0.12), w = g.car.wear[o.pk];
    g.car.wear[o.pk] = fail ? Math.round(w * 0.8) : Math.round(w * rnd(0.2, 0.35));
    g.orders = g.orders.filter(x => x !== o);
    ev.push({ t: '📦 Ozon привёз: ' + pn, s: carName(g.car) + (fail ? ' — поставил криво, но едет' : ' — поставил сам, норм') });
  }
}

// ---------- склад Ozon ----------
const isPayday = d => d % 7 === 0;
// Какой сегодня день на складе: коэффициент и сколько товара. Детерминированно от дня, чтобы не перероллить.
function whDay(d) {
  let x = (S.wh.seed * 9301 + d * 49297) % 233280; x = ((x * 9301 + 49297) % 233280) / 233280;
  const y = ((d * 7919 + S.wh.seed) % 1000) / 1000;
  if (x < 0.13) return { coef: 1.25 + Math.round(y * 15) / 100, flow: 'high', t: 'Коэффициент повышен!' };
  if (x < 0.33) return { coef: 1, flow: 'low', t: 'Мало товара' };
  if (x < 0.5) return { coef: 1, flow: 'high', t: 'Товара завались' };
  return { coef: 1, flow: 'norm', t: 'Обычный день' };
}
// Спидометр: каждые 2000 пиков — бонус, и он растёт: 200, 400, 600…
const speedBonus = picks => { const n = Math.floor(picks / 2000); return 100 * n * (n + 1); };
function shiftPay(ppc, good, d) {
  const picks = good * ppc, base = Math.round(picks * d.coef), bonus = speedBonus(picks);
  return { picks, base, bonus, total: base + bonus };
}
function finishShift(title, res) {
  S.money += res.total;
  S.wh.last = S.day; S.wh.shifts++; S.wh.earned += res.total; S.wh.best = Math.max(S.wh.best, res.total);
  addLog('Смена на ' + WH.name + ' (' + title + '): ' + res.picks + ' пиков, ' + money(res.total) + '.');
}

const diyFail = () => Math.max(0.015, 0.12 - 0.035 * up('tools'));
const washPrice = () => up('wash') ? 500 : PRICES.wash;
function wash(g) { const p = washPrice(); if (!canPay(p)) return 'Не хватает денег'; pay(p); g.spent += p; g.car.clean = true; return null; }
function upPrice(u) { const lv = up(u.k); return lv < u.price.length ? u.price[lv] : null; }
function buyUpgrade(k) {
  const u = UPGRADES.find(x => x.k === k), p = upPrice(u);
  if (p == null) return 'Уже максимум';
  if (!canPay(p)) return 'Не хватает денег';
  pay(p); S.up[k] = up(k) + 1;
  addLog('Гараж: ' + (u.lv ? u.lv[S.up[k] - 1] : u.n) + ' за ' + money(p) + '.');
  return null;
}
const trustMul = () => 1 + 0.015 * up('room');
function twist(g) {
  const c = g.car;
  if (!canPay(PRICES.twist)) return 'Не хватает денег';
  pay(PRICES.twist); g.spent += PRICES.twist;
  c.kmShown = Math.max(5000, Math.round(c.kmShown * rnd(0.45, 0.65) / 1000) * 1000); c.twisted = true;
  return null;
}
function clearZalog(g) { const s = g.car.legal.zalog; if (!canPay(s)) return 'Не хватает денег'; pay(s); g.spent += s; g.car.legal.zalog = 0; return null; }
function clearLimit(g) { const s = g.car.legal.limit + 1500; if (!canPay(s)) return 'Не хватает денег'; pay(s); g.spent += s; g.car.legal.limit = 0; return null; }
function checkOwn(g, what) {
  const cost = PRICES[what === 'auto' ? 'autoteka' : 'probiv'];
  if (!canPay(cost)) return 'Не хватает денег';
  pay(cost); g.spent += cost; g.car.k[what] = true; return null;
}
function marketPrice(g) {
  return roundPrice(valueOf(g.car, buyerView(g.car, false)) * (1 + (S.rep - 50) / 600) * (g.car.clean ? 1.03 : 1) * trustMul());
}
function listForSale(g, price) { g.sale = { price: roundPrice(price), day: S.day }; g.offers = []; }
function unlist(g) { g.sale = null; g.offers = []; }
function quickSell(g) {
  const p = roundPrice(trueValue(g.car) * 0.72);
  finishSale(g, p, 'перекупу на месте');
  return p;
}
function finishSale(g, price, who) {
  S.money += price;
  const profit = price - g.paid - g.spent;
  S.stats.sold++; S.stats.profit += profit; S.stats.best = Math.max(S.stats.best, profit);
  S.rep = clamp(S.rep + (profit > 0 ? 1 : 0), 0, 100);
  S.garage = S.garage.filter(x => x !== g);
  addLog('Продал ' + carName(g.car) + ' (' + who + ') за ' + money(price) + '. ' + (profit >= 0 ? 'Навар ' : 'Минус ') + money(Math.abs(profit)) + '.');
  if (g.car.twisted) S.sold = (S.sold || []).concat([{ name: carName(g.car), day: S.day }]);
  return profit;
}
function slotPrice() { return 200000 * Math.pow(2, S.slots - 2); }
function buySlot() { const p = slotPrice(); if (S.slots >= 8) return 'Больше мест нет'; if (!canPay(p)) return 'Не хватает денег'; pay(p); S.slots++; return null; }

// ---------- покупатели ----------
function genOffers(g) {
  const c = g.car, md = MODELS[c.m], mp = marketPrice(g), price = g.sale.price;
  const ratio = price / mp;
  const demand = { econ: 1.3, mid: 1.15, biz: 0.9, prem: 0.7, suv: 1.1, sport: 0.8, classic: 0.7, moto: 0.8, comm: 0.9 }[md.cls] || 1;
  const lambda = 1.5 * clamp((1.28 - ratio) / 0.35, 0.04, 1.7) * demand * (0.6 + S.rep / 125) * (up('sign') ? 1.2 : 1);
  let n = 0; let L = Math.exp(-lambda), p = 1; do { n++; p *= Math.random(); } while (p > L); n--;
  const out = [];
  for (let i = 0; i < Math.min(n, 4); i++) {
    const b = wpick(BUYERS, x => x.k === 'boss' ? (md.cls === 'prem' || md.cls === 'sport' ? 3 : 0.5) : x.k === 'granny' ? 0.4
      : x.k === 'klad' ? (isPayday(S.day) && price < 1500000 ? 4 : 0.4) : x.k === 'podryad' ? (md.cls === 'comm' ? 3 : 0) : 1.5);
    const checks = chance(b.check + (price > 1500000 ? 0.2 : 0));
    let v = valueOf(c, buyerView(c, checks)) * (1 + (S.rep - 50) / 600) * (c.clean ? 1.03 : 1) * trustMul();
    const name = pick(b.name);
    if (checks && c.twisted) {
      S.rep = clamp(S.rep - 5, 0, 100); S.stats.caught++;
      return [{ id: S.nextId++, face: b.face, name, caught: true, text: 'Пробил по автотеке: пробег скручен! Обещал рассказать всем на районе.' }];
    }
    if (checks && (c.legal.zalog || c.legal.limit || c.legal.wanted)) {
      out.push({ id: S.nextId++, face: b.face, name, caught: true, text: 'Пробил по базам: ' + (c.legal.wanted ? 'машина в угоне!' : c.legal.zalog ? 'висит залог.' : 'есть ограничения.') + ' Не беру.' });
      continue;
    }
    const max = roundPrice(v * rnd(b.pay[0], b.pay[1]));
    const offer = roundPrice(Math.min(price, max * rnd(0.86, 0.97)));
    if (offer < price * 0.6) continue;
    out.push({ id: S.nextId++, face: b.face, name, offer, max, patience: 2, checked: checks,
      text: b.k === 'podryad' ? pick(['Беру под развоз для Ozon. Даю ' + money(offer) + '.', 'Нам на Волхонку нужна ещё машина. ' + money(offer) + ', и забираю завтра.'])
        : b.k === 'klad' ? pick(['Зарплату получил — беру за ' + money(offer) + '!', 'Со склада пацаны скинулись, даём ' + money(offer) + '.'])
        : offer >= price ? pick(['Беру за вашу цену, когда можно приехать?', 'Готов забрать хоть сегодня по цене объявления.'])
        : pick(['Посмотрел машину. Готов взять за ' + money(offer) + '.', 'Скинете до ' + money(offer) + '? Деньги на руках.', 'Предлагаю ' + money(offer) + ', больше не дам, жена убьёт.', 'За ' + money(offer) + ' забрал бы.']) });
  }
  return out;
}
function counterOffer(g, o, x) {
  x = roundPrice(x);
  if (x <= o.max) { o.offer = x; o.text = 'Ладно, уговорили: ' + money(x) + '.'; o.agreed = true; return 'ok'; }
  o.patience--;
  if (o.patience <= 0 || x > o.max * 1.15) { g.offers = g.offers.filter(z => z !== o); return 'left'; }
  o.offer = o.max; o.text = 'Максимум ' + money(o.max) + ', дальше не двигаюсь.'; return 'counter';
}

// ---------- новый день ----------
function nextDay() {
  const ev = [];
  S.day++;
  const rent = 700 * S.slots;
  S.money -= rent;
  ev.push({ t: 'Аренда гаража', v: -rent });

  // Объявления: кто-то купил раньше вас, кто-то снял
  const before = S.listings.length;
  S.listings = S.listings.filter(l => !l.gone && l.expires >= S.day && !(chance(l.urgent ? 0.5 : 0.12) && !l.deal));
  const gone = before - S.listings.length;
  const fresh = clamp(26 - S.listings.length, 4, 10);
  for (let i = 0; i < fresh; i++) S.listings.unshift(genListing(0));
  ev.push({ t: 'Новых объявлений', s: '+' + fresh + (gone ? ', ушло ' + gone : '') });
  S.listings.forEach(l => { if (!l.gone && !l.deal) l.patience = Math.max(l.patience, 1); });

  deliverOrders(ev);
  refreshLots();
  if (!S.yanDone && S.day >= 3 && chance(0.4)) { S.listings.unshift(genYanListing()); S.yanDone = true; ev.push({ t: '👀 Новое объявление от Яна с приёмки', s: 'ВАЗ 2107 «Хамелеон» — глянь в объявлениях' }); }
  if (isPayday(S.day)) ev.push({ t: '💸 День зарплаты на складе', s: 'кладовщики при деньгах — покупателей больше' });
  // Гараж: менты за краденым, покупатели
  for (const g of S.garage.slice()) {
    if (g.car.legal.wanted && chance(0.45)) {
      S.garage = S.garage.filter(x => x !== g);
      S.stats.profit -= g.paid + g.spent;
      addLog('Полиция изъяла ' + carName(g.car) + ': машина была в угоне. Минус ' + money(g.paid + g.spent) + '.');
      ev.push({ t: '🚨 Изъяли ' + carName(g.car), s: 'машина была в угоне', v: -(g.paid + g.spent) });
      continue;
    }
    if (g.sale) {
      g.offers = g.offers.filter(o => o.agreed);
      const o = genOffers(g);
      g.offers.push(...o);
      const real = o.filter(x => !x.caught).length;
      if (o.length) ev.push({ t: carName(g.car), s: real ? real + ' ' + plural(real, 'покупатель', 'покупателя', 'покупателей') : o[0].text });
    }
  }
  // отложенная расплата за скрученный пробег
  if (S.sold && S.sold.length) {
    S.sold = S.sold.filter(s => {
      if (S.day - s.day > 6) return false;
      if (chance(0.12)) { S.rep = clamp(S.rep - 7, 0, 100); S.stats.caught++; ev.push({ t: '😡 Покупатель ' + s.name, s: 'узнал про скрученный пробег, репутация −7' }); addLog('Покупатель ' + s.name + ' узнал про скрутку. Репутация −7.'); return false; }
      return true;
    });
  }
  return ev;
}
// ---------- гаражи с сюрпризом ----------
function genLot() {
  const T = pick(LOT_TYPES), car = genCar({ cls: T.cls, wear: T.wear });
  const md = MODELS[car.m];
  if (chance(T.docs)) { if (chance(0.5)) car.legal.zalog = roundPrice(trueValue(car) * rnd(0.15, 0.5)); else car.legal.limit = roundPrice(rnd(5000, 60000)); }
  if (T.k === 'abandon') { car.clean = false; car.kmShown = car.km; }
  const ask = roundPrice(Math.max(30000, trueValue(car) * rnd(T.f[0], T.f[1])));
  const hints = ['Сквозь щель в воротах: ' + BODY_NAMES[md.body] + '.'];
  if (chance(0.45)) hints.push('На ключах брелок ' + md.brand + '.');
  if (chance(0.35)) hints.push('Год примерно ' + (Math.round(car.year / 5) * 5) + '-й.');
  return { id: S.nextId++, type: LOT_TYPES.indexOf(T), car, ask, ask0: ask, floor: roundPrice(ask * rnd(0.74, 0.88)), patience: 3, deal: 0, chat: [],
    seller: pick(LOT_SELLERS), city: pick(['Санкт-Петербург', 'Мурино', 'Кудрово', 'Колпино', 'Гатчина', 'Петергоф', 'Всеволожск']), hints, until: S.day + ri(2, 4) };
}
function refreshLots() {
  S.lots = (S.lots || []).filter(x => x.until >= S.day && !x.gone);
  while (S.lots.length < 3) S.lots.push(genLot());
}
function lotOffer(lot, x) {
  x = roundPrice(x);
  lot.chat.push({ w: 'p', t: 'Отдадите за ' + money(x) + '?' });
  const s = t => lot.chat.push({ w: 's', t });
  if (x >= lot.ask) { lot.deal = lot.ask; s('Забирай, ключи у меня.'); return 'deal'; }
  if (x >= lot.floor) {
    lot.patience--;
    if (x >= lot.floor + (lot.ask - lot.floor) * 0.6 || lot.patience <= 0) { lot.deal = x; s('Ладно, по рукам. Только что внутри — сам разбирайся.'); return 'deal'; }
    lot.ask = Math.max(lot.floor, roundPrice((x + lot.ask) / 2)); s('Не, давай ' + money(lot.ask) + ', там же машина целая. Наверное.'); return 'counter';
  }
  lot.patience -= x < lot.floor * 0.8 ? 2 : 1;
  if (lot.patience <= 0) { lot.gone = true; s('Всё, продам другому. Не звони.'); return 'gone'; }
  s(pick(['Ты что, за такие деньги только ворота заберёшь.', 'Мало. Тут одних колёс на больше.'])); return 'no';
}
function buyLot(lot) {
  if (!lot.deal || lot.gone) return 'Сначала договоритесь';
  if (S.garage.length >= S.slots) return 'В гараже нет места';
  if (!canPay(lot.deal)) return 'Не хватает денег';
  pay(lot.deal);
  S.garage.push({ car: lot.car, paid: lot.deal, spent: 0, boughtDay: S.day, sale: null, offers: [] });
  S.lots = S.lots.filter(x => x !== lot);
  S.stats.bought++;
  addLog('Купил «' + LOT_TYPES[lot.type].n.toLowerCase() + '» за ' + money(lot.deal) + ', а там ' + carName(lot.car) + '.');
  return null;
}

// ---------- пасхалка: семёрка Яна ----------
function genYanListing() {
  const m = MODELS.findIndex(x => x.brand === 'ВАЗ' && x.name === '2107');
  const car = genCar();
  Object.assign(car, { m, year: 2006, km: 187000, kmShown: 187000, owners: 3, ownersSaid: 3, acc: 0, accSaid: 0, taxi: false, taxiSaid: false,
    wear: { engine: 14, gearbox: 18, suspension: 9, body: 6, electric: 22, interior: 12 }, declared: {}, legal: { zalog: 0, limit: 0, wanted: false },
    tune: 1450000, photo: 'img/yan-2107.jpg', title: 'ВАЗ 2107 «Хамелеон»' });
  return { id: S.nextId++, car, seller: SELLERS.findIndex(x => x.k === 'yan'), sname: 'Ян с приёмки', city: 'Санкт-Петербург', posted: S.day, expires: S.day + 7,
    ask: 1200000, ask0: 1200000, floor: 980000, patience: 6, pointed: [], cash: false, deal: 0, called: false, gone: false, urgent: false, special: 'yan', chat: [],
    text: 'Продаю свою ласточку. Хамелеон, неон, интеркулер наружу, бронзовые диски, расширители арок, низкая. Вложено больше, чем заработал на приёмке за год. ' +
      'Не бита, гнила нет, всё по уму. Торг у капота, но как своему. Смотреть после смены на СЦ Волхонское.' };
}

function plural(n, a, b, c) { n = Math.abs(n) % 100; const d = n % 10; if (n > 10 && n < 20) return c; if (d > 1 && d < 5) return b; if (d === 1) return a; return c; }
function carName(c) { const m = MODELS[c.m]; return c.title || m.brand + ' ' + m.name; }

// ---------- сохранение: localStorage + облако Telegram ----------
const SAVE_KEY = 'perekup_save_v1';
const tg = window.Telegram && window.Telegram.WebApp;
const cloudOk = () => tg && tg.initData && tg.CloudStorage && tg.isVersionAtLeast && tg.isVersionAtLeast('6.9');

function save() {
  S.savedAt = Date.now();
  const json = JSON.stringify(S);
  try { localStorage.setItem(SAVE_KEY, json); } catch (e) { }
  clearTimeout(save.t); save.t = setTimeout(() => cloudSave(json), 800);
}
function cloudSave(json) {
  if (!cloudOk()) return;
  const parts = []; for (let i = 0; i < json.length; i += 3800) parts.push(json.slice(i, i + 3800));
  parts.forEach((p, i) => tg.CloudStorage.setItem('s' + i, p));
  tg.CloudStorage.setItem('sn', String(parts.length));
}
function cloudLoad() {
  return new Promise(res => {
    if (!cloudOk()) return res(null);
    const t = setTimeout(() => res(null), 2500);
    tg.CloudStorage.getItem('sn', (err, n) => {
      n = parseInt(n); if (err || !n) { clearTimeout(t); return res(null); }
      const keys = []; for (let i = 0; i < n; i++) keys.push('s' + i);
      tg.CloudStorage.getItems(keys, (e2, vals) => {
        clearTimeout(t);
        if (e2 || !vals) return res(null);
        try { res(JSON.parse(keys.map(k => vals[k] || '').join(''))); } catch (x) { res(null); }
      });
    });
  });
}
async function load() {
  let local = null;
  try { local = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { }
  const cloud = await cloudLoad();
  const best = [local, cloud].filter(x => x && x.v === 1).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
  if (best) S = best; else newGame();
  if (!S.wh) S.wh = newWh();
  if (!S.up) S.up = {};
  if (!S.lots) { S.lots = []; refreshLots(); }
}
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  newGame(); save();
}
