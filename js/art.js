// 2D-машины сбоку в SVG. Машина смотрит вправо. Холст 400×170, земля на y=160.
// Каждый кузов: контур, стёкла, колёса [x, r], фара и фонарь, линии дверей.

const BODIES = {
  sedan: {
    body: 'M24,128 Q18,112 28,104 L70,97 Q98,93 128,91 L152,65 Q160,57 176,56 L246,56 Q262,57 274,67 L304,91 L352,95 Q378,99 382,113 L382,128 Q380,134 372,134 L332,134 A27,27 0 0 0 278,134 L122,134 A27,27 0 0 0 68,134 L32,134 Q24,134 24,128 Z',
    glass: ['M137,91 L157,67 Q162,62 174,62 L206,62 L206,91 Z', 'M212,62 L244,62 Q257,63 266,71 L290,91 L212,91 Z'],
    wheels: [[95, 24], [305, 24]], head: [362, 101, 18, 7], tail: [24, 107, 9, 8],
    doors: ['M209,94 L209,128', 'M140,94 Q138,112 142,128', 'M286,96 Q290,112 286,126'],
  },
  hatch: {
    body: 'M40,128 Q34,112 40,98 L50,70 Q56,57 72,56 L222,56 Q240,57 254,69 L284,93 L338,99 Q364,103 366,117 L366,128 Q364,134 356,134 L316,134 A26,26 0 0 0 264,134 L126,134 A26,26 0 0 0 74,134 L48,134 Q40,134 40,128 Z',
    glass: ['M58,93 L64,70 Q68,62 80,62 L150,62 L150,93 Z', 'M156,62 L218,62 Q232,63 244,73 L268,93 L156,93 Z'],
    wheels: [[100, 23], [290, 23]], head: [348, 106, 16, 7], tail: [40, 100, 8, 12],
    doors: ['M153,96 L153,128', 'M262,97 Q266,112 262,126'],
  },
  wagon: {
    body: 'M22,128 Q16,110 24,100 L30,71 Q34,57 50,56 L246,56 Q262,57 274,67 L304,91 L352,95 Q378,99 382,113 L382,128 Q380,134 372,134 L332,134 A27,27 0 0 0 278,134 L122,134 A27,27 0 0 0 68,134 L30,134 Q22,134 22,128 Z',
    glass: ['M38,91 L42,69 Q45,62 56,62 L128,62 L128,91 Z', 'M134,62 L206,62 L206,91 L134,91 Z', 'M212,62 L244,62 Q257,63 266,71 L290,91 L212,91 Z'],
    wheels: [[95, 24], [305, 24]], head: [362, 101, 18, 7], tail: [22, 98, 8, 14],
    doors: ['M131,94 L131,128', 'M209,94 L209,128', 'M286,96 Q290,112 286,126'],
  },
  suv: {
    body: 'M22,124 Q16,100 24,88 L30,51 Q33,36 50,35 L250,35 Q266,36 278,49 L304,81 L356,87 Q380,91 382,107 L382,126 Q380,132 372,132 L338,132 A32,32 0 0 0 274,132 L126,132 A32,32 0 0 0 62,132 L30,132 Q22,132 22,124 Z',
    glass: ['M38,80 L42,48 Q45,41 56,41 L130,41 L130,80 Z', 'M136,41 L206,41 L206,80 L136,80 Z', 'M212,41 L248,41 Q260,42 268,52 L290,80 L212,80 Z'],
    wheels: [[94, 28], [306, 28]], head: [362, 93, 18, 9], tail: [22, 86, 8, 16],
    doors: ['M133,84 L133,126', 'M209,84 L209,126', 'M290,86 Q296,106 290,124'],
    extra: '<rect x="40" y="31" width="200" height="4" rx="2" fill="#1a1d22"/>',
  },
  suvc: { // купе-кроссовер вроде X6
    body: 'M22,124 Q16,100 26,88 L52,52 Q64,38 90,36 L236,36 Q258,38 276,52 L304,81 L356,87 Q380,91 382,107 L382,126 Q380,132 372,132 L338,132 A32,32 0 0 0 274,132 L126,132 A32,32 0 0 0 62,132 L30,132 Q22,132 22,124 Z',
    glass: ['M66,80 L80,52 Q88,42 104,42 L140,42 L140,80 Z', 'M146,42 L210,42 L210,80 L146,80 Z', 'M216,42 L238,42 Q256,44 268,56 L290,80 L216,80 Z'],
    wheels: [[94, 29], [306, 29]], head: [362, 93, 18, 8], tail: [24, 88, 10, 9],
    doors: ['M143,84 L143,126', 'M213,84 L213,126'],
  },
  box: { // Гелик
    body: 'M28,126 L28,92 Q28,84 34,84 L46,84 L52,34 Q53,28 60,28 L262,28 Q270,28 272,34 L284,80 L366,84 Q378,85 378,96 L378,126 Q376,132 368,132 L340,132 A32,32 0 0 0 276,132 L126,132 A32,32 0 0 0 62,132 L34,132 Q28,132 28,126 Z',
    glass: ['M60,78 L64,36 L130,36 L130,78 Z', 'M136,36 L204,36 L204,78 L136,78 Z', 'M210,36 L262,36 L272,78 L210,78 Z'],
    wheels: [[94, 29], [308, 29]], head: [360, 90, 14, 14, true], tail: [28, 92, 7, 16],
    doors: ['M133,82 L133,126', 'M207,82 L207,126', 'M274,82 L274,126'],
    extra: '<circle cx="26" cy="100" r="16" fill="#1a1d22"/><circle cx="26" cy="100" r="8" fill="#3a3f47"/>',
  },
  coupe: {
    body: 'M26,126 Q20,110 30,102 L80,95 Q110,91 140,89 L168,63 Q176,57 192,57 L238,57 Q254,59 268,71 L298,93 L352,97 Q378,101 380,115 L380,128 Q378,134 370,134 L327,134 A27,27 0 0 0 273,134 L127,134 A27,27 0 0 0 73,134 L34,134 Q26,134 26,126 Z',
    glass: ['M150,91 L172,67 Q178,63 190,63 L224,63 L224,91 Z', 'M230,63 L236,63 Q249,64 258,73 L282,91 L230,91 Z'],
    wheels: [[100, 24], [300, 24]], head: [360, 103, 18, 6], tail: [26, 104, 10, 7],
    doors: ['M227,94 L227,128', 'M148,94 Q146,112 150,128'],
    extra: '<path d="M26,100 L18,92 L46,92 L52,100 Z" fill="#1a1d22"/>',
  },
  super: {
    body: 'M20,124 Q18,108 30,102 L110,91 Q150,81 180,67 Q196,59 216,59 L240,61 Q262,65 290,85 L360,97 Q384,103 384,119 L382,128 Q380,134 370,134 L328,134 A27,27 0 0 0 276,134 L124,134 A27,27 0 0 0 72,134 L30,134 Q20,134 20,124 Z',
    glass: ['M152,88 Q178,72 196,66 Q206,63 218,63 L238,65 Q256,69 274,87 Z'],
    wheels: [[98, 24], [302, 24]], head: [362, 104, 18, 5], tail: [22, 104, 12, 6],
    doors: ['M150,92 Q146,112 152,128', 'M262,92 L262,126'],
    extra: '<path d="M150,108 L196,104 L196,116 L156,120 Z" fill="#14161a" opacity=".7"/>',
  },
  pickup: {
    body: 'M18,126 L18,84 L172,84 L176,47 Q178,39 190,39 L262,39 Q276,40 284,51 L306,83 L358,89 Q382,93 384,109 L384,126 Q382,132 374,132 L340,132 A31,31 0 0 0 278,132 L122,132 A31,31 0 0 0 62,132 L24,132 Q18,132 18,126 Z',
    glass: ['M186,80 L188,47 Q190,45 196,45 L232,45 L232,80 Z', 'M238,45 L262,45 Q272,46 278,55 L294,80 L238,80 Z'],
    wheels: [[92, 28], [308, 28]], head: [364, 95, 18, 9], tail: [18, 90, 7, 14],
    doors: ['M172,86 L172,126', 'M235,84 L235,126'],
  },
  van: {
    body: 'M16,126 L16,30 Q16,20 28,20 L282,20 Q296,20 304,34 L330,70 L362,80 Q382,86 384,104 L384,126 Q382,134 372,134 L328,134 A28,28 0 0 0 272,134 L118,134 A28,28 0 0 0 62,134 L24,134 Q16,134 16,126 Z',
    glass: ['M30,32 L110,32 L110,66 L30,66 Z', 'M120,32 L200,32 L200,66 L120,66 Z', 'M210,32 L262,32 L262,72 L210,72 Z', 'M272,30 L290,30 Q296,30 300,38 L322,72 L272,72 Z'],
    wheels: [[90, 25], [300, 25]], head: [366, 92, 16, 9], tail: [16, 92, 6, 16],
    doors: ['M206,26 L206,128', 'M266,26 L266,128'],
  },
  old: { // классика: «Волга», «Копейка», «Москвич»
    body: 'M20,128 Q14,104 34,98 L100,93 Q118,91 128,87 Q140,59 170,55 L238,55 Q262,57 276,83 Q282,91 300,93 L360,97 Q384,101 384,119 L384,128 Q382,134 372,134 L326,134 A27,27 0 0 0 274,134 L122,134 A27,27 0 0 0 68,134 L28,134 Q20,134 20,128 Z',
    glass: ['M138,89 Q148,63 172,61 L204,61 L204,89 Z', 'M210,61 L236,61 Q256,63 268,89 L210,89 Z'],
    wheels: [[95, 23], [300, 23]], head: [372, 104, 9, 9, true], tail: [22, 104, 7, 9],
    doors: ['M207,92 L207,128', 'M136,94 Q134,112 138,128'],
    extra: '<path d="M30,112 L380,112" stroke="#e9eef4" stroke-width="2.5" opacity=".85"/><rect x="372" y="116" width="14" height="10" rx="3" fill="#cfd5dc"/><rect x="14" y="116" width="14" height="10" rx="3" fill="#cfd5dc"/>',
  },
  micro: {
    body: 'M60,128 Q52,104 62,94 Q72,62 100,57 L230,55 Q262,57 280,85 L318,99 Q338,105 338,119 L338,130 Q336,136 328,136 L298,136 A24,24 0 0 0 252,136 L138,136 A24,24 0 0 0 92,136 L68,136 Q60,136 60,128 Z',
    glass: ['M78,93 Q86,67 104,63 L160,62 L160,93 Z', 'M166,62 L226,62 Q252,63 266,93 L166,93 Z'],
    wheels: [[115, 21], [275, 21]], head: [326, 106, 10, 9, true], tail: [60, 100, 7, 10],
    doors: ['M163,96 L163,130'],
  },
};

let artSeq = 0;
function shade(hex, f) { // f>0 светлее, f<0 темнее
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = f > 0 ? 255 : 0, p = Math.abs(f);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function wheelSvg(x, y, r, id, sporty) {
  const rim = r * 0.6, spokes = sporty ? 10 : 5;
  let s = `<circle cx="${x}" cy="${y}" r="${r}" fill="#16181c"/><circle cx="${x}" cy="${y}" r="${r - 2}" fill="none" stroke="#2a2d33" stroke-width="2"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${rim}" fill="url(#rim${id})"/>`;
  for (let i = 0; i < spokes; i++) {
    const a = i / spokes * Math.PI * 2 + 0.3;
    s += `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * rim * 0.92).toFixed(1)}" y2="${(y + Math.sin(a) * rim * 0.92).toFixed(1)}" stroke="#8a929d" stroke-width="${sporty ? 2 : 4}" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${x}" cy="${y}" r="${rim * 0.28}" fill="#5b636e"/><circle cx="${x}" cy="${y}" r="${rim * 0.12}" fill="#c9ced6"/>`;
  return s;
}

function motoSvg(color, id) {
  const c = color, d = shade(color, -0.35), l = shade(color, 0.3);
  return `
  <defs><linearGradient id="mb${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${d}"/></linearGradient>
  <radialGradient id="rim${id}"><stop offset="0" stop-color="#e3e7ec"/><stop offset="1" stop-color="#6c7480"/></radialGradient></defs>
  <ellipse cx="200" cy="160" rx="150" ry="8" fill="#000" opacity=".28"/>
  <path d="M110,124 L170,96 L238,96 L290,124" stroke="#3a3f47" stroke-width="7" fill="none" stroke-linejoin="round"/>
  <path d="M262,58 L292,124" stroke="#9aa3ad" stroke-width="7" stroke-linecap="round"/>
  <path d="M126,118 L196,118 Q206,126 196,132 L134,130 Z" fill="#7d858f"/>
  <path d="M60,112 L150,110" stroke="#aab2bb" stroke-width="7" stroke-linecap="round"/>
  ${wheelSvg(110, 124, 34, id, true)}${wheelSvg(292, 124, 34, id, true)}
  <path d="M168,80 Q186,60 226,62 L254,70 L248,94 L180,98 Z" fill="url(#mb${id})"/>
  <path d="M112,84 L168,82 L176,94 L120,98 Z" fill="#1f2226"/>
  <path d="M98,82 L124,80 L126,90 L104,92 Z" fill="url(#mb${id})"/>
  <path d="M246,66 Q270,52 290,62 L282,86 L252,92 Z" fill="url(#mb${id})"/>
  <path d="M258,56 L272,42" stroke="#2b2f35" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="288" cy="70" rx="6" ry="8" fill="#fff6c8"/>
  <path d="M182,70 Q204,62 228,66" stroke="#fff" stroke-width="3" opacity=".35" fill="none"/>`;
}

// Главная функция: SVG машины. car — объект машины (m, color, wear, acc).
function carSvg(car, cls) {
  const md = MODELS[car.m], id = ++artSeq;
  const color = COLORS[car.color].c;
  if (md.body === 'moto') return `<svg class="${cls || 'car'}" viewBox="0 0 400 170">${motoSvg(color, id)}</svg>`;
  const B = BODIES[md.body] || BODIES.sedan;
  const lt = shade(color, 0.28), dk = shade(color, -0.42), mid = shade(color, -0.08);
  const sporty = md.cls === 'sport' || md.cls === 'prem';
  let s = `<svg class="${cls || 'car'}" viewBox="0 0 400 170"><defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset=".45" stop-color="${color}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dk}"/></linearGradient>
    <linearGradient id="gl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb4c8"/><stop offset=".5" stop-color="#2b3a4a"/><stop offset="1" stop-color="#121a24"/></linearGradient>
    <radialGradient id="rim${id}"><stop offset="0" stop-color="#e3e7ec"/><stop offset="1" stop-color="#6c7480"/></radialGradient>
    <clipPath id="cl${id}"><path d="${B.body}"/></clipPath></defs>`;
  s += `<ellipse cx="200" cy="160" rx="178" ry="9" fill="#000" opacity=".3"/>`;
  for (const [x, r] of B.wheels) s += `<circle cx="${x}" cy="${160 - r - 2}" r="${r + 4}" fill="#0b0d10"/>`; // тёмные арки
  s += `<path d="${B.body}" fill="url(#bg${id})" stroke="${dk}" stroke-width="1.5"/>`;
  // нижний порог потемнее
  s += `<g clip-path="url(#cl${id})"><rect x="0" y="118" width="400" height="30" fill="#000" opacity=".18"/>`;
  // блик вдоль борта
  s += `<rect x="0" y="${B.wheels[0][1] > 26 ? 88 : 98}" width="400" height="3" fill="#fff" opacity=".22"/>`;
  // ржавчина и вмятины
  const bw = car.wear ? car.wear.body : 0;
  if (bw > 50) {
    const n = Math.round((bw - 45) / 10);
    for (let i = 0; i < n; i++) {
      const wx = B.wheels[i % 2][0] + (i % 3 - 1) * 22, wy = 122 - (i % 2) * 8;
      s += `<ellipse cx="${wx}" cy="${wy}" rx="${8 + i % 3 * 4}" ry="${5 + i % 2 * 3}" fill="#7a3d16" opacity=".75"/>`;
    }
  }
  if (car.acc && car.wear && car.wear.body > 30) s += `<path d="M300,100 q10,6 22,2 q-6,10 -20,8 Z" fill="#000" opacity=".25"/>`;
  s += `</g>`;
  for (const g of B.glass) s += `<path d="${g}" fill="url(#gl${id})" stroke="#0d1117" stroke-width="2.5"/>`;
  s += `<path d="${B.glass[0]}" fill="#fff" opacity=".08"/>`;
  for (const d of B.doors) s += `<path d="${d}" stroke="${dk}" stroke-width="1.6" fill="none" opacity=".8"/>`;
  // ручки
  B.doors.slice(0, 2).forEach(d => { const x = +d.split(/[ML,]/)[1] + 14; s += `<rect x="${x}" y="${B.wheels[0][1] > 26 ? 90 : 100}" width="12" height="3" rx="1.5" fill="${dk}"/>`; });
  const [hx, hy, hw, hh, round] = B.head;
  s += round ? `<circle cx="${hx}" cy="${hy}" r="${hw / 1.6}" fill="#fff6c8" stroke="#9aa3ad" stroke-width="2"/>`
    : `<rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="3" fill="#fff6c8"/><rect x="${hx}" y="${hy}" width="${hw}" height="${hh}" rx="3" fill="none" stroke="#0d1117" stroke-width="1.5" opacity=".6"/>`;
  const [tx, ty, tw, th] = B.tail;
  s += `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="2" fill="#d4242c"/>`;
  if (B.extra) s += B.extra;
  for (const [x, r] of B.wheels) s += wheelSvg(x, 160 - r - 2, r, id, sporty);
  return s + '</svg>';
}

// Сцена-«фото» за машиной
function sceneClass(car) { return 'scene scene-' + car.scene; }

// Реальное фото модели (Wikimedia Commons). SVG остаётся под ним: если фото не загрузится, будет видна нарисованная машина.
function carPic(car) {
  const ph = typeof PHOTOS !== 'undefined' && PHOTOS[car.m];
  if (!ph || !ph.length) return carSvg(car);
  const p = ph[(car.ph != null ? car.ph : car.uid) % ph.length];
  // пока фото грузится — нейтральный фон; нарисованная машина показывается, только если фото не загрузилось
  return carSvg(car).replace('<svg class="car"', '<svg class="car fb"') + `<img class="photo ${car.wear && car.wear.body > 60 ? 'rough' : ''}" src="${p.u}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.previousElementSibling.classList.remove('fb');this.remove()">`;
}
