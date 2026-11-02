// Склад Ozon (СЦ Волхонское): вкладка «Склад» и две мини-игры — ромашка и приёмка.

const SHIFT_SEC = 45;
const FLOW_MS = { low: 1700, norm: 1000, high: 720 }; // как часто приезжает новый товар
const CELL_COLORS = ['#e5463b', '#f6c21c', '#8bd43a', '#2f9cf0', '#b56cf0', '#ff8a3d', '#2ed1b8', '#f06aa8'];
let GM = null;

// ---------- вкладка ----------
function viewWarehouse() {
  const d = whDay(S.day), worked = S.wh.last === S.day;
  const payday = isPayday(S.day) ? 'сегодня 💸' : 'через ' + (7 - S.day % 7) + ' дн.';
  const role = k => {
    const r = WH.roles[k];
    return `<div class="panel wh-role">
      <div class="row"><div class="wh-face">${r.face}</div>
        <div style="flex:1;min-width:0"><b class="h">${r.n}</b> <span class="sub">${r.who}</span><div class="sub">${r.text}</div>
          <div class="sub" style="margin-top:2px">В среднем <b style="color:#fff">${r.avg}</b> за смену</div></div></div>
      <button class="btn block ${worked ? 'gray' : 'green'}" style="margin-top:10px" data-a="shift" data-k="${k}" ${worked ? 'disabled' : ''}>${worked ? 'Сегодня уже отработал' : I.box + 'Выйти на смену'}</button>
    </div>`;
  };
  return `<div class="screen-title h">Склад Ozon</div>
  <div class="panel wh-head" style="margin-top:28px"><div class="title-plate h">${WH.name}</div>
    <div class="grid2">
      <div class="plate ${d.coef > 1 ? 'green' : d.flow === 'low' ? 'red' : 'blue'}"><small>Сегодня</small><b>${d.t}${d.coef > 1 ? ' ×' + d.coef.toFixed(2) : ''}</b></div>
      <div class="plate beige"><small>Зарплата у кладовщиков</small><b>${payday}</b></div>
    </div>
    <div class="note">Смена занимает весь день: после неё сразу наступает следующий. <b>Спидометр</b>: каждые 2000 пиков — бонус, и он растёт: 200, 400, 600 ₽… Ошибка (пересорт или пропущенный брак) съедает одну посылку.</div>
  </div>
  ${role('romashka')}${role('priemka')}
  <div class="panel flat">
    <div class="kv"><span>Смен отработано</span><b>${S.wh.shifts}</b></div>
    <div class="kv"><span>Заработано на складе</span><b class="g">${money(S.wh.earned)}</b></div>
    <div class="kv"><span>Лучшая смена</span><b>${money(S.wh.best)}</b></div>
  </div>`;
}

// ---------- мини-игры ----------
function gameEl() {
  let el = $('#game');
  if (!el) { el = document.createElement('div'); el.id = 'game'; document.body.appendChild(el); }
  return el;
}
function startShift(role) {
  if (S.wh.last === S.day) return toast('Сегодня ты уже отработал', true);
  const d = whDay(S.day);
  GM = { role, d, good: 0, bad: 0, queue: 3, left: SHIFT_SEC, cur: null, flash: null, timers: [], cells: null, since: 0, msg: '' };
  if (role === 'romashka') newCells();
  const el = gameEl(); el.className = 'on';
  let n = 3;
  const tick = () => {
    el.innerHTML = `<div class="gm-count"><div class="sub">${WH.roles[role].face} ${WH.roles[role].n} · ${esc(d.t)}</div><b>${n || 'Погнали!'}</b></div>`;
    hap('light');
    if (n-- > 0) GM.timers.push(setTimeout(tick, 650)); else GM.timers.push(setTimeout(runShift, 500));
  };
  tick();
}
function newCells() {
  const codes = new Set(); while (codes.size < 8) codes.add(ri(10, 99));
  GM.cells = [...codes].map((c, i) => ({ c, col: CELL_COLORS[i] }));
}
function nextItem() {
  if (GM.queue <= 0) { GM.cur = null; return; }
  GM.queue--;
  if (GM.role === 'romashka') GM.cur = { c: pick(GM.cells).c };
  else {
    const defect = chance(0.27) ? pick(WH.defects) : null;
    GM.cur = { name: pick(WH.goods), defect, fragile: !defect && chance(0.2) };
  }
}
function runShift() {
  const t0 = Date.now();
  nextItem(); drawGame();
  GM.timers.push(setInterval(() => {
    GM.queue = Math.min(GM.queue + 1, 9);
    if (!GM.cur) nextItem();
    drawGame();
  }, FLOW_MS[GM.d.flow]));
  GM.timers.push(setInterval(() => {
    GM.left = Math.max(0, SHIFT_SEC - (Date.now() - t0) / 1000);
    const bar = $('#gm-time'); if (bar) bar.style.width = (GM.left / SHIFT_SEC * 100) + '%';
    const sec = $('#gm-sec'); if (sec) sec.textContent = Math.ceil(GM.left);
    if (GM.left <= 0) endShift();
  }, 100));
}
function gmHead() {
  const r = WH.roles[GM.role], picks = Math.max(0, GM.good - GM.bad) * r.ppc;
  const n = Math.floor(picks / 2000), into = picks - n * 2000;
  return `<div class="gm-head">
    <div class="row" style="justify-content:space-between"><b class="h">${r.face} ${r.n}</b><span class="sub">${esc(GM.d.t)}${GM.d.coef > 1 ? ' ×' + GM.d.coef.toFixed(2) : ''}</span><button class="gm-quit" data-g="quit">${I.x}</button></div>
    <div class="gm-time"><i id="gm-time" style="width:${GM.left / SHIFT_SEC * 100}%"></i><span id="gm-sec">${Math.ceil(GM.left)}</span></div>
    <div class="grid2" style="margin-top:8px">
      <div class="plate blue"><small>Пиков</small><b>${picks.toLocaleString('ru-RU')}</b></div>
      <div class="plate green"><small>Спидометр → +${money(200 * (n + 1))}</small><div class="gm-speed"><i style="width:${into / 20}%"></i></div></div>
    </div>
    <div class="sub" style="text-align:center;margin-top:6px">На конвейере: <b style="color:#fff">${GM.queue}</b>${GM.bad ? ` · ошибок: <b style="color:var(--red)">${GM.bad}</b>` : ''}</div>
  </div>`;
}
function drawGame() {
  if (!GM || GM.done) return;
  const el = gameEl();
  let body = '';
  if (GM.role === 'romashka') {
    const R = 118;
    const cells = GM.cells.map((x, i) => {
      const a = i / GM.cells.length * Math.PI * 2 - Math.PI / 2;
      const fl = GM.flash && GM.flash.i === i ? ' ' + GM.flash.k : '';
      return `<button class="gm-cell${fl}" data-g="cell" data-i="${i}" style="left:calc(50% + ${Math.cos(a) * R}px);top:calc(50% + ${Math.sin(a) * R}px);background:${x.col}">${x.c}</button>`;
    }).join('');
    body = `<div class="gm-flower">${cells}
      <div class="gm-parcel ${GM.cur ? '' : 'wait'}">${GM.cur ? `<small>Посылка</small><b>${GM.cur.c}</b><small>кинь в ячейку</small>` : '<small>ждём товар…</small>'}</div></div>`;
  } else {
    const c = GM.cur;
    body = `<div class="gm-box ${c ? '' : 'wait'} ${c && c.defect ? 'defect' : ''}">${c ? `
        <div class="gm-emoji">${c.name.split(' ')[0]}</div><b>${esc(c.name.split(' ').slice(1).join(' '))}</b>
        ${c.defect === 'нет штрихкода' ? '<div class="gm-nobar">штрихкод отсутствует</div>' : '<div class="gm-bar"></div>'}
        ${c.defect && c.defect !== 'нет штрихкода' ? `<div class="gm-tag bad">⚠ ${c.defect}</div>` : c.fragile ? '<div class="gm-tag">🥚 хрупкое, аккуратно</div>' : '<div class="gm-tag ok">упаковка целая</div>'}`
      : '<small class="sub">ждём товар…</small>'}</div>
      <div class="grid2" style="margin-top:14px">
        <button class="btn green gm-big" data-g="acc">${I.check}Принять</button>
        <button class="btn red gm-big" data-g="rej">${I.x}Брак</button>
      </div>`;
  }
  el.innerHTML = `<div class="gm-wrap">${gmHead()}${body}<div class="gm-msg ${GM.msgBad ? 'bad' : ''}">${esc(GM.msg)}</div></div>`;
}
function answer(ok, msg) {
  if (ok) { GM.good++; GM.msg = msg || '+' + WH.roles[GM.role].ppc + ' пиков'; GM.msgBad = false; hap('light'); }
  else { GM.bad++; GM.msg = msg; GM.msgBad = true; hap('err'); }
  if (GM.role === 'romashka' && ok && ++GM.since % 15 === 0) { newCells(); GM.msg = 'Ромашку переставили! Смотри внимательнее'; }
  nextItem(); drawGame();
  clearTimeout(GM.ft); GM.ft = setTimeout(() => { if (GM && !GM.done) { GM.flash = null; drawGame(); } }, 350);
}
function endShift(quit) {
  if (!GM || GM.done) return;
  GM.done = true; GM.timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  const net = Math.max(0, GM.good - GM.bad), res = shiftPay(GM.role, net, GM.d);
  GM.res = res;
  hap('ok');
  gameEl().innerHTML = `<div class="gm-wrap"><div class="panel" style="margin-top:40px"><div class="title-plate h">${quit ? 'Ушёл пораньше' : 'Смена окончена'}</div>
    <div class="ev"><div>Правильно<small>${GM.good} шт.${GM.bad ? ', ошибок ' + GM.bad : ''}</small></div><b>${res.picks.toLocaleString('ru-RU')} пиков</b></div>
    <div class="ev"><div>Оплата за пики${GM.d.coef > 1 ? `<small>коэффициент ×${GM.d.coef.toFixed(2)}</small>` : ''}</div><b class="pos">+${money(res.base)}</b></div>
    <div class="ev"><div>Спидометр<small>${Math.floor(res.picks / 2000)} × по 2000 пиков</small></div><b class="pos">+${money(res.bonus)}</b></div>
    <div class="ev"><div><b>Итого за смену</b></div><b class="pos">${money(res.total)}</b></div>
    <div class="note">${res.total >= 14000 ? 'Машина! Бригадир в шоке 🔥' : res.total >= 9000 ? 'Нормальная смена, жить можно.' : res.total >= 5000 ? 'Так себе денёк. Бывает.' : 'Бригадир смотрит с осуждением 😐'}</div>
    <button class="btn block green" style="margin-top:12px" data-g="home">${I.sun}Забрать деньги и домой</button></div></div>`;
}
function goHome() {
  const role = GM.role, res = GM.res;
  finishShift(role, res);
  GM = null; const el = gameEl(); el.className = ''; el.innerHTML = '';
  const ev = nextDay();
  ev.unshift({ t: 'Смена на складе: ' + WH.roles[role].n.toLowerCase(), s: res.picks.toLocaleString('ru-RU') + ' пиков', v: res.total });
  save(); UI.modal = { type: 'day', ev }; render();
}

// pointerdown — чтобы на телефоне не было задержки клика
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('[data-g]');
  if (!t || !GM) return;
  e.preventDefault();
  const g = t.dataset.g;
  if (g === 'quit') { if (!GM.done) endShift(true); return; }
  if (g === 'home') return goHome();
  if (GM.done || !GM.cur) return;
  if (g === 'cell') {
    const i = +t.dataset.i, ok = GM.cells[i].c === GM.cur.c;
    GM.flash = { i, k: ok ? 'ok' : 'bad' };
    answer(ok, ok ? null : 'Пересорт! Это ячейка ' + GM.cells[i].c);
  } else if (g === 'acc') answer(!GM.cur.defect, GM.cur.defect ? 'Пропустил брак: ' + GM.cur.defect : null);
  else if (g === 'rej') answer(!!GM.cur.defect, GM.cur.defect ? null : 'Нормальный товар в брак!');
});
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a="shift"]');
  if (t) startShift(t.dataset.k);
});
