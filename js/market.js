// 0.6: аукцион со ставками и бизнесы с пассивным доходом.

// ---------- аукцион ----------
// Площадка раскрывает всё: отчёт, автотека, базы. Риск не в скрытых проблемах, а в том, сколько дадут остальные.
const AUC_FEE = 0.05;
const AUC_TYPES = [
  { k: 'leasing', n: 'Лизинговый возврат', t: 'Фирма не платила лизинг — машину забрали. Обслуживалась у дилера.', cls: ['mid', 'biz', 'comm', 'suv'], wear: 0.7, start: [0.42, 0.55] },
  { k: 'insur', n: 'Страховой аукцион', t: 'После ДТП. Страховая продаёт годные остатки.', wear: 1, crash: true, start: [0.3, 0.45] },
  { k: 'fssp', n: 'Конфискат приставов', t: 'Арестовали за долги. Хозяин ключи не отдал, сделали дубликат.', wear: 1.1, start: [0.35, 0.5] },
  { k: 'carshare', n: 'Списание каршеринга', t: 'Отъездила своё в каршеринге. Салон уставший, пробег большой.', cls: ['econ', 'mid'], wear: 1.3, share: true, start: [0.35, 0.48] },
  { k: 'bank', n: 'Банк продаёт залог', t: 'Кредит не вернули — банк избавляется от машины.', cls: ['biz', 'prem', 'suv', 'sport'], wear: 0.8, start: [0.45, 0.58] },
];
const AUC_BOTS = ['Перекуп из Кудрово', 'Автосалон «Мотор»', 'Ахмед с разборки', 'Таксопарк «Шашка»', 'Барыга с Юнны', 'Тихий участник №7',
  'Дилер из Москвы', 'Серёга-подборщик', 'Участник №312', 'Батя на «Ниве»', 'Блогер-автохаус', 'Кладовщик с Волхонки'];
const aucStep = p => p < 100000 ? 2000 : p < 300000 ? 5000 : p < 1000000 ? 10000 : p < 3000000 ? 25000 : p < 10000000 ? 50000 : 100000;
const aucFee = p => roundPrice(p * AUC_FEE);

function genAuction() {
  const T = pick(AUC_TYPES), car = genCar({ cls: T.cls, wear: T.wear });
  if (T.crash) { car.acc++; car.wear.body = Math.max(car.wear.body, ri(45, 85)); car.wear.suspension = Math.max(car.wear.suspension, ri(25, 60)); }
  if (T.share) { car.km = Math.min(999000, car.km + ri(40000, 120000)); car.wear.interior = Math.max(car.wear.interior, ri(40, 75)); }
  car.kmShown = car.km; car.accSaid = car.acc; car.ownersSaid = car.owners; car.taxiSaid = car.taxi;
  car.legal = { zalog: 0, limit: 0, wanted: false }; car.k = { auto: true, probiv: true, insp: true };
  PARTS.forEach(p => car.declared[p.k] = true);
  const tv = trueValue(car) * eventMul(car);
  // у каждого участника свой потолок; кто-то пришёл за этой машиной специально
  const bots = shuffle(AUC_BOTS).slice(0, ri(2, 5)).map(n => ({ n, max: roundPrice(tv * (chance(0.15) ? rnd(1, 1.12) : rnd(0.62, 1))) }));
  return { id: S.nextId++, type: AUC_TYPES.indexOf(T), car, start: roundPrice(tv * rnd(T.start[0], T.start[1])), bots, price: 0, leader: null, done: null };
}
function refreshAuctions() { S.auc = []; for (let i = 0; i < 4; i++) S.auc.push(genAuction()); }

// leader: null — ставок нет, 'p' — игрок, число — индекс участника
const aucNext = a => a.leader == null ? a.start : a.price + aucStep(a.price);
const aucCanPay = (a, x) => canPay(x + aucFee(x));
function aucBid(a, who, x) { a.price = x; a.leader = who; }
// Ход участников: кто-то из тех, у кого потолок выше следующей ставки, перебивает. Возвращает индекс или -1.
function aucBotMove(a) {
  const need = aucNext(a);
  const ok = a.bots.map((b, i) => i).filter(i => i !== a.leader && a.bots[i].max >= need);
  if (!ok.length) return -1;
  const i = pick(ok); aucBid(a, i, need); return i;
}
function aucStart(a) { a.price = 0; a.leader = null; }
// Удар молотка. Если игрок ушёл посреди торгов — участники доторговываются без него.
function aucFinish(a) {
  while (aucBotMove(a) >= 0);
  const c = a.car;
  if (a.leader === 'p') {
    const fee = aucFee(a.price);
    pay(a.price + fee);
    S.garage.push({ car: c, paid: a.price + fee, spent: 0, boughtDay: S.day, sale: null, offers: [] });
    S.stats.bought++; flag('hammer');
    addLog('Выиграл аукцион: ' + carName(c) + ' за ' + money(a.price) + ' + комиссия ' + money(fee) + '.');
    track('buy', { car: c }); track('auction');
  } else if (a.leader != null) addLog('Аукцион: ' + carName(c) + ' ушла за ' + money(a.price) + ' (' + a.bots[a.leader].n + ').');
  a.done = { who: a.leader === 'p' ? 'p' : a.leader == null ? null : a.bots[a.leader].n, price: a.price };
  return a.done;
}

// ---------- бизнесы ----------
// inc — доход в день на первом уровне, mod — как на него влияют события
const BIZ = [
  { k: 'shaurma', n: 'Шаурмичная у метро', ic: '🌯', price: 250000, inc: [5000, 9000], t: 'Девяткино, выход №2. Очередь после ночной смены со склада.',
    perk: 'В день зарплаты на складе выручка в полтора раза больше', mod: () => isPayday(S.day) ? 1.5 : 1,
    bad: ['Пришла проверка, нашли кота в подсобке', 'Кончился лаваш посреди смены'], good: ['Ян привёл всю приёмку обедать', 'Попали в паблик «Мурино онлайн»'] },
  { k: 'wash', n: 'Автомойка', ic: '🧽', price: 600000, inc: [12000, 20000], t: 'Два бокса, керхер и пацан на кассе.',
    perk: 'Свои машины моешь бесплатно', mod: () => curEvent() && curEvent().k === 'winter' ? 1.3 : 1,
    bad: ['Сломался компрессор', 'Мойщик уволился, не предупредив'], good: ['Таксопарк заключил договор на мойку', 'После дождя очередь до дороги'] },
  { k: 'tire', n: 'Шиномонтаж', ic: '🛞', price: 450000, inc: [8000, 15000], t: 'Сезонный бизнес: весной и осенью очередь, летом скучно.',
    perk: 'Ремонт подвески дешевле на 20%. В сезон переобувки доход ×2', mod: () => (curEvent() && curEvent().k === 'winter') || S.day % 30 < 6 ? 2 : 1,
    bad: ['Станок пробил диск клиента — компенсация', 'Украли комплект резины со склада'], good: ['Первый снег — все бегут переобуваться', 'Скупили остатки шипов оптом'] },
  { k: 'pvz', n: 'ПВЗ Ozon', ic: '📦', price: 900000, inc: [16000, 26000], t: 'Пункт выдачи в новом ЖК. Люди заказывают всё подряд.',
    perk: 'Запчасти с Ozon приходят на следующий день и без пересорта', mod: () => curEvent() && curEvent().k === 'logist' ? 1.3 : 1,
    bad: ['Штраф от Ozon за потерянную посылку', 'Клиент вернул 40 пар кроссовок'], good: ['Распродажа 11.11 — завал посылок', 'Рядом сдали новый корпус ЖК'] },
  { k: 'school', n: 'Автошкола', ic: '🚦', price: 1000000, inc: [18000, 28000], minLv: 1, t: 'Три учебные «Гранты» и площадка за гаражами.',
    perk: 'Денис наконец-то сдаст на права', mod: () => 1,
    bad: ['Ученик въехал в столб', 'Инструктор ушёл в запой'], good: ['Набрали целую группу студентов Политеха', 'Весь поток сдал с первого раза'] },
  { k: 'razbor', n: 'Авторазборка', ic: '🔩', price: 1500000, inc: [25000, 40000], minLv: 1, t: 'Разбираем битое на запчасти и продаём по частям.',
    perk: '«Слить перекупу» — сдаёшь на свою разборку за 82% вместо 72%', mod: () => 1,
    bad: ['Нагрянул экологический надзор', 'Сгорела бытовка с запчастями'], good: ['Нашли в бардачке старый ноутбук с биткоинами', 'Скупщик забрал весь металлолом'] },
  { k: 'sto', n: 'Автосервис', ic: '🔧', price: 2500000, inc: [40000, 65000], minLv: 2, t: 'Пять постов, развал-схождение, свой электрик.',
    perk: 'Ремонт в сервисе дешевле на 30%', mod: () => 1,
    bad: ['Клиент уехал, не заплатив', 'Сломался подъёмник'], good: ['Подписали договор с каршерингом', 'Отзыв на картах: «лучший сервис района»'] },
  { k: 'taxi', n: 'Таксопарк', ic: '🚕', price: 6000000, inc: [100000, 160000], minLv: 3, t: '20 машин на линии, водители платят аренду каждый день.',
    perk: 'Во время «Бума такси» доход ×1,6', mod: () => curEvent() && curEvent().k === 'taxi' ? 1.6 : 1,
    bad: ['Водитель разбил машину', 'Проверка ГИБДД на линии'], good: ['Аэропорт: ночь сплошных заказов', 'Взяли госконтракт на развоз'] },
];
const BIZ_MUL = [0, 1, 2, 3.2];
const BIZ_MAX = 3;
const bizLv = k => (S && S.biz && S.biz[k] && S.biz[k].lv) || 0;
const bizPrice = (b, lv) => lv === 0 ? b.price : roundPrice(b.price * (lv === 1 ? 1 : 1.5));
const bizIncome = b => roundPrice((b.inc[0] + b.inc[1]) / 2 * BIZ_MUL[bizLv(b.k)]);
const bizSellPrice = k => roundPrice(S.biz[k].spent * 0.6);
function buyBiz(k) {
  const b = BIZ.find(x => x.k === k), lv = bizLv(k);
  if (lv >= BIZ_MAX) return 'Уже максимум';
  if (b.minLv && level().i < b.minLv) return 'Нужен уровень «' + LEVELS[b.minLv][1] + '»';
  const p = bizPrice(b, lv);
  if (!canPay(p)) return 'Не хватает денег';
  pay(p);
  const x = S.biz[k] = S.biz[k] || { lv: 0, spent: 0, earned: 0 };
  x.lv++; x.spent += p;
  addLog((lv ? 'Расширил бизнес «' : 'Купил бизнес «') + b.n + '» за ' + money(p) + '.');
  flag('biz');
  return null;
}
function sellBiz(k) {
  const b = BIZ.find(x => x.k === k), p = bizSellPrice(k);
  S.money += p; delete S.biz[k];
  addLog('Продал бизнес «' + b.n + '» за ' + money(p) + '.');
}
function bizDay(ev) {
  let sum = 0;
  const crisis = curEvent() && curEvent().k === 'crisis' ? 0.85 : 1;
  for (const b of BIZ) {
    const x = S.biz[b.k]; if (!x) continue;
    let v = roundPrice(rnd(b.inc[0], b.inc[1]) * BIZ_MUL[x.lv] * b.mod() * crisis);
    if (chance(0.06)) { const loss = roundPrice(v * rnd(1.5, 3)); ev.push({ t: b.ic + ' ' + b.n + ': ' + pick(b.bad), v: -loss }); v -= loss; }
    else if (chance(0.05)) { const bonus = roundPrice(v * rnd(1, 2.5)); ev.push({ t: b.ic + ' ' + b.n + ': ' + pick(b.good), v: bonus }); v += bonus; }
    x.earned += v; sum += v;
  }
  if (Object.keys(S.biz).length) { S.money += sum; ev.push({ t: 'Итого с бизнесов', s: Object.keys(S.biz).length + ' ' + plural(Object.keys(S.biz).length, 'точка', 'точки', 'точек'), v: sum }); }
}

// ---------- новый день и старт ----------
function marketInit() {
  S.biz = S.biz || {};
  if (!S.auc || S.aucDay !== S.day) { refreshAuctions(); S.aucDay = S.day; }
}
function marketDay(ev) {
  refreshAuctions(); S.aucDay = S.day;
  bizDay(ev);
}
