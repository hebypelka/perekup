// Свой персонаж: имя и лоу-поли человечек. Каждая часть — набор граней с разной яркостью, как в лоу-поли моделях.

const AV = {
  skin: ['#f1d2b6', '#e3b48f', '#c98d62', '#a46a43', '#6e4529'],
  hairC: ['#1d1a18', '#4a2f1c', '#8a5a32', '#d2a85a', '#a8a8a8', '#b8322a'],
  topC: ['#1d2026', '#e9ecef', '#2457b8', '#c4262e', '#2e6b3a', '#6b7280', '#e06a1b', '#7c3aed'],
  hair: [['none', 'Лысый'], ['buzz', 'Ёжик'], ['short', 'Короткие'], ['side', 'Набок'], ['long', 'Длинные'], ['curly', 'Кудри']],
  beard: [['none', 'Нет'], ['stub', 'Щетина'], ['beard', 'Борода'], ['mous', 'Усы']],
  hat: [['none', 'Нет'], ['cap', 'Кепка'], ['beanie', 'Шапка'], ['hood', 'Капюшон']],
  top: [['tee', 'Футболка'], ['hoodie', 'Худи'], ['jacket', 'Куртка'], ['vest', 'Жилетка склада']],
  glasses: [['none', 'Нет'], ['glasses', 'Очки'], ['sun', 'Тёмные']],
  chain: [['0', 'Нет'], ['1', 'Цепь']],
};
const defaultMe = () => ({ name: '', skin: 1, hair: 'short', hairC: 0, beard: 'none', hat: 'none', top: 'hoodie', topC: 0, glasses: 'none', chain: '0' });

// яркость грани: f — множитель (1 — как есть, 1.1 — светлее, 0.8 — темнее)
function mul(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = x => Math.max(0, Math.min(255, Math.round(x * f)));
  return '#' + ((1 << 24) | (c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1);
}
const poly = (pts, fill, extra) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}"${extra || ''}/>`;
// веер граней от центра: «лоу-поли» из контура
const fan = (c, pts, col, fs) => pts.map((p, i) => poly([c, p, pts[(i + 1) % pts.length]], mul(col, fs[i % fs.length]))).join('');

function avatarSvg(me, head) {
  me = me || defaultMe();
  const sk = AV.skin[me.skin], hc = AV.hairC[me.hairC], tc = AV.topC[me.topC];
  let s = `<svg viewBox="${head ? '33 18 54 54' : '14 16 92 134'}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">`;
  // сзади: длинные волосы, капюшон
  if (me.hair === 'long' && me.hat !== 'hood') s += fan([60, 60], [[38, 50], [42, 32], [60, 23], [78, 32], [82, 50], [84, 88], [72, 90], [48, 90], [36, 88]], hc, [.9, 1, 1.1, 1, .85, .8, .75, .8, .85]);
  if (me.hat === 'hood') s += fan([60, 58], [[34, 94], [33, 52], [42, 30], [60, 20], [78, 30], [87, 52], [86, 94], [60, 92]], tc, [.75, .85, .95, .9, .8, .7, .65, .7]);
  if (me.top === 'hoodie' && me.hat !== 'hood') s += poly([[38, 96], [44, 82], [60, 78], [76, 82], [82, 96], [60, 92]], mul(tc, .7));
  // туловище
  const T = [
    [[[22, 104], [40, 92], [46, 118]], 1.08], [[[40, 92], [52, 90], [46, 118]], 1], [[[52, 90], [68, 90], [60, 112]], .95],
    [[[52, 90], [60, 112], [46, 118]], 1.03], [[[68, 90], [74, 118], [60, 112]], .9], [[[68, 90], [80, 92], [74, 118]], .92],
    [[[80, 92], [98, 104], [74, 118]], .84], [[[22, 104], [46, 118], [18, 150]], .98], [[[46, 118], [40, 150], [18, 150]], .92],
    [[[46, 118], [60, 112], [74, 118], [80, 150], [40, 150]], .96], [[[74, 118], [102, 150], [80, 150]], .86], [[[98, 104], [102, 150], [74, 118]], .8],
  ];
  s += T.map(([p, f]) => poly(p, mul(tc, f))).join('');
  if (me.top === 'tee') s += poly([[52, 90], [68, 90], [60, 101]], mul(sk, .8));
  if (me.top === 'hoodie') s += `<path d="M55 96 L54 114 M65 96 L66 114" stroke="#e5e7eb" stroke-width="1.6"/>` + poly([[44, 132], [76, 132], [80, 148], [40, 148]], mul(tc, .82));
  if (me.top === 'jacket') s += poly([[50, 88], [59, 97], [52, 104]], mul(tc, 1.25)) + poly([[70, 88], [61, 97], [68, 104]], mul(tc, 1.1)) + `<path d="M60 97 V150" stroke="#0b0d10" stroke-width="1.6"/>`;
  if (me.top === 'vest') {
    const o = '#ff7a1a';
    s += poly([[28, 102], [50, 91], [56, 112], [52, 150], [24, 150]], o) + poly([[92, 102], [70, 91], [64, 112], [68, 150], [96, 150]], mul(o, .85));
    s += poly([[26, 124], [54, 124], [54, 129], [25, 129]], '#e8eef2') + poly([[25, 137], [53, 137], [53, 142], [24, 142]], '#e8eef2');
    s += poly([[66, 124], [94, 124], [95, 129], [66, 129]], '#cfd6dc') + poly([[67, 137], [95, 137], [96, 142], [67, 142]], '#cfd6dc');
    s += poly([[34, 108], [46, 105], [46, 113], [34, 115]], '#005bff');
  }
  // шея, уши, лицо
  s += poly([[53, 74], [67, 74], [68, 91], [52, 91]], mul(sk, .76));
  if (me.chain === '1') s += `<path d="M51 91 L55 101 L60 104 L65 101 L69 91" fill="none" stroke="#e2b53a" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += poly([[43, 52], [38, 55], [40, 64], [44, 63]], mul(sk, .88)) + poly([[77, 52], [82, 55], [80, 64], [76, 63]], mul(sk, .78));
  s += fan([60, 56], [[44, 44], [52, 32], [68, 32], [76, 44], [77, 60], [70, 74], [60, 79], [50, 74], [43, 60]], sk, [1.06, 1.12, 1, .9, .85, .88, .95, 1, 1.04]);
  s += poly([[60, 57], [63.5, 66], [57.5, 66]], mul(sk, .8));
  s += poly([[50, 56], [55, 55.2], [55, 58], [50, 58]], '#1a1a1a') + poly([[65, 55.2], [70, 56], [70, 58], [65, 58]], '#1a1a1a');
  s += poly([[48.5, 52.5], [56, 51], [56, 52.8], [48.5, 54]], hc) + poly([[64, 51], [71.5, 52.5], [71.5, 54], [64, 52.8]], hc);
  s += poly([[55, 70.5], [65, 70.5], [60, 72.5]], mul(sk, .55));
  // борода
  const beard = [[43, 60], [50, 74], [60, 82], [70, 74], [77, 60], [74, 69], [66, 73], [60, 74], [54, 73], [46, 69]];
  if (me.beard === 'beard') s += fan([60, 74], beard, hc, [1, .9, .85, .9, 1, 1.05, 1.1, 1.05, 1]);
  if (me.beard === 'stub') s += poly(beard, hc, ' opacity=".33"');
  if (me.beard === 'beard' || me.beard === 'mous') s += poly([[53, 68.5], [60, 66.5], [67, 68.5], [65, 70.3], [55, 70.3]], mul(hc, 1.1));
  // волосы спереди
  if (me.hat !== 'hood') {
    const H = {
      buzz: [[[44, 45], [46, 36], [52, 31], [68, 31], [74, 36], [76, 45], [71, 40], [60, 37], [49, 40]], [1, .9]],
      short: [[[42, 50], [43, 38], [50, 28], [60, 25], [70, 28], [77, 38], [78, 50], [74, 42], [66, 38], [56, 38], [47, 43]], [1.15, 1, .9]],
      side: [[[42, 50], [43, 36], [52, 27], [64, 25], [74, 29], [78, 40], [78, 50], [72, 41], [56, 45], [46, 47]], [1.15, 1, .88]],
      long: [[[42, 52], [43, 36], [50, 28], [60, 24], [70, 28], [77, 36], [78, 52], [73, 40], [60, 37], [47, 40]], [1.15, 1, .9]],
      curly: [[[41, 50], [40, 40], [45, 32], [50, 27], [56, 22], [62, 24], [68, 22], [74, 28], [79, 34], [80, 42], [79, 50], [74, 41], [66, 38], [58, 40], [48, 42]], [1.15, .95, 1.05, .9]],
    }[me.hair];
    if (H) s += fan([60, 36], H[0], hc, H[1]);
  }
  // головной убор
  if (me.hat === 'cap') s += fan([60, 36], [[41, 47], [43, 34], [52, 26], [60, 24], [68, 26], [77, 34], [79, 47]], tc, [1.1, 1.15, 1, .95, .85, .8, .9]) + poly([[41, 46], [79, 46], [86, 52], [34, 52]], mul(tc, .65));
  if (me.hat === 'beanie') s += fan([60, 34], [[41, 46], [42, 32], [50, 23], [60, 20], [70, 23], [78, 32], [79, 46]], tc, [1.1, 1.15, 1, .92, .85, .8, .95]) + poly([[40, 42], [80, 42], [80, 50], [40, 50]], mul(tc, .78));
  // очки
  if (me.glasses !== 'none') {
    const f = me.glasses === 'sun' ? '#0b0d10' : 'none';
    s += `<g stroke="#0b0d10" stroke-width="1.6" fill="${f}" opacity="${me.glasses === 'sun' ? .92 : 1}"><rect x="46.5" y="52.5" width="11" height="7.5" rx="1.5"/><rect x="62.5" y="52.5" width="11" height="7.5" rx="1.5"/><path d="M57.5 55 H62.5" fill="none"/></g>`;
  }
  return s + '</svg>';
}

// ---------- редактор ----------
function modalAvatar(m) {
  const d = m.draft;
  const opts = (k, label) => `<div class="av-row"><small>${label}</small><div class="av-opts">${AV[k].map(([v, n]) => `<button class="av-opt ${String(d[k]) === v ? 'on' : ''}" data-a="av" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  const sw = (k, label) => `<div class="av-row"><small>${label}</small><div class="av-opts">${AV[k].map((c, i) => `<button class="av-sw ${d[k] === i ? 'on' : ''}" style="--c:${c}" data-a="av" data-k="${k}" data-v="${i}" aria-label="цвет ${i + 1}"></button>`).join('')}</div></div>`;
  return `<div class="panel"><button class="x" data-a="mclose">${I.x}</button><div class="sec-title">Твой персонаж</div>
    <div class="av-wrap">
      <div class="av-prev" id="avprev">${avatarSvg(d)}</div>
      <div><input class="av-name" id="avname" maxlength="18" placeholder="Как тебя зовут?" value="${esc(d.name)}" data-a="avname">
        ${sw('skin', 'Кожа')}</div>
    </div>
    ${opts('hair', 'Причёска')}${sw('hairC', 'Цвет волос')}${opts('beard', 'Борода')}${opts('hat', 'На голове')}
    ${opts('top', 'Одежда')}${sw('topC', 'Цвет одежды')}${opts('glasses', 'Очки')}${opts('chain', 'Цепь')}
    <button class="btn block green" style="margin-top:14px" data-a="avsave">Готово</button></div>`;
}
function openAvatar() { UI.modal = { type: 'avatar', draft: Object.assign(defaultMe(), S.me || {}) }; render(); }
const meName = () => (S.me && S.me.name) || 'Перекуп';
