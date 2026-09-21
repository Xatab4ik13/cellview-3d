/*!
 * Кладовка78 — виджет 3D-плана кладовок. v1.0
 * Подключение: <div data-kladovka78-plan></div> + <script type="module" src="kladovka78-plan.js"></script>
 * Программно:  import {mount} from './kladovka78-plan.js'; const plan = mount(el, {...});
 * Зависимость: three.js r160 (по умолчанию подтягивается с CDN, можно положить рядом — см. threeBase).
 */
const VERSION = '1.0';
const DEFAULT_THREE_BASE = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';

const DEFAULTS = {
  model: 'kladovka78-plan.glb',   // путь к модели (рядом со скриптом, если не задан абсолютный)
  threeBase: DEFAULT_THREE_BASE,  // откуда брать three.js
  statusUrl: null,                // адрес, отдающий занятость: [{cell|number, status}, …]
  statusMap: null,                // своя функция разбора ответа: (data) => ({'1':'occupied', …})
  statuses: null,                 // либо готовый объект {номер: статус}
  refreshMs: 0,                   // автообновление занятости, мс (0 — выключено)
  view: 'iso',                    // стартовый вид: 'iso' | 'top' | 'south'
  cut: 2.6,                       // высота среза, м
  numbers: true,                  // подписи номеров
  panel: true,                    // левая панель со слоями и поиском
  legend: true,                   // легенда занятости
  height: '70vh',                 // высота контейнера, если у него не задана своя
  onSelect: null,                 // (info) => {} — клик по ячейке
  onReady: null,                  // (api) => {}
};

const KIND = {
  floor:      {ru: 'Пол',                      col: 0x2c313c, order: 1},
  structural: {ru: 'Стены несущие',            col: 0x8d94a3, order: 2},
  partition:  {ru: 'Перегородки',              col: 0xc9cedb, order: 3},
  door:       {ru: 'Двери ячеек',              col: 0x8b5cf6, order: 4},
  officedoor: {ru: 'Двери помещений и входов', col: 0x8b5cf6, order: 5},
  roomdoor:   {ru: 'Двери помещений',          col: 0x8b5cf6, order: 5},
  shelf:      {ru: 'Ярусные полки',            col: 0xf5c542, order: 5},
  casing:     {ru: 'Наличники',                col: 0xf2f4f8, order: 6},
  sign:       {ru: 'Знаки',                    col: 0x1f2430, order: 6},
  window:     {ru: 'Окна',                     col: 0x6ec8f0, order: 6},
  stair:      {ru: 'Лестница',                 col: 0xd98a4a, order: 7},
  excluded:   {ru: 'Вне площади',              col: 0x5a4550, order: 8},
  other:      {ru: 'Каркас и сетка',           col: 0x707888, order: 9},
};
const STATUS = {
  available: {ru: 'Свободна',   col: 0x2fb35e},
  reserved:  {ru: 'Бронь',      col: 0xe8c02a},
  occupied:  {ru: 'Занята',     col: 0xd23b3b},
  unknown:   {ru: 'Нет данных', col: 0x707888},
};
const CAPITAL = /Наружная стена|Капитальная стена|Продольная капитальная|Перемычка прохода|Надоконная перемычка|Входная перемычка|Подоконная часть|западный нижний блок/;
const BRICK_Y = 1.50;

const CSS = `
:host{all:initial}
*{box-sizing:border-box;font-family:"Segoe UI",system-ui,-apple-system,sans-serif}
.wrap{position:relative;width:100%;height:100%;min-height:320px;background:#0f1115;color:#e8eaee;
      border-radius:12px;overflow:hidden;font-size:13px;line-height:1.45}
canvas{position:absolute;inset:0;display:block;width:100%;height:100%}
.panel{position:absolute;background:rgba(20,23,29,.92);border:1px solid #2a2f3a;border-radius:10px;
       backdrop-filter:blur(8px)}
.ui{top:12px;left:12px;width:236px;padding:12px;max-height:calc(100% - 24px);overflow:auto}
.ui h1{margin:0 0 2px;font-size:15px;font-weight:600}
.ui .sub{color:#9aa2b1;font-size:11px;margin-bottom:10px}
.grp{border-top:1px solid #2a2f3a;padding-top:9px;margin-top:9px}
.grp .t{color:#9aa2b1;text-transform:uppercase;font-size:10px;letter-spacing:.09em;margin-bottom:6px}
label.row{display:flex;align-items:center;gap:7px;padding:3px 0;cursor:pointer;user-select:none;color:#e8eaee}
label.row:hover{color:#fff}
.sw{width:11px;height:11px;border-radius:3px;flex:0 0 auto;border:1px solid rgba(255,255,255,.25)}
.cnt{margin-left:auto;color:#9aa2b1;font-size:11px;font-variant-numeric:tabular-nums}
input[type=range]{width:100%;accent-color:#8b5cf6;margin:2px 0}
input[type=search],input[type=text]{width:100%;background:#12151b;border:1px solid #2a2f3a;color:#e8eaee;
       border-radius:7px;padding:6px 8px;font-size:13px}
.btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
button{flex:1 1 auto;background:#1b1f27;color:#e8eaee;border:1px solid #2a2f3a;border-radius:7px;
       padding:6px 8px;cursor:pointer;font-size:12px}
button:hover{background:#262b35;border-color:#3a4150}
.legend{right:12px;top:12px;padding:10px 12px}
.info{left:12px;bottom:12px;right:12px;max-width:440px;padding:10px 12px;display:none}
.info .k{color:#9aa2b1;font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.info .l{font-size:14px;margin-top:2px}
.info .d{color:#9aa2b1;font-size:11px;margin-top:4px}
.load{position:absolute;inset:0;display:grid;place-items:center;color:#9aa2b1;background:#0f1115;
      text-align:center;padding:24px;font-size:13px}
@media (max-width:640px){
  .ui{width:calc(100% - 24px);max-height:46%}
  .legend{top:auto;bottom:12px;right:12px;padding:8px 10px}
  .info{bottom:auto;top:12px;right:12px;left:12px;max-width:none}
}
`;

const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
function toStatus(v){
  const s = norm(v);
  if (!s) return null;
  if (/^(free|available|vacant|свобод)/.test(s)) return 'available';
  if (/^(reserved|booked|hold|брон)/.test(s))    return 'reserved';
  if (/^(occupied|busy|rented|taken|занят)/.test(s)) return 'occupied';
  return null;
}
function defaultStatusMap(data){
  const out = {};
  const list = Array.isArray(data) ? data
    : (Array.isArray(data?.data) ? data.data
    : (Array.isArray(data?.items) ? data.items
    : (Array.isArray(data?.cells) ? data.cells : [])));
  list.forEach(it => {
    if (!it || typeof it !== 'object') return;
    const num = it.cell ?? it.number ?? it.num ?? it.name ?? it.title ?? it.id;
    const st = toStatus(it.status ?? it.state ?? it.availability ?? it.busy);
    const n = String(num ?? '').match(/\d+/);
    if (n && st) out[n[0]] = st;
  });
  return out;
}

function resolve(url, base){
  try { return new URL(url, base).href; } catch { return url; }
}

export async function mount(target, options = {}){
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error('Кладовка78: контейнер не найден');
  const o = Object.assign({}, DEFAULTS, options);
  const here = import.meta.url;
  const modelUrl = resolve(o.model, here);
  // three.js: сначала заданный адрес, затем запасные CDN — если один недоступен
  const bases = [o.threeBase, DEFAULT_THREE_BASE, 'https://unpkg.com/three@0.160.0/']
    .filter(Boolean).map(b => b.endsWith('/') ? b : b + '/');
  let THREE, OrbitControls, GLTFLoader, lastErr;
  for (const tb of [...new Set(bases)]){
    try {
      const [a, b, c] = await Promise.all([
        import(/* @vite-ignore */ tb + 'build/three.module.js'),
        import(/* @vite-ignore */ tb + 'examples/jsm/controls/OrbitControls.js'),
        import(/* @vite-ignore */ tb + 'examples/jsm/loaders/GLTFLoader.js'),
      ]);
      THREE = a; OrbitControls = b.OrbitControls; GLTFLoader = c.GLTFLoader;
      break;
    } catch (e){ lastErr = e; }
  }
  if (!THREE) throw new Error('не загрузился three.js (' + (lastErr && lastErr.message) + ')');

  if (!el.style.height && !el.clientHeight) el.style.height = o.height;
  const shadow = el.shadowRoot || el.attachShadow({mode: 'open'});
  shadow.innerHTML = '';
  const style = document.createElement('style'); style.textContent = CSS; shadow.appendChild(style);
  const wrap = document.createElement('div'); wrap.className = 'wrap'; shadow.appendChild(wrap);
  wrap.innerHTML = `
    <canvas></canvas>
    <div class="panel ui" ${o.panel ? '' : 'hidden'}>
      <h1>План кладовок</h1>
      <div class="sub">Алтайская, 21 · нумерация по факту</div>
      <div class="grp">
        <div class="t">Найти ячейку</div>
        <div style="display:flex;gap:6px">
          <input type="search" inputmode="numeric" placeholder="номер" data-q>
          <button data-go style="flex:0 0 auto">Найти</button>
        </div>
      </div>
      <div class="grp">
        <div class="t">Вид</div>
        <div class="btns">
          <button data-view="iso">Объём</button>
          <button data-view="top">Сверху</button>
          <button data-view="south">Фронт</button>
        </div>
      </div>
      <div class="grp">
        <div class="t">Срез по высоте · <span data-cutv>2,60 м</span></div>
        <input type="range" min="0.4" max="2.6" step="0.05" value="${o.cut}" data-cut>
        <label class="row"><input type="checkbox" data-nums ${o.numbers ? 'checked' : ''}><span>Номера ячеек</span></label>
      </div>
      <div class="grp" data-layers><div class="t">Слои</div></div>
    </div>
    <div class="panel legend" ${o.legend ? '' : 'hidden'} data-legend></div>
    <div class="panel info" data-info></div>
    <div class="load" data-load>Загрузка плана…</div>`;

  const q = (s) => wrap.querySelector(s);
  const canvas = q('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1115);
  scene.fog = new THREE.Fog(0x0f1115, 70, 160);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  scene.add(new THREE.HemisphereLight(0xdfe6f5, 0x1a1d24, 2.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(18, 26, 12); scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd0ff, 0.55); fill.position.set(-20, 14, -14); scene.add(fill);
  const grid = new THREE.GridHelper(90, 90, 0x2a2f3a, 0x1c2029);
  grid.material.transparent = true; grid.material.opacity = .4; grid.position.y = -0.03; scene.add(grid);

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), o.cut);
  const groups = {}, cellIndex = new Map(), doorMeshes = [], zoneMeshes = [];
  const center = new THREE.Vector3();
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true; orbit.dampingFactor = 0.08; orbit.maxPolarAngle = Math.PI / 2 - 0.02;

  // отделка «белый кирпич» выше 1,50 м — только капитальные и наружные стены
  function brickify(mat){
    mat.onBeforeCompile = sh => {
      if (sh.vertexShader.indexOf('#include <begin_vertex>') < 0 ||
          sh.fragmentShader.indexOf('#include <color_fragment>') < 0) return;
      sh.uniforms.uBrickY = {value: BRICK_Y};
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWPosB;')
        .replace('#include <begin_vertex>',
                 '#include <begin_vertex>\n  vWPosB = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>',
`#include <common>
varying vec3 vWPosB;
uniform float uBrickY;
float hashB(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }`)
        .replace('#include <color_fragment>',
`#include <color_fragment>
  vec3 nb = abs(normalize(cross(dFdx(vWPosB), dFdy(vWPosB)) + vec3(1e-7)));
  if (vWPosB.y > uBrickY && nb.y <= max(nb.x, nb.z)) {
    vec2 uvb = (nb.x > nb.z) ? vec2(vWPosB.z, vWPosB.y) : vec2(vWPosB.x, vWPosB.y);
    const float H = 0.077, L = 0.262, J = 0.012;
    float row = floor(uvb.y / H);
    float u   = uvb.x + mod(row, 2.0) * L * 0.5;
    float bx  = mod(u, L);
    float by  = uvb.y - row * H;
    float face = step(J, bx) * step(J, by);
    float v = hashB(vec2(floor(u / L), row));
    diffuseColor.rgb = mix(vec3(0.74, 0.73, 0.71), vec3(0.955, 0.945, 0.925) * (0.955 + 0.07 * v), face);
  }`);
    };
    mat.customProgramCacheKey = () => 'brick';
    return mat;
  }

  // подписи
  function sprite(text, {font = 'bold 46px "Segoe UI",sans-serif', fill = '#ffd400', pad = 0, plate = null, h = 0.42} = {}){
    const cv = document.createElement('canvas');
    const g0 = cv.getContext('2d'); g0.font = font;
    const w = Math.ceil(g0.measureText(text).width) + pad * 2 + 8;
    cv.width = Math.max(w, 64); cv.height = plate ? 70 : 64;
    const g = cv.getContext('2d');
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (plate){ g.fillStyle = plate; g.beginPath();
      if (g.roundRect) g.roundRect(0, 0, cv.width, cv.height, 12); else g.rect(0, 0, cv.width, cv.height);
      g.fill(); }
    else { g.lineWidth = 7; g.strokeStyle = 'rgba(12,14,18,.9)'; g.strokeText(text, cv.width / 2, cv.height / 2); }
    g.fillStyle = fill; g.fillText(text, cv.width / 2, cv.height / 2);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: t, depthTest: false, transparent: true}));
    s.scale.set(cv.width / cv.height * h, h, 1);
    return s;
  }
  const labelGroup = new THREE.Group(); labelGroup.visible = !!o.numbers; scene.add(labelGroup);
  const zoneGroup = new THREE.Group(); scene.add(zoneGroup);
  let labelsBuilt = false;
  function buildLabels(){
    const v = new THREE.Vector3();
    cellIndex.forEach(m => {
      m.updateWorldMatrix(true, false);
      new THREE.Box3().setFromObject(m).getCenter(v);
      const s = sprite(String(m.userData.cell));
      s.userData.cell = m.userData.cell;
      s.position.copy(v);
      s.position.y = m.userData.tier === 'нижний' ? 0.55 : 1.75;
      labelGroup.add(s);
    });
    labelsBuilt = true;
  }
  function buildZoneLabels(){
    const v = new THREE.Vector3();
    zoneMeshes.forEach(m => {
      m.updateWorldMatrix(true, false);
      new THREE.Box3().setFromObject(m).getCenter(v);
      const s = sprite(m.userData.zone, {font: '600 44px "Segoe UI",sans-serif', fill: '#e9ecf3',
                                         pad: 26, plate: 'rgba(14,16,21,.78)', h: 0.6});
      s.position.copy(v); s.position.y = 1.35;
      zoneGroup.add(s);
    });
  }

  // загрузка модели
  const buf = await fetch(modelUrl, {cache: 'default'}).then(r => {
    if (!r.ok) throw new Error('модель не загружена: HTTP ' + r.status);
    return r.arrayBuffer();
  });
  const gltf = await new Promise((res, rej) => new GLTFLoader().parse(buf, '', res, rej));
  const root = gltf.scene;
  new THREE.Box3().setFromObject(root).getCenter(center); center.y = 0;
  const counts = {};
  root.updateMatrixWorld(true);
  const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
  meshes.forEach(m => {
    if (m.userData.kind === 'roomdoor') m.userData.kind = 'officedoor';
    const kind = m.userData.kind || 'other';
    counts[kind] = (counts[kind] || 0) + 1;
    const def = KIND[kind] || KIND.other;
    m.material = new THREE.MeshStandardMaterial({
      color: def.col, metalness: 0, roughness: 0.82, side: THREE.DoubleSide,
      flatShading: true, clippingPlanes: [clipPlane],
      transparent: kind === 'excluded', opacity: kind === 'excluded' ? 0.55 : 1,
    });
    if (kind === 'structural' && CAPITAL.test(m.userData.label || '')) brickify(m.material);
    if (m.userData.zone) zoneMeshes.push(m);
    if (m.userData.cell && (kind === 'door' || kind === 'officedoor')){
      cellIndex.set(String(m.userData.cell), m);
      if (kind === 'door'){
        m.userData._base = def.col;
        m.userData._status = (STATUS[m.userData.status] || STATUS.unknown).col;
        doorMeshes.push(m);
      }
    }
    const world = m.matrixWorld.clone();
    if (!groups[kind]){
      groups[kind] = new THREE.Group();
      groups[kind].position.copy(center).negate();
      scene.add(groups[kind]);
    }
    groups[kind].add(m);
    world.decompose(m.position, m.quaternion, m.scale);
  });
  buildZoneLabels();
  if (o.numbers) buildLabels();

  // слои
  const layers = q('[data-layers]');
  Object.keys(KIND).filter(k => counts[k]).sort((a, b) => KIND[a].order - KIND[b].order).forEach(k => {
    const hex = '#' + KIND[k].col.toString(16).padStart(6, '0');
    const l = document.createElement('label');
    l.className = 'row';
    l.innerHTML = `<input type="checkbox" checked><span class="sw" style="background:${hex}"></span>
                   <span>${KIND[k].ru}</span><span class="cnt">${counts[k]}</span>`;
    l.querySelector('input').addEventListener('change', e => { groups[k].visible = e.target.checked; });
    layers.appendChild(l);
  });

  // занятость
  let statusByCell = {};
  let filterState = {cells: null, statuses: null, tiers: null};
  function tierKey(v){
    const s = norm(v);
    if (s === '2' || s.includes('верх')) return '2';
    if (s === '1' || s.includes('ниж')) return '1';
    return s || '';
  }
  function matchesFilter(m){
    const cell = String(m.userData.cell || '');
    const st = m.userData._statusName || m.userData.status || 'unknown';
    const tier = tierKey(m.userData.tier);
    if (filterState.cells && !filterState.cells.has(cell)) return false;
    if (filterState.statuses && !filterState.statuses.has(st)) return false;
    if (filterState.tiers && !filterState.tiers.has(tier)) return false;
    return true;
  }
  function applyFilter(){
    doorMeshes.forEach(m => {
      const ok = matchesFilter(m);
      m.material.transparent = true;
      m.material.opacity = ok ? 1 : 0.12;
      m.visible = true;
    });
    labelGroup.children.forEach(s => {
      const cell = cellIndex.get(String(s.userData.cell || ''));
      s.visible = !cell || matchesFilter(cell);
    });
  }
  function paint(){
    const cnt = {};
    doorMeshes.forEach(m => {
      const st = statusByCell[String(m.userData.cell)] || m.userData.status || 'unknown';
      m.userData._statusName = STATUS[st] ? st : 'unknown';
      m.material.color.setHex((STATUS[st] || STATUS.unknown).col);
      cnt[m.userData._statusName] = (cnt[m.userData._statusName] || 0) + 1;
    });
    applyFilter();
    const L = q('[data-legend]');
    if (L && o.legend){
      L.innerHTML = Object.keys(STATUS).filter(s => cnt[s]).map(s =>
        `<label class="row"><span class="sw" style="background:#${STATUS[s].col.toString(16).padStart(6, '0')}"></span>
         <span>${STATUS[s].ru}</span><span class="cnt">${cnt[s]}</span></label>`).join('');
    }
  }
  async function loadStatuses(){
    if (o.statuses){ statusByCell = o.statuses; paint(); return statusByCell; }
    if (!o.statusUrl) { paint(); return statusByCell; }
    try {
      const r = await fetch(o.statusUrl, {headers: {'Accept': 'application/json'}, credentials: 'omit'});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      statusByCell = (o.statusMap || defaultStatusMap)(data) || {};
    } catch (e){
      console.warn('Кладовка78: занятость не получена —', e.message);
    }
    paint();
    return statusByCell;
  }
  await loadStatuses();
  let timer = null;
  if (o.refreshMs > 0) timer = setInterval(loadStatuses, Math.max(o.refreshMs, 15000));

  // виды, срез, поиск, выбор
  const START = {iso: [[-26, 20, 22], [0, 1, 0]], top: [[0, 40, 7], [0, 1, 0]], south: [[0, 20.5, 11], [0, 1, 0.5]]};
  function setView(v){
    const s = START[v] || START.iso;
    camera.position.set(...s[0]); orbit.target.set(...s[1]); orbit.update();
  }
  wrap.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  function applyCut(v){
    clipPlane.constant = parseFloat(v);
    q('[data-cutv]').textContent = (+v).toFixed(2).replace('.', ',') + ' м';
  }
  q('[data-cut]').addEventListener('input', e => applyCut(e.target.value));
  applyCut(o.cut);
  q('[data-nums]').addEventListener('change', e => {
    if (e.target.checked && !labelsBuilt) buildLabels();
    labelGroup.visible = e.target.checked;
  });

  const info = q('[data-info]');
  function cellInfo(m){
    const st = m.userData._statusName || m.userData.status || 'unknown';
    return {
      cell: String(m.userData.cell || ''),
      status: st,
      statusRu: (STATUS[st] || STATUS.unknown).ru,
      tier: m.userData.tier || '',
      size: m.userData.size_m || null,
      label: m.userData.label || '',
    };
  }
  function showInfo(m){
    if (!m || !m.userData.cell){ info.style.display = 'none'; return; }
    const i = cellInfo(m);
    info.style.display = 'block';
    info.innerHTML = `<div class="k">Ячейка</div><div class="l">№ ${i.cell} — ${i.statusRu}</div>
      <div class="d">${[i.tier && ('ярус: ' + i.tier), i.size && ('габарит: ' + i.size.join(' × ') + ' м')].filter(Boolean).join(' · ')}</div>`;
    if (typeof o.onSelect === 'function') o.onSelect(i);
  }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let downAt = null, picked = null, pickedMat = null;
  canvas.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
  canvas.addEventListener('pointerup', ev => {
    if (!downAt) return;
    const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]); downAt = null;
    if (moved > 4) return;
    const r = canvas.getBoundingClientRect();
    ptr.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(Object.values(groups).filter(g => g.visible), true)[0];
    if (picked){ picked.material = pickedMat; picked = null; pickedMat = null; }
    if (!hit){ info.style.display = 'none'; return; }
    picked = hit.object; pickedMat = picked.material;
    if ((picked.userData.kind || 'other') !== 'other'){
      picked.material = pickedMat.clone();
      picked.material.emissive = new THREE.Color(0x4a3585);
    }
    showInfo(picked);
  });

  function focusCell(num){
    const m = cellIndex.get(String(num).replace(/\D+/g, ''));
    if (!m) return false;
    m.updateWorldMatrix(true, false);
    const p = new THREE.Vector3();
    new THREE.Box3().setFromObject(m).getCenter(p);
    orbit.target.copy(p);
    camera.position.set(p.x, p.y + 40, p.z + 0.01);
    orbit.update();
    showInfo(m);
    return true;
  }
  q('[data-go]').addEventListener('click', () => focusCell(q('[data-q]').value));
  q('[data-q]').addEventListener('keydown', e => { if (e.key === 'Enter') focusCell(e.target.value); });

  function resize(){
    const w = wrap.clientWidth || el.clientWidth, h = wrap.clientHeight || el.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  const ro = new ResizeObserver(resize); ro.observe(wrap); resize();
  setView(o.view);
  q('[data-load]').remove();

  let alive = true;
  (function loop(){
    if (!alive) return;
    requestAnimationFrame(loop);
    orbit.update();
    renderer.render(scene, camera);
  })();

  const api = {
    version: VERSION, THREE, scene, camera, renderer, orbit, groups, cellIndex,
    focusCell, setView, setCut: applyCut,
    setStatuses(map){ statusByCell = map || {}; paint(); },
    setFilter(filter = {}){
      filterState = {
        cells: Array.isArray(filter.cells) ? new Set(filter.cells.map(v => String(v))) : null,
        statuses: Array.isArray(filter.statuses) ? new Set(filter.statuses.map(v => String(v))) : null,
        tiers: Array.isArray(filter.tiers) ? new Set(filter.tiers.map(tierKey)) : null,
      };
      applyFilter();
    },
    refresh: loadStatuses,
    listCells(){ return [...cellIndex.values()].map(cellInfo); },
    destroy(){
      alive = false; if (timer) clearInterval(timer);
      ro.disconnect(); renderer.dispose(); shadow.innerHTML = '';
    },
  };
  el.__kladovka78Plan = api;
  if (typeof o.onReady === 'function') o.onReady(api);
  return api;
}

function readOptions(el){
  const d = el.dataset, out = {};
  if (d.model) out.model = d.model;
  if (d.statusUrl) out.statusUrl = d.statusUrl;
  if (d.threeBase) out.threeBase = d.threeBase;
  if (d.view) out.view = d.view;
  if (d.cut) out.cut = parseFloat(d.cut);
  if (d.height) out.height = d.height;
  if (d.refreshMs) out.refreshMs = parseInt(d.refreshMs, 10);
  if (d.numbers) out.numbers = d.numbers !== 'false';
  if (d.panel) out.panel = d.panel !== 'false';
  if (d.legend) out.legend = d.legend !== 'false';
  return out;
}
export function autoMount(){
  document.querySelectorAll('[data-kladovka78-plan]').forEach(el => {
    if (el.__kladovka78Plan) return;
    mount(el, readOptions(el)).catch(e => {
      el.textContent = 'План не загрузился: ' + e.message;
      console.error('Кладовка78:', e);
    });
  });
}
if (typeof document !== 'undefined'){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
}
export default {mount, autoMount, version: VERSION};
