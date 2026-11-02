// Склад Ozon (СЦ Волхонское): вкладка «Склад» и мини-игры — ромашка (буквы A–K), приёмка, аллея, грузчик.

const SHIFT_SEC = 45;
const FLOW_K = { low: 1.6, norm: 1, high: 0.75 }; // как день на складе меняет поток товара
const LETTER_COL = { A: '#e5463b', B: '#f6c21c', C: '#2f9cf0', D: '#8bd43a', E: '#b56cf0', K: '#ff8a3d', Q: '#ff8a3d' };
let GM = null;

// ---------- вкладка ----------
function viewWarehouse() {
  const d = whDay(S.day), worked = S.wh.last === S.day;
  const payday = isPayday(S.day) ? 'сегодня' : 'через ' + (7 - S.day % 7) + ' дн.';
  const btn = (k, extra) => `<button class="btn block ${worked ? 'gray' : 'green'}" style="margin-top:10px" data-a="shift" data-k="${k}" ${worked ? 'disabled' : ''}>${worked ? 'Сегодня уже отработал' : 'Выйти на смену' + (extra || '')}</button>`;
  const role = (k, inner) => {
    const r = WH.roles[k];
    return `<div class="panel wh-role">
      <div class="row"><div class="wh-face">${r.ic}</div>
        <div style="flex:1;min-width:0"><b>${r.n}</b> <span class="sub">· ${r.who} · ${r.avg}</span><div class="sub">${r.text}</div></div></div>
      ${inner || ''}${btn(k, k === 'romashka' ? ' на букву ' + UI.whLetter : '')}
    </div>`;
  };
  const L = WH.letters[UI.whLetter];
  const letters = `<div class="wh-letters">${Object.keys(WH.letters).map(x => `<button class="wh-letter ${x === UI.whLetter ? 'on' : ''}" style="--c:${LETTER_COL[x]}" data-a="wl" data-k="${x}">${x}</button>`).join('')}</div>
    <div class="sub" style="margin-top:6px"><b style="color:var(--text)">Буква ${UI.whLetter}.</b> ${L.t}</div>`;
  const flow = ['Фура', 'Разгрузка', 'Приёмка', 'Ромашки A–K и аллея', 'Ворота', 'Погрузка', 'Фура'];
  return `<div class="screen-title">Склад Ozon</div>
  <div class="panel wh-head">
    <div class="sec-title">${WH.name}</div>
    <div class="grid2">
      <div class="plate ${d.coef > 1 ? 'green' : d.flow === 'low' ? 'red' : 'blue'}"><small>Сегодня</small><b>${d.t}${d.coef > 1 ? ' ×' + d.coef.toFixed(2) : ''}</b></div>
      <div class="plate beige"><small>Зарплата у кладовщиков</small><b>${payday}</b></div>
    </div>
    <div class="wh-flow">${flow.map(x => `<span>${x}</span>`).join('<i>›</i>')}</div>
    <div class="note">Смена занимает весь день. Платят за пики, в хорошие дни с коэффициентом. <b>Спидометр</b>: каждые 2000 пиков — бонус, и он растёт: 200, 400, 600 ₽… Ошибка съедает одно действие.</div>
  </div>
  ${role('romashka', letters)}${role('priemka')}${role('alleya')}${role('gruz')}
  <div class="panel flat">
    <div class="kv"><span>Смен отработано</span><b>${S.wh.shifts}</b></div>
    <div class="kv"><span>Заработано на складе</span><b class="g">${money(S.wh.earned)}</b></div>
    <div class="kv"><span>Лучшая смена</span><b>${money(S.wh.best)}</b></div>
  </div>`;
}

// ---------- запуск смены ----------
function gameEl() {
  let el = $('#game');
  if (!el) { el = document.createElement('div'); el.id = 'game'; document.body.appendChild(el); }
  return el;
}
function startShift(kind) {
  if (S.wh.last === S.day) return toast('Сегодня ты уже отработал', true);
  const d = whDay(S.day), r = WH.roles[kind];
  GM = { kind, d, good: 0, bad: 0, queue: 3, left: SHIFT_SEC, cur: null, timers: [], msg: '', lock: 0, t0: 0 };
  if (kind === 'romashka') {
    const L = WH.letters[UI.whLetter];
    Object.assign(GM, { letter: UI.whLetter, L, ppc: L.ppc, ms: L.ms * FLOW_K[d.flow], title: 'ромашка ' + UI.whLetter });
  } else Object.assign(GM, { ppc: r.ppc, ms: (r.ms || 1000) * FLOW_K[d.flow], title: r.n.toLowerCase() });
  if (kind === 'alleya') GM.boxes = [0, 0, 0, 0, 0, 0];
  if (kind === 'gruz') { GM.queue = 0; newTruck(); }
  const el = gameEl(); el.className = 'on';
  let n = 3;
  const tick = () => {
    el.innerHTML = `<div class="gm-count"><div class="sub">${r.n}${GM.letter ? ' · буква ' + GM.letter : ''} · ${esc(d.t)}</div><b>${n || 'Погнали'}</b></div>`;
    hap('light');
    if (n-- > 0) GM.timers.push(setTimeout(tick, 650)); else GM.timers.push(setTimeout(runShift, 450));
  };
  tick();
}
function runShift() {
  GM.t0 = Date.now();
  if (GM.kind !== 'gruz') {
    nextItem();
    GM.timers.push(setInterval(() => {
      // буква K: товар идёт партией только в начале смены
      if (GM.L && GM.L.burst && (Date.now() - GM.t0) / 1000 > SHIFT_SEC * 0.45) return;
      GM.queue = Math.min(GM.queue + 1, 12);
      if (!GM.cur) nextItem();
      drawGame();
    }, GM.ms));
  }
  drawGame();
  GM.timers.push(setInterval(() => {
    GM.left = Math.max(0, SHIFT_SEC - (Date.now() - GM.t0) / 1000);
    const bar = $('#gm-time'); if (bar) bar.style.width = (GM.left / SHIFT_SEC * 100) + '%';
    const sec = $('#gm-sec'); if (sec) sec.textContent = Math.ceil(GM.left);
    if (GM.left <= 0) endShift();
  }, 100));
}

// ---------- генерация товара ----------
const wsum = a => a.reduce((s, x) => s + x, 0);
function pickDigit(d) { let r = Math.random() * wsum(d); for (let i = 0; i < d.length; i++) { r -= d[i]; if (r <= 0) return i + 1; } return d.length; }
function nextItem() {
  if (GM.queue <= 0) { GM.cur = null; return; }
  GM.queue--;
  if (GM.kind === 'romashka') {
    const heavy = GM.L.heavy, dg = pickDigit(GM.L.d);
    GM.cur = { digit: dg, name: pick(heavy ? WH.big : WH.goods), kg: heavy ? ri(40, 120) : ri(1, 35), held: !heavy };
  } else if (GM.kind === 'priemka') {
    const letter = wpick(['A', 'B', 'C', 'D', 'E', 'Q'], x => ({ A: 30, B: 22, C: 22, D: 14, E: 5, Q: 7 })[x]);
    const defect = chance(0.2) ? pick(WH.defects) : null;
    GM.cur = { letter, defect, name: pick(letter === 'E' ? WH.big : WH.goods), kg: letter === 'E' ? ri(40, 120) : ri(80, 400) };
  } else if (GM.kind === 'alleya') {
    GM.cur = { digit: ri(1, 6), name: pick(WH.small) };
  }
}
function newTruck() {
  GM.phase = 'unload';
  GM.truck = [0, 1].map(() => Array.from({ length: 6 }, () => pick(['A', 'A', 'B', 'C', 'D', 'E', 'Q'])));
}
function newLoad() {
  GM.phase = 'load';
  GM.route = pick(WH.routes);
  const others = WH.routes.filter(x => x !== GM.route);
  GM.gate = shuffle([GM.route, GM.route, GM.route, GM.route, pick(others), pick(others), pick(others), pick(others)]).map(r => ({ r, done: false }));
  GM.loaded = 0;
}

// ---------- отрисовка ----------
function gmHead() {
  const picks = Math.max(0, GM.good - GM.bad) * GM.ppc;
  const n = Math.floor(picks / 2000), into = picks - n * 2000;
  const r = WH.roles[GM.kind];
  return `<div class="gm-head">
    <div class="row" style="justify-content:space-between"><b>${r.n}${GM.letter ? ' ' + GM.letter : ''}</b><span class="sub">${esc(GM.d.t)}${GM.d.coef > 1 ? ' ×' + GM.d.coef.toFixed(2) : ''}</span><button class="gm-quit" data-g="quit">${I.x}</button></div>
    <div class="gm-time"><i id="gm-time" style="width:${GM.left / SHIFT_SEC * 100}%"></i><span id="gm-sec">${Math.ceil(GM.left)}</span></div>
    <div class="grid2" style="margin-top:8px">
      <div class="plate blue"><small>Пиков</small><b>${picks.toLocaleString('ru-RU')}</b></div>
      <div class="plate green"><small>Спидометр → +${money(200 * (n + 1))}</small><div class="gm-speed"><i style="width:${into / 20}%"></i></div></div>
    </div>
    ${GM.kind !== 'gruz' ? `<div class="sub" style="text-align:center;margin-top:6px">На подходе: <b style="color:var(--text)">${GM.queue}</b>${GM.bad ? ` · ошибок: <b style="color:var(--red)">${GM.bad}</b>` : ''}</div>` : ''}
  </div>`;
}
function itemCard(c, label) {
  return `<div class="gm-item"><span class="gm-emoji">${c.name.split(' ')[0]}</span><div><b>${esc(c.name.split(' ').slice(1).join(' '))}</b><small>${c.kg ? c.kg + ' кг' : ''}${label ? ' · ' + label : ''}</small></div></div>`;
}
function drawRomashka() {
  const n = GM.L.d.length, R = n > 4 ? 128 : 132, size = n > 8 ? 58 : n > 4 ? 64 : 74;
  const cells = GM.L.d.map((w, i) => {
    const a = i / n * Math.PI * 2 - Math.PI / 2;
    const fl = GM.flash && GM.flash.i === i ? ' ' + GM.flash.k : '';
    return `<button class="gm-cell${fl} ${w < 0.1 ? 'rare' : ''}" data-g="cell" data-i="${i}" style="--s:${size}px;left:calc(50% + ${Math.cos(a) * R}px);top:calc(50% + ${Math.sin(a) * R}px)">${i + 1}</button>`;
  }).join('');
  const c = GM.cur;
  const burstDone = GM.L.burst && !c && GM.queue <= 0 && (Date.now() - GM.t0) / 1000 > SHIFT_SEC * 0.45;
  return `<div class="gm-flower">${cells}
    <div class="gm-parcel ${c ? '' : 'wait'} ${c && !c.held ? 'heavy' : ''}" data-g="take">${c
      ? `<small>${c.held ? 'Ставь в ячейку' : 'Тяжёлый — нажми, чтобы взять'}</small><b style="color:${LETTER_COL[GM.letter]}">${GM.letter}${c.digit}</b><small>${esc(c.name)}, ${c.kg} кг</small>`
      : '<small>ждём товар…</small>'}</div></div>
    ${burstDone ? `<button class="btn block green" style="margin-top:12px" data-g="early">Норма сделана — домой</button>` : ''}`;
}
function drawPriemka() {
  const c = GM.cur;
  const keys = ['A', 'B', 'C', 'D', 'E', 'K'].map(x => `<button class="gm-key" style="--c:${LETTER_COL[x]}" data-g="let" data-k="${x}">${x}</button>`).join('');
  return `<div class="gm-pallet ${c ? '' : 'wait'}">${c ? `
      <div class="gm-sticker" style="--c:${LETTER_COL[c.letter]}">${c.letter}</div>
      ${itemCard(c, 'палет')}
      ${c.defect === 'нет штрихкода' ? '<div class="gm-nobar">штрихкод отсутствует</div>' : '<div class="gm-bar"></div>'}
      ${c.defect && c.defect !== 'нет штрихкода' ? `<div class="gm-tag bad">${c.defect}</div>` : '<div class="gm-tag ok">упаковка целая</div>'}`
    : '<small class="sub">ждём фуру…</small>'}</div>
    <div class="gm-keys">${keys}</div>
    <button class="btn block red" style="margin-top:8px" data-g="brak">В брак</button>
    <div class="note" style="text-align:center">Палеты Q — это буква K</div>`;
}
function drawAlleya() {
  const c = GM.cur, CAP = 8;
  const boxes = GM.boxes.map((f, i) => `<button class="gm-box2 ${f >= CAP ? 'full' : ''}" data-g="box" data-i="${i}">
      <b>${i + 1}</b><div class="gm-fill"><i style="height:${f / CAP * 100}%"></i></div><small>${f >= CAP ? 'закрыть' : f + '/' + CAP}</small></button>`).join('');
  return `<div class="gm-small ${c ? '' : 'wait'}">${c ? `<b class="gm-code">${c.digit}</b>${itemCard(c)}` : '<small class="sub">ждём товар…</small>'}</div>
    <div class="gm-boxes">${boxes}</div>
    <div class="note" style="text-align:center">Полный короб нажми, чтобы закрыть. В полный не влезет.</div>`;
}
function drawGruz() {
  if (GM.phase === 'unload') {
    const cols = GM.truck.map((col, ci) => `<div class="gm-col">${col.map((l, ri) => {
      const free = ri === col.length - 1;
      return `<button class="gm-pal ${free ? 'free' : ''}" style="--c:${LETTER_COL[l]}" data-g="pal" data-c="${ci}" data-r="${ri}">${l}</button>`;
    }).join('')}</div>`).join('');
    return `<div class="sub" style="text-align:center;margin-top:10px">Разгрузка фуры: снимай палеты от дверей</div>
      <div class="gm-truck">${cols}<div class="gm-door">двери</div></div>`;
  }
  const gate = GM.gate.map((g, i) => `<button class="gm-gp ${g.done ? 'done' : ''}" data-g="gate" data-i="${i}" ${g.done ? 'disabled' : ''}>${g.done ? 'в фуре' : esc(g.r)}</button>`).join('');
  return `<div class="sub" style="text-align:center;margin-top:10px">Погрузка: фура на <b style="color:var(--text)">${esc(GM.route)}</b> · загружено ${GM.loaded}/4</div>
    <div class="gm-gate">${gate}</div>`;
}
function drawGame() {
  if (!GM || GM.done) return;
  const body = { romashka: drawRomashka, priemka: drawPriemka, alleya: drawAlleya, gruz: drawGruz }[GM.kind]();
  gameEl().innerHTML = `<div class="gm-wrap">${gmHead()}${body}<div class="gm-msg ${GM.msgBad ? 'bad' : ''}">${esc(GM.msg)}</div></div>`;
}

// ---------- ответы ----------
function answer(ok, msg, keep) {
  if (ok) { GM.good++; GM.msg = msg || '+' + GM.ppc + ' пиков'; GM.msgBad = false; hap('light'); }
  else { GM.bad++; GM.msg = msg; GM.msgBad = true; hap('err'); }
  if (!keep) nextItem();
  drawGame();
  clearTimeout(GM.ft); GM.ft = setTimeout(() => { if (GM && !GM.done) { GM.flash = null; drawGame(); } }, 350);
}
function onTap(g, t) {
  const c = GM.cur;
  if (GM.kind === 'gruz') {
    if (Date.now() < GM.lock) return;
    if (g === 'pal') {
      const col = GM.truck[+t.dataset.c], r = +t.dataset.r;
      if (r !== col.length - 1) return answer(false, 'Палет зажат — сначала ближний к дверям', true);
      col.pop(); GM.lock = Date.now() + 450;
      answer(true, null, true);
      if (!GM.truck[0].length && !GM.truck[1].length) { newLoad(); GM.msg = 'Фура пустая. Теперь погрузка'; drawGame(); }
    } else if (g === 'gate') {
      const p = GM.gate[+t.dataset.i];
      if (p.r !== GM.route) return answer(false, 'Не та фура! Этот палет на ' + p.r, true);
      p.done = true; GM.loaded++; GM.lock = Date.now() + 450;
      answer(true, null, true);
      if (GM.loaded >= 4) { newTruck(); GM.msg = 'Фура ушла на ' + GM.route + '. Следующая на разгрузку'; drawGame(); }
    }
    return;
  }
  if (!c) return;
  if (GM.kind === 'romashka') {
    if (g === 'take') { if (!c.held) { c.held = true; hap('medium'); drawGame(); } return; }
    if (g !== 'cell') return;
    if (!c.held) { GM.msg = 'Сначала возьми товар'; GM.msgBad = true; return drawGame(); }
    const i = +t.dataset.i, ok = i + 1 === c.digit;
    GM.flash = { i, k: ok ? 'ok' : 'bad' };
    answer(ok, ok ? null : 'Пересорт! Это ячейка ' + (i + 1) + ', а надо ' + c.digit);
  } else if (GM.kind === 'priemka') {
    const need = c.letter === 'Q' ? 'K' : c.letter;
    if (g === 'brak') answer(!!c.defect, c.defect ? 'В брак, верно' : 'Нормальный палет в брак!');
    else if (g === 'let') {
      if (c.defect) return answer(false, 'Пропустил брак: ' + c.defect);
      answer(t.dataset.k === need, t.dataset.k === need ? null : 'Не та буква! Это ' + need + (c.letter === 'Q' ? ' (Q идёт на K)' : ''));
    }
  } else if (GM.kind === 'alleya' && g === 'box') {
    const i = +t.dataset.i;
    if (GM.boxes[i] >= 8) { GM.boxes[i] = 0; return answer(true, 'Короб ' + (i + 1) + ' закрыт и ушёл на палет', true); }
    if (i + 1 !== c.digit) return answer(false, 'Не тот короб! Надо ' + c.digit);
    GM.boxes[i]++;
    answer(true);
  }
}
function endShift(quit) {
  if (!GM || GM.done) return;
  GM.done = true; GM.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  const net = Math.max(0, GM.good - GM.bad), res = shiftPay(GM.ppc, net, GM.d);
  GM.res = res;
  hap('ok');
  gameEl().innerHTML = `<div class="gm-wrap"><div class="panel" style="margin-top:40px"><div class="sec-title">${quit === 'early' ? 'Норма сделана' : quit ? 'Ушёл пораньше' : 'Смена окончена'}</div>
    <div class="ev"><div>Правильно<small>${GM.good} шт.${GM.bad ? ', ошибок ' + GM.bad : ''}</small></div><b>${res.picks.toLocaleString('ru-RU')} пиков</b></div>
    <div class="ev"><div>Оплата за пики${GM.d.coef > 1 ? `<small>коэффициент ×${GM.d.coef.toFixed(2)}</small>` : ''}</div><b class="pos">+${money(res.base)}</b></div>
    <div class="ev"><div>Спидометр<small>${Math.floor(res.picks / 2000)} × по 2000 пиков</small></div><b class="pos">+${money(res.bonus)}</b></div>
    <div class="ev"><div><b>Итого за смену</b></div><b class="pos">${money(res.total)}</b></div>
    <div class="note">${res.total >= 14000 ? 'Машина. Бригадир в шоке.' : res.total >= 9000 ? 'Нормальная смена, жить можно.' : res.total >= 5000 ? 'Так себе денёк. Бывает.' : 'Бригадир смотрит с осуждением.'}</div>
    <button class="btn block green" style="margin-top:12px" data-g="home">Забрать деньги и домой</button></div></div>`;
}
function goHome() {
  const title = GM.title, res = GM.res;
  finishShift(title, res);
  GM = null; const el = gameEl(); el.className = ''; el.innerHTML = '';
  const ev = nextDay();
  ev.unshift({ t: 'Смена на складе: ' + title, s: res.picks.toLocaleString('ru-RU') + ' пиков', v: res.total });
  save(); UI.modal = { type: 'day', ev }; render();
}

// pointerdown — чтобы на телефоне не было задержки клика
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('[data-g]');
  if (!t || !GM) return;
  e.preventDefault();
  const g = t.dataset.g;
  if (g === 'quit') { if (!GM.done) endShift(true); return; }
  if (g === 'early') { if (!GM.done) endShift('early'); return; }
  if (g === 'home') return goHome();
  if (GM.done) return;
  onTap(g, t);
});
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a="shift"], [data-a="wl"]');
  if (!t) return;
  if (t.dataset.a === 'wl') { UI.whLetter = t.dataset.k; hap('light'); render(); }
  else startShift(t.dataset.k);
});
