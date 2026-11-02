// 0.5: задания дня, события рынка, банк, достижения, звуки. Всё, что крутится вокруг основной игры.

// ---------- события рынка ----------
const RU_BRANDS = ['ВАЗ', 'Lada', 'ГАЗ', 'Москвич', 'ЗАЗ', 'УАЗ', 'ИЖ', 'КамАЗ', 'ПАЗ', 'Aurus', 'Урал', 'Минск', 'Восход'];
const CN_BRANDS = ['Haval', 'Chery', 'Geely', 'Changan', 'Tank', 'BYD', 'Zeekr', 'Hongqi', 'Li Auto'];
// mul — во сколько раз покупатели готовы платить больше. Продавцы реагируют с опозданием — в этом и навар.
const EVENTS = [
  { k: 'sanct', n: 'Новые санкции', t: 'Иномарки на вторичке подорожали на 12%', mul: md => RU_BRANDS.includes(md.brand) ? 1 : 1.12 },
  { k: 'winter', n: 'Зима близко', t: 'Внедорожники +10%, спорткары −10%', mul: md => md.cls === 'suv' ? 1.1 : md.cls === 'sport' ? 0.9 : 1 },
  { k: 'summer', n: 'Мотосезон', t: 'Мотоциклы +20%, спорткары +8%', mul: md => md.cls === 'moto' ? 1.2 : md.cls === 'sport' ? 1.08 : 1 },
  { k: 'taxi', n: 'Бум такси', t: 'Эконом +10%: таксопарки скупают всё подряд', mul: md => md.cls === 'econ' ? 1.1 : 1 },
  { k: 'crisis', n: 'Кризис', t: 'Покупатели жмутся: всё −8%', mul: () => 0.92 },
  { k: 'china', n: 'Завоз китайцев', t: 'Китайские марки −12%: новые дешевле', mul: md => CN_BRANDS.includes(md.brand) ? 0.88 : 1 },
  { k: 'retro', n: 'Мода на ретро', t: 'Классика +18%: блогеры скупают', mul: md => md.cls === 'classic' ? 1.18 : 1 },
  { k: 'util', n: 'Подняли утильсбор', t: 'Машины не старше 3 лет +10%', mul: (md, car) => YEAR_NOW - car.year <= 3 ? 1.1 : 1 },
  { k: 'logist', n: 'Маркетплейсы ищут машины', t: 'Коммерческий транспорт +15%', mul: md => md.cls === 'comm' ? 1.15 : 1 },
];
const curEvent = () => S && S.event && S.event.until >= S.day ? EVENTS.find(e => e.k === S.event.k) : null;
function eventMul(car) { const e = curEvent(); return e ? e.mul(MODELS[car.m], car) : 1; }

// ---------- задания дня ----------
const TASKS = [
  { k: 'buy', t: 'Купи любую машину', need: 1 },
  { k: 'buycls', t: c => 'Купи машину класса «' + CLASSES[c] + '»', need: 1, p: () => pick(['econ', 'mid', 'suv', 'classic', 'biz', 'comm']) },
  { k: 'sell', t: 'Продай машину', need: 1 },
  { k: 'profit', t: x => 'Продай машину с наваром от ' + money(x), need: 1, p: () => roundPrice(50000 * (1 + level().i)) },
  { k: 'check', t: 'Сделай 3 проверки: автотека, пробив или подборщик', need: 3 },
  { k: 'repair', t: 'Отремонтируй 2 узла', need: 2 },
  { k: 'shift', t: 'Отработай смену на складе', need: 1 },
  { k: 'lot', t: 'Купи гараж с сюрпризом', need: 1 },
  { k: 'wash', t: 'Помой машину перед продажей', need: 1 },
  { k: 'haggle', t: 'Выбей у продавца скидку от 10%', need: 1 },
  { k: 'auction', t: 'Выиграй лот на аукционе', need: 1 },
];
function genTasks() {
  const lv = level().i;
  return shuffle(TASKS).slice(0, 3).map(T => {
    const p = T.p ? T.p() : null;
    return { k: T.k, p, need: T.need, got: 0, reward: roundPrice(rnd(12000, 30000) * (1 + lv * 0.6)), claimed: false };
  });
}
const taskText = x => { const T = TASKS.find(t => t.k === x.k); return typeof T.t === 'function' ? T.t(x.p) : T.t; };
// игра сообщает о событиях, задания и достижения сами решают, засчитать ли
function track(type, d) {
  if (!S || !S.daily) return;
  for (const x of S.daily.tasks) {
    if (x.got >= x.need) continue;
    const ok = x.k === type
      || (x.k === 'buycls' && type === 'buy' && MODELS[d.car.m].cls === x.p)
      || (x.k === 'profit' && type === 'sell' && d.profit >= x.p);
    if (ok) x.got++;
  }
  if (type === 'buy' && d.car.title) flag('yan');
  if (type === 'lot' && trueValue(d.car) >= d.paid * 2) flag('jackpot');
}
const tasksReady = () => S.daily ? S.daily.tasks.filter(x => x.got >= x.need && !x.claimed).length : 0;
function claimTask(i) {
  const x = S.daily.tasks[i];
  if (!x || x.claimed || x.got < x.need) return;
  x.claimed = true; S.money += x.reward; S.rep = clamp(S.rep + 1, 0, 100); S.tasksDone = (S.tasksDone || 0) + 1;
  addLog('Задание «' + taskText(x) + '»: +' + money(x.reward) + '.');
  sfx('coin'); toast('Задание выполнено: +' + money(x.reward));
}

// ---------- банк ----------
const LOAN_DAYS = 20, LOAN_RATE = 0.15;
const loanMax = () => [150000, 300000, 700000, 1500000, 3000000, 6000000, 12000000][level().i];
function takeLoan(sum) {
  if (S.loan) return 'Сначала закрой текущий кредит';
  if (sum > loanMax()) return 'Банк столько не даст';
  const total = Math.round(sum * (1 + LOAN_RATE));
  S.loan = { sum, left: total, daily: Math.ceil(total / LOAN_DAYS / 100) * 100, day: S.day, late: 0 };
  S.money += sum; addLog('Взял кредит ' + money(sum) + '. Вернуть ' + money(total) + ' за ' + LOAN_DAYS + ' дней.');
  return null;
}
function repayLoan() {
  if (!S.loan) return null;
  if (!canPay(S.loan.left)) return 'Не хватает денег';
  pay(S.loan.left); addLog('Досрочно закрыл кредит.'); S.loan = null; flag('loan'); return null;
}

// ---------- достижения ----------
const ACH = [
  { k: 'first_buy', n: 'Первая тачка', t: 'Купить первую машину', ok: () => S.stats.bought >= 1 },
  { k: 'first_sale', n: 'Первый навар', t: 'Продать первую машину', ok: () => S.stats.sold >= 1 },
  { k: 'fat', n: 'Жирный навар', t: '300 000 ₽ на одной машине', ok: () => S.stats.best >= 300000 },
  { k: 'ten', n: 'Конвейер', t: 'Продать 10 машин', ok: () => S.stats.sold >= 10 },
  { k: 'fifty', n: 'Барыга года', t: 'Продать 50 машин', ok: () => S.stats.sold >= 50 },
  { k: 'mil', n: 'Миллионер', t: 'Навар 1 000 000 ₽ за всё время', ok: () => S.stats.profit >= 1e6 },
  { k: 'caught', n: 'Спалился', t: 'Попасться на скрутке', ok: () => S.stats.caught >= 1 },
  { k: 'yan', n: 'Семёрка Яна', t: 'Купить «Хамелеон» у Яна', ok: () => S.flags.yan },
  { k: 'jackpot', n: 'Джекпот', t: 'Открыть гараж, где машина вдвое дороже цены', ok: () => S.flags.jackpot },
  { k: 'shifts', n: 'Свой на складе', t: 'Отработать 10 смен', ok: () => S.wh.shifts >= 10 },
  { k: 'loan', n: 'Чистая кредитная история', t: 'Взять и закрыть кредит', ok: () => S.flags.loan },
  { k: 'loft', n: 'Лофт', t: 'Сделать гаражу ремонт по максимуму', ok: () => up('room') >= 3 },
  { k: 'salon', n: 'Автосалон', t: 'Открыть свой автосалон', ok: () => up('salon') >= 1 },
  { k: 'tasks', n: 'Исполнительный', t: 'Выполнить 20 заданий', ok: () => (S.tasksDone || 0) >= 20 },
  { k: 'hammer', n: 'Молоток', t: 'Выиграть аукцион', ok: () => S.flags.hammer },
  { k: 'biz', n: 'Бизнесмен', t: 'Купить первый бизнес', ok: () => S.flags.biz },
  { k: 'empire', n: 'Империя', t: 'Владеть всеми бизнесами', ok: () => BIZ.every(b => bizLv(b.k)) },
  { k: 'tycoon', n: 'Олигарх', t: 'Прокачать любой бизнес до максимума', ok: () => BIZ.some(b => bizLv(b.k) >= BIZ_MAX) },
];
function flag(k) { S.flags = S.flags || {}; S.flags[k] = true; }
function checkAch() {
  if (!S) return;
  for (const a of ACH) {
    if (S.ach[a.k] || !a.ok()) continue;
    S.ach[a.k] = S.day; addLog('Достижение: «' + a.n + '».');
    sfx('ach'); toast('🏆 Достижение: ' + a.n);
  }
}

// ---------- новый день и старт ----------
function extrasInit() {
  S.flags = S.flags || {}; S.ach = S.ach || {};
  if (S.sound == null) S.sound = true;
  if (!S.daily || S.daily.day !== S.day) S.daily = { day: S.day, tasks: genTasks() };
}
function extrasDay(ev) {
  if (S.loan) {
    const p = Math.min(S.loan.daily, S.loan.left);
    S.money -= p; S.loan.left -= p;
    ev.push({ t: 'Платёж по кредиту', s: S.loan.left > 0 ? 'осталось ' + money(S.loan.left) : 'кредит закрыт', v: -p });
    if (S.loan.left <= 0) { S.loan = null; flag('loan'); }
    else if (S.money < 0 && ++S.loan.late >= 3) { S.rep = clamp(S.rep - 5, 0, 100); S.loan.late = 0; ev.push({ t: '📞 Звонили коллекторы', s: 'долг висит, репутация −5' }); }
  }
  if (S.event && S.event.until < S.day) { ev.push({ t: 'Рынок успокоился', s: EVENTS.find(e => e.k === S.event.k).n + ' — всё' }); S.event = null; }
  if (!S.event && S.day > 2 && chance(0.2)) {
    const e = pick(EVENTS); S.event = { k: e.k, until: S.day + ri(3, 5) };
    ev.push({ t: '📈 ' + e.n, s: e.t + '. Продлится ' + (S.event.until - S.day + 1) + ' дн.' });
  }
  S.daily = { day: S.day, tasks: genTasks() };
  ev.push({ t: 'Новые задания дня', s: S.daily.tasks.map(taskText).join(' · ') });
}

// ---------- звук и вибрация ----------
let AC = null;
function sfx(kind) {
  if (!S || S.sound === false) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime;
    const tone = (f, at, dur, type, vol) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0 + at);
      g.gain.setValueAtTime(vol || 0.12, t0 + at); g.gain.exponentialRampToValueAtTime(0.001, t0 + at + dur);
      o.connect(g); g.connect(AC.destination); o.start(t0 + at); o.stop(t0 + at + dur);
    };
    if (kind === 'cash') { tone(1568, 0, 0.09, 'square', 0.05); tone(2093, 0.07, 0.35, 'square', 0.05); tone(523, 0, 0.12, 'triangle', 0.12); }
    else if (kind === 'coin') { tone(988, 0, 0.08, 'square', 0.05); tone(1319, 0.06, 0.25, 'square', 0.05); }
    else if (kind === 'ach') [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.12));
    else if (kind === 'err') { tone(220, 0, 0.15, 'sawtooth', 0.06); tone(165, 0.1, 0.2, 'sawtooth', 0.06); }
    else if (kind === 'bid') tone(660, 0, 0.07, 'square', 0.04);
    else if (kind === 'hammer') { tone(140, 0, 0.12, 'square', 0.12); tone(90, 0.02, 0.3, 'triangle', 0.15); }
    else if (kind === 'door') { tone(110, 0, 0.6, 'sawtooth', 0.04); tone(90, 0.3, 0.5, 'sawtooth', 0.04); }
  } catch (e) { }
}
