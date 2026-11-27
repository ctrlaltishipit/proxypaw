/**
 * CommunityWorld: 3D gated communities you can watch and walk through.
 *
 * One engine builds whichever community is chosen from ./worldLayouts (each an
 * illustrative model based on that community's published master plan: homes,
 * internal roads, a charcoal jogging track with white lanes, pool, clubhouse,
 * lawns). Choosing another community freezes the last frame, rebuilds the
 * scene behind it and dissolves into the new one; the renderer is kept.
 *
 * The menu is one glass panel: an area filter, the communities in that area,
 * the three services (dog walking, cat care, overnight boarding), Watch and
 * Explore on foot. Three stories play inside a flat (the dog walker arriving,
 * a cat home visit, an overnight stay at a host's home); the dog story then
 * hands over the leash: WASD or arrow keys walk, dragging looks around,
 * tapping the ground walks there along the paths, the checklist can auto-walk
 * you to each stop. On foot it is a small game: you start under a start arch on
 * the track, holding the up arrow follows the track round, bones along it are
 * worth ProxyPaw points (so are the stops, photos and a full lap), a minimap
 * shows the path, the bones left and you, and the best score in each community
 * is kept on this device. From the air the walk path is drawn as a route.
 *
 * Left alone, it plays by itself like a video: a "director" moves a demo
 * cursor over the real controls (community pill, service pill, Watch, the
 * checklist, action buttons, End walk) and calls their handlers, touring
 * three communities with one service each, then looping. Any real press, tap
 * or key inside the world hands control to the visitor.
 *
 * People and pets come from ./worldActors. Built with three.js, loaded
 * lazily, rendered only while on screen. Stylised, not photoreal.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { T, head, body } from './ui';
import { createActors, xf, paint, merge } from './worldActors';
import type { Person } from './worldActors';
import { LAYOUTS, COMMUNITY_IDS, DRAFTS, AREAS } from './worldLayouts';
import type { Area, CommunityId, StopId } from './worldLayouts';

const PRICE = 249;

/* ---------- ProxyPaw points: a game inside the walk ---------- */
/** what each thing is worth while you walk a community on foot */
const PTS = { bone: 10, gold: 50, stop: 25, allStops: 50, allBones: 100, lap: 100, photo: 5 };
const BANK_KEY = 'pp-points-v1';
/** best score per community, kept on this device only (no account, nothing sent anywhere) */
function loadBank(): Record<string, number> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(BANK_KEY) || '{}'), out: Record<string, number> = {};
    if (v && typeof v === 'object') for (const [k, n] of Object.entries(v as Record<string, unknown>)) if (typeof n === 'number' && n > 0 && n < 100000) out[k] = Math.round(n);
    return out;
  } catch { return {}; }
}
function saveBank(b: Record<string, number>) { try { localStorage.setItem(BANK_KEY, JSON.stringify(b)); } catch { /* private mode: the points simply last for this visit */ } }

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,.62)', border: '1px solid rgba(255,255,255,.75)',
  backdropFilter: 'blur(16px) saturate(1.6)', WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
  boxShadow: '0 10px 30px rgba(20,48,31,.14)', borderRadius: 18,
};

/* ---------- small builders ---------- */

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
function std(color: string | number, rough = 0.85, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
}
/** every texture painted here, so that switching community can free them all, including ones on sprites that already left the scene */
const paintedTex = new Set<THREE.Texture>();
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  paintedTex.add(t);
  return t;
}
function rand(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }

/** Beige towers with white vertical bays and a darker band every four floors. */
function facade(floors: number, cols: number, seed: number) {
  const cw = 40, fh = 56;
  const W = cols * cw, H = Math.min(2048, floors * fh), k = H / (floors * fh);
  const r = rand(seed);
  const lit: boolean[] = [];
  for (let i = 0; i < floors * cols; i++) lit.push(r() < 0.4);
  const map = canvasTex(W, H, (g) => {
    g.scale(1, k);
    g.fillStyle = '#cdb49c'; g.fillRect(0, 0, W, floors * fh);
    for (let c = 0; c < cols; c++) if (c % 3 === 1) { g.fillStyle = '#f1efe8'; g.fillRect(c * cw + 2, 0, cw - 4, floors * fh); }
    for (let f = 0; f < floors; f++) {
      const y = f * fh;
      for (let c = 0; c < cols; c++) {
        const x = c * cw, white = c % 3 === 1;
        const grd = g.createLinearGradient(0, y, 0, y + fh);
        grd.addColorStop(0, '#7d98a6'); grd.addColorStop(1, '#4d6878');
        g.fillStyle = grd; g.fillRect(x + 9, y + 12, cw - 18, fh * 0.5);
        g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 9, y + 12, 5, fh * 0.5);
        if (r() < 0.2) { g.fillStyle = r() < 0.5 ? '#eadfc6' : '#d9e3e6'; g.fillRect(x + cw / 2, y + 12, cw / 2 - 9, fh * 0.5); }
        if (white) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x + 4, y + fh * 0.62, cw - 8, fh * 0.2); g.fillStyle = '#b9b3a8'; g.fillRect(x + 4, y + fh * 0.6, cw - 8, 2); }
        if (r() < 0.07) { g.fillStyle = '#4f9a57'; g.beginPath(); g.arc(x + 12, y + fh * 0.66, 5, 0, 7); g.fill(); }
      }
      g.fillStyle = 'rgba(120,96,78,.35)'; g.fillRect(0, y + fh - 3, W, 3);
      if (f % 4 === 0) { g.fillStyle = '#8d6f58'; g.fillRect(0, y, W, 7); }
    }
  });
  const emissive = canvasTex(W, H, (g) => {
    g.scale(1, k);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, floors * fh);
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      if (!lit[f * cols + c]) continue;
      g.fillStyle = r() < 0.8 ? '#ffcf86' : '#fff1d0';
      g.fillRect(c * cw + 9, f * fh + 12, cw - 18, fh * 0.5);
    }
  });
  return { map, emissive };
}

function label(text: string, opts: { bg?: string; fg?: string; scale?: number } = {}) {
  const fs = 44, padX = 30;
  const tmp = document.createElement('canvas').getContext('2d')!;
  tmp.font = `700 ${fs}px Plus Jakarta Sans, Inter, sans-serif`;
  const w = Math.ceil(tmp.measureText(text).width) + padX * 2, h = 84;
  const tex = canvasTex(w, h, (g) => {
    g.fillStyle = opts.bg ?? 'rgba(255,255,255,.92)';
    g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 40); g.fill();
    g.font = `700 ${fs}px Plus Jakarta Sans, Inter, sans-serif`;
    g.fillStyle = opts.fg ?? '#14301f'; g.textBaseline = 'middle'; g.fillText(text, padX, h / 2 + 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  const sc = opts.scale ?? 1;
  s.scale.set((w / h) * 1.6 * sc, 1.6 * sc, 1);
  s.renderOrder = 10;
  return s;
}

function heartTex() {
  return canvasTex(64, 64, (g) => {
    g.fillStyle = '#ef5b6b';
    g.beginPath(); g.moveTo(32, 56);
    g.bezierCurveTo(4, 36, 6, 10, 22, 10); g.bezierCurveTo(28, 10, 32, 15, 32, 20);
    g.bezierCurveTo(32, 15, 36, 10, 42, 10); g.bezierCurveTo(58, 10, 60, 36, 32, 56); g.fill();
  });
}

/** Ribbon mesh along a curve (paths). */
function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, segs: number, y: number, mat: THREE.Material, off = 0) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const len = curve.getLength();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const n = V(-tan.z, 0, tan.x).normalize();
    p.addScaledVector(n, off); n.multiplyScalar(width / 2); // `off` slides the whole ribbon sideways (a kerb beside a track)
    pos.push(p.x + n.x, y, p.z + n.z, p.x - n.x, y, p.z - n.z);
    uv.push(0, (t * len) / width, 1, (t * len) / width);
    if (i < segs) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true;
  return m;
}

/* ---------- component ---------- */

interface Stats { minutes: number; km: number; photos: number }
type Mode = 'menu' | 'story' | 'walk' | 'ended' | 'catdone' | 'boarddone';
type StoryId = 'dog' | 'cat' | 'board';
/** the three services, as the switch names them, with the price line the site shows for each */
const SERVICES: { id: StoryId; label: string; price: string; line: string }[] = [
  { id: 'dog', label: 'Dog walking', price: 'Walks from ₹149', line: 'A verified neighbour walks your dog on the community track, with live GPS and photo updates.' },
  { id: 'cat', label: 'Cat care', price: 'Cat home visits from ₹129', line: 'Food, fresh water, litter and play, in your cat\'s own home.' },
  { id: 'board', label: 'Overnight boarding', price: 'Boarding from ₹449 a night', line: 'Your pet sleeps over at a vetted host\'s home in your community, with daily photos.' },
];
/** the self-playing tour: one glimpse per community, a different service in each */
/** the self-playing tour shows three communities per loop, one service each (only ones that have a layout) */
const TOUR: { c: CommunityId; s: StoryId }[] = ([{ c: 'prestige', s: 'dog' }, { c: 'myscape', s: 'cat' }, { c: 'olympus', s: 'board' }] as { c: CommunityId; s: StoryId }[]).filter((t) => LAYOUTS[t.c]);
const slug = (t: string) => t.toLowerCase().replace(/\s+/g, '-');

export default function CommunityWorld({ onJoin }: { onJoin: (source: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null); // one renderer for the life of the section; only the scene is rebuilt
  // the tour outlives a community switch: the scene is rebuilt, the tour and its cursor carry on from here
  const tourRef = useRef({ on: false, step: 0, x: 0, y: 0, swapped: false, touched: false });
  const api = useRef<{
    act: (id: StopId) => void; goTo: (id: StopId) => void; photo: () => string | null;
    setNight: (n: boolean) => void; play: (s: StoryId, glimpse?: boolean) => void; skip: () => void; explore: () => void; menu: () => void; sync: (x: Mode) => void;
    dirStart: () => void; dirPause: (p: boolean) => void; freeze: () => void;
  } | null>(null);

  const [community, setCommunity] = useState<CommunityId>('prestige');
  const [service, setService] = useState<StoryId>('dog');
  const [area, setArea] = useState<Area | 'All'>('All');
  const LY = LAYOUTS[community], STOPS = LY.stops;

  const [mode, setMode] = useState<Mode>('menu');
  const [story, setStory] = useState<StoryId | null>(null);
  const [caption, setCaption] = useState<{ text: string; i: number; n: number; img?: string } | null>(null);
  const [near, setNear] = useState<StopId | null>(null);
  const [done, setDone] = useState<StopId[]>([]);
  const [stats, setStats] = useState<Stats>({ minutes: 0, km: 0, photos: 0 });
  // the game inside the walk: bones along the track are worth ProxyPaw points
  const [bones, setBones] = useState({ got: 0, of: 0 });
  // the score carries the community it was earned in, so a switch of community can never bank it under the wrong name
  const [score, setScore] = useState<{ c: CommunityId; n: number }>({ c: 'prestige', n: 0 });
  const [bank, setBank] = useState<Record<string, number>>(loadBank); // best score per community, on this device
  const mapRef = useRef<HTMLCanvasElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [night, setNight] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false); // true once the first real frames are on the canvas
  const dissolveRef = useRef<HTMLCanvasElement>(null);
  const [listOpen, setListOpen] = useState(true);
  // the director plays the stories and the walk by itself; `demo` is its on-screen cursor
  const [dir, setDir] = useState<'off' | 'play' | 'pause'>('off');
  const [demo, setDemo] = useState({ x: 0, y: 0, on: false, press: false, rip: 0, cut: 0 });
  const listRef = useRef(true); listRef.current = listOpen;
  const photoRef = useRef<() => void>(() => {});
  const toastTimer = useRef(0);

  // a walk you played yourself counts: the best score in each community is kept (the self-playing tour's points are not)
  useEffect(() => {
    if (dir !== 'off' || score.n <= 0) return;
    setBank((b) => { if ((b[score.c] ?? 0) >= score.n) return b; const nb = { ...b, [score.c]: score.n }; saveBank(nb); return nb; });
  }, [score, dir]);
  const points = score.c === community ? score.n : 0;

  const say = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  useEffect(() => {
    const canvas = canvasRef.current!, wrap = wrapRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = rendererRef.current ?? (rendererRef.current = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }));
    } catch { setWebgl(false); return; }
    // every community starts on its own menu
    setMode('menu'); setStory(null); setCaption(null); setNear(null); setDone([]); setStats({ minutes: 0, km: 0, photos: 0 }); setBones({ got: 0, of: 0 }); setScore({ c: community, n: 0 }); setPhotos([]); setToast(null); setNight(false);
    const small = wrap.clientWidth < 700, coarse = !!window.matchMedia?.('(pointer: coarse)').matches;
    // a narrow screen sees less to either side, so the opening view stands further back (and sways less)
    // A long, low community may give its own opening view for narrow screens (looking along its length).
    const narrowView = small && !!LY.aerialNarrow;
    const AV = (narrowView && LY.aerialNarrow) || LY.aerial; // orbit centre x, z, camera height, radius, look height, bearing in degrees
    const AK = narrowView ? 1 : small ? THREE.MathUtils.clamp(0.45 / ((wrap.clientWidth / Math.max(1, wrap.clientHeight)) * 0.625), 1.15, 1.6) : 1;
    const A_BEAR = ((AV[5] ?? 90) * Math.PI) / 180, A_SWAY = narrowView ? 0.06 : small ? 0.2 : 0.32;
    if (small) setListOpen(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const AC = createActors(Math.min(4, maxAniso));

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRoom = new RoomEnvironment(), envRT = pmrem.fromScene(envRoom, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.35;
    const DAY = { top: new THREE.Color('#6fb4e4'), bottom: new THREE.Color('#e6f2ee'), fog: new THREE.Color('#dcebe8') };
    const NIGHT = { top: new THREE.Color('#0c1a2e'), bottom: new THREE.Color('#2a3d4d'), fog: new THREE.Color('#1c2c38') };
    scene.fog = new THREE.Fog(DAY.fog.clone(), 120, 520);
    const camera = new THREE.PerspectiveCamera(52, 1, 0.25, 1600);

    const skyU = { top: { value: DAY.top.clone() }, bottom: { value: DAY.bottom.clone() } };
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(900, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.5+0.06,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, h),1.0); }',
      }),
    ));
    const hemi = new THREE.HemisphereLight('#dff3ff', '#55924a', 0.9); scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff1d6', 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 10, far: 520 });
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
    scene.add(sun); scene.add(sun.target);
    const SUN_OFF = V(-90, 170, 70);
    let shadowR = 80;
    const setRange = (aerial: boolean) => {
      const r = aerial ? 250 : 80; if (r === shadowR) return; shadowR = r;
      sun.shadow.bias = aerial ? -0.0016 : -0.0004; sun.shadow.normalBias = aerial ? 0.6 : 0.05;
      Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sun.shadow.camera.updateProjectionMatrix();
      const f = scene.fog as THREE.Fog; f.near = aerial ? 320 : 120; f.far = aerial ? 1100 : 520;
      // From the air everything is hundreds of metres away. A far near-plane gives the depth buffer the precision to
      // keep lawn, roads, track and paint apart; with the ground-level near-plane they flicker and break into blocks.
      camera.near = aerial ? 40 : 0.25; camera.updateProjectionMatrix();
    };

    /* ---- ground, roads, paths ---- */
    const grassTex = canvasTex(512, 512, (g) => {
      g.fillStyle = '#4f9a3c'; g.fillRect(0, 0, 512, 512);
      const r = rand(7);
      for (let i = 0; i < 26000; i++) {
        g.strokeStyle = ['#3f8a33', '#5fae45', '#4a983a', '#6fbc50', '#55a440', '#7cc45a', '#3a7f30'][Math.floor(r() * 7)];
        g.lineWidth = 0.8 + r(); const x = r() * 512, y = r() * 512, a = -1.57 + (r() - 0.5) * 1.2, l = 3 + r() * 6;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
    });
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping; grassTex.repeat.set(380, 380);
    // wide enough that the lower opening views never see its edge: it fades into the haze instead
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1400, 64), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    // soft sunlit and damp patches so the lawn never reads as one flat colour
    const patchTex = canvasTex(512, 512, (g) => {
      const r = rand(19);
      for (let i = 0; i < 60; i++) {
        const x = r() * 512, y = r() * 512, rad = 30 + r() * 90, dark = r() < 0.5;
        for (const ox of [-512, 0, 512]) for (const oy of [-512, 0, 512]) { // wrapped, so the tiles never show an edge
          const grd = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
          grd.addColorStop(0, dark ? 'rgba(24,78,30,.3)' : 'rgba(170,228,110,.26)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = grd; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
        }
      }
    });
    patchTex.wrapS = patchTex.wrapT = THREE.RepeatWrapping; patchTex.repeat.set(20, 20);
    const patches = new THREE.Mesh(new THREE.PlaneGeometry(2800, 2800), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    patches.rotation.x = -Math.PI / 2; patches.position.y = 0.012; scene.add(patches);

    const asphaltTex = canvasTex(64, 256, (g) => {
      g.fillStyle = '#8f9390'; g.fillRect(0, 0, 64, 256);
      const r = rand(3); for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? '#868a87' : '#999d9a'; g.fillRect(r() * 64, r() * 256, 2, 2); }
      g.fillStyle = '#e9e7df'; g.fillRect(0, 0, 3, 256); g.fillRect(61, 0, 3, 256);
      g.fillStyle = '#f4f2ea'; g.fillRect(30, 20, 4, 90);
    });
    asphaltTex.wrapS = asphaltTex.wrapT = THREE.RepeatWrapping;
    const roadM = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const graniteTex = canvasTex(128, 128, (g) => {
      g.fillStyle = '#c9cbc6'; g.fillRect(0, 0, 128, 128);
      const r = rand(5); for (let i = 0; i < 1600; i++) { g.fillStyle = ['#bfc1bc', '#d3d5d0', '#b4b6b1'][Math.floor(r() * 3)]; g.fillRect(r() * 128, r() * 128, 2, 2); }
      g.strokeStyle = '#aeb0ab'; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128);
    });
    graniteTex.wrapS = graniteTex.wrapT = THREE.RepeatWrapping;
    const pathM = new THREE.MeshStandardMaterial({ map: graniteTex, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const curve = (pts: [number, number][], closed: boolean): THREE.Curve<THREE.Vector3> => pts.length === 2 ? new THREE.LineCurve3(V(pts[0][0], 0, pts[0][1]), V(pts[1][0], 0, pts[1][1])) : new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z)), closed, 'catmullrom', 0.5);
    const ring = curve(LY.ring, true), loop = curve(LY.loop, true);
    scene.add(ribbon(ring, 7, Math.max(120, Math.min(900, Math.round(ring.getLength() / 1.4))), 0.03, roadM));
    // the inner loop is a charcoal jogging track: three lanes, crisp white lines
    const TRACK_W = 4;
    const trackTex = canvasTex(256, 256, (g) => {
      g.fillStyle = '#2a2c2e'; g.fillRect(0, 0, 256, 256);
      const r = rand(13); for (let i = 0; i < 2600; i++) { g.fillStyle = ['#323538', '#232527', '#2f3134', '#3a3d40'][Math.floor(r() * 4)]; g.fillRect(r() * 256, r() * 256, 1.6, 1.6); }
      g.fillStyle = '#f6f5ef';
      g.fillRect(7, 0, 7, 256); g.fillRect(242, 0, 7, 256);
      g.fillRect(256 / 3 - 2.5, 0, 5, 256); g.fillRect((256 * 2) / 3 - 2.5, 0, 5, 256);
    });
    trackTex.wrapS = trackTex.wrapT = THREE.RepeatWrapping; trackTex.anisotropy = maxAniso;
    const trackM = new THREE.MeshStandardMaterial({ map: trackTex, roughness: 0.93, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const isPath = !!LY.loopIsPath; // where the plan draws no jogging track, the circuit is an ordinary garden path
    const loopLen = loop.getLength(), ringLen = ring.getLength();
    scene.add(ribbon(loop, isPath ? 3.6 : TRACK_W, Math.max(400, Math.round(loopLen / 1.5)), 0.05, isPath ? new THREE.MeshStandardMaterial({ map: graniteTex, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }) : trackM));
    // Counts and speeds follow the length of the road or track, so a short drop-off loop is not crowded and a long perimeter
    // is not bare. Mid-sized ones keep exactly the counts they were tuned with.
    const byLen = (n: number, len: number, ref: number) => { const k = len / ref; return Math.max(2, Math.round(n * (k < 0.5 ? k / 0.5 : k > 1.6 ? k / 1.6 : 1))); };
    const JOG = 3.8 / loopLen, STROLL = 1.5 / loopLen, DRIVE = Math.min(8.4, Math.max(1.5, ringLen / 40)) / ringLen; // laps per second
    // painted distance marks and a start line, the way a real community track has them
    let tStart = 0; { let bd = 1e9; for (let i = 0; i < 300; i++) { const p = loop.getPointAt(i / 300), d = Math.hypot(p.x - LY.trackStart[0], p.z - LY.trackStart[1]); if (d < bd) { bd = d; tStart = i / 300; } } }
    // distance ticks every 50 m: short bars on the outer lane (no painted words: they read upside down from the other side)
    for (let k = 1; !isPath && k * 50 < loopLen - 20; k++) {
      const tt = (((tStart + (k * 50) / loopLen) % 1) + 1) % 1, p = loop.getPointAt(tt), tan = loop.getTangentAt(tt);
      const nx = tan.z, nz = -tan.x, off = TRACK_W / 2 - 0.55;
      const tick = mesh(new THREE.PlaneGeometry(0.7, 0.16), new THREE.MeshStandardMaterial({ color: '#f6f5ef', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), p.x + nx * off, 0.06, p.z + nz * off, false);
      tick.rotation.order = 'YXZ'; tick.rotation.y = Math.atan2(tan.x, tan.z); tick.rotation.x = -Math.PI / 2; scene.add(tick);
    }
    if (!isPath) { // start line across the three lanes
      const p = loop.getPointAt(tStart), tan = loop.getTangentAt(tStart);
      const line = mesh(new THREE.PlaneGeometry(TRACK_W - 0.5, 0.32), new THREE.MeshStandardMaterial({ color: '#f6f5ef', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), p.x, 0.06, p.z, false);
      line.rotation.order = 'YXZ'; line.rotation.y = Math.atan2(tan.x, tan.z); line.rotation.x = -Math.PI / 2; scene.add(line);
    }
    // A pale kerb on both sides, so the walk path reads as one defined band against the lawn, on foot and from the air.
    const LOOP_W = isPath ? 3.6 : TRACK_W, loopSegs = Math.max(400, Math.round(loopLen / 1.5));
    const kerbM = new THREE.MeshStandardMaterial({ color: '#dedbd0', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    for (const sd of [-1, 1]) scene.add(ribbon(loop, 0.3, loopSegs, 0.058, kerbM, sd * (LOOP_W / 2 + 0.1)));
    // painted arrows in the middle lane every 24 m: the way round
    if (!isPath) {
      const chevTex = canvasTex(64, 64, (g) => { g.strokeStyle = '#f6f5ef'; g.lineWidth = 9; g.beginPath(); g.moveTo(11, 46); g.lineTo(32, 22); g.lineTo(53, 46); g.stroke(); });
      const chevM = new THREE.MeshStandardMaterial({ map: chevTex, alphaTest: 0.45, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), chevGeo = new THREE.PlaneGeometry(1.05, 1.05);
      for (let k = 0; k * 24 + 12 < loopLen - 8; k++) {
        const tt = (tStart + (k * 24 + 12) / loopLen) % 1, p = loop.getPointAt(tt), tan = loop.getTangentAt(tt);
        const c = mesh(chevGeo, chevM, p.x, 0.062, p.z, false); c.rotation.order = 'YXZ'; c.rotation.y = Math.atan2(tan.x, tan.z) + Math.PI; c.rotation.x = -Math.PI / 2; scene.add(c);
      }
    }
    { // a start arch over the line: where the walk on foot begins, and where a full lap is counted
      const p = loop.getPointAt(tStart), tan = loop.getTangentAt(tStart), half = LOOP_W / 2 + 0.34;
      const arch = new THREE.Group(); arch.position.set(p.x, 0, p.z); arch.rotation.y = Math.atan2(tan.x, tan.z);
      const postM = std('#f4f1ea', 0.6);
      for (const sd of [-1, 1]) arch.add(mesh(new THREE.CylinderGeometry(0.07, 0.085, 4.1, 10), postM, sd * half, 2.05, 0));
      const banT = canvasTex(512, 80, (g) => {
        g.fillStyle = '#fbfaf5'; g.fillRect(0, 0, 512, 80); g.fillStyle = '#e0662f'; g.fillRect(0, 0, 14, 80); g.fillRect(498, 0, 14, 80);
        g.font = '800 46px Plus Jakarta Sans, Inter, sans-serif'; g.fillStyle = '#14301f'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Start', 256, 43);
      });
      const banM = new THREE.MeshStandardMaterial({ map: banT, roughness: 0.7 });
      arch.add(new THREE.Mesh(new THREE.BoxGeometry(half * 2 + 0.3, 0.68, 0.07), [postM, postM, postM, postM, banM, banM]).translateY(3.82));
      arch.traverse((o) => { o.castShadow = true; }); scene.add(arch);
    }
    // From the air the walk path is drawn as a route: marigold dashes that flow the way round, and that still show
    // (fainter) where a tower stands in front of the track. On foot it is hidden: the real track is under your feet.
    const routeTex = canvasTex(32, 128, (g) => { g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(4, 14, 24, 74, 12); g.fill(); });
    routeTex.wrapS = routeTex.wrapT = THREE.RepeatWrapping; routeTex.repeat.set(1, 0.34);
    const routeG = new THREE.Group(); scene.add(routeG);
    {
      // drawn wider than the real track, the way a route is drawn on a map: from 300 m up a 4 m path is only a few pixels
      const band = ribbon(loop, LOOP_W + 7, loopSegs, 0.3, new THREE.MeshBasicMaterial({ color: '#ffb23f', transparent: true, opacity: 0.34, depthWrite: false }));
      const dash = ribbon(loop, 6.4, loopSegs, 0.34, new THREE.MeshBasicMaterial({ map: routeTex, color: '#ffc24d', transparent: true, opacity: 1, depthWrite: false }));
      const ghost = ribbon(loop, 6.4, loopSegs, 0.34, new THREE.MeshBasicMaterial({ map: routeTex, color: '#ffc24d', transparent: true, opacity: 0.74, depthWrite: false, depthFunc: THREE.GreaterDepth }));
      const ghostBand = ribbon(loop, LOOP_W + 7, loopSegs, 0.3, new THREE.MeshBasicMaterial({ color: '#ffb23f', transparent: true, opacity: 0.24, depthWrite: false, depthFunc: THREE.GreaterDepth }));
      band.renderOrder = 5; dash.renderOrder = 6; ghostBand.renderOrder = 7; ghost.renderOrder = 8;
      for (const r of [band, dash, ghostBand, ghost]) { r.receiveShadow = false; routeG.add(r); }
    }
    const linkCurves = LY.links.map((l) => curve(l.p, false));
    // link 0 is the entrance road, `road` links are streets, the rest are garden paths
    const linkW = LY.links.map((l, i) => (i === 0 ? 7 : l.road ? 6 : 3.6));
    linkCurves.forEach((c, i) => scene.add(ribbon(c, linkW[i], Math.max(12, Math.round(c.getLength() / 3)), i === 0 || LY.links[i].road ? 0.035 : 0.04, i === 0 || LY.links[i].road ? roadM : pathM)));
    // the public road outside the gate
    scene.add(ribbon(new THREE.LineCurve3(V(LY.mainRoad[0], 0, LY.mainRoad[1]), V(LY.mainRoad[2], 0, LY.mainRoad[3])), 14, 2, 0.02, roadM));
    // entry arch
    const gateM = std('#cdb49c', 0.8);
    const gate = new THREE.Group(); gate.position.set(LY.gate.x, 0, LY.gate.z); gate.rotation.y = LY.gate.rot; scene.add(gate);
    gate.add(mesh(new THREE.BoxGeometry(2, 7, 2), gateM, 0, 3.5, -6)); gate.add(mesh(new THREE.BoxGeometry(2, 7, 2), gateM, 0, 3.5, 6));
    gate.add(mesh(new THREE.BoxGeometry(3, 1.6, 15), std('#8d6f58', 0.8), 0, 7.6, 0));

    /* ---- walkable graph (roads and paths) ---- */
    const nodes: THREE.Vector3[] = []; const adj: number[][] = [];
    const nodeAt = (x: number, z: number) => {
      for (let i = 0; i < nodes.length; i++) if (Math.hypot(nodes[i].x - x, nodes[i].z - z) < 3.0) return i;
      nodes.push(V(x, 0, z)); adj.push([]); return nodes.length - 1;
    };
    const link = (a: number, b: number) => { if (a !== b && !adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); } };
    const addPoly = (pts: [number, number][], closed: boolean) => {
      const c = curve(pts, closed), n = Math.max(1, Math.round(c.getLength() / 4)); // 4 m apart, joined within 3 m: crossing streets always connect
      const ids = c.getSpacedPoints(n).map((pt) => nodeAt(pt.x, pt.z));
      for (let i = 1; i < ids.length; i++) link(ids[i - 1], ids[i]);
    };
    addPoly(LY.ring, true); addPoly(LY.loop, true); LY.links.forEach((l) => addPoly(l.p, false));
    const nearestNode = (p: THREE.Vector3) => { let b = 0, bd = 1e9; nodes.forEach((n, i) => { const d = n.distanceTo(p); if (d < bd) { bd = d; b = i; } }); return b; };
    function routeTo(from: THREE.Vector3, to: THREE.Vector3) {
      const a = nearestNode(from), b = nearestNode(to);
      const dist = nodes.map(() => 1e9), prev = nodes.map(() => -1), seen = nodes.map(() => false);
      dist[a] = 0;
      for (let k = 0; k < nodes.length; k++) {
        let u = -1; for (let i = 0; i < nodes.length; i++) if (!seen[i] && (u < 0 || dist[i] < dist[u])) u = i;
        if (u < 0 || u === b) break; seen[u] = true;
        for (const v of adj[u]) { const d = dist[u] + nodes[u].distanceTo(nodes[v]); if (d < dist[v]) { dist[v] = d; prev[v] = u; } }
      }
      const out: THREE.Vector3[] = [to.clone()];
      for (let u = b; u >= 0; u = prev[u]) out.unshift(nodes[u].clone());
      // drop the first node if we are already past it
      if (out.length > 2 && from.distanceTo(out[1]) < out[0].distanceTo(out[1])) out.shift();
      return out;
    }

    /* ---- towers ---- */
    interface Box { x: number; z: number; hw: number; hd: number; c: number; s: number; h: number }
    const blockers: Box[] = [];
    const block = (x: number, z: number, hw: number, hd: number, rot = 0, h = 0) => blockers.push({ x, z, hw, hd, c: Math.cos(rot), s: Math.sin(rot), h });
    const windowMats: THREE.MeshStandardMaterial[] = [];
    const wm = (f: { map: THREE.Texture; emissive: THREE.Texture }) => {
      const m = new THREE.MeshStandardMaterial({ map: f.map, emissiveMap: f.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.8 });
      windowMats.push(m); return m;
    };
    // name tags seen from the air: the same small size on screen however far away, hidden once you are on foot
    const air = new THREE.Group(); scene.add(air);
    const airLabel = (text: string, x: number, y: number, z: number) => {
      const s = label(text); (s.material as THREE.SpriteMaterial).sizeAttenuation = false; s.material.depthTest = false; // never half hidden behind a tower
      s.scale.multiplyScalar((small ? 0.034 : 0.029) / 1.6); s.position.set(x, y, z); air.add(s);
    };
    { // the walk path gets the first name tag, on the side of the loop nearest the opening view
      const ax = AV[0] + Math.cos(A_BEAR) * AV[3], az = AV[1] + Math.sin(A_BEAR) * AV[3]; let bp = loop.getPointAt(0), bd = 1e9;
      for (let i = 0; i < 120; i++) { const q = loop.getPointAt(i / 120), d = Math.hypot(q.x - ax, q.z - az); if (d < bd) { bd = d; bp = q; } }
      airLabel(isPath ? 'Walking path' : 'Walking track', bp.x, 5, bp.z);
    }
    if (LY.towers) {
    const FL = Math.max(...LY.towers.map((t) => t[4])), TH = FL * 3;
    const WD = LY.towerDepth ?? 18; // how deep a block is, front to back
    const fWide = facade(FL, 10, 11), fDeep = facade(FL, Math.max(2, Math.round(WD / 3.6)), 23), fNarrow = facade(FL, 2, 37);
    const mWide = wm(fWide), mDeep = wm(fDeep), mNarrow = wm(fNarrow);
    const roofM = std('#c9bfb2', 0.9), podiumM = std('#c2b3a0', 0.9), crownM = std('#b39a82', 0.8);
    const wingGeo = new THREE.BoxGeometry(6, TH, WD), spines = new Map<number, THREE.BoxGeometry>();
    // a tower is a slab: a spine with a wing every 8.5 m. A longer slab simply carries more wings
    LY.towers.forEach(([name, x, z, rot, floors, len = 34]) => {
      const nW = Math.round(len / 8.5), spineGeo = spines.get(len) ?? new THREE.BoxGeometry(len, TH, 8); spines.set(len, spineGeo);
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = rot;
      const body3 = new THREE.Group(); body3.scale.y = floors / FL; t.add(body3);
      const sp = new THREE.Mesh(spineGeo, [mNarrow, mNarrow, roofM, roofM, mWide, mWide]); sp.position.y = TH / 2 + 1; sp.castShadow = sp.receiveShadow = true; body3.add(sp);
      for (let i = 0; i < nW; i++) {
        const wx = (i - (nW - 1) / 2) * 8.5;
        const w = new THREE.Mesh(wingGeo, [mDeep, mDeep, roofM, roofM, mNarrow, mNarrow]); w.position.set(wx, TH / 2 + 1, 0); w.castShadow = w.receiveShadow = true; body3.add(w);
        body3.add(mesh(new THREE.BoxGeometry(6.6, 1.2, WD + 0.6), crownM, wx, TH + 1.6, 0));
      }
      t.add(mesh(new THREE.BoxGeometry(len + 2, 1, WD + 2), podiumM, 0, 0.5, 0));
      // lobby canopy on the north side
      t.add(mesh(new THREE.BoxGeometry(7, 0.4, 4), crownM, 0, 4.2, -(WD / 2 + 2)));
      t.add(mesh(new THREE.BoxGeometry(5, 3.2, 0.3), new THREE.MeshStandardMaterial({ color: '#9cc6d6', roughness: 0.05, metalness: 0.3 }), 0, 2.6, -(WD / 2 + 0.1), false));
      if (name) { const lb = label(name, { scale: 1.3 }); lb.position.set(0, 7.5, -(WD / 2 + 3.5)); t.add(lb); airLabel(name, x, floors * 3 + 10, z); }
      scene.add(t); block(x, z, len / 2 + 2, WD / 2 + 2, rot, floors * 3 + 12);
    });
    // where a tower is two slabs, a plain lift core joins them
    for (const [x, z, w, d, floors] of LY.cores ?? []) scene.add(mesh(new THREE.BoxGeometry(w, floors * 3 + 4, d), roofM, x, (floors * 3 + 4) / 2 + 1, z));
    }

    /* ---- villas: two storeys, pitched or flat roofs, each on its own paved plot ---- */
    if (LY.villas) {
      const villaTex = (front: boolean) => {
        const draw = (g: CanvasRenderingContext2D, lit: boolean) => {
          const W = 256, H = 160;
          if (lit) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
          else { g.fillStyle = '#efe7d8'; g.fillRect(0, 0, W, H); g.fillStyle = '#d9cfbb'; g.fillRect(0, H - 10, W, 10); g.fillStyle = '#e2d8c6'; g.fillRect(0, 76, W, 5); }
          const win = (x: number, y: number, w: number, h: number, on: boolean) => {
            if (lit) { if (on) { g.fillStyle = '#ffcf86'; g.fillRect(x, y, w, h); } return; }
            g.fillStyle = '#fbf9f3'; g.fillRect(x - 3, y - 3, w + 6, h + 6);
            const grd = g.createLinearGradient(0, y, 0, y + h); grd.addColorStop(0, '#7f9aa8'); grd.addColorStop(1, '#4f6b7a'); g.fillStyle = grd; g.fillRect(x, y, w, h);
            g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y, w * 0.3, h); g.fillStyle = '#fbf9f3'; g.fillRect(x + w / 2 - 1, y, 2, h);
          };
          [26, 106, 186].forEach((x, i) => win(x, 18, 44, 46, i !== 1));
          if (front) {
            win(26, 96, 44, 46, true); win(186, 96, 44, 46, false);
            if (!lit) { g.fillStyle = '#5c7c6a'; g.fillRect(112, 92, 32, 58); g.fillStyle = '#f0b429'; g.fillRect(138, 120, 3, 3); g.fillStyle = '#fbf9f3'; g.fillRect(96, 70, 64, 6); }
          } else [26, 106, 186].forEach((x, i) => win(x, 96, 44, 46, i === 1));
        };
        return { map: canvasTex(256, 160, (g) => draw(g, false)), emissive: canvasTex(256, 160, (g) => draw(g, true)) };
      };
      const vFront = wm(villaTex(true)), vSide = wm(villaTex(false)), vTop = std('#d8d2c4', 0.9);
      const N = LY.villas.length, unit = new THREE.BoxGeometry(1, 1, 1);
      const pyr = new THREE.ConeGeometry(0.7071, 1, 4, 1); pyr.rotateY(Math.PI / 4); pyr.translate(0, 0.5, 0);
      const bodies = new THREE.InstancedMesh(unit, [vSide, vSide, vTop, vTop, vFront, vSide], N);
      const roofs = new THREE.InstancedMesh(pyr, std('#737d84', 0.85), N), slabs = new THREE.InstancedMesh(unit, std('#f4f1ea', 0.85), N * 2);
      const plots = new THREE.InstancedMesh(unit, std('#d9d4c8', 0.95), N), porches = new THREE.InstancedMesh(unit, std('#fbf9f3', 0.8), N);
      const vm = new THREE.Matrix4(), vq = new THREE.Quaternion(), vc = new THREE.Color(), TINTS = ['#ffffff', '#f6efe2', '#eef1ee', '#f3e9dc'];
      let rN = 0, sN = 0;
      LY.villas.forEach((v, i) => {
        const h = 6.6, y0 = 0.3;
        vm.compose(V(v.x, y0 + h / 2, v.z), vq, V(v.w, h, v.d)); bodies.setMatrixAt(i, vm); bodies.setColorAt(i, vc.set(TINTS[v.n % 4]));
        vm.compose(V(v.x, y0 / 2, v.z), vq, V(v.w + 3, y0, v.d + 3)); plots.setMatrixAt(i, vm);
        vm.compose(V(v.x, 3.35, v.z + v.d / 2 + 0.8), vq, V(v.w * 0.42, 0.18, 1.6)); porches.setMatrixAt(i, vm);
        if (v.flat) { vm.compose(V(v.x, y0 + h + 0.2, v.z), vq, V(v.w + 0.6, 0.4, v.d + 0.6)); slabs.setMatrixAt(sN++, vm); }
        else { vm.compose(V(v.x, y0 + h, v.z), vq, V(v.w + 1.1, v.big ? 3 : 2.4, v.d + 1.1)); roofs.setMatrixAt(rN++, vm); }
        if (v.big && v.flat) { vm.compose(V(v.x - v.w * 0.15, y0 + h + 1.8, v.z - v.d * 0.1), vq, V(v.w * 0.6, 3, v.d * 0.65)); slabs.setMatrixAt(sN++, vm); }
        block(v.x, v.z, v.w / 2 + 1.5, v.d / 2 + 1.5, 0, h + 4);
        if (v.label) { const lb = label(`Villa ${v.n}`, { scale: 0.55 }); lb.position.set(v.x, y0 + h + 4.8, v.z); scene.add(lb); }
      });
      roofs.count = rN; slabs.count = sN;
      [bodies, roofs, slabs, plots, porches].forEach((im) => { im.castShadow = im.receiveShadow = true; scene.add(im); });
    }

    /* ---- clubhouse, pools, courts, play area ---- */
    const checker = canvasTex(128, 128, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9c9bd' : '#f6efe8'; g.fillRect(i * 16, j * 16, 16, 16); } });
    // glazing on all four sides (the water bowl and the lawn sit by different walls in each community) under a deep eave
    const clubGlass = new THREE.MeshStandardMaterial({ map: canvasTex(256, 64, (g) => {
      const grd = g.createLinearGradient(0, 0, 0, 64); grd.addColorStop(0, '#a9d2e0'); grd.addColorStop(1, '#6f9db0'); g.fillStyle = grd; g.fillRect(0, 0, 256, 64);
      g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 4, 0, 6, 64);
      g.fillStyle = '#f3efe8'; for (let i = 0; i <= 8; i++) g.fillRect(Math.min(253, i * 32 - 1.5), 0, 3, 64); g.fillRect(0, 0, 256, 3); g.fillRect(0, 61, 256, 3); g.fillRect(0, 20, 256, 2);
    }), roughness: 0.08, metalness: 0.3 });
    // the clubhouse, and any second one the plan shows
    for (const CL of [...(LY.club ? [LY.club] : []), ...(LY.clubs ?? [])]) {
      const club = new THREE.Group(); club.position.set(CL.x, 0, CL.z); club.rotation.y = CL.rot; club.scale.set(CL.s * (CL.kx ?? 1), CL.s, CL.s * (CL.kz ?? 1)); scene.add(club);
      club.add(mesh(new THREE.BoxGeometry(24, 7, 18), std('#d6c2ab', 0.8), 0, 3.5, 0));
      const roofTop = mesh(new THREE.PlaneGeometry(23, 17), new THREE.MeshStandardMaterial({ map: checker, roughness: 0.9 }), 0, 7.03, 0, false); roofTop.rotation.x = -Math.PI / 2; club.add(roofTop);
      for (const sx of [-1, 1]) club.add(mesh(new THREE.BoxGeometry(0.3, 4, 12), clubGlass, sx * 12.1, 2.6, 0, false));
      for (const sz of [-1, 1]) club.add(mesh(new THREE.BoxGeometry(18, 3.6, 0.3), clubGlass, 0, 2.5, sz * 9.1, false));
      club.add(mesh(new THREE.BoxGeometry(26.6, 0.45, 20.6), std('#b39a82', 0.8), 0, 6.6, 0));
      const clb = label(CL.label, { scale: 0.9 }); clb.position.set(-13, 6.5, 0); club.add(clb);
      block(CL.x, CL.z, 13.5 * CL.s * (CL.kx ?? 1), 10.5 * CL.s * (CL.kz ?? 1), CL.rot, 8 * CL.s);
      airLabel(CL.label, CL.x, 12, CL.z);
    }
    for (const [text, x, z] of LY.places ?? []) airLabel(text, x, 7, z);
    const BX = LY.bowl[0], BZ = LY.bowl[1];
    scene.add(mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.16, 20), std('#cfd6d8', 0.2, 0.9), BX, 0.08, BZ));
    const bowlWater = mesh(new THREE.CircleGeometry(0.27, 20), new THREE.MeshStandardMaterial({ color: '#5fa8c9', roughness: 0.05 }), BX, 0.15, BZ, false); bowlWater.rotation.x = -Math.PI / 2; scene.add(bowlWater);

    // pools: tiled floor seen through moving water, stone coping, lane ropes, a ladder, loungers and umbrellas
    const poolTex = canvasTex(128, 128, (g) => {
      const grd = g.createLinearGradient(0, 0, 128, 128); grd.addColorStop(0, '#39b4de'); grd.addColorStop(1, '#2a9fd0');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1.5;
      for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, 128); g.moveTo(0, i * 16); g.lineTo(128, i * 16); g.stroke(); }
    });
    poolTex.wrapS = poolTex.wrapT = THREE.RepeatWrapping; poolTex.repeat.set(4, 3);
    const waterU = { uTime: { value: 0 } };
    const poolM = new THREE.MeshStandardMaterial({ map: poolTex, roughness: 0.06, metalness: 0.05 });
    poolM.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = waterU.uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vW;').replace('#include <begin_vertex>', '#include <begin_vertex>\n vW = (modelMatrix * vec4(position, 1.0)).xz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform float uTime; varying vec2 vW;
          float ppRipple(vec2 p, float t) {
            float a = sin(p.x * 2.1 + sin(p.y * 1.7 + t * 0.9) * 1.3 + t * 0.7);
            float b = sin(p.y * 2.4 + sin(p.x * 1.9 - t * 0.8) * 1.2 - t * 0.6);
            float c = sin((p.x + p.y) * 1.6 + sin((p.x - p.y) * 2.2 + t) * 1.1);
            return pow(1.0 - abs((a + b + c) / 3.0), 7.0);
          }`)
        .replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec2 ppWob = vec2(sin(vW.y * 1.3 + uTime * 1.1), cos(vW.x * 1.2 - uTime * 0.9)) * 0.03;
            diffuseColor *= texture2D(map, vMapUv + ppWob);
          #endif
          diffuseColor.rgb += vec3(0.5, 0.72, 0.78) * (ppRipple(vW * 1.4, uTime) * 0.55 + ppRipple(vW * 0.6 + 7.0, uTime * 0.7) * 0.25);`);
    };
    const deckM = std('#e6dccb', 0.9), copingM = std('#f6f3ec', 0.75);
    const lagoonDeck = mesh(new THREE.CircleGeometry(1, 48), deckM, 0, 0.04, -9, false); lagoonDeck.scale.set(9, 6.8, 1); lagoonDeck.rotation.x = -Math.PI / 2;
    // the free-form pool is drawn around (0, -9); the group moves it to where this community has one
    const lagoonG = new THREE.Group(); lagoonG.position.set((LY.lagoon?.[0] ?? 0), 0, (LY.lagoon?.[1] ?? -9) + 9); lagoonG.visible = !!LY.lagoon; scene.add(lagoonG); lagoonG.add(lagoonDeck);
    const lagoon = mesh(new THREE.CircleGeometry(1, 48), poolM, 0, 0.1, -9, false); lagoon.scale.set(7, 5, 1); lagoon.rotation.x = -Math.PI / 2; lagoonG.add(lagoon);
    const lagoonEdge = mesh(new THREE.TorusGeometry(1, 0.045, 6, 56), copingM, 0, 0.1, -9, false); lagoonEdge.scale.set(7.15, 5.15, 3); lagoonEdge.rotation.x = -Math.PI / 2; lagoonG.add(lagoonEdge);
    const POOL = LY.pool ?? { x: 0, z: 0, rot: 0 }, hasPool = !!LY.pool; // some plans keep the pool indoors: then none is shown
    const rp = new THREE.Group(); rp.position.set(POOL.x, 0, POOL.z); rp.rotation.y = POOL.rot; rp.visible = hasPool; scene.add(rp);
    const PW = 13, PD = 6.4;
    const rpd = mesh(new THREE.PlaneGeometry(PW + 3.4, PD + 3.7), deckM, 0, 0.044, -0.55, false); rpd.rotation.x = -Math.PI / 2; rp.add(rpd);
    const rpw = mesh(new THREE.PlaneGeometry(PW, PD), poolM, 0, 0.1, 0, false); rpw.rotation.x = -Math.PI / 2; rp.add(rpw);
    rp.add(mesh(merge([xf(new THREE.BoxGeometry(PW + 0.7, 0.16, 0.35), 1, 1, 1, 0, 0.08, PD / 2 + 0.17), xf(new THREE.BoxGeometry(PW + 0.7, 0.16, 0.35), 1, 1, 1, 0, 0.08, -PD / 2 - 0.17), xf(new THREE.BoxGeometry(0.35, 0.16, PD), 1, 1, 1, PW / 2 + 0.17, 0.08, 0), xf(new THREE.BoxGeometry(0.35, 0.16, PD), 1, 1, 1, -PW / 2 - 0.17, 0.08, 0)]), copingM, 0, 0, 0));
    const ropeTex = canvasTex(8, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f6f5ef' : '#e0483f'; g.fillRect(0, i * 8, 8, 8); } });
    ropeTex.wrapS = ropeTex.wrapT = THREE.RepeatWrapping; ropeTex.repeat.set(1, 6);
    const ropeM = new THREE.MeshStandardMaterial({ map: ropeTex, roughness: 0.6 });
    for (const z of [-PD / 6, PD / 6]) { const r = mesh(new THREE.CylinderGeometry(0.055, 0.055, PW - 0.2, 8), ropeM, 0, 0.13, z, false); r.rotation.z = Math.PI / 2; rp.add(r); }
    const chrome = std('#dfe5e8', 0.15, 0.9);
    for (const z of [-0.28, 0.28]) { const h = mesh(new THREE.TorusGeometry(0.3, 0.025, 6, 14, Math.PI), chrome, -PW / 2 - 0.05, 0.45, PD / 2 - 1.2 + z); rp.add(h); rp.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6), chrome, -PW / 2 - 0.35, 0.225, PD / 2 - 1.2 + z)); rp.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6), chrome, -PW / 2 + 0.25, 0.2, PD / 2 - 1.2 + z)); }
    const loungerGeo = merge([
      paint(xf(new THREE.BoxGeometry(0.68, 0.07, 1.25), 1, 1, 1, 0, 0.3, 0.1), '#f7f5ef'), paint(xf(new THREE.BoxGeometry(0.68, 0.07, 0.78), 1, 1, 1, 0, 0.5, -0.82, 0.62), '#f7f5ef'),
      paint(xf(new THREE.BoxGeometry(0.6, 0.02, 0.9), 1, 1, 1, 0, 0.345, 0.2), '#f0a53a'),
      ...[[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.45], [0.3, -0.45]].map(([x, z]) => paint(xf(new THREE.BoxGeometry(0.05, 0.28, 0.05), 1, 1, 1, x, 0.14, z), '#cfd3d0')),
    ]);
    const umbrellaGeo = (c1: string, c2: string) => merge([
      paint(xf(new THREE.CylinderGeometry(0.035, 0.035, 2.5, 8), 1, 1, 1, 0, 1.25, 0), '#f1efe8'),
      ...Array.from({ length: 8 }, (_, i) => paint(new THREE.ConeGeometry(1.45, 0.55, 3, 1, true, (i / 8) * Math.PI * 2, Math.PI / 4).translate(0, 2.45, 0), i % 2 ? c1 : c2)),
    ]);
    const detailM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide });
    const umbA = umbrellaGeo('#f0a53a', '#fbf8f0'), umbB = umbrellaGeo('#2e9d6a', '#fbf8f0');
    const lounger = (parent: THREE.Object3D, x: number, z: number, rot: number) => { const l = mesh(loungerGeo, detailM, x, 0, z); l.rotation.y = rot; parent.add(l); };
    for (let i = 0; i < 5; i++) { lounger(rp, -5.2 + i * 2.6, -PD / 2 - 1.3, 0); if (i % 2 === 0) rp.add(mesh(i === 2 ? umbB : umbA, detailM, -3.9 + i * 2.6, 0, -PD / 2 - 1.5)); }
    for (const a of [1.75, 2.2]) { const x = 8 * Math.cos(a), z = -9 + 5.9 * Math.sin(a); lounger(lagoonG, x, z, Math.atan2(-x, -9 - z)); }
    lagoonG.add(mesh(umbA, detailM, 8.2 * Math.cos(1.98), 0, -9 + 6 * Math.sin(1.98)));
    if (LY.lagoon) block(LY.lagoon[0], LY.lagoon[1], 7.6, 5.6);
    if (hasPool) block(POOL.x, POOL.z, PW / 2 + 0.6, PD / 2 + 0.5, POOL.rot);

    const courtTex = canvasTex(256, 160, (g) => { g.fillStyle = '#4f9a6a'; g.fillRect(0, 0, 256, 160); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(10, 10, 236, 140); g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 150); g.stroke(); g.strokeRect(50, 40, 156, 80); });
    for (const ct of LY.courts) { const c = mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshStandardMaterial({ map: courtTex, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), ct.x, 0.05, ct.z, false); c.rotation.x = -Math.PI / 2; c.rotation.z = ct.rot; scene.add(c); }
    const bbTex = canvasTex(256, 160, (g) => { g.fillStyle = '#d98a5a'; g.fillRect(0, 0, 256, 160); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(8, 8, 240, 144); g.beginPath(); g.arc(128, 80, 26, 0, 7); g.stroke(); g.beginPath(); g.arc(8, 80, 50, -1.57, 1.57); g.stroke(); g.beginPath(); g.arc(248, 80, 50, 1.57, 4.71); g.stroke(); });
    const bb = mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ map: bbTex, roughness: 0.9 }), LY.bball?.[0] ?? 0, 0.05, LY.bball?.[1] ?? 0, false); bb.rotation.x = -Math.PI / 2; bb.rotation.z = LY.bball?.[2] ?? 0; bb.visible = !!LY.bball; scene.add(bb);
    // play area: soft floor, slide and swing frame
    const play = new THREE.Group(); play.position.set(LY.play[0], 0, LY.play[1]); scene.add(play);
    const pf = mesh(new THREE.CircleGeometry(5, 32), std('#e98a8a', 0.9), 0, 0.05, 0, false); pf.rotation.x = -Math.PI / 2; play.add(pf);
    play.add(mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), std('#f0b429', 0.6), 0, 1.6, 0));
    for (const [px, pz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) play.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8), std('#3f9fd0', 0.5), px, 0.8, pz));
    const slide = mesh(new THREE.BoxGeometry(0.8, 0.08, 3), std('#e0662f', 0.4), 0, 0.85, 2.1); slide.rotation.x = 0.55; play.add(slide);
    const roofP = mesh(new THREE.ConeGeometry(1.4, 0.9, 4), std('#49a85a', 0.6), 0, 3.2, 0); roofP.rotation.y = Math.PI / 4; play.add(roofP);
    for (const [px, pz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) play.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), std('#3f9fd0', 0.5), px, 2.2, pz));

    /* ---- pet garden ---- */
    if (LY.pet) {
      // built in its own frame with the gate in the left (-x) fence, then turned so the gate faces the side the plan needs
      const fenceM = std('#f6f7f2', 0.6);
      const [ax0, ax1, az0, az1] = LY.pet, side = LY.petGate ?? 'w', flip = side === 'n' || side === 's';
      const w = flip ? az1 - az0 : ax1 - ax0, d = flip ? ax1 - ax0 : az1 - az0;
      const pg = new THREE.Group(); pg.position.set((ax0 + ax1) / 2, 0, (az0 + az1) / 2); pg.rotation.y = { w: 0, s: Math.PI / 2, e: Math.PI, n: -Math.PI / 2 }[side] + (LY.petRot ?? 0); scene.add(pg);
      const px0 = -w / 2, px1 = w / 2, pz0 = -d / 2, pz1 = d / 2, roomy = w >= 14 && d >= 16;
      const gz = pz0 + (d >= 16 && d <= 20 ? 10 : d / 2); // where the gate is along that fence
      const post = (x: number, z: number) => pg.add(mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), fenceM, x, 0.55, z));
      for (let x = px0; x <= px1 + 0.01; x += 2) for (const z of [pz0, pz1]) post(x, z);
      for (let z = pz0; z <= pz1 + 0.01; z += 2) { post(px1, z); if (z < gz - 2 || z > gz + 2) post(px0, z); }
      for (const z of [pz0, pz1]) pg.add(mesh(new THREE.BoxGeometry(w, 0.08, 0.08), fenceM, 0, 1, z));
      pg.add(mesh(new THREE.BoxGeometry(0.08, 0.08, d), fenceM, px1, 1, 0));
      const hx = roomy ? px0 + 12 : px0 + w * 0.6;
      for (const z of roomy ? [pz0 + 6, pz0 + 14] : [pz0 + d * 0.3, pz0 + d * 0.7]) { for (const x of [hx - 1, hx + 1]) pg.add(mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), std('#e0662f', 0.7), x, 0.45, z)); pg.add(mesh(new THREE.BoxGeometry(2.1, 0.08, 0.08), std('#f0b429', 0.7), hx, 0.6, z)); }
      pg.add(mesh(new THREE.TorusGeometry(0.7, 0.12, 8, 20, Math.PI), std('#3f9fd0', 0.6), roomy ? px0 + 8 : px0 + w * 0.42, 0, roomy ? pz1 - 3 : pz1 - d * 0.14));
      const dpl = label(LY.petLabel ?? 'Pet garden', { scale: 0.5 }); dpl.position.set(0, 4, 0); pg.add(dpl);
      airLabel(LY.petLabel ?? 'Pet garden', (ax0 + ax1) / 2, 7, (az0 + az1) / 2);
    }

    /* ---- garden: trees, palms, shrubs, beds, hedges ---- */
    const inBlock = (x: number, z: number, pad = 2) => blockers.some((b) => { const dx = x - b.x, dz = z - b.z; return Math.abs(dx * b.c - dz * b.s) < b.hw + pad && Math.abs(dx * b.s + dz * b.c) < b.hd + pad; });
    const tr = rand(42);
    const along = (c: THREE.Curve<THREE.Vector3>, t: number, off: number) => { const p = c.getPointAt(((t % 1) + 1) % 1), tan = c.getTangentAt(((t % 1) + 1) % 1); return V(p.x - tan.z * off, 0, p.z + tan.x * off); };
    const onPaving = (x: number, z: number) => {
      const near = (c: THREE.Curve<THREE.Vector3>, w: number, n: number) => { for (let i = 0; i <= n; i++) { const p = c.getPointAt(i / n); if (Math.hypot(p.x - x, p.z - z) < w) return true; } return false; };
      return near(ring, 5, Math.max(160, Math.ceil(ringLen / 4))) || near(loop, 3, Math.max(110, Math.ceil(loopLen / 2.4))) || linkCurves.some((c, i) => near(c, linkW[i] / 2 + 1.4, Math.max(24, Math.round(c.getLength() / 2.5))));
    };
    // nothing is planted inside the pet park: it is open lawn for fetch
    const inPet = (x: number, z: number) => {
      if (!LY.pet) return false;
      const [a0, a1, b0, b1] = LY.pet, cx = (a0 + a1) / 2, cz = (b0 + b1) / 2, r = LY.petRot ?? 0, dx = x - cx, dz = z - cz;
      return Math.abs(dx * Math.cos(r) - dz * Math.sin(r)) < (a1 - a0) / 2 + 1 && Math.abs(dx * Math.sin(r) + dz * Math.cos(r)) < (b1 - b0) / 2 + 1;
    };
    const free = (x: number, z: number, pad = 1.5) => !inBlock(x, z, pad) && !onPaving(x, z) && !inPet(x, z);
    const loopPts = loop.getSpacedPoints(Math.max(140, Math.ceil(loopLen / 1.6)));
    const nearLoop = (x: number, z: number, d: number) => loopPts.some((p) => Math.hypot(p.x - x, p.z - z) < d);
    // park benches sit in gaps in the hedge, facing the track (and the pools beyond it)
    const BENCHES: [number, number, number][] = LY.benches.map((b) => [b[0], b[1], b[2]]);
    for (const [t, side] of [[0.06, 1], [0.16, -1], [0.29, 1], [0.4, -1], [0.52, 1], [0.63, -1], [0.76, 1], [0.9, -1]]) {
      const p = along(loop, t, side * 3.25), c = loop.getPointAt(t);
      if (!free(p.x, p.z, 1) || BENCHES.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 9) || STOPS.some((st) => Math.hypot(p.x - st.pos[0], p.z - st.pos[1]) < 5) || LY.hedgeGaps.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 6)) continue;
      BENCHES.push([p.x, p.z, Math.atan2(c.x - p.x, c.z - p.z)]);
    }

    // organic canopies: lumpy, darker underneath, shared by every tree
    const lumpy = (seed: number, detail: number) => {
      const g0 = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
      const pos = g0.attributes.position, cols: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const d = 1 + 0.2 * Math.sin(x * 3.1 + seed) * Math.cos(y * 2.7 + seed * 1.3) + 0.13 * Math.sin(z * 4.3 + seed * 0.7) * Math.cos(x * 5.1 + seed);
        pos.setXYZ(i, x * d, y * d * 0.86, z * d);
        const sh = 0.55 + 0.6 * Math.min(1, Math.max(0, (y + 0.9) / 1.7)); cols.push(sh, sh, sh);
      }
      g0.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g0.computeVertexNormals();
      return g0;
    };
    const canopyGeos = [lumpy(1.3, 3), lumpy(4.1, 3), lumpy(7.7, 3)];
    const shrubGeo = lumpy(2.2, 2);
    // foliage dissolves just in front of the camera, so a canopy never blocks the view of the walk
    const NEAR_FADE = `#include <clipping_planes_fragment>
      float ppD = length(vViewPosition);
      if (ppD < 3.9) { // an ordered 4x4 dither reads as a soft fade; random noise reads as static
        vec2 ppA = floor(gl_FragCoord.xy), ppH = floor(ppA * 0.5);
        float ppT = fract(ppH.x / 2.0 + ppH.y * ppH.y * 0.75) * 0.25 + fract(ppA.x / 2.0 + ppA.y * ppA.y * 0.75);
        if (ppD < 2.9 || ppT > (ppD - 2.9)) discard;
      }`;
    const nearFade = <M extends THREE.Material>(mat: M) => { const prev = mat.onBeforeCompile; mat.onBeforeCompile = (sh, r) => { prev.call(mat, sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <clipping_planes_fragment>', NEAR_FADE); }; return mat; };
    const leafMat = (c: string) => nearFade(new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, vertexColors: true }));
    const leafMs = ['#3f8f4f', '#4c9d55', '#5aa85c', '#37834a', '#6bb05f'].map(leafMat);
    const blossomMs = [leafMat('#e8556a'), leafMat('#f28a45'), leafMat('#f4b8c8')];
    const goldMs = [leafMat('#f2c12e'), leafMat('#f7d548'), leafMat('#e8b01f')];
    const goldSpots: [number, number, number][] = [];
    const barkTex = canvasTex(64, 128, (g) => { g.fillStyle = '#7a5230'; g.fillRect(0, 0, 64, 128); const r = rand(9); for (let i = 0; i < 90; i++) { g.strokeStyle = r() < 0.5 ? '#63401f' : '#8d6540'; g.lineWidth = 1 + r() * 2; const x = r() * 64; g.beginPath(); g.moveTo(x, r() * 128); g.lineTo(x + (r() - 0.5) * 6, r() * 128); g.stroke(); } });
    const trunkM = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 1 });
    const trunkGeo = new THREE.CylinderGeometry(0.16, 0.3, 1, 9), branchGeo = new THREE.CylinderGeometry(0.06, 0.11, 1, 6);

    // leaf cards give the canopies a soft, leafy edge
    const leafTex = canvasTex(256, 256, (g) => {
      const r = rand(31);
      for (let i = 0; i < 70; i++) {
        const x = 128 + (r() - 0.5) * 190, y = 128 + (r() - 0.5) * 190; if (Math.hypot(x - 128, y - 128) > 112) continue;
        const v = 190 + Math.floor(r() * 65);
        g.save(); g.translate(x, y); g.rotate(r() * 6.3); g.fillStyle = `rgb(${v},${v},${v})`;
        g.beginPath(); g.ellipse(0, 0, 9 + r() * 7, 20 + r() * 12, 0, 0, 6.3); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 24); g.stroke(); g.restore();
      }
    });
    // two-sided quad with a fixed "sky-facing" normal, so every card is lit like the canopy top
    const cardGeo = (() => {
      const g0 = new THREE.BufferGeometry();
      g0.setAttribute('position', new THREE.Float32BufferAttribute([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0], 3));
      g0.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
      g0.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
      g0.setIndex([0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0]); return g0;
    })();
    const skyNormal = (mat: THREE.Material) => { mat.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n transformedNormal = normalize(mat3(viewMatrix) * vec3(0.22, 1.0, 0.16));'); }; return mat; };
    const CARDS_MAX = small ? 1800 : 4200;
    const cards = new THREE.InstancedMesh(cardGeo, nearFade(skyNormal(new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.4, roughness: 0.9 }))), CARDS_MAX);
    let cardN = 0; const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(), eul = new THREE.Euler();
    const addCards = (cx: number, cy: number, cz: number, r: number, n: number, tint: string) => {
      for (let i = 0; i < n && cardN < CARDS_MAX; i++) {
        const u = tr() * 2 - 1, th = tr() * 6.283, sq = Math.sqrt(1 - u * u), rr = r * (0.82 + tr() * 0.22);
        q.setFromEuler(eul.set(tr() * 3, tr() * 6.3, tr() * 3));
        mtx.compose(V(cx + sq * Math.cos(th) * rr, cy + u * rr * 0.86, cz + sq * Math.sin(th) * rr), q, V(1, 1, 1).multiplyScalar(r * (0.75 + tr() * 0.5)));
        cards.setMatrixAt(cardN, mtx); cards.setColorAt(cardN, col.set(tint).multiplyScalar(0.62 + 0.5 * (u * 0.5 + 0.5) + tr() * 0.12)); cardN++;
      }
    };
    const trees: THREE.Group[] = [];
    function tree(x: number, z: number, s: number, kind: number, detail = true) {
      if (!free(x, z, 1) || nearLoop(x, z, 3.9)) return;
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = tr() * 6.3; t.userData.c0 = cardN;
      const h = (2.6 + tr() * 1.2) * s;
      const tk = mesh(trunkGeo, trunkM, 0, h / 2, 0); tk.scale.set(s, h, s); t.add(tk);
      const blossom = kind === 9, gold = kind === 8, lm = gold ? goldMs[Math.floor(tr() * 3)] : blossom ? blossomMs[Math.floor(tr() * 3)] : leafMs[kind % leafMs.length];
      const tint = '#' + lm.color.getHexString();
      const n = 4 + Math.floor(tr() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283 + tr(), rad = i === 0 ? 0 : (0.7 + tr() * 0.7) * s, br = (i === 0 ? 1.7 : 1.05 + tr() * 0.5) * s;
        const bx = Math.cos(a) * rad, bz = Math.sin(a) * rad, by = h + (i === 0 ? 1.1 * s : (0.3 + tr() * 1.1) * s);
        const c = mesh(canopyGeos[i % 3], gold ? (i === n - 1 ? leafMs[4] : goldMs[i % 3]) : i % 2 && blossom ? leafMs[1] : lm, bx, by, bz); c.scale.setScalar(br); c.rotation.y = tr() * 6.3; t.add(c);
        if (i > 0) { const b = mesh(branchGeo, trunkM, bx * 0.5, h * 0.9 + (by - h) * 0.3, bz * 0.5); b.scale.set(s, Math.hypot(rad, by - h * 0.8), s); b.lookAt(bx, by * 3, bz); b.rotateX(Math.PI / 2 - Math.atan2(by - h * 0.8, rad)); t.add(b); }
        if (detail) addCards(x + (bx * Math.cos(t.rotation.y) + bz * Math.sin(t.rotation.y)), by, z + (-bx * Math.sin(t.rotation.y) + bz * Math.cos(t.rotation.y)), br, small ? 5 : 9, tint);
      }
      t.userData.c1 = cardN; scene.add(t); trees.push(t); if (gold) goldSpots.push([x, z, s]);
    }
    for (let i = 0, n = byLen(34, loopLen, 200); i < n; i++) { const p = along(loop, i / n + tr() * 0.01, (i % 2 ? 5 : -5) + (tr() - 0.5) * 2); tree(p.x, p.z, 0.75 + tr() * 0.4, i % 6 === 0 ? 9 : i % 4 === 1 ? 8 : i % 5); }
    for (let i = 0, n = byLen(72, ringLen, 700); i < n; i++) { const p = along(ring, i / n + tr() * 0.006, (i % 2 ? 7.5 : -7.5) + (tr() - 0.5) * 2.5); tree(p.x, p.z, 0.9 + tr() * 0.5, i % 8 === 0 ? 9 : i % 7 === 3 ? 8 : i % 5); }
    for (let i = 0; i < LY.grove[4]; i++) tree(LY.grove[0] + tr() * LY.grove[2], LY.grove[1] + tr() * LY.grove[3], 0.7 + tr() * 0.4, i % 5 === 0 ? 9 : i % 6 === 2 ? 8 : i % 5);
    for (const [x, z] of LY.golds) tree(x, z, 0.95, 8);
    // street trees down both sides of every street
    linkCurves.forEach((c, i) => { if (i === 0 || !LY.links[i].road) return; const n = Math.round(c.getLength() / 13); for (let k = 0; k < n; k++) for (const side of [-1, 1]) { const p = along(c, (k + 0.5) / n, side * 5.2); tree(p.x, p.z, 0.8 + tr() * 0.3, k % 5 === 0 ? 8 : k % 7 === 3 ? 9 : k % 5, false); } });
    for (let i = 0; i < 110; i++) { const a = tr() * Math.PI * 2, r = LY.far[2] + tr() * 170; tree(Math.cos(a) * r + LY.far[0], Math.sin(a) * r + LY.far[1], 1.1 + tr() * 0.8, Math.floor(tr() * 5), false); }

    // palms by the pools
    const frondGeo = (() => {
      const g0 = new THREE.PlaneGeometry(0.9, 3.4, 2, 8); const pos = g0.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) + 1.7, t = y / 3.4, x = pos.getX(i); pos.setXYZ(i, x * (1 - t * 0.85), y, -t * t * 1.5 - Math.abs(x) * 0.5); }
      g0.computeVertexNormals(); return g0;
    })();
    const frondM = nearFade(new THREE.MeshStandardMaterial({ color: '#4c9d55', roughness: 0.8, side: THREE.DoubleSide }));
    const palmTrunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1, 8);
    const palms: THREE.Group[] = [];
    for (const [x, z, h] of LY.palms) {
      const g0 = new THREE.Group(); g0.position.set(x, 0, z);
      const tk = mesh(palmTrunkGeo, trunkM, 0, h / 2, 0); tk.scale.y = h; g0.add(tk);
      const crown = new THREE.Group(); crown.position.y = h; g0.add(crown); palms.push(crown);
      for (let i = 0; i < 11; i++) { const f = new THREE.Group(); f.rotation.y = (i / 11) * 6.283; const m2 = mesh(frondGeo, frondM, 0, 0, 0); m2.rotation.x = 0.9 + (i % 3) * 0.22; f.add(m2); crown.add(f); }
      scene.add(g0);
    }

    // shrubs, flower beds on soil, and tall ornamental grass
    const SHRUBS = small ? (LY.villas ? 420 : 260) : LY.villas ? 900 : 520;
    const shrubs = new THREE.InstancedMesh(shrubGeo, new THREE.MeshStandardMaterial({ roughness: 0.95, vertexColors: true }), SHRUBS);
    const petals = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.062, 0), new THREE.MeshStandardMaterial({ roughness: 0.6 }), small ? 4000 : 5600);
    const soil = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 20), std('#7a5230', 1), 96);
    let shrubN = 0, petalN = 0, soilN = 0;
    const GREENS = ['#2f7a3d', '#3f8f4f', '#4f9a57', '#2b6e44', '#6bb05f', '#557f3a'], PETALS = ['#f29bb4', '#f0b429', '#ffffff', '#e0662f', '#c6a3e8', '#e8556a'];
    const shrub = (x: number, z: number, r: number, flowers: string | null) => {
      if (shrubN >= SHRUBS || !free(x, z, 0.6)) return;
      q.setFromEuler(eul.set(0, tr() * 6.3, 0)); mtx.compose(V(x, r * 0.55, z), q, V(r, r * (0.7 + tr() * 0.3), r));
      shrubs.setMatrixAt(shrubN, mtx); shrubs.setColorAt(shrubN, col.set(GREENS[Math.floor(tr() * GREENS.length)])); shrubN++;
      if (flowers) for (let i = 0; i < 9 && petalN < petals.count; i++) {
        const u = tr() * 0.9 + 0.1, th = tr() * 6.283, sq = Math.sqrt(1 - u * u);
        mtx.makeTranslation(x + sq * Math.cos(th) * r * 1.02, r * 0.55 + u * r * 0.8, z + sq * Math.sin(th) * r * 1.02);
        petals.setMatrixAt(petalN, mtx); petals.setColorAt(petalN, col.set(flowers)); petalN++;
      }
    };
    const bed = (x: number, z: number, rx: number, rz: number, c1: string, c2: string) => {
      if (soilN >= 96 || !free(x, z, 0.5)) return;
      q.setFromEuler(eul.set(-Math.PI / 2, 0, tr() * 3)); mtx.compose(V(x, 0.03, z), q, V(rx, rz, 1)); soil.setMatrixAt(soilN++, mtx);
      const n = Math.floor(rx * rz * 22);
      for (let i = 0; i < n && petalN < petals.count; i++) {
        const a = tr() * 6.283, d = Math.sqrt(tr()) * 0.92;
        mtx.makeTranslation(x + Math.cos(a) * d * rx, 0.16 + tr() * 0.22, z + Math.sin(a) * d * rz);
        petals.setMatrixAt(petalN, mtx); petals.setColorAt(petalN, col.set(tr() < 0.65 ? c1 : c2)); petalN++;
      }
      for (let i = 0; i < 3; i++) shrub(x + (tr() - 0.5) * rx, z + (tr() - 0.5) * rz, 0.3 + tr() * 0.2, null);
    };
    { // Keep the approach to the start arch open: no trunk or canopy between the walk camera and the banner.
      // (Done after planting, so every other plant stays exactly where it was.)
      const lane: THREE.Vector3[] = []; for (let d = -16; d <= 6; d += 2) lane.push(loop.getPointAt((((tStart + d / loopLen) % 1) + 1) % 1));
      const inLane = (x: number, z: number) => lane.some((q) => Math.hypot(q.x - x, q.z - z) < 7.5);
      for (const t of trees) {
        if (!inLane(t.position.x, t.position.z)) continue;
        t.visible = false;
        for (let i = t.userData.c0 as number; i < (t.userData.c1 as number); i++) { cards.getMatrixAt(i, mtx); mtx.elements[13] -= 300; cards.setMatrixAt(i, mtx); } // its loose leaves go with it
      }
      for (const c of palms) if (c.parent && inLane(c.parent.position.x, c.parent.position.z)) c.parent.visible = false;
    }
    // layered planting along the walking loop, like a real landscaped path
    for (let i = 0, n = byLen(120, loopLen, 200); i < n; i++) {
      const t = i / n, side = i % 2 ? 1 : -1;
      const p = along(loop, t, side * (3.9 + tr() * 1.6)); shrub(p.x, p.z, 0.45 + tr() * 0.5, i % 4 === 0 ? PETALS[Math.floor(tr() * PETALS.length)] : null);
    }
    for (let i = 0, n = byLen(26, loopLen, 200); i < n; i++) { const p = along(loop, i / n + 0.013, (i % 2 ? 1 : -1) * (6.2 + tr() * 2)); bed(p.x, p.z, 1.4 + tr() * 1.3, 0.9 + tr() * 0.8, PETALS[i % PETALS.length], PETALS[(i + 2) % PETALS.length]); }
    // foundation planting around every tower, and around the clubhouse and pools
    blockers.forEach((b) => {
      const n = b.h > 50 ? 26 : LY.villas ? 7 : 14;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 4, e = Math.floor(t), f = (t - e) * 2 - 1;
        const lx = e % 2 === 0 ? f * (b.hw + 0.4) : (e === 1 ? 1 : -1) * (b.hw + 0.9), lz = e % 2 === 0 ? (e === 0 ? 1 : -1) * (b.hd + 0.9) : f * (b.hd + 0.4);
        shrub(b.x + lx * b.c + lz * b.s, b.z - lx * b.s + lz * b.c, 0.5 + tr() * 0.45, i % 5 === 0 ? PETALS[Math.floor(tr() * PETALS.length)] : null);
      }
    });
    for (let i = 0, n = byLen(70, ringLen, 700); i < n; i++) { const p = along(ring, i / n + 0.007, (i % 2 ? 1 : -1) * (5.6 + tr())); shrub(p.x, p.z, 0.4 + tr() * 0.4, i % 6 === 0 ? PETALS[i % PETALS.length] : null); }
    // flower borders behind the hedges, planted in runs of marigold, pink and white
    const BORDER = ['#f0a020', '#f29bb4', '#ffffff', '#e0662f', '#f7d548', '#f4b8c8'];
    for (let i = 0, n = small ? 700 : 1700; i < n && petalN < petals.count - 400; i++) {
      const t = tr(), side = tr() < 0.5 ? 1 : -1, p = along(loop, t, side * (3.15 + tr() * 0.75));
      if (!free(p.x, p.z, 0.4) || BENCHES.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 1.5)) continue;
      mtx.makeTranslation(p.x, 0.2 + tr() * 0.2, p.z); petals.setMatrixAt(petalN, mtx);
      petals.setColorAt(petalN, col.set(BORDER[(Math.floor(t * 30) + (side > 0 ? 0 : 2)) % BORDER.length])); petalN++;
    }
    linkCurves.forEach((c, i) => { if (i === 0) return; const n = Math.max(2, Math.round(c.getLength() / 9)); for (let k = 0; k < n; k++) for (const side of [-1, 1]) { const p = along(c, (k + 0.5) / n, side * 3.4); bed(p.x, p.z, 1.3 + tr() * 0.8, 0.8 + tr() * 0.4, BORDER[(k + i) % 3], BORDER[(k + i + 3) % BORDER.length]); } });
    // yellow petals shed under the golden trees, on the lawn and across the track
    const fallen = new THREE.InstancedMesh(new THREE.CircleGeometry(0.075, 5), new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }), goldSpots.length * (small ? 40 : 90));
    let fallenN = 0;
    for (const [gx, gz, gs] of goldSpots) for (let i = 0; i < (small ? 40 : 90); i++) {
      const a = tr() * 6.283, d = Math.sqrt(tr()) * (2.4 * gs + 1.6), x = gx + Math.cos(a) * d, z = gz + Math.sin(a) * d;
      if (inBlock(x, z, 0.2)) continue;
      const paved = onPaving(x, z);
      q.setFromEuler(eul.set(-Math.PI / 2 + (paved ? 0 : (tr() - 0.5) * 0.9), tr() * 6.3, 0)); mtx.compose(V(x, paved ? 0.068 : 0.1 + tr() * 0.14, z), q, V(1, 0.6 + tr() * 0.5, 1));
      fallen.setMatrixAt(fallenN, mtx); fallen.setColorAt(fallenN, col.set(['#f4cc3a', '#f7d95a', '#eab52a'][fallenN % 3])); fallenN++;
    }
    fallen.count = fallenN; fallen.receiveShadow = true; scene.add(fallen);
    shrubs.count = shrubN; petals.count = petalN; soil.count = soilN; cards.count = cardN;
    shrubs.castShadow = shrubs.receiveShadow = true; soil.receiveShadow = true; cards.receiveShadow = true;
    scene.add(shrubs); scene.add(petals); scene.add(soil); scene.add(cards);

    // boulders by the lagoon
    const rockM = std('#a9a79d', 0.95);
    for (const [x, z, sz] of LY.rocks) { const rk = mesh(new THREE.DodecahedronGeometry(sz, 1), rockM, x, sz * 0.5, z); rk.rotation.set(sz * 3, sz * 7, 0); rk.scale.y = 0.7; scene.add(rk); }

    // clipped hedges on both sides of the walking loop
    const hedgeM = std('#2f7a3d', 1);
    const HEDGE = isPath ? 2 : Math.min(2000, 2 * Math.ceil(loopLen / 1.05)); // one box a metre on each side, however long the track
    const hedge = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 0.8, 0.85, 2, 2, 2), hedgeM, HEDGE);
    const hedgeGap: boolean[] = []; // true where the hedge is left out (a path joins, a bench, a stop): the way through
    for (let i = 0; i < HEDGE; i++) {
      const t = (i >> 1) / (HEDGE / 2), side = i % 2 ? 2.55 : -2.55; const p = along(loop, t, side), tan = loop.getTangentAt(t);
      q.setFromAxisAngle(V(0, 1, 0), Math.atan2(-tan.z, tan.x));
      const pr0 = POOL.rot, rx = (p.x - POOL.x) * Math.cos(pr0) - (p.z - POOL.z) * Math.sin(pr0), rz = (p.x - POOL.x) * Math.sin(pr0) + (p.z - POOL.z) * Math.cos(pr0);
      const hide = isPath || [...LY.hedgeGaps, STOPS[2].pos].some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 3.6) || inBlock(p.x, p.z, 0.4)
        || BENCHES.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 2.1)
        || (hasPool && Math.abs(rx) < PW / 2 + 2.3 && rz > -PD / 2 - 3.4 && rz < PD / 2 + 2.2) || (!!LY.lagoon && ((p.x - LY.lagoon[0]) / 9.5) ** 2 + ((p.z - LY.lagoon[1]) / 7.3) ** 2 < 1);
      hedgeGap.push(hide);
      mtx.compose(V(p.x, hide ? -3 : 0.4, p.z), q, V(1, 0.92 + ((i * 7) % 5) * 0.03, 1)); hedge.setMatrixAt(i, mtx);
    }
    hedge.castShadow = hedge.receiveShadow = true; scene.add(hedge);

    /* ---- real grass: tens of thousands of blades that sway and follow you ---- */
    const MX0 = LY.mask[0], MZ0 = LY.mask[1], MW = LY.maskSize?.[0] ?? 320, MH = LY.maskSize?.[1] ?? 210, MPX = Math.round((1024 * MH) / MW);
    const maskTex = canvasTex(1024, MPX, (g) => {
      const k = 1024 / MW, X = (x: number) => (x - MX0) * k, Z = (z: number) => (z - MZ0) * k;
      g.fillStyle = '#fff'; g.fillRect(0, 0, 1024, MPX); g.fillStyle = g.strokeStyle = '#000'; g.lineCap = g.lineJoin = 'round';
      const stroke = (c: THREE.Curve<THREE.Vector3>, w: number) => { const pts = c.getSpacedPoints(260); g.lineWidth = w * k; g.beginPath(); pts.forEach((pt, i) => (i ? g.lineTo(X(pt.x), Z(pt.z)) : g.moveTo(X(pt.x), Z(pt.z)))); g.stroke(); };
      stroke(ring, 8.2); stroke(loop, 6.9); linkCurves.forEach((c, i) => stroke(c, linkW[i] + 1.2));
      stroke(new THREE.LineCurve3(V(LY.mainRoad[0], 0, LY.mainRoad[1]), V(LY.mainRoad[2], 0, LY.mainRoad[3])), 16);
      const rect = (x: number, z: number, hw: number, hd: number, rot: number) => { g.save(); g.translate(X(x), Z(z)); g.rotate(-rot); g.fillRect(-hw * k, -hd * k, hw * 2 * k, hd * 2 * k); g.restore(); };
      blockers.forEach((b) => rect(b.x, b.z, b.hw + 0.4, b.hd + 0.4, Math.atan2(b.s, b.c)));
      if (LY.lagoon) { g.beginPath(); g.ellipse(X(LY.lagoon[0]), Z(LY.lagoon[1]), 9 * k, 6.8 * k, 0, 0, 6.3); g.fill(); }
      if (hasPool) rect(POOL.x, POOL.z, PW / 2 + 1.8, PD / 2 + 2.5, POOL.rot);
      LY.courts.forEach((ct) => rect(ct.x, ct.z, 5.8, 3.8, ct.rot)); if (LY.bball) rect(LY.bball[0], LY.bball[1], 7.3, 4.8, LY.bball[2] ?? 0);
      g.beginPath(); g.arc(X(LY.play[0]), Z(LY.play[1]), 5.2 * k, 0, 6.3); g.fill();
    }, false);
    const TILE = small ? 30 : 44, BLADES = small ? 34000 : 96000;
    const bladeGeo = (() => {
      const g0 = new THREE.BufferGeometry(); const w = 0.017;
      g0.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, -w * 0.7, 0.5, 0, w * 0.7, 0.5, 0, 0, 1, 0], 3));
      g0.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 0.5, 1, 0.5, 0.5, 1], 2));
      g0.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
      g0.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4, 2, 1, 0, 3, 1, 2, 4, 3, 2]); return g0;
    })();
    const grassU = { uTime: { value: 0 }, uCenter: { value: new THREE.Vector2(LY.start[0], LY.start[1]) }, uMask: { value: maskTex } };
    const grassMat = new THREE.MeshStandardMaterial({ roughness: 0.82 });
    grassMat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, grassU);
      const half = (TILE / 2).toFixed(1), size = TILE.toFixed(1);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime; uniform vec2 uCenter; uniform sampler2D uMask; varying float vH; vec2 gShift;')
        .replace('#include <begin_vertex>', `
          vec3 transformed = vec3(position);
          vH = uv.y;
          vec3 io = instanceMatrix[3].xyz;
          vec2 wrapped = mod(io.xz - uCenter + ${half}, ${size}) - ${half};
          vec2 wxz = uCenter + wrapped;
          gShift = wxz - io.xz;
          float gm = texture2D(uMask, vec2((wxz.x - (${MX0.toFixed(1)})) / ${MW.toFixed(1)}, 1.0 - (wxz.y - (${MZ0.toFixed(1)})) / ${MH.toFixed(1)})).r;
          float gk = step(0.5, gm) * (1.0 - smoothstep(${(TILE * 0.36).toFixed(1)}, ${(TILE * 0.49).toFixed(1)}, length(wrapped)));
          transformed *= gk;
          float sway = sin(uTime * 1.7 + wxz.x * 0.35 + wxz.y * 0.28) * 0.5 + sin(uTime * 2.9 + wxz.x * 1.1) * 0.22;
          transformed.x += sway * 0.32 * vH * vH;
          transformed.z += cos(uTime * 1.3 + wxz.y * 0.4) * 0.08 * vH * vH;`)
        .replace('#include <project_vertex>', `
          vec4 mvPosition = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
          #endif
          mvPosition.xz += gShift;
          mvPosition = modelViewMatrix * mvPosition;
          gl_Position = projectionMatrix * mvPosition;`)
        .replace('#include <worldpos_vertex>', `
          #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
            vec4 worldPosition = vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              worldPosition = instanceMatrix * worldPosition;
            #endif
            worldPosition.xz += gShift;
            worldPosition = modelMatrix * worldPosition;
          #endif`);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vH;')
        .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= mix(0.5, 1.12, vH);');
    };
    const grass = new THREE.InstancedMesh(bladeGeo, grassMat, BLADES);
    for (let i = 0; i < BLADES; i++) {
      q.setFromEuler(eul.set((tr() - 0.5) * 0.5, tr() * 6.283, (tr() - 0.5) * 0.5));
      mtx.compose(V(tr() * TILE, 0, tr() * TILE), q, V(0.8 + tr() * 0.9, 0.09 + tr() * tr() * 0.3, 1));
      grass.setMatrixAt(i, mtx); grass.setColorAt(i, col.set(['#4c9a3a', '#5aab45', '#3f8a35', '#6cba4f', '#55a341', '#7cc45a', '#8ccb5e'][Math.floor(tr() * 7)]));
    }
    grass.frustumCulled = false; grass.receiveShadow = true; scene.add(grass);

    // butterflies over the beds, birds overhead
    const flyers: { g: THREE.Group; wings: THREE.Mesh[]; c: THREE.Vector3; ph: number; r: number; bird: boolean }[] = [];
    const flyWing = new THREE.PlaneGeometry(0.16, 0.2); flyWing.translate(0.08, 0, 0);
    const birdWing = new THREE.PlaneGeometry(0.7, 0.26); birdWing.translate(0.35, 0, 0);
    for (let i = 0; i < (small ? 8 : 16); i++) {
      const bird = i % 4 === 3, g0 = new THREE.Group();
      const wm2 = new THREE.MeshBasicMaterial({ color: bird ? '#3a4650' : ['#f0b429', '#ffffff', '#e0662f', '#c6a3e8'][i % 4], side: THREE.DoubleSide });
      const a = new THREE.Mesh(bird ? birdWing : flyWing, wm2), b = new THREE.Mesh(bird ? birdWing : flyWing, wm2); b.scale.x = -1;
      a.rotation.x = b.rotation.x = -Math.PI / 2; g0.add(a); g0.add(b); scene.add(g0);
      const p = along(loop, tr(), (tr() - 0.5) * 12);
      flyers.push({ g: g0, wings: [a, b], c: bird ? V(LY.aerial[0] + tr() * 80 - 40, 26 + tr() * 22, LY.aerial[1] + tr() * 60 - 30) : V(p.x, 0.9 + tr() * 0.8, p.z), ph: tr() * 6.3, r: bird ? 30 + tr() * 30 : 1.5 + tr() * 2.5, bird });
    }
    // lamps along the loop
    const lampM = std('#24452f', 0.5, 0.5); const bulbs: THREE.MeshStandardMaterial[] = [];
    for (let i = 0, n = byLen(14, loopLen, 200); i < n; i++) {
      const p = along(loop, i / n + 0.02, 3.3);
      scene.add(mesh(new THREE.CylinderGeometry(0.07, 0.1, 4, 8), lampM, p.x, 2, p.z));
      const bm = new THREE.MeshStandardMaterial({ color: '#fff6dc', emissive: '#ffcf86', emissiveIntensity: 0.1 }); bulbs.push(bm);
      scene.add(mesh(new THREE.SphereGeometry(0.26, 12, 10), bm, p.x, 4.1, p.z, false));
    }
    // benches: pale timber slats on a dark green metal frame with armrests
    const slatGeo = merge([
      ...[-0.15, -0.05, 0.05, 0.15].map((z) => new THREE.BoxGeometry(1.7, 0.03, 0.085).translate(0, 0.45, z)),
      ...[0.62, 0.74, 0.86].map((y) => xf(new THREE.BoxGeometry(1.7, 0.085, 0.028), 1, 1, 1, 0, y, -0.25 - (y - 0.5) * 0.2, -0.2)),
    ]);
    const frameGeo = merge([-0.78, 0.78].flatMap((x) => [
      new THREE.BoxGeometry(0.05, 0.45, 0.05).translate(x, 0.225, 0.2), xf(new THREE.BoxGeometry(0.05, 0.98, 0.05), 1, 1, 1, x, 0.48, -0.29, -0.16),
      new THREE.BoxGeometry(0.06, 0.035, 0.52).translate(x, 0.66, -0.03), new THREE.BoxGeometry(0.05, 0.04, 0.5).translate(x, 0.42, -0.03),
    ]));
    const slatM = std('#d8c3a0', 0.8), frameM = std('#24452f', 0.5, 0.4);
    BENCHES.forEach(([x, z, rot]) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rot; b.add(mesh(slatGeo, slatM)); b.add(mesh(frameGeo, frameM)); scene.add(b); });
    const cat = AC.makeCat(); { const b0 = BENCHES[0]; cat.g.position.set(b0[0] - 0.4 * Math.cos(b0[2]), 0.47, b0[1] + 0.4 * Math.sin(b0[2]) + 0.04); cat.g.rotation.y = b0[2]; } scene.add(cat.g); // Lily, on the first bench

    /* ---- cars ---- */
    function car(color: string) {
      const g = new THREE.Group(); const m = std(color, 0.35, 0.4);
      g.add(mesh(new THREE.BoxGeometry(1.8, 0.7, 4.2), m, 0, 0.7, 0)); g.add(mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: '#2a3a44', roughness: 0.1, metalness: 0.5 }), 0, 1.3, -0.2));
      for (const [x, z] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12), std('#1c1c1c', 0.8), x, 0.34, z); w.rotation.z = Math.PI / 2; g.add(w); }
      scene.add(g); return g;
    }
    ['#f4f4f2', '#b8312f', '#3b4a5a', '#d9d9d9', '#1f2a33', '#e9e2d0', '#7c8f83'].slice(0, Math.min(7, byLen(7, ringLen, 700))).forEach((c, i) => { const t = 0.08 + i * 0.13, p = along(ring, t, 5.2), tan = ring.getTangentAt(t); const g = car(c); g.position.copy(p); g.rotation.y = Math.atan2(tan.x, tan.z); });
    const driver = car('#e0662f');

    /* ---- clouds, far city ---- */
    const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.92, fog: false });
    const clouds: THREE.Group[] = [];
    for (let i = 0; i < 9; i++) { const c = new THREE.Group(); c.position.set(-300 + i * 75, 430 + (i % 3) * 30, -260 + (i % 4) * 150); c.scale.setScalar(1.8); for (let k = 0; k < 4; k++) { const s = mesh(new THREE.SphereGeometry(14 + k * 3, 12, 10), cloudM, k * 16, (k % 2) * 4, 0, false); s.scale.y = 0.5; c.add(s); } scene.add(c); clouds.push(c); }
    /* ---- the flat (story set), on a high floor ---- */
    const flat = new THREE.Group(); flat.position.set(LY.flat[0], LY.flat[1], LY.flat[2]); flat.visible = false; scene.add(flat); // hung in clear air at about a mid-floor's height
    const wallM = std('#f3f1ea', 0.95), floorM = std('#e6dfd0', 0.7);
    const fadd = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, sh = true) => { const m = mesh(geo, mat, x, y, z, sh); flat.add(m); return m; };
    fadd(new THREE.BoxGeometry(13, 0.2, 14), floorM, -1.5, -0.1, 3);
    fadd(new THREE.BoxGeometry(10, 0.6, 0.2), wallM, 0, 0.3, -4); fadd(new THREE.BoxGeometry(10, 0.4, 0.2), wallM, 0, 3.0, -4);
    fadd(new THREE.BoxGeometry(2, 3.2, 0.2), wallM, -4, 1.6, -4); fadd(new THREE.BoxGeometry(2, 3.2, 0.2), wallM, 4, 1.6, -4);
    fadd(new THREE.BoxGeometry(6, 2.2, 0.05), new THREE.MeshStandardMaterial({ color: '#cfe6f0', transparent: true, opacity: 0.18, roughness: 0.05 }), 0, 1.7, -4, false);
    fadd(new THREE.BoxGeometry(0.08, 2.2, 0.12), wallM, 0, 1.7, -4);
    fadd(new THREE.BoxGeometry(0.2, 3.2, 5), wallM, -5, 1.6, -1.5); fadd(new THREE.BoxGeometry(0.2, 3.2, 1.8), wallM, -5, 1.6, 3.1); fadd(new THREE.BoxGeometry(0.2, 1, 1.2), wallM, -5, 2.7, 1.6);
    fadd(new THREE.BoxGeometry(0.2, 3.2, 8), wallM, 5, 1.6, 0);
    const ceilM = new THREE.MeshBasicMaterial({ color: '#e4e1d8' });
    fadd(new THREE.BoxGeometry(10.2, 0.16, 14), ceilM, 0, 3.28, 3, false);
    fadd(new THREE.BoxGeometry(0.2, 3.2, 6), wallM, -5, 1.6, 7, false); fadd(new THREE.BoxGeometry(0.2, 3.2, 6), wallM, 5, 1.6, 7, false);
    const roomLight = new THREE.PointLight('#ffe9cc', 11, 18, 1.5); roomLight.position.set(56 - 0.3, 62 + 2.3, 2 + 1.2); scene.add(roomLight);
    fadd(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6), std('#3a3f3c', 0.5), -0.3, 2.85, 0.6, false);
    fadd(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshStandardMaterial({ color: '#fff6dc', emissive: '#ffd9a0', emissiveIntensity: 0.9 }), -0.3, 2.45, 0.6, false);
    fadd(new THREE.BoxGeometry(0.04, 0.8, 1.1), std('#ffffff', 0.6), -4.88, 1.8, -1.6, false); fadd(new THREE.BoxGeometry(0.05, 0.62, 0.92), std('#8fc79a', 0.8), -4.87, 1.8, -1.6, false);
    const door = new THREE.Group(); door.position.set(-5, 0, 1); flat.add(door);
    door.add(mesh(new THREE.BoxGeometry(0.07, 2.2, 1.2), std('#8fb39a', 0.6), 0, 1.1, 0.6));
    door.add(mesh(new THREE.SphereGeometry(0.05, 8, 6), std('#f0b429', 0.3, 0.8), 0.08, 1.05, 1.05));
    // desk, laptop, chair
    fadd(new THREE.BoxGeometry(1.9, 0.06, 0.8), std('#d9c8ae', 0.6), 2.3, 0.76, -3.2);
    for (const [x, z] of [[1.45, -3.5], [3.15, -3.5], [1.45, -2.9], [3.15, -2.9]]) fadd(new THREE.BoxGeometry(0.06, 0.76, 0.06), std('#3a3f3c', 0.5), x, 0.38, z);
    fadd(new THREE.BoxGeometry(0.42, 0.02, 0.28), std('#c9ccce', 0.3, 0.7), 2.3, 0.8, -3.15);
    const screen = fadd(new THREE.BoxGeometry(0.42, 0.28, 0.02), new THREE.MeshStandardMaterial({ color: '#dfeeff', emissive: '#9fc8ff', emissiveIntensity: 0.6 }), 2.3, 0.94, -3.32, false); screen.rotation.x = -0.2;
    fadd(new THREE.BoxGeometry(0.5, 0.08, 0.5), std('#49a85a', 0.8), 2.3, 0.5, -2.35); fadd(new THREE.BoxGeometry(0.5, 0.6, 0.08), std('#49a85a', 0.8), 2.3, 0.85, -2.08);
    fadd(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), std('#3a3f3c', 0.5), 2.3, 0.25, -2.35);
    // sofa, rug, plant, shelf
    const sofaM = std('#9fbfa4', 0.95);
    fadd(new THREE.BoxGeometry(2.6, 0.45, 0.95), sofaM, -1.8, 0.25, -3.3); fadd(new THREE.BoxGeometry(2.6, 0.6, 0.25), sofaM, -1.8, 0.75, -3.7);
    fadd(new THREE.BoxGeometry(0.25, 0.7, 0.95), sofaM, -3.2, 0.4, -3.3); fadd(new THREE.BoxGeometry(0.25, 0.7, 0.95), sofaM, -0.4, 0.4, -3.3);
    fadd(new THREE.BoxGeometry(0.5, 0.14, 0.4), std('#f0b429', 0.9), -2.6, 0.55, -3.3);
    const rug = fadd(new THREE.CircleGeometry(1.7, 40), std('#f5dccb', 1), -0.3, 0.012, 0.6, false); rug.rotation.x = -Math.PI / 2;
    fadd(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 14), std('#f4f1ea', 0.7), 4.3, 0.2, -3.3); fadd(shrubGeo, leafMs[2], 4.3, 0.95, -3.3).scale.setScalar(0.5); fadd(shrubGeo, leafMs[0], 4.45, 1.45, -3.2).scale.setScalar(0.35);
    fadd(new THREE.BoxGeometry(0.3, 2, 2.2), std('#d9c8ae', 0.7), 4.75, 1, -1.2);
    ['#e0662f', '#2e7d4f', '#f0b429', '#6fa8c9', '#c6a3e8', '#49a85a'].forEach((c, i) => fadd(new THREE.BoxGeometry(0.2, 0.3, 0.09), std(c, 0.8), 4.62, 0.7 + Math.floor(i / 3) * 0.6, -2 + (i % 3) * 0.14, false));
    // pet corner: dog bed, bowls, litter box, toy
    fadd(new THREE.CylinderGeometry(0.55, 0.6, 0.16, 20), std('#e7b98a', 1), -3.9, 0.08, -1.4);
    const bowlM = std('#cfd6d8', 0.2, 0.9);
    fadd(new THREE.CylinderGeometry(0.16, 0.12, 0.09, 16), bowlM, 3.3, 0.045, 2.6); fadd(new THREE.CylinderGeometry(0.16, 0.12, 0.09, 16), bowlM, 3.8, 0.045, 2.6);
    const food = fadd(new THREE.SphereGeometry(0.13, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std('#b97c3d', 0.9), 3.3, 0.06, 2.6, false);
    const drink = fadd(new THREE.CircleGeometry(0.13, 16), new THREE.MeshStandardMaterial({ color: '#5fa8c9', roughness: 0.05 }), 3.8, 0.092, 2.6, false); drink.rotation.x = -Math.PI / 2;
    fadd(new THREE.BoxGeometry(0.8, 0.2, 0.6), std('#b9d3c0', 0.8), 4.3, 0.1, 0.6); const litter = fadd(new THREE.BoxGeometry(0.7, 0.04, 0.5), std('#e9e2cf', 1), 4.3, 0.19, 0.6, false);
    const wand = fadd(new THREE.SphereGeometry(0.07, 8, 6), std('#e8556a', 0.8), 0, -5, 0, false);
    // people and pets of the flat
    const parent = AC.makePerson({ shirt: '#c6a3e8', pants: '#3b3b46', skin: '#b98562', hair: '#1a1512', style: 'long', build: 'f', height: 1.62 }); flat.add(parent.g);
    parent.g.position.set(2.3, 0, -2.42); parent.g.rotation.y = Math.PI; parent.c.sit = parent.k.sit = 1; parent.c.seat = 0.625; parent.c.type = 1;
    const vPriya = AC.makePerson({ shirt: '#2e7d4f', pants: '#33424a', skin: '#c08a63', hair: '#1f1a17', style: 'pony', build: 'f', height: 1.65, lanyard: true }); flat.add(vPriya.g);
    const vKabir = AC.makePerson({ shirt: '#6fa8c9', pants: '#2f3b47', skin: '#a9764f', hair: '#17120f', style: 'crop', build: 'm', height: 1.77, lanyard: true }); flat.add(vKabir.g);
    // boarding: Marcus is the host at home, and Ananya brings Biscuit to his door
    const vMarcus = AC.makePerson({ shirt: '#3f6c8a', pants: '#3a3f45', skin: '#8a5a3c', hair: '#161210', style: 'crop', build: 'm', height: 1.8, lanyard: true }); flat.add(vMarcus.g);
    const vOwner = AC.makePerson({ shirt: '#c6a3e8', pants: '#3b3b46', skin: '#b98562', hair: '#1a1512', style: 'long', build: 'f', height: 1.62 }); flat.add(vOwner.g);
    let visitor: Person = vPriya;
    const homeCat = AC.makeCat(); flat.add(homeCat.g);
    // name tags in the flat keep one small size on screen, so a close-up never blows a name up across the picture
    const nameTag = (text: string) => { const s = label(text); (s.material as THREE.SpriteMaterial).sizeAttenuation = false; s.scale.multiplyScalar((small ? 0.036 : 0.03) / 1.6); return s; };
    const pLabel = nameTag('Ananya'); pLabel.position.set(2.3, 1.56, -2.42); flat.add(pLabel);
    const vLabel = nameTag('Priya'); flat.add(vLabel);

    /* ---- world people and pets ---- */
    const walker = AC.makePerson({ shirt: '#2e7d4f', pants: '#33424a', skin: '#c08a63', hair: '#1f1a17', style: 'pony', build: 'f', height: 1.65, lanyard: true }); walker.g.position.set(LY.start[0], 0, LY.start[1]); walker.c.leash = 0; scene.add(walker.g);
    const dog = AC.makeDog(); dog.g.position.set(LY.start[0] - 0.5, 0, LY.start[1] - 0.8); scene.add(dog.g);
    const priya = AC.makePerson({ shirt: '#e0662f', pants: '#2c3a50', skin: '#9a6a4a', hair: '#14110f', style: 'bun', build: 'f', height: 1.6, lanyard: true }); priya.g.position.set(LY.rhea[0], 0, LY.rhea[1]); scene.add(priya.g);
    const pl = label('Rhea', { scale: 0.2 }); pl.position.set(LY.rhea[0], 2.0, LY.rhea[1]); scene.add(pl); // the neighbour at the pool; Priya is the walker
    const jogger = AC.makePerson({ shirt: '#f0b429', pants: '#22313a', skin: '#d1a07a', hair: '#3a2a1f', style: 'crop', build: 'm', height: 1.78, shorts: true }); scene.add(jogger.g);
    const resident = AC.makePerson({ shirt: '#6fa8c9', pants: '#4a4f55', skin: '#a87656', hair: '#8f8f8c', style: 'crop', build: 'm', height: 1.7 }); resident.c.leash = 0; scene.add(resident.g);
    const dog2 = AC.makeDog({ coat: '#2f2a26', cream: '#4a423b', dark: '#1d1916', scale: 0.82, harness: '#3f9fd0' }); scene.add(dog2.g);
    const sitter = AC.makePerson({ shirt: '#c6a3e8', pants: '#3b3b46', skin: '#b07a58', hair: '#1a1512', style: 'bun', build: 'f', height: 1.6 }); { const b1 = BENCHES[1]; sitter.g.position.set(b1[0] - 0.4 * Math.cos(b1[2]), 0, b1[1] + 0.4 * Math.sin(b1[2])); sitter.g.rotation.y = b1[2]; } sitter.c.sit = sitter.k.sit = 1; sitter.c.phone = sitter.k.phone = 1; scene.add(sitter.g);
    sitter.arms[0].low.add(mesh(new THREE.BoxGeometry(0.07, 0.14, 0.012), std('#20262a', 0.3, 0.4), 0, -0.3, 0.035, false));
    [parent, vPriya, vKabir, vMarcus, vOwner, walker, priya, jogger, resident, sitter].forEach((pp) => AC.posePerson(pp, 1, 0, false));
    AC.poseDog(dog, 1, 0, false); AC.poseDog(dog2, 1, 0, false); AC.poseCat(cat, 1, 0, false); AC.poseCat(homeCat, 1, 0, false);

    // leashes are real cords (instanced segments), one for Biscuit and one for the neighbour's dog
    const LEASH_N = 12;
    const leashGeo = new THREE.CylinderGeometry(0.011, 0.011, 1, 5, 1, true), leashM = std('#e0662f', 0.7);
    const mkLeash = () => { const l = new THREE.InstancedMesh(leashGeo, leashM, LEASH_N - 1); l.frustumCulled = false; l.castShadow = true; scene.add(l); return l; };
    const leash = mkLeash(), leash2 = mkLeash();
    const lA = V(), lB = V(), lP = V(), lQ = V(), lD = V(), lS = V(), lUp = V(0, 1, 0);
    function drawLeash(l: THREE.InstancedMesh, a: THREE.Vector3, b: THREE.Vector3) {
      const sag = Math.max(0.04, 1.5 - a.distanceTo(b)) * 0.3;
      lP.copy(a);
      for (let i = 1; i < LEASH_N; i++) {
        const t = i / (LEASH_N - 1); lQ.lerpVectors(a, b, t); lQ.y -= Math.sin(Math.PI * t) * sag;
        lD.subVectors(lQ, lP); const len = lD.length() || 0.001; q.setFromUnitVectors(lUp, lD.divideScalar(len));
        mtx.compose(lS.addVectors(lP, lQ).multiplyScalar(0.5), q, lD.set(1, len, 1)); l.setMatrixAt(i - 1, mtx); lP.copy(lQ);
      }
      l.instanceMatrix.needsUpdate = true;
    }
    const FX = (LY.fetch[0] + LY.fetch[1]) / 2, FZ = (LY.fetch[2] + LY.fetch[3]) / 2; // the middle of the lawn where fetch happens
    const ball = mesh(new THREE.SphereGeometry(0.075, 12, 10), std('#d4e157', 0.6), FX - 2, 0.075, FZ - 1); scene.add(ball);

    const ringGeo = new THREE.RingGeometry(1.1, 1.35, 40);
    const rings = new Map<StopId, THREE.Mesh>();
    for (const s of STOPS) { const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#e0662f', transparent: true, opacity: 0.85, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(s.pos[0], 0.09, s.pos[1]); scene.add(r); rings.set(s.id, r); }
    const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false }));
    marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);

    /* ---- bones to collect: every one is worth ProxyPaw points ---- */
    const boneGeo = merge([xf(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), 1, 1, 1, 0, 0, 0, 0, 0, Math.PI / 2), ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => new THREE.SphereGeometry(0.07, 10, 8).translate(a * 0.13, b * 0.05, 0))]);
    const boneM = new THREE.MeshStandardMaterial({ color: '#fff3d9', emissive: '#f0a23a', emissiveIntensity: 0.55, roughness: 0.4 });
    const goldM = new THREE.MeshStandardMaterial({ color: '#ffd04a', emissive: '#e98a1c', emissiveIntensity: 0.95, roughness: 0.25, metalness: 0.45 });
    const glowTex = canvasTex(64, 64, (g) => { const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, 'rgba(255,196,96,.85)'); grd.addColorStop(1, 'rgba(255,196,96,0)'); g.fillStyle = grd; g.fillRect(0, 0, 64, 64); });
    // a soft column of light above each bone, so the next one can be seen from a long way down the track
    const beamTex = canvasTex(32, 128, (g) => {
      const up = g.createLinearGradient(0, 128, 0, 0); up.addColorStop(0, 'rgba(255,214,130,.8)'); up.addColorStop(0.5, 'rgba(255,214,130,.26)'); up.addColorStop(1, 'rgba(255,214,130,0)');
      g.fillStyle = up; g.fillRect(0, 0, 32, 128);
      g.globalCompositeOperation = 'destination-in'; const side = g.createLinearGradient(0, 0, 32, 0); side.addColorStop(0, 'rgba(0,0,0,0)'); side.addColorStop(0.5, 'rgba(0,0,0,1)'); side.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = side; g.fillRect(0, 0, 32, 128);
    });
    const tOf = (x: number, z: number) => { let bt2 = 0, bd = 1e9; for (let i = 0; i < 300; i++) { const p = loop.getPointAt(i / 300), d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; bt2 = i / 300; } } return bt2; };
    // About one bone every 16 m, spread over the three lanes. The first few sit in the middle lane beside the stops
    // (one either side of the first stop), so the self-playing walk always collects one on its way in.
    const N_BONES = THREE.MathUtils.clamp(Math.round(loopLen / 16), 10, 26), LANE = isPath ? 0.9 : 1.25;
    const t0 = tOf(STOPS[0].pos[0], STOPS[0].pos[1]);
    const boneT = [t0 + 5 / loopLen, t0 - 5 / loopLen, tOf(STOPS[2].pos[0], STOPS[2].pos[1]) - 5.5 / loopLen, tOf(LY.story.to[0], LY.story.to[1]) - 6 / loopLen].map((t) => ((t % 1) + 1) % 1);
    const fixedBones = boneT.length;
    for (let i = 0; i < N_BONES; i++) { const t = (tStart + (i + 0.5) / N_BONES) % 1; if (boneT.every((u) => Math.min(Math.abs(u - t), 1 - Math.abs(u - t)) > 0.45 / N_BONES)) boneT.push(t); }
    interface Bone { g: THREE.Group; b: THREE.Mesh; sp: THREE.Sprite; beam: THREE.Sprite; got: number; done: boolean; v: number; gold: boolean; y: number }
    const mkBone = (x: number, z: number, gold: boolean): Bone => {
      const y = gold ? 0.95 : 0.78, g = new THREE.Group(); g.position.set(x, y, z);
      const b = mesh(boneGeo, gold ? goldM : boneM); b.scale.setScalar(gold ? 3 : 2); b.rotation.z = 0.35; g.add(b);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(gold ? 3 : 2); g.add(sp);
      const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: beamTex, transparent: true, depthWrite: false, opacity: gold ? 0.75 : 0.5 })); beam.center.set(0.5, 0); beam.scale.set(gold ? 1.5 : 0.95, gold ? 7.5 : 4.6, 1); beam.position.y = 0.1; g.add(beam);
      scene.add(g); return { g, b, sp, beam, got: 0, done: false, v: gold ? PTS.gold : PTS.bone, gold, y };
    };
    const treats: Bone[] = [];
    boneT.forEach((t, i) => { const p = along(loop, t, i < fixedBones ? 0 : [-LANE, 0, LANE][i % 3]); if (!inBlock(p.x, p.z, 0.3)) treats.push(mkBone(p.x, p.z, false)); });
    { // one golden bone waits on the pet lawn, off the track: worth five ordinary ones
      let gx = THREE.MathUtils.clamp(FX + 3, LY.fetch[0] + 0.8, LY.fetch[1] - 0.8), gz = THREE.MathUtils.clamp(FZ + 2, LY.fetch[2] + 0.8, LY.fetch[3] - 0.8);
      if (inBlock(gx, gz, 0.3)) { gx = FX; gz = FZ; }
      treats.push(mkBone(gx, gz, true));
    }
    const BONES = treats.length; setBones({ got: 0, of: BONES });
    let treatN = 0, pts = 0, lapAcc = 0, lapLast = -1, lapDone = false;
    // "+10" rises from whatever earned the points
    const popMats = new Map<string, { m: THREE.SpriteMaterial; r: number }>();
    function popup(at: THREE.Vector3, text: string) {
      let pm = popMats.get(text);
      if (!pm) { const l = label(text, { bg: 'rgba(224,102,47,.96)', fg: '#ffffff' }); pm = { m: l.material as THREE.SpriteMaterial, r: l.scale.x / l.scale.y }; popMats.set(text, pm); }
      const mat = pm.m.clone(); mat.sizeAttenuation = false; mat.depthTest = false;
      const s = new THREE.Sprite(mat), h = small ? 0.05 : 0.04; s.scale.set(pm.r * h, h, 1); s.position.copy(at); s.renderOrder = 12;
      scene.add(s); fx.push({ s, t: 0, v: V(0, 1.15, 0) });
    }
    const award = (n: number, at?: THREE.Vector3) => { pts += n; setScore({ c: LY.id, n: pts }); if (at) popup(at, `+${n}`); };

    const hTex = heartTex();
    const fx: { s: THREE.Sprite; t: number; v: THREE.Vector3 }[] = [];
    function hearts(at: THREE.Vector3, n = 6, size = 0.35) {
      for (let i = 0; i < n; i++) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: hTex, transparent: true, depthWrite: false }));
        s.position.copy(at).add(V((Math.random() - 0.5) * 0.6, 0.2, (Math.random() - 0.5) * 0.6)); s.scale.setScalar(size);
        scene.add(s); fx.push({ s, t: 0, v: V((Math.random() - 0.5) * 0.4, 1 + Math.random() * 0.6, (Math.random() - 0.5) * 0.4) });
      }
    }
    let bubble: THREE.Sprite | null = null; let bubbleT = 0;

    /* ---- state ---- */
    const WALK_PITCH = 0.2; // the walk camera sits low behind the walker and looks over their head, so the towers fill the frame
    const keys = new Set<string>();
    let queue: THREE.Vector3[] = [];
    let yaw = Math.PI * 0.5, pitch = WALK_PITCH; const dist = 8.4, SPEED = 3.7, PACE = 0.8;
    let m: Mode = 'menu';
    let minutes = 0, meters = 0, photoCount = 0;
    const doneSet = new Set<StopId>();
    let nightF = 0, nightTarget = 0;
    let dogMode: 'follow' | 'go' | 'back' | 'drink' | 'sit' = 'follow';
    let dogTimer = 0;
    let ballFlight: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
    let ballHeld = false, nearId: StopId | null = null, lastHud = 0, wave = 0, visible = true, dogSitFlat = false;
    let autoWalk = false;

    const camPos = V(), camLook = V(); let camDist = dist, camSnap = false;
    const camHit = (x: number, y: number, z: number) => blockers.some((b) => { if (y > b.h) return false; const dx = x - b.x, dz = z - b.z; return Math.abs(dx * b.c - dz * b.s) < b.hw - 0.6 && Math.abs(dx * b.s + dz * b.c) < b.hd - 0.6; });
    function followCam(snap = false) {
      const tgt = walker.g.position.clone().add(V(0, 1.35, 0));
      const pc = Math.max(pitch, 0.07); // dragging further down than this looks up at the towers instead of sinking the camera into the ground
      const dv = V(Math.sin(yaw) * Math.cos(pc), Math.sin(pc), Math.cos(yaw) * Math.cos(pc));
      let d = dist;
      for (let i = 1; i <= 12; i++) { const dd = (dist * i) / 12; if (camHit(tgt.x + dv.x * dd, tgt.y + dv.y * dd, tgt.z + dv.z * dd)) { d = Math.max(2.4, (dist * (i - 1)) / 12 - 0.3); break; } }
      camDist = d < camDist || snap ? d : camDist + (d - camDist) * 0.08;
      const want = tgt.clone().add(dv.multiplyScalar(camDist));
      tgt.y += (1.2 + Math.max(0, 0.07 - pitch) * 15) * (camDist / dist); // aim above the walker's head: walker low in the frame, skyline above
      if (snap) { camPos.copy(want); camLook.copy(tgt); } else { camPos.lerp(want, 0.14); camLook.lerp(tgt, 0.2); }
    }
    /* Where a point is relative to the walking loop: the nearest sample, the distance to it, the signed distance from
       the centre line (the side it is on) and the way the track runs there. */
    const LN = loopPts.length - 1; // the last sample repeats the first
    interface OnLoop { j: number; d: number; off: number; tx: number; tz: number }
    const trk: OnLoop = { j: 0, d: 1e9, off: 0, tx: 0, tz: 1 }, hk: OnLoop = { j: 0, d: 1e9, off: 0, tx: 0, tz: 1 };
    const onLoop = (x: number, z: number, o: OnLoop) => {
      let bj = 0, bd = 1e18; for (let i = 0; i < LN; i++) { const q = loopPts[i], d = (q.x - x) ** 2 + (q.z - z) ** 2; if (d < bd) { bd = d; bj = i; } }
      const a = loopPts[(bj + LN - 1) % LN], b = loopPts[(bj + 1) % LN], q = loopPts[bj]; let tx = b.x - a.x, tz = b.z - a.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      o.j = bj; o.d = Math.sqrt(bd); o.tx = tx; o.tz = tz; o.off = (x - q.x) * -tz + (z - q.z) * tx; return o;
    };
    /* The clipped hedge either side of the track is solid when you walk by keys: you slide along it and leave through
       the gaps. (Tapping a place or pressing Go still walks you straight there.) `from` is the side you were on. */
    const HEDGE_IN = 1.72, HEDGE_OUT = 3.32, HN = HEDGE / 2;
    const hedgeStop = (p: THREE.Vector3, from: number) => {
      if (isPath) return; onLoop(p.x, p.z, hk); const a = Math.abs(hk.off);
      if (hk.d > HEDGE_OUT + 0.8 || a <= HEDGE_IN || a >= HEDGE_OUT) return;
      const k = Math.round((hk.j / LN) * HN) % HN; if (hedgeGap[2 * k + (hk.off > 0 ? 1 : 0)]) return;
      const want = Math.sign(hk.off) * (Math.abs(from) < 2.55 ? HEDGE_IN : HEDGE_OUT);
      p.x += -hk.tz * (want - hk.off); p.z += hk.tx * (want - hk.off);
    };
    function collide(p: THREE.Vector3) {
      p.x = THREE.MathUtils.clamp(p.x, LY.bounds[0], LY.bounds[1]); p.z = THREE.MathUtils.clamp(p.z, LY.bounds[2], LY.bounds[3]);
      for (const b of blockers) {
        const dx = p.x - b.x, dz = p.z - b.z; let lx = dx * b.c - dz * b.s, lz = dx * b.s + dz * b.c;
        if (Math.abs(lx) < b.hw && Math.abs(lz) < b.hd) {
          if (b.hw - Math.abs(lx) < b.hd - Math.abs(lz)) lx = Math.sign(lx || 1) * b.hw; else lz = Math.sign(lz || 1) * b.hd;
          p.x = b.x + lx * b.c + lz * b.s; p.z = b.z - lx * b.s + lz * b.c;
        }
      }
    }
    const clearLine = (a: THREE.Vector3, b: THREE.Vector3) => { const n = Math.ceil(a.distanceTo(b) / 2); for (let i = 1; i < n; i++) { const p = a.clone().lerp(b, i / n); if (inBlock(p.x, p.z, 0)) return false; } return true; };
    function finish(msg: string, id: StopId) {
      if (!doneSet.has(id)) {
        doneSet.add(id); setDone(Array.from(doneSet)); rings.get(id)!.visible = false; award(PTS.stop, walker.g.position.clone().add(V(0, 2.2, 0)));
        if (doneSet.size === 4) { award(PTS.allStops); msg += ` All four stops done: ${PTS.allStops} bonus points. End the walk when you are ready.`; }
      }
      say(msg);
    }
    const goToPoint = (p: THREE.Vector3) => {
      queue = p.distanceTo(walker.g.position) < 30 && clearLine(walker.g.position, p) ? [p.clone()] : routeTo(walker.g.position, p);
      marker.visible = true; marker.position.set(p.x, 0.1, p.z);
    };

    /* ---- actors inside the flat ---- */
    interface Actor { g: THREE.Group; dest: THREE.Vector3 | null; speed: number }
    const actor = (g: THREE.Group, speed: number): Actor => ({ g, dest: null, speed });
    const aVisitor = actor(visitor.g, 1.5), aDog = actor(dog.g, 2), aCat = actor(homeCat.g, 1.2), aOwner = actor(vOwner.g, 1.4);
    let flatHolder: Person = vPriya, dogEatFlat = false; // who holds the leash indoors; Biscuit at his bowl
    /** moves an actor towards its destination; returns the distance covered this frame */
    function stepActor(a: Actor, dt: number) {
      if (!a.dest) return 0;
      const d = a.dest.clone().sub(a.g.position); d.y = 0; const len = d.length();
      if (len < 0.06) { a.dest = null; return 0; }
      d.normalize(); const st = Math.min(len, a.speed * dt); a.g.position.addScaledVector(d, st);
      let r = Math.atan2(d.x, d.z) - a.g.rotation.y; r = Math.atan2(Math.sin(r), Math.cos(r)); a.g.rotation.y += r * Math.min(1, dt * 9);
      return st;
    }

    /* ---- stories ---- */
    interface Beat { dur: number; text: string; img?: string; cam: [number, number, number, number, number, number]; start?: () => void; update?: (t: number, dt: number) => void }
    let beats: Beat[] = [], bi = -1, bt = 0, storyId: StoryId | null = null, leashInFlat = false, doorOpen = 0, doorTarget = 0, fill = 0, fillTarget = 0;
    const F = flat.position;
    const fc = (x: number, y: number, z: number, lx: number, ly: number, lz: number): Beat['cam'] => [F.x + x, F.y + y, F.z + z, F.x + lx, F.y + ly, F.z + lz];
    const wpos = (o: THREE.Object3D, y = 0.6) => o.getWorldPosition(V()).add(V(0, y, 0));
    function setupFlat(id: StoryId) {
      flat.visible = true; doorOpen = doorTarget = 0; leashInFlat = false; dogSitFlat = dogEatFlat = false; fill = fillTarget = id === 'dog' ? 1 : 0;
      visitor = id === 'dog' ? vPriya : id === 'cat' ? vKabir : vMarcus; aVisitor.g = visitor.g; flatHolder = visitor;
      vPriya.g.visible = id === 'dog'; vKabir.g.visible = id === 'cat'; vMarcus.g.visible = vOwner.g.visible = id === 'board';
      visitor.g.position.set(-8, 0, 1.6); visitor.g.rotation.set(0, Math.PI / 2, 0); aVisitor.dest = null;
      Object.assign(visitor.c, { crouch: 0, reach: [0, 0], leash: -1, phone: 0 }); Object.assign(parent.c, { wave: [0, 0], twist: 0, look: 0 });
      wand.position.y = -5;
      const nl = nameTag(id === 'dog' ? 'Priya' : id === 'cat' ? 'Kabir' : 'Marcus'); vLabel.material.map?.dispose(); vLabel.material = nl.material; vLabel.scale.copy(nl.scale);
      if (id === 'dog') {
        parent.g.visible = pLabel.visible = true; homeCat.g.visible = false; pLabel.position.set(2.3, 1.56, -2.42);
        flat.add(dog.g); dog.g.position.set(1.2, 0, -1.6); dog.g.rotation.set(0, 1.2, 0); aDog.dest = null;
      } else if (id === 'board') {
        parent.g.visible = false; pLabel.visible = true; homeCat.g.visible = false;
        visitor.g.position.set(0.4, 0, 1.4); visitor.g.rotation.set(0, -Math.PI / 2, 0);
        vOwner.g.visible = true; vOwner.g.position.set(-8.4, 0, 1.6); vOwner.g.rotation.set(0, Math.PI / 2, 0); aOwner.dest = null; Object.assign(vOwner.c, { wave: [0, 0], leash: 0 });
        flat.add(dog.g); dog.g.position.set(-8.9, 0, 2.3); dog.g.rotation.set(0, Math.PI / 2, 0); aDog.dest = null;
        flatHolder = vOwner; leashInFlat = true;
      } else {
        parent.g.visible = pLabel.visible = false; homeCat.g.visible = true;
        homeCat.g.position.set(-1.6, 0.48, -3.25); homeCat.g.rotation.set(0, 0.3, 0); aCat.dest = null;
      }
    }
    const L = (x: number, z: number) => V(x, 0, z);
    const DOG_BEATS: Beat[] = [
      { dur: 6, text: `9:40 am, ${LY.words.home}. Ananya has calls until noon. Biscuit has other plans.`, cam: fc(-0.5, 2.3, 6.4, 0.6, 0.9, -1.2), start: () => { aDog.dest = L(-1.5, 1.2); }, update: (t) => { if (t > 3.6 && !aDog.dest) { dog.g.rotation.y += (-1.5 - dog.g.rotation.y) * 0.08; dogSitFlat = true; } } },
      { dur: 5.5, img: '/real/meet-greet.jpg', text: `The doorbell. Priya lives in ${LY.words.walker}, is Aadhaar-verified, and met Biscuit at last week's meet-and-greet.`, cam: fc(-1.2, 1.9, 5.6, -3.2, 0.95, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); dogSitFlat = false; }, update: (t) => { if (t > 1.6) doorTarget = 1; if (t > 2.4 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-3.2, 1.5); if (t > 2.2) aDog.dest = L(-2.15, 1.35); } },
      { dur: 5.5, text: 'A proper hello first. Then the leash goes on, with poop bags and a towel packed.', cam: fc(-1.9, 1.25, 3.9, -2.7, 0.7, 1.4), start: () => { hearts(wpos(dog.g, 0.9), 6, 0.22); Object.assign(parent.c, { wave: [0, 1], twist: 0.9, look: 0.5, type: 0 }); dogSitFlat = true; },
        update: (t) => { visitor.c.crouch = t < 3.2 ? 1 : 0; visitor.c.reach[0] = t > 0.4 && t < 3.2 ? 1 : 0; if (t > 2.6) { leashInFlat = true; visitor.c.leash = 0; } if (t > 3.5) Object.assign(parent.c, { wave: [0, 0], twist: 0, look: 0, type: 1 }); } },
      { dur: 4.5, text: 'Out they go. Ananya is back on her call before the lift arrives.', cam: fc(1.5, 2.2, 6.4, -2.5, 0.9, 0.8), start: () => { visitor.c.crouch = 0; visitor.c.reach[0] = 0; dogSitFlat = false; aVisitor.dest = L(-8.5, 1.6); }, update: (t) => { if (t > 0.5) aDog.dest = L(-8, 2.2); if (t > 3.4) doorTarget = 0; } },
      { dur: 9, img: '/real/hero.jpg', text: `Down to the ${LY.words.track ?? (isPath ? 'garden path' : 'jogging track')}. Live GPS and a photo every 15 minutes go to Ananya's phone.`, cam: [0, 0, 0, 0, 0, 0], start: () => { toWorld(); queue = routeTo(walker.g.position, V(LY.story.to[0], 0, LY.story.to[1])); autoWalk = true; } },
    ];
    const CAT_BEATS: Beat[] = [
      { dur: 5, img: '/real/cat-window.jpg', text: 'Meera is travelling for work. Lily stays home, where cats are happiest.', cam: fc(-0.5, 1.5, 0.6, -1.6, 0.62, -3.25) },
      { dur: 5.5, text: `Kabir from ${LY.words.sitter} lets himself in with a one-time door code. Meera gets a ping the moment it opens.`, cam: fc(-1.2, 1.9, 5.6, -3.2, 0.95, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); }, update: (t) => { if (t > 1.5) doorTarget = 1; if (t > 2.3 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-2.6, 1.4); if (t > 4.5) doorTarget = 0; } },
      { dur: 6, text: 'Fresh food and fresh water first. Lily supervises.', cam: fc(1.6, 1.5, 5.6, 3.1, 0.4, 2.3), start: () => { aVisitor.dest = L(2.75, 2.45); }, update: (t) => { const dn = t > 2.2 && t < 4.8; visitor.c.crouch = dn ? 1 : 0; visitor.c.reach[0] = dn ? 1 : 0; if (t > 2.6) fillTarget = 1; if (t > 1.5 && homeCat.g.position.y > 0.1) { homeCat.g.position.y = 0; homeCat.g.position.z = -2.4; } if (t > 1.5) aCat.dest = L(3.75, 2.05); } },
      { dur: 5, text: 'Litter scooped and the box wiped clean.', cam: fc(1.9, 1.7, 4.6, 3.9, 0.4, 0.6), start: () => { visitor.c.crouch = 0; visitor.c.reach[0] = 0; aVisitor.dest = L(3.45, 0.65); }, update: (t) => { const dn = t > 1.8 && t < 4.2; visitor.c.crouch = dn ? 1 : 0; visitor.c.reach[0] = dn ? 1 : 0; if (t > 2.4) (litter.material as THREE.MeshStandardMaterial).color.set('#f8f5ea'); } },
      { dur: 6.5, img: '/real/cat-visit.jpg', text: 'Ten minutes of play, then chin scratches. This is the part Lily booked it for.', cam: fc(-0.2, 1.2, 4.2, -0.1, 0.45, 0.7), start: () => { visitor.c.crouch = 0; aVisitor.dest = L(0.55, 0.9); aCat.dest = L(-0.5, 0.75); },
        update: (t) => {
          const play = t > 2 && t < 4.4;
          visitor.c.reach[0] = t > 1.6 ? (play ? 0.75 : 1) : 0;
          if (play) { visitor.arms[0].end.getWorldPosition(tmp2); flat.worldToLocal(tmp2); wand.position.set(tmp2.x - 0.35 + Math.sin(t * 5) * 0.18, 0.42 + Math.abs(Math.sin(t * 7)) * 0.28, tmp2.z + Math.cos(t * 5) * 0.12); homeCat.g.position.y = Math.abs(Math.sin(t * 7)) * 0.1; }
          if (t > 4.4) { wand.position.y = -5; homeCat.g.position.y = 0; visitor.c.crouch = 1; if (Math.random() < 0.08) hearts(wpos(homeCat.g, 0.4), 1, 0.2); }
        } },
      { dur: 5, text: 'Photos sent to Meera. Visit done in 30 minutes: ₹129, and ₹90.30 of it goes to Kabir.', cam: fc(0.5, 2.3, 6.6, -0.6, 0.9, -0.3), start: () => { visitor.c.crouch = 0; visitor.c.reach[0] = 0; aVisitor.dest = L(-3.4, 1.5); } },
    ];
    const BOARD_BEATS: Beat[] = [
      { dur: 5.5, text: `6:30 pm. Ananya flies out early tomorrow, so Biscuit is sleeping over with Marcus in ${LY.words.host}.`, cam: fc(-1.2, 1.9, 5.6, -3.2, 0.95, 1.2),
        start: () => { nightTarget = 0.45; aVisitor.dest = L(-3.9, 1.6); },
        update: (t) => { if (t > 1.2) doorTarget = 1; if (t > 1.8 && !aOwner.dest && vOwner.g.position.x < -6.5) { aOwner.dest = L(-5.9, 1.6); aDog.dest = L(-5.3, 2.3); } } },
      { dur: 5.5, img: '/real/meet-greet.jpg', text: 'The same hello as at the meet-and-greet. His leash, his food and his blanket change hands.', cam: fc(-1.9, 1.25, 3.9, -3.6, 0.7, 1.7),
        start: () => { hearts(wpos(dog.g, 0.9), 5, 0.22); dogSitFlat = true; },
        update: (t) => {
          visitor.c.crouch = t > 0.3 && t < 2.8 ? 1 : 0; visitor.c.reach[0] = t > 0.6 && t < 2.8 ? 1 : 0;
          if (t > 2.6) { flatHolder = visitor; visitor.c.leash = 0; vOwner.c.leash = -1; }
          vOwner.c.wave[1] = t > 3 && t < 4.6 ? 1 : 0; if (t > 4.2 && !aOwner.dest && vOwner.g.position.x > -7) aOwner.dest = L(-8.8, 1.6);
        } },
      { dur: 6, text: 'Dinner at eight, one scoop, exactly as her note says.', cam: fc(1.6, 1.5, 5.6, 3.1, 0.4, 2.3),
        start: () => { doorTarget = 0; dogSitFlat = false; leashInFlat = false; visitor.c.leash = -1; vOwner.g.visible = pLabel.visible = false; nightTarget = 0.7; aVisitor.dest = L(2.75, 2.45); aDog.dest = L(2.5, 1.4); },
        update: (t) => { const dn = t > 2 && t < 4; visitor.c.crouch = dn ? 1 : 0; visitor.c.reach[0] = dn ? 1 : 0; if (t > 2.5) fillTarget = 1; if (t > 3.6 && t < 3.7) aDog.dest = L(3.3, 2.05); dogEatFlat = t > 4.4 && !aDog.dest; } },
      { dur: 5.5, img: '/real/boarding.jpg', text: 'Lights down. Biscuit settles on his own blanket, with Marcus a few steps away.', cam: fc(-1.4, 1.6, 4.4, -2.9, 0.4, -1.6),
        start: () => { dogEatFlat = false; visitor.c.crouch = 0; visitor.c.reach[0] = 0; nightTarget = 1; doorTarget = 0; leashInFlat = false; visitor.c.leash = -1; vOwner.g.visible = pLabel.visible = false; fillTarget = 1; /* so it is also right when the glimpse skips dinner */ aDog.dest = L(-3.6, -1.2); aVisitor.dest = L(-1.4, -2.2); },
        update: (t) => { if (!aDog.dest && t > 1.5) dogSitFlat = true; } },
      { dur: 5, text: '7 am. A morning photo goes to Ananya before her flight boards.', cam: fc(-0.8, 1.3, 3.6, -3.1, 0.6, -1.0),
        start: () => { nightTarget = 0; aVisitor.dest = L(-2.6, -0.4); },
        update: (t) => { visitor.c.phone = t > 1.6 ? 1 : 0; if (t > 2.6 && t < 2.66) hearts(wpos(dog.g, 0.9), 2, 0.2); } },
      { dur: 5, text: 'Picked up, fed and happy. One night: ₹549, and ₹384.30 of it goes to Marcus.', cam: fc(1.5, 2.2, 6.4, -2.5, 0.9, 0.8),
        start: () => { nightTarget = 0; visitor.c.phone = 0; dogSitFlat = false; vOwner.g.visible = pLabel.visible = true; vOwner.g.position.set(-8.6, 0, 1.6); aOwner.dest = L(-5.8, 1.6); doorTarget = 1; aVisitor.dest = L(-3.8, 1.4); aDog.dest = L(-4.9, 2.1); },
        update: (t) => { if (t > 2.2 && Math.random() < 0.05) hearts(wpos(dog.g, 0.9), 1, 0.2); } },
    ];
    // the tour shows a shorter cut of each story: the beats that explain the service at a glance
    const cut = (all: Beat[], keep: number[]) => keep.map((i) => all[i]);
    const storyBeats = (id: StoryId, glimpse: boolean) => id === 'dog' ? (glimpse ? cut(DOG_BEATS, [1, 2, 4]) : DOG_BEATS) : id === 'cat' ? (glimpse ? cut(CAT_BEATS, [1, 2, 4, 5]) : CAT_BEATS) : glimpse ? cut(BOARD_BEATS, [0, 1, 3, 5]) : BOARD_BEATS;
    function toWorld(fromFlat = true) {
      dissolve();
      flat.visible = false; scene.add(dog.g); leashInFlat = false; dogMode = 'follow';
      let at: number[] = LY.story.at;
      if (!fromFlat) { // exploring on foot begins on the track itself, a few steps before the start arch, facing the way round
        const ts = (((tStart - 3.5 / loopLen) % 1) + 1) % 1, sp = loop.getPointAt(ts), st = loop.getTangentAt(ts), hr = Math.atan2(st.x, st.z);
        at = [sp.x, sp.z, hr, hr + Math.PI];
      }
      const r = at[2];
      walker.g.position.set(at[0], 0, at[1]); walker.g.rotation.y = r;
      dog.g.position.set(at[0] - Math.cos(r) * 0.8 + Math.sin(r) * 0.8, 0, at[1] + Math.sin(r) * 0.8 + Math.cos(r) * 0.8); dog.g.rotation.set(0, r, 0); yaw = at[3]; pitch = WALK_PITCH;
      followCam(true);
    }
    function resetWalk() {
      minutes = 0; meters = 0; photoCount = 0; doneSet.clear(); setDone([]); rings.forEach((r) => (r.visible = true)); setPhotos([]);
      ballFlight = null; ballHeld = false; ball.position.set(FX - 2, 0.075, FZ - 1); queue = []; marker.visible = false; autoWalk = false;
      treatN = 0; pts = 0; lapAcc = 0; lapLast = -1; lapDone = false; setScore({ c: LY.id, n: 0 }); setBones({ got: 0, of: BONES });
      treats.forEach((t) => { t.got = 0; t.done = false; t.g.visible = true; t.b.scale.setScalar(t.gold ? 3 : 2); (t.sp.material as THREE.SpriteMaterial).opacity = 1; t.beam.visible = true; });
    }
    function nextBeat() {
      bi++; bt = 0;
      if (bi >= beats.length) {
        if (storyId === 'dog') { autoWalk = false; m = 'walk'; setMode('walk'); setCaption(null); say(dirOn ? `Now the walk: four stops along the ${isPath ? 'path' : 'track'}.` : 'Your turn. Collect the bones and walk Biscuit to the four stops.'); }
        else {
          dissolve(); nightTarget = 0; const dm: Mode = storyId === 'cat' ? 'catdone' : 'boarddone'; m = dm; setMode(dm); setCaption(null); flat.visible = false; camSnap = true;
          if (dog.g.parent !== scene) { scene.add(dog.g); dog.g.position.set(LY.start[0] - 0.5, 0, LY.start[1] - 0.8); }
        }
        beats = []; return;
      }
      setCaption({ text: beats[bi].text, i: bi, n: beats.length, img: beats[bi].img }); beats[bi].start?.();
    }
    const setM = (x: Mode) => { m = x; setMode(x); };

    const tmp2 = V();

    api.current = {
      dirStart: () => {}, dirPause: () => {},
      setNight: (n) => { nightTarget = n ? 1 : 0; },
      sync: (x) => { m = x; },
      play: (id, glimpse = false) => {
        dissolve(); resetWalk(); nightTarget = 0; storyId = id; setStory(id); setupFlat(id); beats = storyBeats(id, glimpse);
        if (glimpse && id === 'dog') { dog.g.position.set(-1.5, 0, 1.2); dog.g.rotation.set(0, -1.5, 0); dogSitFlat = true; } // the short cut opens on the doorbell, with Biscuit already waiting
        bi = -1; camSnap = true; setM('story'); nextBeat();
      },
      freeze: () => { // hold the last frame of this community on screen while the next one is built
        const dc = dissolveRef.current, g2 = dc?.getContext('2d'); if (!dc || !g2) return;
        renderer.render(scene, camera); dc.width = canvas.width; dc.height = canvas.height; g2.drawImage(canvas, 0, 0); dc.style.transition = 'none'; dc.style.opacity = '1';
      },
      skip: () => { if (storyId === 'dog') { if (flat.visible) toWorld(); bi = beats.length; nextBeat(); } else { bi = beats.length; nextBeat(); } },
      explore: () => { resetWalk(); storyId = 'dog'; setStory('dog'); toWorld(false); setCaption(null); setM('walk'); wrap.focus({ preventScroll: true }); say(coarse ? `Tap the ${isPath ? 'path' : 'track'} ahead to walk. Every bone is ${PTS.bone} ProxyPaw points.` : `Hold the up arrow to walk the ${isPath ? 'path' : 'track'}. Every bone is ${PTS.bone} ProxyPaw points.`); },
      menu: () => { dissolve(); nightTarget = 0; flat.visible = false; if (dog.g.parent !== scene) scene.add(dog.g); beats = []; setCaption(null); camSnap = true; setM('menu'); },
      goTo: (id) => { const s = STOPS.find((x) => x.id === id)!; goToPoint(V(s.pos[0], 0, s.pos[1])); },
      act: (id) => {
        const s = STOPS.find((x) => x.id === id)!;
        if (id === 'cat') { hearts(cat.g.position.clone().add(V(0, 0.5, 0)), 8); dogMode = 'sit'; dogTimer = 2.6; finish(s.done, id); }
        if (id === 'hello') {
          wave = 2.4; if (bubble) scene.remove(bubble);
          bubble = label('Morning! Biscuit looks so happy.', { scale: 0.6 }); (bubble.material as THREE.SpriteMaterial).sizeAttenuation = false; bubble.scale.multiplyScalar(0.046 / 0.96); /* a steady size on screen, so a close camera never crops it */ bubble.position.set(priya.g.position.x, 2.75, priya.g.position.z); scene.add(bubble); bubbleT = 4;
          finish(s.done, id);
        }
        if (id === 'water') { dogMode = 'drink'; dogTimer = 0; say('Biscuit is drinking...'); }
        if (id === 'fetch' && !ballFlight && dogMode === 'follow') {
          const from = walker.arms[1].end.getWorldPosition(V());
          const fwd = V(FX, 0, FZ).sub(walker.g.position).setY(0).normalize();
          const to = walker.g.position.clone().add(fwd.multiplyScalar(8));
          to.x = THREE.MathUtils.clamp(to.x, LY.fetch[0], LY.fetch[1]); to.z = THREE.MathUtils.clamp(to.z, LY.fetch[2], LY.fetch[3]); to.y = 0.075;
          ballFlight = { from, to, t: 0 }; ballHeld = false; dogMode = 'go'; say('Go get it, Biscuit!');
        }
      },
      photo: () => {
        renderer.render(scene, camera);
        const c = document.createElement('canvas'); c.width = 240; c.height = 160;
        const g = c.getContext('2d')!; const src = renderer.domElement;
        const ar = 240 / 160, sw = Math.min(src.width, src.height * ar), sh = sw / ar;
        g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, 240, 160);
        photoCount++; hearts(dog.g.position.clone().add(V(0, 0.95, 0)), 3); if (photoCount <= 3) award(PTS.photo, dog.g.position.clone().add(V(0, 1.5, 0)));
        return c.toDataURL('image/jpeg', 0.8);
      },
    };

    /* ---- the director: plays the stories and the walk by itself, like a video ---- */
    const reducedMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let dirOn = false, dirPaused = false, dirRun = 0, dirT = 0, half = false, touched = tourRef.current.touched, started = false, rip = 0, cutN = 0, simT = 0;
    let dirWaits: { t: number; res: () => void; cond?: () => boolean }[] = [];
    const cursor = { x: 0, y: 0 };
    const sleep = (sec: number) => new Promise<void>((res) => dirWaits.push({ t: dirT + sec, res }));
    const until = (cond: () => boolean, max: number) => new Promise<void>((res) => dirWaits.push({ t: dirT + max, res, cond }));
    /** where a control is right now, relative to the world (never hard-coded, so it works at any width) */
    const point = (sel: string) => {
      const el = wrap.querySelector<HTMLElement>(`[data-pp="${sel}"]`); if (!el || !el.getClientRects().length) return null;
      const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
      return { x: r.left - w.left + r.width / 2, y: r.top - w.top + r.height / 2 };
    };
    const showCursor = (press = false) => setDemo({ x: cursor.x, y: cursor.y, on: true, press, rip, cut: cutN });
    /** the demo cursor glides to a control and presses it; then the control's own handler is called directly (no DOM event) */
    async function tap(sel: string, fn: () => void, thenHide = false) {
      await until(() => !!point(sel), 2.5);
      const p = point(sel);
      if (p) { cursor.x = p.x; cursor.y = p.y; showCursor(); await sleep(0.58); rip++; showCursor(true); await sleep(0.15); showCursor(); }
      fn(); await sleep(0.2);
      if (thenHide) { await sleep(0.5); setDemo((d) => ({ ...d, on: false })); } // the cursor steps out while a story plays
    }
    /** Cross-dissolve: freeze the frame we are leaving on a canvas above the 3D view and fade it away over the new view. */
    function dissolve() {
      const dc = dissolveRef.current, g2 = dc?.getContext('2d');
      if (!dc || !g2 || reducedMotion) return;
      renderer.render(scene, camera); // the drawing buffer now holds exactly the frame on screen
      dc.width = canvas.width; dc.height = canvas.height;
      g2.drawImage(canvas, 0, 0);
      dc.style.transition = 'none'; dc.style.opacity = '1';
      void dc.offsetWidth; // commit the opaque state before fading
      dc.style.transition = 'opacity .7s ease'; dc.style.opacity = '0';
    }
    /** a film cut: jump to a few metres before a stop, so each leg of the walk is short */
    function cutTo(target: THREE.Vector3, back = 7.5) {
      const route = routeTo(walker.g.position, target);
      let total = 0; for (let i = 1; i < route.length; i++) total += route[i].distanceTo(route[i - 1]);
      if (total < back + 6) return;
      dissolve();
      meters += total - back; minutes += (total - back) / SPEED / 3; // the ground skipped by the cut still counts as walked
      let rem = back; const p = route[route.length - 1].clone(), d = V(0, 0, 1);
      for (let i = route.length - 1; i > 0; i--) {
        const a = route[i - 1], b = route[i], len = a.distanceTo(b); d.subVectors(b, a).normalize();
        if (len >= rem) { p.copy(b).lerp(a, rem / len); break; }
        rem -= len; p.copy(a);
      }
      const r = Math.atan2(d.x, d.z);
      walker.g.position.set(p.x, 0, p.z); walker.g.rotation.y = r;
      dog.g.position.set(p.x - Math.cos(r) * 0.8 + Math.sin(r) * 0.8, 0, p.z + Math.sin(r) * 0.8 + Math.cos(r) * 0.8); dog.g.rotation.y = r; dogMode = 'follow';
      yaw = r + Math.PI; pitch = WALK_PITCH; followCam(true); cutN++; showCursor();
    }
    /** The tour: pick a community, pick a service, watch a short cut of it, move on. It resumes after each community is rebuilt. */
    async function direct(run: number) {
      const ok = () => run === dirRun && dirOn;
      const tour = tourRef.current;
      if (!tour.x && !tour.y) { const w0 = wrap.getBoundingClientRect(); tour.x = w0.width * 0.5; tour.y = w0.height * 0.35; }
      cursor.x = tour.x; cursor.y = tour.y;
      let first = !tour.swapped; tour.swapped = false;
      while (ok()) {
        const step = TOUR[tour.step % TOUR.length];
        if ((m as Mode) !== 'menu') api.current!.menu();
        setNight(false);
        await sleep(0.4); showCursor(); await sleep(first ? 1.1 : 0.6); first = false; if (!ok()) return;
        // 1. the community: pressing its pill rebuilds the scene, and the tour picks up again in the new one
        if (step.c !== LY.id) {
          if (!point(`com-${step.c}`)) { await tap('area-all', () => setArea('All')); await sleep(0.35); if (!ok()) return; } // filtered out by the area chips
          { // on a phone the communities are one scrolling row: bring the pill into view first
            const el = wrap.querySelector<HTMLElement>(`[data-pp="com-${step.c}"]`), row = el?.parentElement;
            if (el && row && row.scrollWidth > row.clientWidth + 2) { row.scrollTo({ left: row.scrollLeft + el.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' }); await sleep(0.55); if (!ok()) return; }
          }
          await tap(`com-${step.c}`, () => { tour.swapped = true; tour.x = cursor.x; tour.y = cursor.y; api.current!.freeze(); setCommunity(step.c); });
          return;
        }
        // 2. the service, then Watch
        await tap(`svc-${step.s}`, () => setService(step.s)); await sleep(0.3); if (!ok()) return;
        await tap('watch', () => api.current!.play(step.s, true), true); if (!ok()) return;
        if (step.s === 'dog') { // the story indoors, then one stop on the track, a photo, and the payment
          await until(() => (m as Mode) === 'walk', 60); if (!ok()) return;
          await sleep(0.6);
          if (!listRef.current) await tap('list', () => setListOpen(true));
          const s0 = STOPS[0];
          await tap(`go-${s0.id}`, () => { cutTo(V(s0.pos[0], 0, s0.pos[1])); api.current!.goTo(s0.id); }); if (!ok()) return;
          await until(() => nearId === s0.id && !queue.length, 9); if (!ok()) return;
          await tap('act', () => api.current!.act(s0.id)); if (!ok()) return;
          await until(() => doneSet.has(s0.id), 8); await sleep(1.2); if (!ok()) return;
          await tap('photo', () => photoRef.current()); await sleep(0.9); if (!ok()) return;
          await tap('end', () => { minutes = Math.max(minutes, 58); setStats({ minutes, km: meters / 1000, photos: photoCount }); setM('ended'); }, true); await sleep(3.4); if (!ok()) return;
        } else {
          await until(() => (m as Mode) === (step.s === 'cat' ? 'catdone' : 'boarddone'), 70); await sleep(3.2); if (!ok()) return;
        }
        // 3. back to the switch, and on to the next community
        tour.step = (tour.step + 1) % TOUR.length;
        await tap('back', () => { api.current!.menu(); setNight(false); }); await sleep(0.7);
      }
    }
    const startDirector = () => { dirWaits = []; dirOn = true; dirPaused = false; started = true; tourRef.current.on = true; dirRun++; setDir('play'); void direct(dirRun); };
    const stopDirector = () => { if (!dirOn) return; dirOn = false; dirPaused = false; tourRef.current.on = false; dirRun++; dirWaits = []; setDir('off'); setDemo((d) => ({ ...d, on: false })); };
    api.current.dirStart = startDirector;
    api.current.dirPause = (p) => { if (!dirOn) return; dirPaused = p; setDir(p ? 'pause' : 'play'); };
    // taking over: a real press, tap, drag or key inside the world stops the director at once
    let touchDown: number | null = null;
    const realDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.('[data-pp-dir]')) return;
      if (e.pointerType === 'touch') { touchDown = e.pointerId; return; } // a touch that turns into a page scroll is cancelled by the browser, and is not a take-over
      touched = tourRef.current.touched = true; stopDirector();
    };
    const realUp = (e: PointerEvent) => { if (touchDown === e.pointerId) { touchDown = null; touched = tourRef.current.touched = true; stopDirector(); } };
    const realCancel = (e: PointerEvent) => { if (touchDown === e.pointerId) touchDown = null; };
    wrap.addEventListener('pointerdown', realDown, true); wrap.addEventListener('pointerup', realUp, true); wrap.addEventListener('pointercancel', realCancel, true);

    // test hook, only with #ppdebug in the address: lets a test place the camera and the walker
    const dbg: { cam: number[] | null; rel: number[] | null; [k: string]: unknown } | null = location.hash.includes('ppdebug') ? { cam: null, rel: null, speed: 1, tp: (x: number, z: number, r = 0) => { walker.g.position.set(x, 0, z); walker.g.rotation.y = r; dog.g.position.set(x - Math.cos(r) * 0.8 + Math.sin(r) * 0.8, 0, z + Math.sin(r) * 0.8 + Math.cos(r) * 0.8); dog.g.rotation.y = r; yaw = r + Math.PI; followCam(true); }, look: (y: number, p: number) => { yaw = y; pitch = p; }, night: (n: number) => { nightTarget = n; }, flat: F, keys, state: () => ({ com: LY.id, tour: tourRef.current.step, pos: [Math.round(walker.g.position.x * 10) / 10, Math.round(walker.g.position.z * 10) / 10], geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures, m, bi, dirOn, dirT: Math.round(dirT * 10) / 10, near: nearId, done: Array.from(doneSet), treats: treatN, bones: BONES, pts, lap: Math.round(lapAcc * 100) / 100, yaw: Math.round(yaw * 100) / 100, len: Math.round(loopLen), d: Math.round(onLoop(walker.g.position.x, walker.g.position.z, hk).d * 10) / 10, story: storyId }) } : null;
    if (dbg) (window as unknown as { __ppw: unknown }).__ppw = dbg;

    /* ---- input ---- */
    const onKey = (e: KeyboardEvent) => {
      if (dirOn) { if (e.type !== 'keydown' || !wrap.contains(document.activeElement)) return; touched = tourRef.current.touched = true; stopDirector(); }
      if (m !== 'walk') return;
      const tag = (e.target as HTMLElement)?.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const k = e.key.toLowerCase();
      const map: Record<string, string> = { arrowup: 'w', arrowdown: 's', arrowleft: 'a', arrowright: 'd', w: 'w', a: 'a', s: 's', d: 'd' };
      const r = wrap.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 80) { keys.clear(); return; }
      if (e.type === 'keydown' && (k === 'e' || k === 'enter') && nearId) { api.current!.act(nearId); e.preventDefault(); return; }
      if (!map[k]) return;
      e.preventDefault();
      if (e.type === 'keydown') { keys.add(map[k]); queue = []; marker.visible = false; } else keys.delete(map[k]);
    };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    const blur = () => keys.clear(); window.addEventListener('blur', blur);

    let drag: { x: number; y: number; moved: number } | null = null;
    const onDown = (e: PointerEvent) => { if (m !== 'walk') return; drag = { x: e.clientX, y: e.clientY, moved: 0 }; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.moved += Math.abs(dx) + Math.abs(dy); drag.x = e.clientX; drag.y = e.clientY;
      yaw -= dx * 0.006; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, -0.5, 1.2);
    };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(V(0, 1, 0), 0);
    const onUp = (e: PointerEvent) => {
      if (!drag) return; const tap = drag.moved < 8; drag = null; if (!tap || m !== 'walk') return;
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera); const hit = V();
      if (ray.ray.intersectPlane(plane, hit) && hit.distanceTo(walker.g.position) < 120) { collide(hit); goToPoint(hit); }
    };
    const onCancel = () => { drag = null; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onCancel);

    let viewShift = small ? 0.16 : 0.14, sideShift = 0, panelFrac = small ? 0.36 : 0.29; // how much of the view the menu panel covers
    let fit = 1; const fitV = V(); // extra stand-back so tall towers keep their roofs (and name tags) inside the frame
    // Tidy name tags: where two would overlap on screen, the one added later steps aside. It is worked out for the
    // resting view (no drift) and only when the framing changes, so tags never blink while the view sways.
    const probe = new THREE.PerspectiveCamera(); let tagKey = '', akpNow = 1;
    const tidyTags = () => {
      const W = wrap.clientWidth, H = wrap.clientHeight, key = `${akpNow.toFixed(2)}|${viewShift.toFixed(2)}|${W}x${H}`;
      if (key === tagKey) return; tagKey = key;
      probe.copy(camera); probe.position.set(AV[0] + Math.cos(A_BEAR) * AV[3] * akpNow, AV[2] * akpNow, AV[1] + Math.sin(A_BEAR) * AV[3] * akpNow);
      probe.lookAt(AV[0], AV[4] ?? 0, AV[1]); probe.updateMatrixWorld();
      const k = (probe.projectionMatrix.elements[5] * H) / 4, placed: number[][] = [];
      for (const c of air.children) {
        fitV.copy(c.position).project(probe);
        const x = (fitV.x * 0.5 + 0.5) * W, y = (0.5 - fitV.y * 0.5) * H, hw = c.scale.x * k + 6, hh = c.scale.y * k + 3;
        const clash = x - hw < 2 || x + hw > W - 2 /* would be cut by the frame edge */ || placed.some((q) => Math.abs(q[0] - x) < q[2] + hw && Math.abs(q[1] - y) < q[3] + hh);
        c.visible = !clash; if (!clash) placed.push([x, y, hw, hh]);
      }
    };
    const applyShift = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (Math.abs(viewShift) < 0.002 && sideShift < 0.002) camera.clearViewOffset(); else camera.setViewOffset(w, h, sideShift * w, viewShift * h, w, h); };
    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = (w < h ? 64 : 52) + (m === 'walk' || m === 'ended' ? 6 : 0); camera.updateProjectionMatrix(); applyShift(); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; half = e.intersectionRatio >= 0.5; }, { threshold: [0.01, 0.5] }); io.observe(wrap);
    const autoplay = !reducedMotion && (!dbg || location.hash.includes('ppauto'));

    /* ---- the minimap: the walk path, the buildings, the stops, the bones still to collect, and you ---- */
    // It keeps you in the middle and shows about 110 m across, north up. Everything that never moves is painted once.
    const MAP_PX = small ? 208 : 328, mu = MAP_PX / 328, mk = MAP_PX / 110; // canvas pixels per metre
    let mx0 = LY.bounds[0], mx1 = LY.bounds[1], mz0 = LY.bounds[2], mz1 = LY.bounds[3];
    const grow = (x: number, z: number) => { mx0 = Math.min(mx0, x); mx1 = Math.max(mx1, x); mz0 = Math.min(mz0, z); mz1 = Math.max(mz1, z); };
    loopPts.forEach((q) => grow(q.x, q.z)); STOPS.forEach((st) => grow(st.pos[0], st.pos[1])); treats.forEach((t) => grow(t.g.position.x, t.g.position.z));
    mx0 -= 12; mz0 -= 12; mx1 += 12; mz1 += 12;
    const mapStatic = document.createElement('canvas'); mapStatic.width = Math.ceil((mx1 - mx0) * mk); mapStatic.height = Math.ceil((mz1 - mz0) * mk);
    const MX = (x: number) => (x - mx0) * mk, MZ = (z: number) => (z - mz0) * mk;
    {
      const g = mapStatic.getContext('2d')!; g.lineCap = g.lineJoin = 'round';
      const stroke = (c: THREE.Curve<THREE.Vector3>, w: number, col: string) => { const pts = c.getSpacedPoints(Math.max(40, Math.round(c.getLength() / 2))); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((q, i) => (i ? g.lineTo(MX(q.x), MZ(q.z)) : g.moveTo(MX(q.x), MZ(q.z)))); g.stroke(); };
      stroke(ring, 7 * mk, '#cfd4cc'); linkCurves.forEach((c, i) => stroke(c, linkW[i] * mk, i === 0 || LY.links[i].road ? '#cfd4cc' : '#dfe2da'));
      blockers.forEach((b) => { g.fillStyle = b.h > 20 ? '#d2b99f' : '#e2d9c9'; g.save(); g.translate(MX(b.x), MZ(b.z)); g.rotate(-Math.atan2(b.s, b.c)); g.fillRect(-b.hw * mk, -b.hd * mk, b.hw * 2 * mk, b.hd * 2 * mk); g.restore(); });
      if (hasPool) { g.fillStyle = '#6fc3e0'; g.save(); g.translate(MX(POOL.x), MZ(POOL.z)); g.rotate(-POOL.rot); g.fillRect((-PW / 2) * mk, (-PD / 2) * mk, PW * mk, PD * mk); g.restore(); }
      // the walk path: one bold band with a dashed centre line, so it is the first thing the eye finds
      stroke(loop, (LOOP_W + 1.6) * mk, '#ffffff'); stroke(loop, LOOP_W * mk, isPath ? '#727972' : '#2a2c2e');
      g.setLineDash([5 * mu, 7 * mu]); stroke(loop, 1.6 * mu, 'rgba(255,255,255,.9)'); g.setLineDash([]);
      { const q = loop.getPointAt(tStart), tn = loop.getTangentAt(tStart); g.strokeStyle = '#ffffff'; g.lineWidth = 3 * mu; g.lineCap = 'butt'; g.beginPath(); g.moveTo(MX(q.x - tn.z * LOOP_W * 0.5), MZ(q.z + tn.x * LOOP_W * 0.5)); g.lineTo(MX(q.x + tn.z * LOOP_W * 0.5), MZ(q.z - tn.x * LOOP_W * 0.5)); g.stroke(); }
    }
    let mapTick = 0;
    const drawMap = () => {
      const mc = mapRef.current; if (!mc) return;
      if (mc.width !== MAP_PX) mc.width = mc.height = MAP_PX;
      const g = mc.getContext('2d')!, H = MAP_PX / 2, wx = walker.g.position.x, wz = walker.g.position.z, ox = H - MX(wx), oz = H - MZ(wz);
      g.clearRect(0, 0, MAP_PX, MAP_PX); g.drawImage(mapStatic, Math.round(ox), Math.round(oz));
      for (const t of treats) {
        if (t.done || t.got > 0) continue; const x = MX(t.g.position.x) + ox, y = MZ(t.g.position.z) + oz; if (x < -10 || y < -10 || x > MAP_PX + 10 || y > MAP_PX + 10) continue;
        g.fillStyle = t.gold ? '#f0a020' : '#ffb23f'; g.beginPath(); g.arc(x, y, (t.gold ? 8 : 5) * mu, 0, 6.3); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = (t.gold ? 2.8 : 1.8) * mu; g.stroke();
      }
      // stops still to do: on the map where they are, or pinned to the edge in their direction when they are further away
      STOPS.forEach((st, i) => {
        if (doneSet.has(st.id)) return;
        let x = MX(st.pos[0]) + ox, y = MZ(st.pos[1]) + oz; const lim = H - 15 * mu, dx = x - H, dy = y - H, far = Math.max(Math.abs(dx), Math.abs(dy));
        if (far > lim) { x = H + (dx / far) * lim; y = H + (dy / far) * lim; }
        g.fillStyle = far > lim ? '#fdebdd' : '#ffffff'; g.beginPath(); g.arc(x, y, 11.5 * mu, 0, 6.3); g.fill(); g.strokeStyle = '#e0662f'; g.lineWidth = 3 * mu; g.stroke();
        g.fillStyle = '#c24e1d'; g.font = `800 ${Math.round(14 * mu)}px Plus Jakarta Sans, Inter, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), x, y + mu);
      });
      // you: a green dot in the middle, with a soft wedge for the way the view is looking
      const ang = Math.atan2(-Math.cos(yaw), -Math.sin(yaw));
      g.fillStyle = 'rgba(46,125,79,.28)'; g.beginPath(); g.moveTo(H, H); g.arc(H, H, 46 * mu, ang - 0.5, ang + 0.5); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(H, H, 10.5 * mu, 0, 6.3); g.fill(); g.fillStyle = '#2e7d4f'; g.beginPath(); g.arc(H, H, 7.5 * mu, 0, 6.3); g.fill();
    };

    /* ---- loop ---- */
    const clock = new THREE.Clock(); let raf = 0;
    const tmp = V(), fwd = V(), right = V();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      let dt = Math.min(clock.getDelta(), 0.05) * (dbg ? (dbg.speed as number) : 1);
      if (!visible || document.hidden) return; // off screen or in a hidden tab: the picture and the director both wait
      if (!started && half && (tourRef.current.on || (autoplay && !touched))) startDirector(); // a running tour carries on in the new community
      if (dirOn && dirPaused) dt = 0;
      else if (dirOn) { dirT += dt; for (let i = dirWaits.length - 1; i >= 0; i--) { const w = dirWaits[i]; if (dirT >= w.t || w.cond?.()) { dirWaits.splice(i, 1); w.res(); } } }
      const time = (simT += dt);
      const inFlat = m === 'story' && flat.visible;
      const walking = m === 'walk' || (m === 'story' && !flat.visible);

      // story timeline
      if (m === 'story' && bi >= 0 && bi < beats.length) { bt += dt; beats[bi].update?.(bt, dt); if (bt >= (!dirOn ? beats[bi].dur : storyId === 'dog' && bi === beats.length - 1 ? 5.5 : beats[bi].dur * 0.86)) nextBeat(); } // the director keeps a slightly brisker pace
      if (inFlat) {
        const dv = stepActor(aVisitor, dt); visitor.phase += dv * AC.stride(0); AC.posePerson(visitor, dt, time, dv > 0);
        if (storyId !== 'cat') { const dd = stepActor(aDog, dt); dog.phase += dd * AC.DOG_STRIDE * 1.5; AC.poseDog(dog, dt, time, dd > 0, { sit: dogSitFlat && !dogEatFlat, drink: dogEatFlat, walk: true, wag: 1.3 }); }
        if (storyId === 'dog') AC.posePerson(parent, dt, time, false);
        else if (storyId === 'cat') { const dc = stepActor(aCat, dt); homeCat.phase += dc * AC.CAT_STRIDE; AC.poseCat(homeCat, dt, time, dc > 0, true); }
        else { const dov = stepActor(aOwner, dt); vOwner.phase += dov * AC.stride(0); AC.posePerson(vOwner, dt, time, dov > 0); pLabel.position.set(vOwner.g.position.x, 1.72 * vOwner.scale + 0.2, vOwner.g.position.z); }
        doorOpen += (doorTarget - doorOpen) * Math.min(1, dt * 4); door.rotation.y = doorOpen * 1.45;
        fill += (fillTarget - fill) * Math.min(1, dt * 2); food.scale.setScalar(Math.max(0.01, fill)); drink.scale.setScalar(Math.max(0.01, fill));
        vLabel.position.set(visitor.g.position.x, 1.72 * visitor.scale + 0.2 - visitor.k.crouch * 0.3, visitor.g.position.z);
        const c = beats[bi]?.cam;
        if (c) { // on a tall phone screen the camera steps back, so both people and the pet stay in frame
          const k = camera.aspect < 1 ? 1.45 : 1;
          camPos.lerp(tmp.set(c[3] + (c[0] - c[3]) * k, Math.min(F.y + 2.95, c[4] + (c[1] - c[4]) * k), Math.min(F.z + 9.4, c[5] + (c[2] - c[5]) * k)), camSnap ? 1 : 0.06);
          camLook.lerp(tmp.set(c[3], c[4], c[5]), camSnap ? 1 : 0.08); camSnap = false;
        }
      }

      // movement in the community
      let moving = false;
      if (walking) {
        fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(-fwd.z, 0, fwd.x); tmp.set(0, 0, 0);
        if (m === 'walk') { if (keys.has('w')) tmp.add(fwd); if (keys.has('s')) tmp.sub(fwd); if (keys.has('d')) tmp.add(right); if (keys.has('a')) tmp.sub(right); }
        const byKeys = tmp.lengthSq() > 0;
        let reach = 1e9; // never step past the point we are walking to, however slow the frame was
        if (!byKeys && queue.length) {
          tmp.copy(queue[0]).sub(walker.g.position).setY(0); reach = tmp.length();
          if (reach < (queue.length > 1 ? 1.2 : 0.35)) { queue.shift(); if (!queue.length) marker.visible = false; tmp.set(0, 0, 0); }
        }
        if (tmp.lengthSq() > 0 && dogMode !== 'drink') {
          tmp.normalize(); const before = walker.g.position.clone();
          if (byKeys) onLoop(before.x, before.z, trk);
          walker.g.position.addScaledVector(tmp, Math.min(SPEED * dt, reach)); collide(walker.g.position);
          if (byKeys) hedgeStop(walker.g.position, trk.off);
          const moved = walker.g.position.distanceTo(before); meters += moved; walker.phase += moved * AC.stride(PACE); moving = moved > 0.001;
          let d = Math.atan2(tmp.x, tmp.z) - walker.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); walker.g.rotation.y += d * Math.min(1, dt * 10);
          if (autoWalk || (queue.length && !drag)) { let yd = walker.g.rotation.y + Math.PI - yaw; yd = Math.atan2(Math.sin(yd), Math.cos(yd)); yaw += yd * Math.min(1, dt * 1.2); }
          else if (byKeys && !drag && !keys.has('s')) {
            // The view settles behind the way you are heading, so left and right steer.
            let yd = Math.atan2(tmp.x, tmp.z) + Math.PI - yaw; yd = Math.atan2(Math.sin(yd), Math.cos(yd)); yaw += yd * Math.min(1, dt * 0.9);
            // On the track it also leans into the bends: holding the up arrow walks you the whole way round.
            if (keys.has('w') && trk.d < 2.7) {
              const along2 = fwd.x * trk.tx + fwd.z * trk.tz;
              if (Math.abs(along2) > 0.4) {
                // aim along the track a step ahead (so a bend is met, not chased), and ease back in from the outer edge;
                // inside the three lanes it never pulls sideways, so you choose your own lane for the bones
                const sg = Math.sign(along2), j2 = (trk.j + sg + LN) % LN, a = loopPts[(j2 + LN - 1) % LN], b = loopPts[(j2 + 1) % LN];
                let ax = (b.x - a.x) * sg, az = (b.z - a.z) * sg; const al = Math.hypot(ax, az) || 1; ax /= al; az /= al;
                const pull = Math.sign(trk.off) * Math.min(0.6, Math.max(0, Math.abs(trk.off) - 1.3) * 0.7);
                ax -= -trk.tz * pull; az -= trk.tx * pull;
                let td = Math.atan2(ax, az) + Math.PI - yaw; td = Math.atan2(Math.sin(td), Math.cos(td)); yaw += td * Math.min(1, dt * 4);
              }
            }
          }
        }
        if (m === 'walk') { minutes += dt / 3; if (minutes >= 60) setM('ended'); }
        AC.posePerson(walker, dt, time, moving, PACE);

        // dog on the leash
        const dp = dog.g.position; const wrot = walker.g.rotation.y; let dogDest: THREE.Vector3;
        if (dogMode === 'go') dogDest = (ballFlight ? ballFlight.to : ball.position).clone().setY(0);
        else if (dogMode === 'drink') dogDest = V(BX, 0, BZ - 0.52);
        else { dogDest = walker.g.position.clone().add(V(Math.cos(wrot), 0, -Math.sin(wrot)).multiplyScalar(-0.8)).add(V(Math.sin(wrot), 0, Math.cos(wrot)).multiplyScalar(0.8)); if (byKeys || !queue.length) hedgeStop(dogDest, onLoop(dp.x, dp.z, trk).off); }
        tmp.copy(dogDest).sub(dp).setY(0); const dd = tmp.length();
        const dogSpeed = dogMode === 'go' || dogMode === 'back' ? 7.5 : Math.min(6.5, dd * 5);
        let dogMoving = false;
        if (dd > 0.12 && dogMode !== 'sit' && !(dogMode === 'drink' && dd < 0.5)) {
          tmp.normalize(); const st = Math.min(dd, dogSpeed * dt); dp.addScaledVector(tmp, st); dog.phase += st * AC.DOG_STRIDE; dogMoving = st > 0.004;
          let d = Math.atan2(tmp.x, tmp.z) - dog.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); dog.g.rotation.y += d * Math.min(1, dt * 9);
        }
        const drinking = dogMode === 'drink' && dd < 0.6;
        if (drinking) { let d = Math.atan2(BX - dp.x, BZ - dp.z) - dog.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); dog.g.rotation.y += d * Math.min(1, dt * 6); }
        dp.y = 0;
        AC.poseDog(dog, dt, time, dogMoving && !drinking, { sit: dogMode === 'sit' || (!moving && dogMode === 'follow' && dd < 0.2), drink: drinking, wag: dogMode === 'sit' ? 1.4 : 1 });
        if (dogMode === 'drink' && dd < 0.6) { dogTimer += dt; if (dogTimer > (dirOn ? 1.7 : 2.4)) { dogMode = 'follow'; finish(STOPS.find((s) => s.id === 'water')!.done, 'water'); } }
        if (dogMode === 'sit') { dogTimer -= dt; if (dogTimer <= 0) dogMode = 'follow'; }
        if (ballFlight) { ballFlight.t += dt / 0.9; const t = Math.min(1, ballFlight.t); ball.position.lerpVectors(ballFlight.from, ballFlight.to, t); ball.position.y += Math.sin(Math.PI * t) * 3.5; if (t >= 1) ballFlight = null; }
        else if (dogMode === 'go' && dp.distanceTo(ball.position.clone().setY(0)) < 0.6) { ballHeld = true; dogMode = 'back'; }
        if (ballHeld) dog.mouth.getWorldPosition(ball.position);
        if (dogMode === 'back' && dp.distanceTo(walker.g.position) < 1.5) { dogMode = 'follow'; ballHeld = false; ball.position.set(dp.x + 0.4, 0.075, dp.z + 0.4); finish(STOPS.find((s) => s.id === 'fetch')!.done, 'fetch'); hearts(dp.clone().add(V(0, 0.9, 0)), 4); }
        followCam();
      }

      if (m === 'ended') { walker.c.leash = 0; AC.posePerson(walker, dt, time, false, PACE); AC.poseDog(dog, dt, time, false, { sit: true, wag: 1.3 }); }
      // leash: a cord from the walker's hand to the ring on Biscuit's harness
      const leashOn = inFlat ? leashInFlat : walking || m === 'ended';
      leash.visible = leashOn;
      if (leashOn) {
        (inFlat ? flatHolder : walker).arms[0].end.getWorldPosition(lA);
        if (inFlat || dogMode === 'follow' || dogMode === 'sit' || dogMode === 'drink') dog.ring.getWorldPosition(lB);
        else lB.set(lA.x + Math.sin(time * 2.4) * 0.03, lA.y - 0.5, lA.z); // unclipped for fetch: it hangs looped from the hand
        drawLeash(leash, lA, lB);
      }

      // menu / end: slow aerial orbit of the whole community
      if (m === 'menu' || m === 'catdone' || m === 'boarddone') {
        // a bird's-eye of the whole community, low enough that it fills the frame, drifting slowly
        // The menu panel grows when an area lists many communities: the view stands back and sits higher by as much as it covers.
        if (m === 'menu' && (frames + Math.floor(time * 4)) % 2 === 0) { const pn = wrap.querySelector<HTMLElement>('.pp-world-panel'); if (pn && wrap.clientHeight) panelFrac = pn.offsetHeight / wrap.clientHeight; }
        const AKP = AK * THREE.MathUtils.clamp((1 - (small ? 0.36 : 0.29)) / (1 - panelFrac), 0.96, 1.32) * fit; akpNow = AKP;
        const A = AV, a = A_BEAR + Math.sin(time * 0.06) * A_SWAY; tmp.set(A[0] + Math.cos(a) * A[3] * AKP, A[2] * AKP, A[1] + Math.sin(a) * A[3] * AKP);
        if (camSnap) { camPos.copy(tmp); camLook.set(A[0], A[4] ?? 0, A[1]); camSnap = false; } else { camPos.lerp(tmp, 0.04); camLook.lerp(tmp.set(A[0], A[4] ?? 0, A[1]), 0.05); }
      }
      if (m === 'ended') followCam();
      if (dbg?.cam) { camPos.set(dbg.cam[0], dbg.cam[1], dbg.cam[2]); camLook.set(dbg.cam[3], dbg.cam[4], dbg.cam[5]); }
      if (dbg?.rel) { const r = walker.g.rotation.y, c = Math.cos(r), sn = Math.sin(r), o = dbg.rel; camPos.set(walker.g.position.x + o[0] * c + o[2] * sn, o[1], walker.g.position.z - o[0] * sn + o[2] * c); camLook.set(walker.g.position.x + (o[3] ?? 0) * c, o[4] ?? 0.85, walker.g.position.z - (o[3] ?? 0) * sn); }
      // behind the story cards the picture slides up, and behind the payment summary it slides aside, so nothing important is covered
      // (the same after a cat visit or a sleepover: otherwise the summary card sits exactly on top of a slim community such as two towers)
      const sumAir = m === 'catdone' || m === 'boarddone';
      const wantShift = m === 'menu' ? THREE.MathUtils.clamp(panelFrac / 2 - (small ? 0.02 : 0.005), 0.1, 0.24) : (m === 'ended' || sumAir) && small ? -0.33 : 0, wantSide = !small ? (m === 'ended' ? 0.34 : sumAir ? 0.3 : 0) : 0;
      if (Math.abs(wantShift - viewShift) > 0.001 || Math.abs(wantSide - sideShift) > 0.001) { const k = Math.min(1, Math.max(dt, 0.016) * 3); viewShift += (wantShift - viewShift) * k; sideShift += (wantSide - sideShift) * k; applyShift(); }
      camera.position.copy(camPos); camera.lookAt(camLook);
      // Headroom: the name tags sit on the roofs, so if one would touch the top of the frame (or the chip there),
      // stand back a little further. It only ever eases outwards, so the view settles and stays put.
      if (m === 'menu' && fit < 1.5 && air.children.length) {
        camera.updateMatrixWorld(); let top = -1;
        for (const c of air.children) { fitV.copy(c.position).project(camera); if (fitV.z < 1 && fitV.y > top) top = fitV.y; }
        const limit = small ? 0.72 : 0.8;
        if (top > limit) fit = Math.min(1.5, fit + Math.min(0.01, (top - limit) * 0.06));
      }
      if (m === 'menu' && Math.abs(wantShift - viewShift) < 0.004) tidyTags();

      // neighbours and traffic
      const tj = (time * JOG) % 1; const pj = along(loop, tj, 1.3), pj2 = along(loop, (tj + 0.8 / loopLen) % 1, 1.3);
      jogger.g.position.copy(pj); jogger.g.lookAt(pj2.x, 0, pj2.z);
      jogger.phase = time * loopLen * JOG * AC.stride(1); AC.posePerson(jogger, dt, time, true, 1);
      const t2 = 1 - ((time * STROLL + 0.4) % 1); const pr = along(loop, t2, -1.2), pr2 = along(loop, (t2 + 1 - 0.8 / loopLen) % 1, -1.2);
      resident.g.position.copy(pr); resident.g.lookAt(pr2.x, 0, pr2.z);
      resident.phase = time * loopLen * STROLL * AC.stride(0); AC.posePerson(resident, dt, time, true, 0);
      const pd = along(loop, (t2 + 1 - 0.9 / loopLen) % 1, -1.2), fx2 = pr2.x - pr.x, fz2 = pr2.z - pr.z, fl = Math.hypot(fx2, fz2) || 1;
      dog2.g.position.set(pd.x - (fz2 / fl) * 0.7, 0, pd.z + (fx2 / fl) * 0.7); dog2.g.lookAt(dog2.g.position.x + fx2, 0, dog2.g.position.z + fz2);
      dog2.phase = time * loopLen * STROLL * AC.DOG_STRIDE * 1.5; AC.poseDog(dog2, dt, time, true, { walk: true });
      drawLeash(leash2, resident.arms[0].end.getWorldPosition(lA), dog2.ring.getWorldPosition(lB));
      const td = (time * DRIVE) % 1; const pc = along(ring, td, -1.6), pc2 = ring.getTangentAt(td); driver.position.copy(pc); driver.rotation.y = Math.atan2(pc2.x, pc2.z);
      priya.c.wave[1] = wave > 0 ? 1 : 0; if (wave > 0) wave -= dt; AC.posePerson(priya, dt, time, false);
      if (walker.g.position.distanceTo(priya.g.position) < 9) priya.g.rotation.y = Math.atan2(walker.g.position.x - priya.g.position.x, walker.g.position.z - priya.g.position.z);
      AC.posePerson(sitter, dt, time, false); AC.poseCat(cat, dt, time, false, true);
      clouds.forEach((c, i) => { c.position.x += dt * (2 + i * 0.3); if (c.position.x > 420) c.position.x = -420; });
      trees.forEach((t, i) => { if (i < 90) t.rotation.z = Math.sin(time * 0.9 + i) * 0.01; });
      palms.forEach((c, i) => { c.rotation.z = Math.sin(time * 1.1 + i * 2) * 0.04; c.rotation.x = Math.cos(time * 0.8 + i) * 0.03; });
      grassU.uTime.value = time; waterU.uTime.value = time;
      if (walking) grassU.uCenter.value.set(walker.g.position.x, walker.g.position.z);
      flyers.forEach((f) => {
        const sp = f.bird ? 0.25 : 0.7, a2 = time * sp + f.ph;
        f.g.position.set(f.c.x + Math.cos(a2) * f.r, f.c.y + Math.sin(a2 * (f.bird ? 0.7 : 2.3)) * (f.bird ? 2 : 0.35), f.c.z + Math.sin(a2 * (f.bird ? 1 : 1.3)) * f.r);
        f.g.rotation.y = -a2 + (f.bird ? 0 : Math.sin(a2 * 3) * 0.5);
        const flap = Math.sin(time * (f.bird ? 7 : 22) + f.ph) * (f.bird ? 0.5 : 1.1);
        f.wings[0].rotation.y = flap; f.wings[1].rotation.y = -flap;
      });
      rings.forEach((r) => { const s = 1 + Math.sin(time * 3) * 0.08; r.scale.set(s, s, 1); });
      if (marker.visible) marker.rotation.z += dt;
      for (let i = fx.length - 1; i >= 0; i--) { const f = fx[i]; f.t += dt; f.s.position.addScaledVector(f.v, dt); (f.s.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - f.t / 1.6); if (f.t > 1.6) { scene.remove(f.s); fx.splice(i, 1); } }
      if (bubble) { bubbleT -= dt; if (bubbleT <= 0) { scene.remove(bubble); bubble = null; } }

      // light follows the action so shadows stay sharp
      const fromAir = !inFlat && !walking && m !== 'ended';
      setRange(fromAir); air.visible = routeG.visible = fromAir;
      if (fromAir) routeTex.offset.y = -time * 0.16; // the dashes flow the way round
      (patches.material as THREE.MeshBasicMaterial).opacity = fromAir ? 0.45 : 1; // seen from above, strong patches read as blotches
      const wantFov = (camera.aspect < 1 ? 64 : 52) + (walking || m === 'ended' ? 6 : 0); // on foot a wider view takes in more of the towers
      if (camera.fov !== wantFov) { camera.fov = wantFov; camera.updateProjectionMatrix(); }
      const focus = inFlat ? F : walking || m === 'ended' ? walker.g.position : tmp.set(LY.aerial[0], 0, LY.aerial[1]); // the light stays on the community's middle
      sun.target.position.copy(focus); sun.position.copy(focus).add(SUN_OFF);
      nightF += (nightTarget - nightF) * Math.min(1, dt * 2.5);
      skyU.top.value.copy(DAY.top).lerp(NIGHT.top, nightF); skyU.bottom.value.copy(DAY.bottom).lerp(NIGHT.bottom, nightF);
      (scene.fog as THREE.Fog).color.copy(DAY.fog).lerp(NIGHT.fog, nightF);
      sun.intensity = 2.6 * (1 - nightF) + 0.25 * nightF; sun.color.set(nightF > 0.5 ? '#b9c9ff' : '#fff1d6'); hemi.intensity = 0.9 - nightF * 0.6;
      windowMats.forEach((w) => (w.emissiveIntensity = nightF * 1.3)); bulbs.forEach((b) => (b.emissiveIntensity = 0.1 + nightF * 2.6));
      scene.environmentIntensity = 0.35 - nightF * 0.25;
      if (inFlat) { sun.intensity *= 0.28; hemi.intensity *= 0.5; scene.environmentIntensity *= 0.6; }
      renderer.toneMappingExposure = inFlat ? 0.92 : 1.05;
      roomLight.intensity = 11 * (1 - 0.82 * nightF); // lights down for the sleepover

      if (m === 'walk') {
        let n: StopId | null = null;
        for (const s of STOPS) { if (doneSet.has(s.id)) continue; if (Math.hypot(walker.g.position.x - s.pos[0], walker.g.position.z - s.pos[1]) < 4.5) { n = s.id; break; } }
        if (n !== nearId) { nearId = n; setNear(n); }
        if (time - lastHud > 0.25) { lastHud = time; setStats({ minutes, km: meters / 1000, photos: photoCount }); }
        for (const t of treats) {
          if (t.done || t.got > 0) continue;
          const g = t.g.position;
          if (Math.hypot(g.x - dog.g.position.x, g.z - dog.g.position.z) < 1.3 || Math.hypot(g.x - walker.g.position.x, g.z - walker.g.position.z) < 1.4) {
            t.got = 0.001; treatN++; setBones({ got: treatN, of: BONES }); hearts(V(g.x, 0.9, g.z), t.gold ? 5 : 2, 0.24); award(t.v, V(g.x, 1.9, g.z));
            if (treatN === BONES) { award(PTS.allBones); say(`Every bone collected: ${PTS.allBones} bonus points. Biscuit is thrilled.`); }
            else if (t.gold) say(`The golden bone: ${PTS.gold} ProxyPaw points.`);
            else if (treatN === 1) say(`Bone collected: ${PTS.bone} ProxyPaw points. ${BONES - 1} more are waiting.`);
          }
        }
        // a full lap of the track, in either direction, is worth a bonus once
        onLoop(walker.g.position.x, walker.g.position.z, trk);
        if (trk.d < 3.4) { const tn = trk.j / LN; if (lapLast >= 0) { let dT = tn - lapLast; dT -= Math.round(dT); if (Math.abs(dT) < 0.04) lapAcc += dT; } lapLast = tn; } else lapLast = -1;
        if (!lapDone && Math.abs(lapAcc) > 0.96) { lapDone = true; award(PTS.lap, walker.g.position.clone().add(V(0, 2.4, 0))); say(`A full lap of the ${isPath ? 'path' : 'track'}: ${PTS.lap} bonus points.`); }
        if (frames >= 3 && ++mapTick % 3 === 0) drawMap();
      }
      treats.forEach((t, i) => {
        if (t.done) return;
        const base = t.gold ? 3 : 2;
        t.b.rotation.y = time * 1.8 + i; t.g.position.y = t.y + Math.sin(time * 2.2 + i) * 0.08 + t.got * 2.4;
        if (t.got > 0) { t.got += dt; const k = t.got / 0.4; t.b.scale.setScalar(base * (k < 0.5 ? 1 + k * 1.2 : Math.max(0.01, 3.2 * (1 - k)))); (t.sp.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - k); t.beam.visible = false; if (k >= 1) { t.done = true; t.g.visible = false; } }
        else t.sp.scale.setScalar(base * (0.95 + Math.sin(time * 3 + i) * 0.12));
      });
      renderer.render(scene, camera);
      if (frames < 3 && ++frames === 3) { // textures and shaders are in: let the picture fade up over the poster, or over the community we just left
        setReady(true);
        const dc = dissolveRef.current; if (dc && dc.style.opacity === '1') { void dc.offsetWidth; dc.style.transition = 'opacity .8s ease'; dc.style.opacity = '0'; }
      }
    };
    let frames = 0;
    camPos.set(AV[0] + Math.cos(A_BEAR) * AV[3] * AK, AV[2] * AK, AV[1] + Math.sin(A_BEAR) * AV[3] * AK); camLook.set(AV[0], AV[4] ?? 0, AV[1]);
    tick();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); dirOn = false; dirWaits = [];
      wrap.removeEventListener('pointerdown', realDown, true); wrap.removeEventListener('pointerup', realUp, true); wrap.removeEventListener('pointercancel', realCancel, true);
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); window.removeEventListener('blur', blur);
      canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onCancel);
      // Free everything this community put on the GPU. The canvas and renderer live on, and the tour rebuilds a scene every
      // half minute, so anything missed here would pile up for as long as the page stays open.
      const isTex = (v: unknown): v is THREE.Texture => !!v && (v as THREE.Texture).isTexture === true;
      scene.traverse((o) => {
        const me = o as THREE.Mesh; if (me.geometry) me.geometry.dispose();
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
        const mats = Array.isArray(me.material) ? me.material : me.material ? [me.material] : [];
        mats.forEach((mm) => {
          for (const v of Object.values(mm)) if (isTex(v)) v.dispose();
          const un = (mm as THREE.ShaderMaterial).uniforms; if (un) for (const k in un) { const v = un[k]?.value; if (isTex(v)) v.dispose(); }
          mm.dispose();
        });
      });
      paintedTex.forEach((t) => t.dispose()); paintedTex.clear();
      envRT.dispose(); envRoom.dispose(); maskTex.dispose(); sun.shadow.dispose(); pmrem.dispose(); renderer.renderLists.dispose(); api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community]);
  // the renderer itself lives until the section leaves the page
  useEffect(() => () => { rendererRef.current?.dispose(); rendererRef.current = null; }, []);

  useEffect(() => { api.current?.setNight(night); }, [night]);
  useEffect(() => { api.current?.sync(mode); }, [mode]);

  const takePhoto = () => { const url = api.current?.photo(); if (url) { setPhotos((p) => [url, ...p].slice(0, 3)); say('Photo sent to Ananya, Biscuit\'s parent.'); } };
  photoRef.current = takePhoto;
  const nearStop = STOPS.find((s) => s.id === near);
  const mins = Math.floor(stats.minutes);
  const glassBtn: React.CSSProperties = { ...glass, borderRadius: 999, padding: '10px 16px', fontFamily: head, fontWeight: 700, fontSize: 13.5, color: T.ink, cursor: 'pointer', minHeight: 42 };
  const kicker: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: T.leaf, marginBottom: 8 };

  const svc = SERVICES.find((x) => x.id === service)!;
  // ProxyPaw points: the best walk in each community, added up
  const walked = COMMUNITY_IDS.filter((id) => (bank[id] ?? 0) > 0), walkedN = walked.length, bankTotal = walked.reduce((n, id) => n + bank[id], 0);
  /** switch community: the last frame stays on screen while the next scene is built, then dissolves into it */
  const pickCommunity = (id: CommunityId) => { if (id === community) return; api.current?.freeze(); setCommunity(id); };
  // the area filter: only areas that have a modelled community are offered, and choosing one lands you in a community there
  const ids = typeof location !== 'undefined' && location.hash.includes('ppdraft') ? [...COMMUNITY_IDS, ...DRAFTS.map((l) => l.id)] : COMMUNITY_IDS; // drafts are for checking only
  const areas = AREAS.filter((a) => ids.some((id) => LAYOUTS[id].area === a));
  const shown = ids.filter((id) => area === 'All' || LAYOUTS[id].area === area);
  const pickArea = (a: Area | 'All') => { setArea(a); if (a !== 'All' && LAYOUTS[community].area !== a) { const first = ids.find((id) => LAYOUTS[id].area === a); if (first) pickCommunity(first); } };
  const DONE: Record<'ended' | 'catdone' | 'boarddone', { k: string; t: string; item: string; price: number; who: string; src: string }> = {
    ended: { k: 'Walk complete', t: 'The walk is over. Here\'s your payment.', item: '1-hour walk', price: PRICE, who: 'The neighbour', src: '3d-walk' },
    catdone: { k: 'Visit complete', t: 'Lily is fed, clean and happy.', item: '30-minute cat visit', price: 129, who: 'The neighbour', src: '3d-cat-visit' },
    boarddone: { k: 'Sleepover complete', t: 'Biscuit slept over, safe and happy.', item: 'One night of dog boarding', price: 549, who: 'The host', src: '3d-boarding' },
  };
  const fin = mode === 'ended' || mode === 'catdone' || mode === 'boarddone' ? DONE[mode] : null;

  return (
    <div ref={wrapRef} tabIndex={-1} data-fin={fin ? '' : undefined} className="pp-world" style={{ position: 'relative', height: 'clamp(600px, 84vh, 800px)', borderRadius: 'clamp(20px, 3vw, 30px)', overflow: 'hidden', background: '#9fc39a url(/real/world-poster.jpg) center / cover no-repeat', outline: 'none', boxShadow: '0 30px 80px rgba(20,48,31,.18)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', opacity: ready ? 1 : 0, transition: 'opacity .8s ease', touchAction: mode === 'walk' && dir === 'off' ? 'none' : 'pan-y', cursor: mode === 'walk' ? 'grab' : 'default' }} aria-label={`3D model of ${LY.name}, a gated community. Watch a dog walk, a cat visit or an overnight stay, or walk Biscuit the dog through it.`} />

      <canvas ref={dissolveRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 1 }} />
      {!webgl && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: T.leafPale, padding: 24, textAlign: 'center', fontFamily: body, color: T.sub }}>Your browser can't show the 3D community. Try the walk tracker below instead.</div>}

      {/* The switch: community, service, then Watch or Explore */}
      {webgl && mode === 'menu' && (
        <div className="pp-fade-in pp-world-menu" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, display: 'flex', justifyContent: 'center', padding: 'clamp(10px, 1.6vw, 18px)', background: 'linear-gradient(180deg, rgba(20,48,31,0), rgba(20,48,31,.3))', pointerEvents: 'none' }}>
          <div className="pp-world-panel" style={{ ...glass, background: 'rgba(255,255,255,.82)', borderRadius: 24, padding: 'clamp(12px, 1.6vw, 18px)', width: 'min(960px, 100%)', pointerEvents: 'auto', fontFamily: body }}>
            {areas.length > 1 && (
              <div className="pp-world-row">
                <div className="pp-world-k" style={{ ...kicker, marginBottom: 0 }}>Area</div>
                <div role="group" aria-label="Area" className="pp-world-pills">
                  {(['All', ...areas] as (Area | 'All')[]).map((a) => <button key={a} aria-pressed={a === area} data-pp={`area-${slug(a)}`} className="pp-world-chip" onClick={() => pickArea(a)}>{a === 'All' ? 'All areas' : a}</button>)}
                </div>
              </div>
            )}
            <div className="pp-world-row">
              <div className="pp-world-k" style={{ ...kicker, marginBottom: 0 }}>Community</div>
              <div role="group" aria-label="Community" className="pp-world-pills">
                {shown.map((id) => <button key={id} aria-pressed={id === community} data-pp={`com-${id}`} className="pp-world-pill" onClick={() => pickCommunity(id)}>{LAYOUTS[id].name}</button>)}
              </div>
            </div>
            <div className="pp-world-row">
              <div className="pp-world-k" style={{ ...kicker, marginBottom: 0 }}>Service</div>
              <div role="group" aria-label="Service" className="pp-world-pills">
                {SERVICES.map((sv) => <button key={sv.id} aria-pressed={sv.id === service} data-pp={`svc-${sv.id}`} className="pp-world-pill" onClick={() => setService(sv.id)}>{sv.label}</button>)}
              </div>
            </div>
            <div className="pp-world-go" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 230px', minWidth: 0 }}>
                <div style={{ fontFamily: head, fontWeight: 800, fontSize: 15.5, letterSpacing: '-0.01em', color: T.ink }}>{svc.price}<span className="pp-world-blurb" style={{ fontFamily: body, fontWeight: 500, fontSize: 14, letterSpacing: 0, color: T.sub }}> · {LY.blurb}</span></div>
                <div className="pp-world-line" style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.45, marginTop: 3 }}>{LY.loopIsPath ? svc.line.replace('community track', 'community paths') : svc.line}</div>
                <div data-pp="bank" className="pp-world-pts" style={{ fontSize: 13, color: T.sub, lineHeight: 1.45, marginTop: 5 }}>
                  {bankTotal > 0
                    ? <><b style={{ fontFamily: head, fontWeight: 800, color: T.marigoldDark }}>{bankTotal} ProxyPaw points</b> from {walkedN} of {COMMUNITY_IDS.length} communities{bank[community] ? `, ${bank[community]} of them here` : ''}.</>
                    : <>Explore on foot to collect bones along the {LY.loopIsPath ? 'path' : 'track'} and earn <b style={{ fontFamily: head, fontWeight: 800, color: T.ink }}>ProxyPaw points</b>.</>}
                </div>
              </div>
              <button data-pp="watch" className="pp-glass-btn pp-glass-primary" style={{ fontSize: 14.5, padding: '11px 20px', minHeight: 44 }} aria-label={`Watch ${svc.label.toLowerCase()}`} onClick={() => api.current?.play(service)}><span>Watch<span className="pp-world-wsvc"> {svc.label.toLowerCase()}</span></span></button>
              <button data-pp="explore" className="pp-glass-btn" style={{ fontSize: 14.5, padding: '11px 18px', minHeight: 44 }} onClick={() => api.current?.explore()}>Explore on foot</button>
            </div>
          </div>
        </div>
      )}

      {/* Story caption */}
      {mode === 'story' && caption && (
        <>
          <div style={{ position: 'absolute', right: 12, top: 12 }}><button className="pp-glass-btn" style={glassBtn} onClick={() => api.current?.skip()}>{story === 'dog' ? 'Skip to the walk' : 'Skip'}</button></div>
          <div key={caption.i} className="pp-fade-in" style={{ ...glass, position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 'clamp(12px, 3vw, 26px)', width: 'min(640px, calc(100% - 24px))', padding: 'clamp(14px, 2vw, 20px) clamp(16px, 2.4vw, 24px)', borderRadius: 22 }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>{Array.from({ length: caption.n }).map((_, i) => <span key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= caption.i ? T.marigold : 'rgba(20,48,31,.15)' }} />)}</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ flex: 1, fontFamily: head, fontWeight: 700, fontSize: 'clamp(15px, 1.7vw, 19px)', lineHeight: 1.4, letterSpacing: '-0.01em', color: T.ink }}>{caption.text}</div>
              {caption.img && <img src={caption.img} alt="How this moment looks in real life" className="pp-world-real" style={{ width: 112, height: 84, objectFit: 'cover', borderRadius: 14, border: '3px solid #fff', boxShadow: '0 8px 20px rgba(20,48,31,.18)', flexShrink: 0 }} />}
            </div>
          </div>
        </>
      )}

      {/* Walk HUD */}
      {mode === 'walk' && (
        <>
          <div className="pp-world-stats" style={{ ...glass, position: 'absolute', left: 12, top: 12, padding: '10px 14px', display: 'flex', gap: 16, alignItems: 'flex-end', fontFamily: body }}>
            <div data-pp="points" aria-live="polite">
              <div key={points} className={points ? 'pp-world-bump' : undefined} style={{ fontFamily: head, fontWeight: 800, fontSize: 22, lineHeight: '22px', color: T.marigoldDark, letterSpacing: '-0.02em', transformOrigin: 'left bottom' }}>{points}</div>
              <div style={{ fontSize: 11, color: T.muted, whiteSpace: 'nowrap' }}>ProxyPaw points</div>
            </div>
            {[[`${bones.got} of ${bones.of}`, 'bones', ''], [`${stats.km.toFixed(2)} km`, 'walked', 'pp-world-min'], [`${mins} min`, 'of 60', 'pp-world-min']].map(([v, l, c]) => (
              <div key={l} className={c || undefined}><div style={{ fontFamily: head, fontWeight: 800, fontSize: 17, color: T.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{v}</div><div style={{ fontSize: 11, color: T.muted }}>{l}</div></div>
            ))}
          </div>
          <canvas ref={mapRef} role="img" aria-label="Map of the walk path, the bones left to collect and where you are" className="pp-world-map" style={{ ...glass, position: 'absolute', left: 12, bottom: 14, width: 164, height: 164, borderRadius: 20, background: 'rgba(240,247,236,.8)' }} />
          <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
            <button data-pp="night" className="pp-glass-btn" style={glassBtn} onClick={() => setNight((n) => !n)}>{night ? 'Morning' : 'Evening'}</button>
            <button data-pp="end" className="pp-glass-btn" style={glassBtn} onClick={() => setMode('ended')}>End walk</button>
          </div>

          <div className="pp-world-stops" style={{ ...glass, position: 'absolute', left: 12, top: 82, padding: 12, width: 262, fontFamily: body }}>
            <button data-pp="list" onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', fontFamily: head, fontWeight: 800, fontSize: 14, color: T.ink }}>
              <span>Walk checklist · {done.length}/4</span><span style={{ color: T.leaf, fontSize: 12.5 }}>{listOpen ? 'Hide' : 'Show'}</span>
            </button>
            {listOpen && STOPS.map((s, i) => {
              const ok = done.includes(s.id);
              return (
                <button key={s.id} onClick={() => api.current?.goTo(s.id)} disabled={ok} className="pp-world-stop"
                  style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'baseline', textAlign: 'left', background: 'none', border: 'none', padding: '7px 4px', borderRadius: 10, cursor: ok ? 'default' : 'pointer', fontFamily: body, fontSize: 13, color: ok ? T.muted2 : T.ink, opacity: ok ? 0.7 : 1 }}>
                  <span style={{ fontFamily: head, fontWeight: 800, color: ok ? T.leafBright : T.marigold, width: 14 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span data-pp={`go-${s.id}`} style={{ fontSize: 11.5, fontWeight: 700, color: ok ? T.leafBright : T.leaf }}>{ok ? 'Done' : 'Go'}</span>
                </button>
              );
            })}
          </div>

          {photos.length > 0 && (
            <div className="pp-world-photos" style={{ position: 'absolute', right: 12, top: 66, display: 'grid', gap: 8 }}>
              {photos.map((p, i) => <img key={p.slice(-24) + i} src={p} alt="Photo update from the walk" className="pp-fade-in" style={{ width: 112, height: 75, objectFit: 'cover', borderRadius: 12, border: '3px solid #fff', boxShadow: '0 8px 20px rgba(20,48,31,.2)' }} />)}
            </div>
          )}

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', padding: '0 12px' }}>
            {nearStop && <button data-pp="act" className="pp-glass-btn pp-glass-primary pp-fade-in" onClick={() => api.current?.act(nearStop.id)} style={{ fontSize: 15 }}>{nearStop.verb}</button>}
            <button data-pp="photo" className="pp-glass-btn" style={{ ...glassBtn, fontSize: 14.5 }} onClick={takePhoto}>Send a photo update</button>
          </div>
          {toast && <div className="pp-fade-in pp-world-toast" style={{ ...glass, position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 76, padding: '10px 18px', fontFamily: body, fontSize: 14, color: T.ink, width: 'max-content', maxWidth: 'calc(100% - 24px)', textAlign: 'center' }}>{toast}</div>}
          <div className="pp-world-hint" style={{ position: 'absolute', right: 14, bottom: 18, fontFamily: body, fontSize: 12, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>Arrow keys or WASD to walk · drag to look · tap to walk there</div>
        </>
      )}

      {/* Summaries */}
      {fin && (
        <div className="pp-fade-in" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(20,48,31,.35)', padding: 14, overflowY: 'auto' }}>
          <div className="pp-modal-in" style={{ ...glass, background: 'rgba(255,255,255,.88)', borderRadius: 26, padding: 'clamp(18px, 3vw, 30px)', width: 'min(460px, 100%)', fontFamily: body }}>
            <div style={kicker}>{fin.k}</div>
            <h3 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(21px, 2.6vw, 26px)', letterSpacing: '-0.02em', margin: '0 0 6px', color: T.ink }}>{fin.t}</h3>
            <p style={{ fontSize: 14.5, color: T.sub, margin: '0 0 16px', lineHeight: 1.6 }}>
              {mode === 'ended'
                ? `${Math.max(1, mins)} min, ${stats.km.toFixed(2)} km, ${done.length} of 4 stops, ${bones.got} of ${bones.of} bones and ${stats.photos} photo${stats.photos === 1 ? '' : 's'} sent. Biscuit is home, towelled and happy.`
                : mode === 'catdone'
                  ? 'Food, water, litter, play and photos, all in her own home. Meera saw every step on her phone.'
                  : 'Dinner as the note said, a night on his own blanket and a morning photo, at a host\'s home in the same community. Ananya saw each update on her phone.'}
            </p>
            {mode === 'ended' && (
              <div data-pp="sum-points" style={{ background: T.marigoldPale, borderRadius: 18, padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontFamily: head, fontWeight: 800, fontSize: 15, color: T.ink }}>ProxyPaw points</div>
                  <div style={{ fontSize: 12.5, color: T.sub, lineHeight: 1.45, marginTop: 2 }}>{dir !== 'off' ? 'Walk it yourself to keep the points you collect.' : walkedN > 1 ? `${bankTotal} across the ${walkedN} communities you have walked.` : `Your best here is kept on this device. ${COMMUNITY_IDS.length - 1} more communities to walk.`}</div>
                </div>
                <div style={{ fontFamily: head, fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: T.marigoldDark }}>{points}</div>
              </div>
            )}
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: `1px solid ${T.line}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontFamily: head, fontWeight: 800, fontSize: 18, color: T.ink, marginBottom: 10 }}><span>{fin.item}</span><span>₹{fin.price}</span></div>
              <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}><div style={{ width: '70%', background: T.leafBright }} /><div style={{ flex: 1, background: T.marigold }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 13, color: T.sub }}><span>{fin.who}: ₹{(fin.price * 0.7).toFixed(2)}</span><span>ProxyPaw: ₹{(fin.price * 0.3).toFixed(2)}</span></div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="pp-glass-btn pp-glass-primary" onClick={() => onJoin(fin.src)} style={{ width: '100%' }}>Join the waitlist for the real thing</button>
              <button data-pp="back" className="pp-glass-btn" style={{ width: '100%' }} onClick={() => api.current?.menu()}>Back to the communities</button>
            </div>
            <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 10, textAlign: 'center' }}>A demo. Nothing is charged.</div>
          </div>
        </div>
      )}

      {/* The director: status chip and its cursor */}
      {webgl && (dir === 'off'
        ? <button data-pp-dir className="pp-glass-btn pp-world-dir" style={{ ...glassBtn, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 12, zIndex: 5 }} onClick={() => api.current?.dirStart()}>Watch the story</button>
        : (
          <div className="pp-world-dir" style={{ ...glass, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 12, zIndex: 5, borderRadius: 999, padding: '5px 5px 5px 16px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: body, fontSize: 13, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', cursor: 'pointer' }}>
            <span>{dir === 'play' ? 'Playing the story. Tap to take over.' : 'Paused.'}</span>
            <button data-pp-dir className="pp-glass-btn" style={{ ...glassBtn, padding: '6px 14px', minHeight: 32, fontSize: 12.5 }} onClick={() => api.current?.dirPause(dir === 'play')}>{dir === 'play' ? 'Pause' : 'Resume'}</button>
          </div>
        ))}
      {demo.on && dir !== 'off' && (
        <div aria-hidden="true" style={{ position: 'absolute', left: demo.x, top: demo.y, width: 0, height: 0, transition: 'left .5s cubic-bezier(.45,0,.2,1), top .5s cubic-bezier(.45,0,.2,1)', zIndex: 7, pointerEvents: 'none' }}>
          {demo.rip > 0 && <span key={demo.rip} className="pp-world-rip" style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 44, borderRadius: '50%', background: T.marigold }} />}
          <svg width="26" height="30" viewBox="0 0 26 30" style={{ position: 'absolute', left: -3, top: -2, transform: `scale(${demo.press ? 0.86 : 1})`, transformOrigin: '3px 2px', transition: 'transform .14s ease', filter: 'drop-shadow(0 3px 5px rgba(20,48,31,.35))' }}>
            <path d="M3 2v22l6-5.4 4.2 9 4-1.9-4.2-8.9 8-.7z" fill="#14301f" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      <style>{`
        .pp-world-rip { animation: pp-world-rip .6s ease-out forwards; }
        @keyframes pp-world-rip { from { transform: translate(-50%,-50%) scale(.25); opacity: .6; } to { transform: translate(-50%,-50%) scale(2.4); opacity: 0; } }
        .pp-world-stop:not(:disabled):hover { background: rgba(46,125,79,.1) !important; }
        .pp-world-bump { animation: pp-world-bump .5s cubic-bezier(.34,1.56,.64,1); }
        @keyframes pp-world-bump { 0% { transform: scale(1); } 35% { transform: scale(1.38); } 100% { transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) { .pp-world-bump { animation: none; } }
        .pp-world-row { display: flex; align-items: center; gap: 12px; }
        .pp-world-row + .pp-world-row { margin-top: 8px; }
        .pp-world-k { flex: 0 0 98px; }
        .pp-world-pills { display: flex; gap: 6px; flex-wrap: wrap; min-width: 0; flex: 1 1 auto; }
        .pp-world-pill, .pp-world-chip { flex: 0 0 auto; white-space: nowrap; border-radius: 999px; cursor: pointer; font-family: ${head}; letter-spacing: -.01em; transition: background .25s ease, border-color .25s ease, color .25s ease, transform .3s cubic-bezier(.34,1.56,.64,1); }
        .pp-world-pill { border: 1px solid rgba(46,125,79,.2); background: rgba(255,255,255,.72); color: ${T.sub}; font-weight: 700; font-size: 13.5px; padding: 8px 15px; min-height: 38px; }
        .pp-world-chip { border: 1px solid transparent; background: transparent; color: ${T.sub}; font-weight: 600; font-size: 12.5px; padding: 5px 11px; min-height: 30px; }
        .pp-world-pill:hover { transform: translateY(-1px); background: #fff; }
        .pp-world-chip:hover { background: rgba(46,125,79,.07); }
        .pp-world-pill[aria-pressed="true"] { background: rgba(46,125,79,.16); border-color: rgba(46,125,79,.42); color: ${T.ink}; box-shadow: 0 0 0 3px rgba(46,125,79,.08); }
        .pp-world-chip[aria-pressed="true"] { background: rgba(46,125,79,.12); border-color: rgba(46,125,79,.3); color: ${T.ink}; font-weight: 700; }
        .pp-world-pill:focus-visible, .pp-world-chip:focus-visible { outline: 2px solid ${T.leaf}; outline-offset: 2px; }
        @media (max-width: 420px) { .pp-world-blurb, .pp-world-wsvc { display: none; } }
        @media (max-width: 520px) { .pp-world-min { display: none; } } /* a phone keeps the two numbers of the game: points and bones */
        @media (max-width: 860px) {
          .pp-world-k, .pp-world-line { display: none; }
          /* each group is one row that scrolls sideways and runs to the panel's edge, so a cut-off pill shows there is more */
          .pp-world-pills { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; margin: 0 -12px; padding: 3px 12px; }
          .pp-world-pills::-webkit-scrollbar { display: none; }
          .pp-world-row + .pp-world-row { margin-top: 4px; }
          .pp-world-pill { font-size: 12.5px; padding: 7px 12px; min-height: 36px; }
          .pp-world-chip { padding: 5px 10px; min-height: 32px; }
          .pp-world-go { margin-top: 8px !important; }
          .pp-world-go .pp-glass-btn { flex: 1 1 auto; font-size: 13.5px !important; padding: 9px 14px !important; min-height: 40px !important; }
          .pp-world-go > div:first-child { flex-basis: 100% !important; }
          .pp-world-real { width: 72px !important; height: 56px !important; }
          .pp-world-hint, .pp-world-photos { display: none !important; }
          .pp-world-dir { top: 62px !important; }
          .pp-world[data-fin] .pp-world-dir { display: none !important; } /* the summary card needs that space on a phone */
          .pp-world-stops { top: 110px !important; left: 10px !important; width: min(262px, calc(100% - 132px)) !important; padding: 9px !important; }
          .pp-world-map { left: auto !important; bottom: auto !important; right: 10px !important; top: 110px !important; width: 104px !important; height: 104px !important; border-radius: 16px !important; }
          .pp-world-pts { font-size: 12px !important; margin-top: 2px !important; }
          .pp-world-stats { left: 10px !important; top: 10px !important; gap: 12px !important; padding: 8px 12px !important; }
          .pp-world-toast { bottom: 128px !important; }
        }
      `}</style>
    </div>
  );
}
