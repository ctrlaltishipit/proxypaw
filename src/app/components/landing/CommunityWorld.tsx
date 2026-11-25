/**
 * CommunityWorld: a 3D gated community you can watch and walk through.
 *
 * The layout follows the published master plan of a ten-tower Hyderabad
 * community (ring road, a charcoal jogging track with white lanes, pools,
 * clubhouse, pet garden). Two stories play inside a flat (the dog walker
 * arriving at the door, and a cat home visit); the dog story then hands over
 * the leash: WASD or arrow keys walk, dragging looks around, tapping the
 * ground walks there along the paths, the checklist can auto-walk you to each
 * stop, and there are treats to collect along the track.
 *
 * Left alone, it plays by itself like a video: a "director" moves a demo
 * cursor over the real controls (cards, checklist, action buttons, End walk)
 * and calls their handlers, looping dog walk, payment summary and cat visit.
 * Any real press, tap or key inside the world hands control to the visitor.
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

type StopId = 'water' | 'fetch' | 'hello' | 'cat';
interface Stop { id: StopId; label: string; verb: string; pos: [number, number]; done: string }
const STOPS: Stop[] = [
  { id: 'hello', label: 'Say hi to Rhea by the pool', verb: 'Say hi to Rhea', pos: [5, -19], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
  { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [36, -3], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
  { id: 'cat', label: 'Meet Lily on the lawn bench', verb: 'Pet Lily', pos: [-30, 0.4], done: 'Lily purred. Biscuit stayed polite and sat.' },
  { id: 'fetch', label: 'Fetch in the pet garden', verb: 'Throw the ball', pos: [136, 22], done: 'Fetch done. Zoomies achieved.' },
];
const PRICE = 249;

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
function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
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
function ribbon(curve: THREE.Curve<THREE.Vector3>, width: number, segs: number, y: number, mat: THREE.Material) {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const len = curve.getLength();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const n = V(-tan.z, 0, tan.x).normalize().multiplyScalar(width / 2);
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
type Mode = 'menu' | 'story' | 'walk' | 'ended' | 'catdone';
type StoryId = 'dog' | 'cat';

// Tower centres and rotation, read off the master plan (1 plan px = 0.2 m).
const TOWERS: [string, number, number, number, number][] = [
  ['T1', -66, -33, 0.42, 33], ['T2', -16, -35, 0.42, 33], ['T3', 36, -35, 0.42, 33], ['T4', 86, -33, -0.35, 33], ['T5', 96, 10, -0.5, 33],
  ['T6', 96, 46, -0.6, 27], ['T7', 48, 48, 0.45, 33], ['T8', 22, 29, 0.42, 33], ['T9', -28, 22, 0.42, 31], ['T10', -76, 18, 0.42, 33],
];
const RING: [number, number][] = [[-104, -40], [-84, -58], [-40, -62], [8, -62], [58, -60], [108, -52], [124, -30], [126, -13], [126, 26], [126, 70], [88, 80], [34, 66], [-8, 54], [-50, 50], [-96, 42], [-106, 6]];
const LOOP: [number, number][] = [[-54, -14], [-30, -19], [5, -18], [28, -14], [31, -4], [12, 2], [-10, 0], [-35, 0], [-52, -4]];
const LINKS: [number, number][][] = [
  [[-128, -40], [-104, -40]],
  [[-106, 6], [-78, -8], [-54, -14]],
  [[5, -18], [9, -40], [8, -62]],
  [[31, -4], [40, -11], [72, -13], [100, -13], [126, -13]],
  [[100, -13], [100, -1]],
  [[126, 26], [131, 22], [136, 22]],
  [[12, 2], [-5, 27], [-8, 54]],
];

export default function CommunityWorld({ onJoin }: { onJoin: (source: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{
    act: (id: StopId) => void; goTo: (id: StopId) => void; photo: () => string | null;
    setNight: (n: boolean) => void; play: (s: StoryId) => void; skip: () => void; explore: () => void; menu: () => void; sync: (x: Mode) => void;
    dirStart: () => void; dirPause: (p: boolean) => void;
  } | null>(null);

  const [mode, setMode] = useState<Mode>('menu');
  const [story, setStory] = useState<StoryId | null>(null);
  const [caption, setCaption] = useState<{ text: string; i: number; n: number; img?: string } | null>(null);
  const [near, setNear] = useState<StopId | null>(null);
  const [done, setDone] = useState<StopId[]>([]);
  const [stats, setStats] = useState<Stats>({ minutes: 0, km: 0, photos: 0 });
  const [treats, setTreats] = useState(0);
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

  const say = (t: string) => {
    setToast(t);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  useEffect(() => {
    const canvas = canvasRef.current!, wrap = wrapRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch { setWebgl(false); return; }
    const small = wrap.clientWidth < 700;
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
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
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
    grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping; grassTex.repeat.set(140, 140);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(520, 64), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }));
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
    patchTex.wrapS = patchTex.wrapT = THREE.RepeatWrapping; patchTex.repeat.set(5, 5);
    const patches = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
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
    const ring = curve(RING, true), loop = curve(LOOP, true);
    scene.add(ribbon(ring, 7, 500, 0.03, roadM));
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
    scene.add(ribbon(loop, TRACK_W, 400, 0.05, trackM));
    // painted distance marks and a start line, the way a real community track has them
    const loopLen = loop.getLength();
    let tStart = 0; { let bd = 1e9; for (let i = 0; i < 300; i++) { const p = loop.getPointAt(i / 300), d = Math.hypot(p.x - 26, p.z + 1.2); if (d < bd) { bd = d; tStart = i / 300; } } }
    // distance ticks every 50 m: short bars on the outer lane (no painted words: they read upside down from the other side)
    for (let k = 1; k * 50 < loopLen - 20; k++) {
      const tt = (((tStart + (k * 50) / loopLen) % 1) + 1) % 1, p = loop.getPointAt(tt), tan = loop.getTangentAt(tt);
      const nx = tan.z, nz = -tan.x, off = TRACK_W / 2 - 0.55;
      const tick = mesh(new THREE.PlaneGeometry(0.7, 0.16), new THREE.MeshStandardMaterial({ color: '#f6f5ef', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), p.x + nx * off, 0.06, p.z + nz * off, false);
      tick.rotation.order = 'YXZ'; tick.rotation.y = Math.atan2(tan.x, tan.z); tick.rotation.x = -Math.PI / 2; scene.add(tick);
    }
    { // start line across the three lanes
      const p = loop.getPointAt(tStart), tan = loop.getTangentAt(tStart);
      const line = mesh(new THREE.PlaneGeometry(TRACK_W - 0.5, 0.32), new THREE.MeshStandardMaterial({ color: '#f6f5ef', roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), p.x, 0.06, p.z, false);
      line.rotation.order = 'YXZ'; line.rotation.y = Math.atan2(tan.x, tan.z); line.rotation.x = -Math.PI / 2; scene.add(line);
    }
    const linkCurves = LINKS.map((l) => curve(l, false));
    linkCurves.forEach((c, i) => scene.add(ribbon(c, i === 0 ? 7 : 3.6, 60, 0.04, i === 0 ? roadM : pathM)));
    // main road outside the gate
    scene.add(ribbon(new THREE.LineCurve3(V(-136, 0, -220), V(-136, 0, 220)), 14, 2, 0.02, roadM));
    // entry arch
    const gateM = std('#cdb49c', 0.8);
    scene.add(mesh(new THREE.BoxGeometry(2, 7, 2), gateM, -124, 3.5, -46)); scene.add(mesh(new THREE.BoxGeometry(2, 7, 2), gateM, -124, 3.5, -34));
    scene.add(mesh(new THREE.BoxGeometry(3, 1.6, 15), std('#8d6f58', 0.8), -124, 7.6, -40));

    /* ---- walkable graph (roads and paths) ---- */
    const nodes: THREE.Vector3[] = []; const adj: number[][] = [];
    const nodeAt = (x: number, z: number) => {
      for (let i = 0; i < nodes.length; i++) if (Math.hypot(nodes[i].x - x, nodes[i].z - z) < 3.2) return i;
      nodes.push(V(x, 0, z)); adj.push([]); return nodes.length - 1;
    };
    const link = (a: number, b: number) => { if (a !== b && !adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); } };
    const addPoly = (pts: [number, number][], closed: boolean) => {
      const c = curve(pts, closed), n = Math.max(1, Math.round(c.getLength() / 5));
      const ids = c.getSpacedPoints(n).map((pt) => nodeAt(pt.x, pt.z));
      for (let i = 1; i < ids.length; i++) link(ids[i - 1], ids[i]);
    };
    addPoly(RING, true); addPoly(LOOP, true); LINKS.forEach((l) => addPoly(l, false));
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
    const FL = 33, TH = FL * 3;
    const fWide = facade(FL, 10, 11), fDeep = facade(FL, 5, 23), fNarrow = facade(FL, 2, 37);
    const windowMats: THREE.MeshStandardMaterial[] = [];
    const wm = (f: { map: THREE.Texture; emissive: THREE.Texture }) => {
      const m = new THREE.MeshStandardMaterial({ map: f.map, emissiveMap: f.emissive, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.8 });
      windowMats.push(m); return m;
    };
    const mWide = wm(fWide), mDeep = wm(fDeep), mNarrow = wm(fNarrow);
    const roofM = std('#c9bfb2', 0.9), podiumM = std('#c2b3a0', 0.9), crownM = std('#b39a82', 0.8);
    const spineGeo = new THREE.BoxGeometry(34, TH, 8), wingGeo = new THREE.BoxGeometry(6, TH, 18);
    TOWERS.forEach(([name, x, z, rot, floors]) => {
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = rot;
      const body3 = new THREE.Group(); body3.scale.y = floors / FL; t.add(body3);
      const sp = new THREE.Mesh(spineGeo, [mNarrow, mNarrow, roofM, roofM, mWide, mWide]); sp.position.y = TH / 2 + 1; sp.castShadow = sp.receiveShadow = true; body3.add(sp);
      for (let i = 0; i < 4; i++) {
        const w = new THREE.Mesh(wingGeo, [mDeep, mDeep, roofM, roofM, mNarrow, mNarrow]); w.position.set(-12.75 + i * 8.5, TH / 2 + 1, 0); w.castShadow = w.receiveShadow = true; body3.add(w);
        body3.add(mesh(new THREE.BoxGeometry(6.6, 1.2, 18.6), crownM, -12.75 + i * 8.5, TH + 1.6, 0));
      }
      t.add(mesh(new THREE.BoxGeometry(36, 1, 20), podiumM, 0, 0.5, 0));
      // lobby canopy on the north side
      t.add(mesh(new THREE.BoxGeometry(7, 0.4, 4), crownM, 0, 4.2, -11));
      t.add(mesh(new THREE.BoxGeometry(5, 3.2, 0.3), new THREE.MeshStandardMaterial({ color: '#9cc6d6', roughness: 0.05, metalness: 0.3 }), 0, 2.6, -9.1, false));
      const lb = label(name.replace(/^T/, 'Tower '), { scale: 1.3 }); lb.position.set(0, 7.5, -12.5); t.add(lb);
      scene.add(t); block(x, z, 19, 11, rot, 110);
    });

    /* ---- clubhouse, pools, courts, play area ---- */
    const club = new THREE.Group(); club.position.set(56, 0, 4); club.rotation.y = 0.42; scene.add(club);
    club.add(mesh(new THREE.BoxGeometry(24, 7, 18), std('#d6c2ab', 0.8), 0, 3.5, 0));
    const checker = canvasTex(128, 128, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9c9bd' : '#f6efe8'; g.fillRect(i * 16, j * 16, 16, 16); } });
    const roofTop = mesh(new THREE.PlaneGeometry(23, 17), new THREE.MeshStandardMaterial({ map: checker, roughness: 0.9 }), 0, 7.03, 0, false); roofTop.rotation.x = -Math.PI / 2; club.add(roofTop);
    club.add(mesh(new THREE.BoxGeometry(0.3, 4, 12), new THREE.MeshStandardMaterial({ color: '#9cc6d6', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.8 }), -12.1, 2.6, 0, false));
    const clb = label('Clubhouse', { scale: 0.9 }); clb.position.set(-13, 6.5, 0); club.add(clb);
    block(56, 4, 13.5, 10.5, 0.42, 8);
    scene.add(mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.16, 20), std('#cfd6d8', 0.2, 0.9), 38, 0.08, -1.6));
    const bowlWater = mesh(new THREE.CircleGeometry(0.27, 20), new THREE.MeshStandardMaterial({ color: '#5fa8c9', roughness: 0.05 }), 38, 0.15, -1.6, false); bowlWater.rotation.x = -Math.PI / 2; scene.add(bowlWater);

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
    const lagoonDeck = mesh(new THREE.CircleGeometry(1, 48), deckM, 0, 0.04, -9, false); lagoonDeck.scale.set(9, 6.8, 1); lagoonDeck.rotation.x = -Math.PI / 2; scene.add(lagoonDeck);
    const lagoon = mesh(new THREE.CircleGeometry(1, 48), poolM, 0, 0.1, -9, false); lagoon.scale.set(7, 5, 1); lagoon.rotation.x = -Math.PI / 2; scene.add(lagoon);
    const lagoonEdge = mesh(new THREE.TorusGeometry(1, 0.045, 6, 56), copingM, 0, 0.1, -9, false); lagoonEdge.scale.set(7.15, 5.15, 3); lagoonEdge.rotation.x = -Math.PI / 2; scene.add(lagoonEdge);
    const rp = new THREE.Group(); rp.position.set(16, 0, -7); rp.rotation.y = 0.42; scene.add(rp);
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
    for (const a of [1.75, 2.2]) { const x = 8 * Math.cos(a), z = -9 + 5.9 * Math.sin(a); lounger(scene, x, z, Math.atan2(-x, -9 - z)); }
    scene.add(mesh(umbA, detailM, 8.2 * Math.cos(1.98), 0, -9 + 6 * Math.sin(1.98)));
    block(0, -9, 7.6, 5.6); block(16, -7, PW / 2 + 0.6, PD / 2 + 0.5, 0.42);

    const courtTex = canvasTex(256, 160, (g) => { g.fillStyle = '#4f9a6a'; g.fillRect(0, 0, 256, 160); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(10, 10, 236, 140); g.beginPath(); g.moveTo(128, 10); g.lineTo(128, 150); g.stroke(); g.strokeRect(50, 40, 156, 80); });
    for (const [x, z] of [[-44, -13], [-40, -5]] as const) { const c = mesh(new THREE.PlaneGeometry(11, 7), new THREE.MeshStandardMaterial({ map: courtTex, roughness: 0.9 }), x, 0.05, z, false); c.rotation.x = -Math.PI / 2; c.rotation.z = 0.42; scene.add(c); }
    const bbTex = canvasTex(256, 160, (g) => { g.fillStyle = '#d98a5a'; g.fillRect(0, 0, 256, 160); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(8, 8, 240, 144); g.beginPath(); g.arc(128, 80, 26, 0, 7); g.stroke(); g.beginPath(); g.arc(8, 80, 50, -1.57, 1.57); g.stroke(); g.beginPath(); g.arc(248, 80, 50, 1.57, 4.71); g.stroke(); });
    const bb = mesh(new THREE.PlaneGeometry(14, 9), new THREE.MeshStandardMaterial({ map: bbTex, roughness: 0.9 }), 22, 0.05, -70, false); bb.rotation.x = -Math.PI / 2; scene.add(bb);
    // play area: soft floor, slide and swing frame
    const play = new THREE.Group(); play.position.set(-20, 0, -9); scene.add(play);
    const pf = mesh(new THREE.CircleGeometry(5, 32), std('#e98a8a', 0.9), 0, 0.05, 0, false); pf.rotation.x = -Math.PI / 2; play.add(pf);
    play.add(mesh(new THREE.BoxGeometry(1.6, 0.2, 1.6), std('#f0b429', 0.6), 0, 1.6, 0));
    for (const [px, pz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) play.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8), std('#3f9fd0', 0.5), px, 0.8, pz));
    const slide = mesh(new THREE.BoxGeometry(0.8, 0.08, 3), std('#e0662f', 0.4), 0, 0.85, 2.1); slide.rotation.x = 0.55; play.add(slide);
    const roofP = mesh(new THREE.ConeGeometry(1.4, 0.9, 4), std('#49a85a', 0.6), 0, 3.2, 0); roofP.rotation.y = Math.PI / 4; play.add(roofP);
    for (const [px, pz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) play.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 6), std('#3f9fd0', 0.5), px, 2.2, pz));

    /* ---- pet garden ---- */
    const fenceM = std('#f6f7f2', 0.6);
    const px0 = 132, px1 = 150, pz0 = 12, pz1 = 32;
    for (let x = px0; x <= px1; x += 2) for (const z of [pz0, pz1]) scene.add(mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), fenceM, x, 0.55, z));
    for (let z = pz0; z <= pz1; z += 2) { scene.add(mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), fenceM, px1, 0.55, z)); if (z < 20 || z > 24) scene.add(mesh(new THREE.BoxGeometry(0.15, 1.1, 0.15), fenceM, px0, 0.55, z)); }
    for (const z of [pz0, pz1]) scene.add(mesh(new THREE.BoxGeometry(px1 - px0, 0.08, 0.08), fenceM, (px0 + px1) / 2, 1, z));
    scene.add(mesh(new THREE.BoxGeometry(0.08, 0.08, pz1 - pz0), fenceM, px1, 1, (pz0 + pz1) / 2));
    for (const z of [18, 26]) { for (const x of [143, 145]) scene.add(mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), std('#e0662f', 0.7), x, 0.45, z)); scene.add(mesh(new THREE.BoxGeometry(2.1, 0.08, 0.08), std('#f0b429', 0.7), 144, 0.6, z)); }
    const tunnel = mesh(new THREE.TorusGeometry(0.7, 0.12, 8, 20, Math.PI), std('#3f9fd0', 0.6), 140, 0, 29); scene.add(tunnel);
    const dpl = label('Pet garden', { scale: 0.5 }); dpl.position.set(141, 4, 22); scene.add(dpl);

    /* ---- garden: trees, palms, shrubs, beds, hedges ---- */
    const inBlock = (x: number, z: number, pad = 2) => blockers.some((b) => { const dx = x - b.x, dz = z - b.z; return Math.abs(dx * b.c - dz * b.s) < b.hw + pad && Math.abs(dx * b.s + dz * b.c) < b.hd + pad; });
    const tr = rand(42);
    const along = (c: THREE.Curve<THREE.Vector3>, t: number, off: number) => { const p = c.getPointAt(((t % 1) + 1) % 1), tan = c.getTangentAt(((t % 1) + 1) % 1); return V(p.x - tan.z * off, 0, p.z + tan.x * off); };
    const onPaving = (x: number, z: number) => {
      const near = (c: THREE.Curve<THREE.Vector3>, w: number, n: number) => { for (let i = 0; i <= n; i++) { const p = c.getPointAt(i / n); if (Math.hypot(p.x - x, p.z - z) < w) return true; } return false; };
      return near(ring, 5, 160) || near(loop, 3, 110) || linkCurves.some((c, i) => near(c, i === 0 ? 5 : 2.8, 24));
    };
    const free = (x: number, z: number, pad = 1.5) => !inBlock(x, z, pad) && !onPaving(x, z);
    const loopPts = loop.getSpacedPoints(140);
    const nearLoop = (x: number, z: number, d: number) => loopPts.some((p) => Math.hypot(p.x - x, p.z - z) < d);
    // park benches sit in gaps in the hedge, facing the track (and the pools beyond it)
    const BENCHES: [number, number, number][] = [[-30, 3.2, Math.PI], [-8, -21.5, 0], [22, 3.6, Math.PI - 0.3]];
    for (const [t, side] of [[0.06, 1], [0.16, -1], [0.29, 1], [0.4, -1], [0.52, 1], [0.63, -1], [0.76, 1], [0.9, -1]]) {
      const p = along(loop, t, side * 3.25), c = loop.getPointAt(t);
      if (!free(p.x, p.z, 1) || BENCHES.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 9) || STOPS.some((st) => Math.hypot(p.x - st.pos[0], p.z - st.pos[1]) < 5) || [[-54, -14], [5, -18], [31, -4], [12, 2]].some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 6)) continue;
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
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = tr() * 6.3;
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
      scene.add(t); trees.push(t); if (gold) goldSpots.push([x, z, s]);
    }
    for (let i = 0; i < 34; i++) { const p = along(loop, i / 34 + tr() * 0.01, (i % 2 ? 5 : -5) + (tr() - 0.5) * 2); tree(p.x, p.z, 0.75 + tr() * 0.4, i % 6 === 0 ? 9 : i % 4 === 1 ? 8 : i % 5); }
    for (let i = 0; i < 72; i++) { const p = along(ring, i / 72 + tr() * 0.006, (i % 2 ? 7.5 : -7.5) + (tr() - 0.5) * 2.5); tree(p.x, p.z, 0.9 + tr() * 0.5, i % 8 === 0 ? 9 : i % 7 === 3 ? 8 : i % 5); }
    for (let i = 0; i < 26; i++) tree(-60 + tr() * 34, -17 + tr() * 16, 0.7 + tr() * 0.4, i % 5 === 0 ? 9 : i % 6 === 2 ? 8 : i % 5);
    for (const [x, z] of [[-12, -12.5], [-12.6, -5], [-3, 5.2], [18, -20.4]]) tree(x, z, 0.95, 8);
    for (let i = 0; i < 110; i++) { const a = tr() * Math.PI * 2, r = 175 + tr() * 170; tree(Math.cos(a) * r + 10, Math.sin(a) * r, 1.1 + tr() * 0.8, Math.floor(tr() * 5), false); }

    // palms by the pools
    const frondGeo = (() => {
      const g0 = new THREE.PlaneGeometry(0.9, 3.4, 2, 8); const pos = g0.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) + 1.7, t = y / 3.4, x = pos.getX(i); pos.setXYZ(i, x * (1 - t * 0.85), y, -t * t * 1.5 - Math.abs(x) * 0.5); }
      g0.computeVertexNormals(); return g0;
    })();
    const frondM = nearFade(new THREE.MeshStandardMaterial({ color: '#4c9d55', roughness: 0.8, side: THREE.DoubleSide }));
    const palmTrunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1, 8);
    const palms: THREE.Group[] = [];
    for (const [x, z, h] of [[-8, -15, 7], [9, -15.5, 8], [-9.5, -3, 6.5], [24, -12, 7.5], [26.5, -1.5, 7], [8.5, -1.5, 6], [36, -8, 7.5], [-22, -1.5, 6.5]] as const) {
      const g0 = new THREE.Group(); g0.position.set(x, 0, z);
      const tk = mesh(palmTrunkGeo, trunkM, 0, h / 2, 0); tk.scale.y = h; g0.add(tk);
      const crown = new THREE.Group(); crown.position.y = h; g0.add(crown); palms.push(crown);
      for (let i = 0; i < 11; i++) { const f = new THREE.Group(); f.rotation.y = (i / 11) * 6.283; const m2 = mesh(frondGeo, frondM, 0, 0, 0); m2.rotation.x = 0.9 + (i % 3) * 0.22; f.add(m2); crown.add(f); }
      scene.add(g0);
    }

    // shrubs, flower beds on soil, and tall ornamental grass
    const SHRUBS = small ? 260 : 520;
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
    // layered planting along the walking loop, like a real landscaped path
    for (let i = 0; i < 120; i++) {
      const t = i / 120, side = i % 2 ? 1 : -1;
      const p = along(loop, t, side * (3.9 + tr() * 1.6)); shrub(p.x, p.z, 0.45 + tr() * 0.5, i % 4 === 0 ? PETALS[Math.floor(tr() * PETALS.length)] : null);
    }
    for (let i = 0; i < 26; i++) { const p = along(loop, i / 26 + 0.013, (i % 2 ? 1 : -1) * (6.2 + tr() * 2)); bed(p.x, p.z, 1.4 + tr() * 1.3, 0.9 + tr() * 0.8, PETALS[i % PETALS.length], PETALS[(i + 2) % PETALS.length]); }
    // foundation planting around every tower, and around the clubhouse and pools
    blockers.forEach((b) => {
      const n = b.h > 50 ? 26 : 14;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 4, e = Math.floor(t), f = (t - e) * 2 - 1;
        const lx = e % 2 === 0 ? f * (b.hw + 0.4) : (e === 1 ? 1 : -1) * (b.hw + 0.9), lz = e % 2 === 0 ? (e === 0 ? 1 : -1) * (b.hd + 0.9) : f * (b.hd + 0.4);
        shrub(b.x + lx * b.c + lz * b.s, b.z - lx * b.s + lz * b.c, 0.5 + tr() * 0.45, i % 5 === 0 ? PETALS[Math.floor(tr() * PETALS.length)] : null);
      }
    });
    for (let i = 0; i < 70; i++) { const p = along(ring, i / 70 + 0.007, (i % 2 ? 1 : -1) * (5.6 + tr())); shrub(p.x, p.z, 0.4 + tr() * 0.4, i % 6 === 0 ? PETALS[i % PETALS.length] : null); }
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
    for (const [x, z, sz] of [[-8.6, -8, 0.9], [-7.8, -10.6, 0.6], [7.9, -12.4, 0.8], [-3, -15, 0.5], [3.4, -3.2, 0.7]] as const) { const rk = mesh(new THREE.DodecahedronGeometry(sz, 1), rockM, x, sz * 0.5, z); rk.rotation.set(sz * 3, sz * 7, 0); rk.scale.y = 0.7; scene.add(rk); }

    // clipped hedges on both sides of the walking loop
    const hedgeM = std('#2f7a3d', 1);
    const HEDGE = 360;
    const hedge = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 0.8, 0.85, 2, 2, 2), hedgeM, HEDGE);
    for (let i = 0; i < HEDGE; i++) {
      const t = (i >> 1) / (HEDGE / 2), side = i % 2 ? 2.55 : -2.55; const p = along(loop, t, side), tan = loop.getTangentAt(t);
      q.setFromAxisAngle(V(0, 1, 0), Math.atan2(-tan.z, tan.x));
      const rx = (p.x - 16) * Math.cos(0.42) - (p.z + 7) * Math.sin(0.42), rz = (p.x - 16) * Math.sin(0.42) + (p.z + 7) * Math.cos(0.42);
      const hide = [[-54, -14], [5, -18], [31, -4], [12, 2], [-30, 0.4]].some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 3.6)
        || BENCHES.some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 2.1)
        || (Math.abs(rx) < PW / 2 + 2.3 && rz > -PD / 2 - 3.4 && rz < PD / 2 + 2.2) || (p.x / 9.5) ** 2 + ((p.z + 9) / 7.3) ** 2 < 1;
      mtx.compose(V(p.x, hide ? -3 : 0.4, p.z), q, V(1, 0.92 + ((i * 7) % 5) * 0.03, 1)); hedge.setMatrixAt(i, mtx);
    }
    hedge.castShadow = hedge.receiveShadow = true; scene.add(hedge);

    /* ---- real grass: tens of thousands of blades that sway and follow you ---- */
    const MX0 = -150, MZ0 = -100, MW = 320, MH = 210;
    const maskTex = canvasTex(1024, 672, (g) => {
      const k = 1024 / MW, X = (x: number) => (x - MX0) * k, Z = (z: number) => (z - MZ0) * k;
      g.fillStyle = '#fff'; g.fillRect(0, 0, 1024, 672); g.fillStyle = g.strokeStyle = '#000'; g.lineCap = g.lineJoin = 'round';
      const stroke = (c: THREE.Curve<THREE.Vector3>, w: number) => { const pts = c.getSpacedPoints(260); g.lineWidth = w * k; g.beginPath(); pts.forEach((pt, i) => (i ? g.lineTo(X(pt.x), Z(pt.z)) : g.moveTo(X(pt.x), Z(pt.z)))); g.stroke(); };
      stroke(ring, 8.2); stroke(loop, 6.9); linkCurves.forEach((c, i) => stroke(c, i === 0 ? 8.2 : 4.6));
      g.fillRect(X(-144), 0, 16 * k, 672);
      const rect = (x: number, z: number, hw: number, hd: number, rot: number) => { g.save(); g.translate(X(x), Z(z)); g.rotate(-rot); g.fillRect(-hw * k, -hd * k, hw * 2 * k, hd * 2 * k); g.restore(); };
      blockers.forEach((b) => rect(b.x, b.z, b.hw + 0.4, b.hd + 0.4, Math.atan2(b.s, b.c)));
      g.beginPath(); g.ellipse(X(0), Z(-9), 9 * k, 6.8 * k, 0, 0, 6.3); g.fill(); rect(16, -7, PW / 2 + 1.8, PD / 2 + 2.5, 0.42);
      rect(-44, -13, 5.8, 3.8, 0.42); rect(-40, -5, 5.8, 3.8, 0.42); rect(22, -70, 7.3, 4.8, 0);
      g.beginPath(); g.arc(X(-20), Z(-9), 5.2 * k, 0, 6.3); g.fill();
    }, false);
    const TILE = small ? 30 : 44, BLADES = small ? 34000 : 96000;
    const bladeGeo = (() => {
      const g0 = new THREE.BufferGeometry(); const w = 0.017;
      g0.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, -w * 0.7, 0.5, 0, w * 0.7, 0.5, 0, 0, 1, 0], 3));
      g0.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 0.5, 1, 0.5, 0.5, 1], 2));
      g0.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
      g0.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4, 2, 1, 0, 3, 1, 2, 4, 3, 2]); return g0;
    })();
    const grassU = { uTime: { value: 0 }, uCenter: { value: new THREE.Vector2(72, -13) }, uMask: { value: maskTex } };
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
      flyers.push({ g: g0, wings: [a, b], c: bird ? V(tr() * 80 - 30, 26 + tr() * 22, tr() * 60 - 30) : V(p.x, 0.9 + tr() * 0.8, p.z), ph: tr() * 6.3, r: bird ? 30 + tr() * 30 : 1.5 + tr() * 2.5, bird });
    }
    // lamps along the loop
    const lampM = std('#24452f', 0.5, 0.5); const bulbs: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 14; i++) {
      const p = along(loop, i / 14 + 0.02, 3.3);
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
    const cat = AC.makeCat(); cat.g.position.set(-29.6, 0.47, 3.24); cat.g.rotation.y = Math.PI; scene.add(cat.g);

    /* ---- cars ---- */
    function car(color: string) {
      const g = new THREE.Group(); const m = std(color, 0.35, 0.4);
      g.add(mesh(new THREE.BoxGeometry(1.8, 0.7, 4.2), m, 0, 0.7, 0)); g.add(mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), new THREE.MeshStandardMaterial({ color: '#2a3a44', roughness: 0.1, metalness: 0.5 }), 0, 1.3, -0.2));
      for (const [x, z] of [[-0.9, 1.3], [0.9, 1.3], [-0.9, -1.3], [0.9, -1.3]]) { const w = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 12), std('#1c1c1c', 0.8), x, 0.34, z); w.rotation.z = Math.PI / 2; g.add(w); }
      scene.add(g); return g;
    }
    ['#f4f4f2', '#b8312f', '#3b4a5a', '#d9d9d9', '#1f2a33', '#e9e2d0', '#7c8f83'].forEach((c, i) => { const t = 0.08 + i * 0.13, p = along(ring, t, 5.2), tan = ring.getTangentAt(t); const g = car(c); g.position.copy(p); g.rotation.y = Math.atan2(tan.x, tan.z); });
    const driver = car('#e0662f');

    /* ---- clouds, far city ---- */
    const cloudM = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: 0.92, fog: false });
    const clouds: THREE.Group[] = [];
    for (let i = 0; i < 9; i++) { const c = new THREE.Group(); c.position.set(-300 + i * 75, 430 + (i % 3) * 30, -260 + (i % 4) * 150); c.scale.setScalar(1.8); for (let k = 0; k < 4; k++) { const s = mesh(new THREE.SphereGeometry(14 + k * 3, 12, 10), cloudM, k * 16, (k % 2) * 4, 0, false); s.scale.y = 0.5; c.add(s); } scene.add(c); clouds.push(c); }
    /* ---- the flat (story set), on a high floor ---- */
    const flat = new THREE.Group(); flat.position.set(56, 62, 2); flat.visible = false; scene.add(flat);
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
    let visitor: Person = vPriya;
    const homeCat = AC.makeCat(); flat.add(homeCat.g);
    const pLabel = label('Ananya', { scale: 0.13 }); pLabel.position.set(2.3, 1.56, -2.42); flat.add(pLabel);
    const vLabel = label('Priya', { scale: 0.13 }); flat.add(vLabel);

    /* ---- world people and pets ---- */
    const walker = AC.makePerson({ shirt: '#2e7d4f', pants: '#33424a', skin: '#c08a63', hair: '#1f1a17', style: 'pony', build: 'f', height: 1.65, lanyard: true }); walker.g.position.set(70, 0, -13); walker.c.leash = 0; scene.add(walker.g);
    const dog = AC.makeDog(); dog.g.position.set(69.5, 0, -13.8); scene.add(dog.g);
    const priya = AC.makePerson({ shirt: '#e0662f', pants: '#2c3a50', skin: '#9a6a4a', hair: '#14110f', style: 'bun', build: 'f', height: 1.6, lanyard: true }); priya.g.position.set(5, 0, -22); scene.add(priya.g);
    const pl = label('Rhea', { scale: 0.2 }); pl.position.set(5, 2.0, -22); scene.add(pl); // the neighbour at the pool; Priya is the walker
    const jogger = AC.makePerson({ shirt: '#f0b429', pants: '#22313a', skin: '#d1a07a', hair: '#3a2a1f', style: 'crop', build: 'm', height: 1.78, shorts: true }); scene.add(jogger.g);
    const resident = AC.makePerson({ shirt: '#6fa8c9', pants: '#4a4f55', skin: '#a87656', hair: '#8f8f8c', style: 'crop', build: 'm', height: 1.7 }); resident.c.leash = 0; scene.add(resident.g);
    const dog2 = AC.makeDog({ coat: '#2f2a26', cream: '#4a423b', dark: '#1d1916', scale: 0.82, harness: '#3f9fd0' }); scene.add(dog2.g);
    const sitter = AC.makePerson({ shirt: '#c6a3e8', pants: '#3b3b46', skin: '#b07a58', hair: '#1a1512', style: 'bun', build: 'f', height: 1.6 }); sitter.g.position.set(-8.4, 0, -21.5); sitter.c.sit = sitter.k.sit = 1; sitter.c.phone = sitter.k.phone = 1; scene.add(sitter.g);
    sitter.arms[0].low.add(mesh(new THREE.BoxGeometry(0.07, 0.14, 0.012), std('#20262a', 0.3, 0.4), 0, -0.3, 0.035, false));
    [parent, vPriya, vKabir, walker, priya, jogger, resident, sitter].forEach((pp) => AC.posePerson(pp, 1, 0, false));
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
    const ball = mesh(new THREE.SphereGeometry(0.075, 12, 10), std('#d4e157', 0.6), 138, 0.075, 20); scene.add(ball);

    const ringGeo = new THREE.RingGeometry(1.1, 1.35, 40);
    const rings = new Map<StopId, THREE.Mesh>();
    for (const s of STOPS) { const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#e0662f', transparent: true, opacity: 0.85, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(s.pos[0], 0.09, s.pos[1]); scene.add(r); rings.set(s.id, r); }
    const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false }));
    marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);

    // treats to collect along the track: glowing marigold dog biscuits
    const TREATS = 8;
    const boneGeo = merge([xf(new THREE.CylinderGeometry(0.05, 0.05, 0.24, 8), 1, 1, 1, 0, 0, 0, 0, 0, Math.PI / 2), ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => new THREE.SphereGeometry(0.07, 10, 8).translate(a * 0.13, b * 0.05, 0))]);
    const treatM = new THREE.MeshStandardMaterial({ color: '#f5b03c', emissive: '#e0662f', emissiveIntensity: 0.55, roughness: 0.35 });
    const glowTex = canvasTex(64, 64, (g) => { const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, 'rgba(255,196,96,.85)'); grd.addColorStop(1, 'rgba(255,196,96,0)'); g.fillStyle = grd; g.fillRect(0, 0, 64, 64); });
    const tOf = (x: number, z: number) => { let bt2 = 0, bd = 1e9; for (let i = 0; i < 300; i++) { const p = loop.getPointAt(i / 300), d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; bt2 = i / 300; } } return bt2; };
    const treatT = [tOf(5, -19) + 5.5 / loopLen, tOf(-30, 0.4) - 5.5 / loopLen, tOf(31, -4) - 6 / loopLen];
    for (const gap of [0.075, 0.04, 0]) for (let i = 0; i < 16 && treatT.length < TREATS; i++) { const t = (tStart + (i * 5 + 0.55) / 16) % 1; if (treatT.every((u) => Math.min(Math.abs(u - t), 1 - Math.abs(u - t)) > gap)) treatT.push(t); }
    const treats = Array.from({ length: treatT.length }, (_, i) => {
      const p = along(loop, treatT[i], i < 3 ? 0 : [-1.25, 0, 1.25][i % 3]);
      const g = new THREE.Group(); g.position.set(p.x, 0.62, p.z);
      const b = mesh(boneGeo, treatM); b.scale.setScalar(1.25); g.add(b);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.setScalar(1.5); g.add(sp);
      scene.add(g); return { g, b, sp, got: 0, done: false };
    });
    let treatN = 0;

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
    const keys = new Set<string>();
    let queue: THREE.Vector3[] = [];
    let yaw = Math.PI * 0.5, pitch = 0.38; const dist = 8.4, SPEED = 3.7, PACE = 0.8;
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
      const tgt = walker.g.position.clone().add(V(0, 1.2, 0));
      const dv = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
      let d = dist;
      for (let i = 1; i <= 12; i++) { const dd = (dist * i) / 12; if (camHit(tgt.x + dv.x * dd, tgt.y + dv.y * dd, tgt.z + dv.z * dd)) { d = Math.max(2.4, (dist * (i - 1)) / 12 - 0.3); break; } }
      camDist = d < camDist || snap ? d : camDist + (d - camDist) * 0.08;
      const want = tgt.clone().add(dv.multiplyScalar(camDist));
      if (snap) { camPos.copy(want); camLook.copy(tgt); } else { camPos.lerp(want, 0.14); camLook.lerp(tgt, 0.2); }
    }
    function collide(p: THREE.Vector3) {
      p.x = THREE.MathUtils.clamp(p.x, -128, 151); p.z = THREE.MathUtils.clamp(p.z, -78, 92);
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
      if (!doneSet.has(id)) { doneSet.add(id); setDone(Array.from(doneSet)); rings.get(id)!.visible = false; if (doneSet.size === 4) msg += ' All four stops done. End the walk when you are ready.'; }
      say(msg);
    }
    const goToPoint = (p: THREE.Vector3) => {
      queue = p.distanceTo(walker.g.position) < 30 && clearLine(walker.g.position, p) ? [p.clone()] : routeTo(walker.g.position, p);
      marker.visible = true; marker.position.set(p.x, 0.1, p.z);
    };

    /* ---- actors inside the flat ---- */
    interface Actor { g: THREE.Group; dest: THREE.Vector3 | null; speed: number }
    const actor = (g: THREE.Group, speed: number): Actor => ({ g, dest: null, speed });
    const aVisitor = actor(visitor.g, 1.5), aDog = actor(dog.g, 2), aCat = actor(homeCat.g, 1.2);
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
      flat.visible = true; doorOpen = doorTarget = 0; leashInFlat = false; dogSitFlat = false; fill = fillTarget = id === 'cat' ? 0 : 1;
      visitor = id === 'dog' ? vPriya : vKabir; aVisitor.g = visitor.g; vPriya.g.visible = id === 'dog'; vKabir.g.visible = id === 'cat';
      visitor.g.position.set(-8, 0, 1.6); visitor.g.rotation.set(0, Math.PI / 2, 0); aVisitor.dest = null;
      Object.assign(visitor.c, { crouch: 0, reach: [0, 0], leash: -1 }); Object.assign(parent.c, { wave: [0, 0], twist: 0, look: 0 });
      wand.position.y = -5;
      const nl = label(id === 'dog' ? 'Priya' : 'Kabir', { scale: 0.13 }); vLabel.material.map?.dispose(); vLabel.material = nl.material; vLabel.scale.copy(nl.scale);
      if (id === 'dog') {
        parent.g.visible = pLabel.visible = true; homeCat.g.visible = false;
        flat.add(dog.g); dog.g.position.set(1.2, 0, -1.6); dog.g.rotation.set(0, 1.2, 0); aDog.dest = null;
      } else {
        parent.g.visible = pLabel.visible = false; homeCat.g.visible = true;
        homeCat.g.position.set(-1.6, 0.48, -3.25); homeCat.g.rotation.set(0, 0.3, 0); aCat.dest = null;
      }
    }
    const L = (x: number, z: number) => V(x, 0, z);
    const DOG_BEATS: Beat[] = [
      { dur: 6, text: '9:40 am, Tower 5, flat 1204. Ananya has calls until noon. Biscuit has other plans.', cam: fc(-0.5, 2.3, 6.4, 0.6, 0.9, -1.2), start: () => { aDog.dest = L(-1.5, 1.2); }, update: (t) => { if (t > 3.6 && !aDog.dest) { dog.g.rotation.y += (-1.5 - dog.g.rotation.y) * 0.08; dogSitFlat = true; } } },
      { dur: 5.5, img: '/real/meet-greet.jpg', text: 'The doorbell. Priya lives in Tower 3, is Aadhaar-verified, and met Biscuit at last week\'s meet-and-greet.', cam: fc(-1.2, 1.9, 5.6, -3.2, 0.95, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); dogSitFlat = false; }, update: (t) => { if (t > 1.6) doorTarget = 1; if (t > 2.4 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-3.2, 1.5); if (t > 2.2) aDog.dest = L(-2.15, 1.35); } },
      { dur: 5.5, text: 'A proper hello first. Then the leash goes on, with poop bags and a towel packed.', cam: fc(-1.9, 1.25, 3.9, -2.7, 0.7, 1.4), start: () => { hearts(wpos(dog.g, 0.9), 6, 0.22); Object.assign(parent.c, { wave: [0, 1], twist: 0.9, look: 0.5, type: 0 }); dogSitFlat = true; },
        update: (t) => { visitor.c.crouch = t < 3.2 ? 1 : 0; visitor.c.reach[0] = t > 0.4 && t < 3.2 ? 1 : 0; if (t > 2.6) { leashInFlat = true; visitor.c.leash = 0; } if (t > 3.5) Object.assign(parent.c, { wave: [0, 0], twist: 0, look: 0, type: 1 }); } },
      { dur: 4.5, text: 'Out they go. Ananya is back on her call before the lift arrives.', cam: fc(1.5, 2.2, 6.4, -2.5, 0.9, 0.8), start: () => { visitor.c.crouch = 0; visitor.c.reach[0] = 0; dogSitFlat = false; aVisitor.dest = L(-8.5, 1.6); }, update: (t) => { if (t > 0.5) aDog.dest = L(-8, 2.2); if (t > 3.4) doorTarget = 0; } },
      { dur: 9, img: '/real/hero.jpg', text: 'Down to the jogging track. Live GPS and a photo every 15 minutes go to Ananya\'s phone.', cam: [0, 0, 0, 0, 0, 0], start: () => { toWorld(); queue = routeTo(walker.g.position, V(31, 0, -4)); autoWalk = true; } },
    ];
    const CAT_BEATS: Beat[] = [
      { dur: 5, img: '/real/cat-window.jpg', text: 'Meera is travelling for work. Lily stays home, where cats are happiest.', cam: fc(-0.5, 1.5, 0.6, -1.6, 0.62, -3.25) },
      { dur: 5.5, text: 'Kabir from Tower 8 lets himself in with a one-time door code. Meera gets a ping the moment it opens.', cam: fc(-1.2, 1.9, 5.6, -3.2, 0.95, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); }, update: (t) => { if (t > 1.5) doorTarget = 1; if (t > 2.3 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-2.6, 1.4); if (t > 4.5) doorTarget = 0; } },
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
    function toWorld(fromFlat = true) {
      dissolve();
      flat.visible = false; scene.add(dog.g); leashInFlat = false; dogMode = 'follow';
      if (fromFlat) { walker.g.position.set(100, 0, -8.5); walker.g.rotation.y = Math.PI; dog.g.position.set(100.8, 0, -9.1); dog.g.rotation.set(0, Math.PI, 0); yaw = Math.PI - 0.75; pitch = 0.3; }
      else { walker.g.position.set(70, 0, -13); walker.g.rotation.y = -Math.PI / 2; dog.g.position.set(69.3, 0, -13.8); dog.g.rotation.set(0, -Math.PI / 2, 0); yaw = Math.PI / 2 - 0.3; pitch = 0.3; }
      followCam(true);
    }
    function resetWalk() {
      minutes = 0; meters = 0; photoCount = 0; doneSet.clear(); setDone([]); rings.forEach((r) => (r.visible = true)); setPhotos([]);
      ballFlight = null; ballHeld = false; ball.position.set(138, 0.075, 20); queue = []; marker.visible = false; autoWalk = false;
      treatN = 0; setTreats(0); treats.forEach((t) => { t.got = 0; t.done = false; t.g.visible = true; t.b.scale.setScalar(1.25); (t.sp.material as THREE.SpriteMaterial).opacity = 1; });
    }
    function nextBeat() {
      bi++; bt = 0;
      if (bi >= beats.length) {
        if (storyId === 'dog') { autoWalk = false; m = 'walk'; setMode('walk'); setCaption(null); say(dirOn ? 'Now the walk: four stops along the track.' : 'Your turn. Walk Biscuit to the four stops.'); }
        else { dissolve(); m = 'catdone'; setMode('catdone'); setCaption(null); flat.visible = false; camSnap = true; }
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
      play: (id) => { dissolve(); resetWalk(); storyId = id; setStory(id); setupFlat(id); beats = id === 'dog' ? DOG_BEATS : CAT_BEATS; bi = -1; camSnap = true; setM('story'); nextBeat(); },
      skip: () => { if (storyId === 'dog') { if (flat.visible) toWorld(); bi = beats.length; nextBeat(); } else { bi = beats.length; nextBeat(); } },
      explore: () => { resetWalk(); storyId = 'dog'; setStory('dog'); toWorld(false); setCaption(null); setM('walk'); wrap.focus({ preventScroll: true }); },
      menu: () => { dissolve(); flat.visible = false; if (dog.g.parent !== scene) scene.add(dog.g); beats = []; setCaption(null); camSnap = true; setM('menu'); },
      goTo: (id) => { const s = STOPS.find((x) => x.id === id)!; goToPoint(V(s.pos[0], 0, s.pos[1])); },
      act: (id) => {
        const s = STOPS.find((x) => x.id === id)!;
        if (id === 'cat') { hearts(cat.g.position.clone().add(V(0, 0.5, 0)), 8); dogMode = 'sit'; dogTimer = 2.6; finish(s.done, id); }
        if (id === 'hello') {
          wave = 2.4; if (bubble) scene.remove(bubble);
          bubble = label('Morning! Biscuit looks so happy.', { scale: 0.6 }); bubble.position.set(priya.g.position.x, 2.75, priya.g.position.z); scene.add(bubble); bubbleT = 4;
          finish(s.done, id);
        }
        if (id === 'water') { dogMode = 'drink'; dogTimer = 0; say('Biscuit is drinking...'); }
        if (id === 'fetch' && !ballFlight && dogMode === 'follow') {
          const from = walker.arms[1].end.getWorldPosition(V());
          const fwd = V(142, 0, 22).sub(walker.g.position).setY(0).normalize();
          const to = walker.g.position.clone().add(fwd.multiplyScalar(8));
          to.x = THREE.MathUtils.clamp(to.x, px0 + 1.5, px1 - 1.5); to.z = THREE.MathUtils.clamp(to.z, pz0 + 1.5, pz1 - 1.5); to.y = 0.075;
          ballFlight = { from, to, t: 0 }; ballHeld = false; dogMode = 'go'; say('Go get it, Biscuit!');
        }
      },
      photo: () => {
        renderer.render(scene, camera);
        const c = document.createElement('canvas'); c.width = 240; c.height = 160;
        const g = c.getContext('2d')!; const src = renderer.domElement;
        const ar = 240 / 160, sw = Math.min(src.width, src.height * ar), sh = sw / ar;
        g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, 240, 160);
        photoCount++; hearts(dog.g.position.clone().add(V(0, 0.95, 0)), 3);
        return c.toDataURL('image/jpeg', 0.8);
      },
    };

    /* ---- the director: plays the stories and the walk by itself, like a video ---- */
    const reducedMotion = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let dirOn = false, dirPaused = false, dirRun = 0, dirT = 0, half = false, touched = false, started = false, rip = 0, cutN = 0, simT = 0;
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
      yaw = r + Math.PI; pitch = 0.3; followCam(true); cutN++; showCursor();
    }
    async function direct(run: number) {
      const ok = () => run === dirRun && dirOn;
      const w0 = wrap.getBoundingClientRect(); cursor.x = w0.width * 0.5; cursor.y = w0.height * 0.3;
      let first = true;
      while (ok()) {
        // 1. the cards
        if ((m as Mode) !== 'menu') api.current!.menu();
        setNight(false);
        await sleep(0.4); showCursor(); await sleep(first ? 1.1 : 0.5); first = false; if (!ok()) return;
        // 2. the dog walk: the story in the flat, then the four stops on the track
        await tap('card-dog', () => api.current!.play('dog'), true); if (!ok()) return;
        await until(() => (m as Mode) === 'walk', 60); if (!ok()) return;
        await sleep(0.6);
        if (!listRef.current) await tap('list', () => setListOpen(true));
        for (const s of STOPS) {
          if (!ok()) return;
          if (s.id === 'fetch') { await tap('photo', () => photoRef.current()); await sleep(0.3); await tap('night', () => setNight(true)); await sleep(0.2); }
          await tap(`go-${s.id}`, () => { cutTo(V(s.pos[0], 0, s.pos[1])); api.current!.goTo(s.id); }); if (!ok()) return;
          await until(() => nearId === s.id && !queue.length, 9); if (!ok()) return;
          await tap('act', () => api.current!.act(s.id)); if (!ok()) return;
          await until(() => doneSet.has(s.id), 8); await sleep(s.id === 'hello' ? 1.2 : s.id === 'cat' ? 1.3 : 0.4);
        }
        if (!ok()) return;
        await tap('end', () => { minutes = Math.max(minutes, 58); setStats({ minutes, km: meters / 1000, photos: photoCount }); setM('ended'); }, true); await sleep(4.3); if (!ok()) return;
        // 3. the cat visit
        await tap('back', () => { api.current!.menu(); setNight(false); }); await sleep(0.8); if (!ok()) return;
        await tap('card-cat', () => api.current!.play('cat'), true); if (!ok()) return;
        await until(() => (m as Mode) === 'catdone', 60); await sleep(4); if (!ok()) return;
        // 4. back to the start
        await tap('back', () => api.current!.menu()); await sleep(0.6);
      }
    }
    const startDirector = () => { dirWaits = []; dirOn = true; dirPaused = false; started = true; dirRun++; setDir('play'); void direct(dirRun); };
    const stopDirector = () => { if (!dirOn) return; dirOn = false; dirPaused = false; dirRun++; dirWaits = []; setDir('off'); setDemo((d) => ({ ...d, on: false })); };
    api.current.dirStart = startDirector;
    api.current.dirPause = (p) => { if (!dirOn) return; dirPaused = p; setDir(p ? 'pause' : 'play'); };
    // taking over: a real press, tap, drag or key inside the world stops the director at once
    let touchDown: number | null = null;
    const realDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest?.('[data-pp-dir]')) return;
      if (e.pointerType === 'touch') { touchDown = e.pointerId; return; } // a touch that turns into a page scroll is cancelled by the browser, and is not a take-over
      touched = true; stopDirector();
    };
    const realUp = (e: PointerEvent) => { if (touchDown === e.pointerId) { touchDown = null; touched = true; stopDirector(); } };
    const realCancel = (e: PointerEvent) => { if (touchDown === e.pointerId) touchDown = null; };
    wrap.addEventListener('pointerdown', realDown, true); wrap.addEventListener('pointerup', realUp, true); wrap.addEventListener('pointercancel', realCancel, true);

    // test hook, only with #ppdebug in the address: lets a test place the camera and the walker
    const dbg: { cam: number[] | null; rel: number[] | null; [k: string]: unknown } | null = location.hash.includes('ppdebug') ? { cam: null, rel: null, speed: 1, tp: (x: number, z: number, r = 0) => { walker.g.position.set(x, 0, z); walker.g.rotation.y = r; dog.g.position.set(x - Math.cos(r) * 0.8 + Math.sin(r) * 0.8, 0, z + Math.sin(r) * 0.8 + Math.cos(r) * 0.8); dog.g.rotation.y = r; yaw = r + Math.PI; followCam(true); }, look: (y: number, p: number) => { yaw = y; pitch = p; }, night: (n: number) => { nightTarget = n; }, flat: F, keys, state: () => ({ m, bi, dirOn, dirT: Math.round(dirT * 10) / 10, near: nearId, done: Array.from(doneSet), treats: treatN, story: storyId }) } : null;
    if (dbg) (window as unknown as { __ppw: unknown }).__ppw = dbg;

    /* ---- input ---- */
    const onKey = (e: KeyboardEvent) => {
      if (dirOn) { if (e.type !== 'keydown' || !wrap.contains(document.activeElement)) return; touched = true; stopDirector(); }
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
      yaw -= dx * 0.006; pitch = THREE.MathUtils.clamp(pitch + dy * 0.004, 0.1, 1.2);
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

    let viewShift = small ? 0.12 : 0.2, sideShift = 0;
    const applyShift = () => { const w = wrap.clientWidth, h = wrap.clientHeight; if (Math.abs(viewShift) < 0.002 && sideShift < 0.002) camera.clearViewOffset(); else camera.setViewOffset(w, h, sideShift * w, viewShift * h, w, h); };
    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 64 : 52; camera.updateProjectionMatrix(); applyShift(); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; half = e.intersectionRatio >= 0.5; }, { threshold: [0.01, 0.5] }); io.observe(wrap);
    const autoplay = !reducedMotion && (!dbg || location.hash.includes('ppauto'));

    /* ---- loop ---- */
    const clock = new THREE.Clock(); let raf = 0;
    const tmp = V(), fwd = V(), right = V();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      let dt = Math.min(clock.getDelta(), 0.05) * (dbg ? (dbg.speed as number) : 1);
      if (!visible || document.hidden) return; // off screen or in a hidden tab: the picture and the director both wait
      if (autoplay && !started && !touched && half) startDirector();
      if (dirOn && dirPaused) dt = 0;
      else if (dirOn) { dirT += dt; for (let i = dirWaits.length - 1; i >= 0; i--) { const w = dirWaits[i]; if (dirT >= w.t || w.cond?.()) { dirWaits.splice(i, 1); w.res(); } } }
      const time = (simT += dt);
      const inFlat = m === 'story' && flat.visible;
      const walking = m === 'walk' || (m === 'story' && !flat.visible);

      // story timeline
      if (m === 'story' && bi >= 0 && bi < beats.length) { bt += dt; beats[bi].update?.(bt, dt); if (bt >= (!dirOn ? beats[bi].dur : storyId === 'dog' && bi === 4 ? 5.5 : beats[bi].dur * 0.86)) nextBeat(); } // the director keeps a slightly brisker pace
      if (inFlat) {
        const dv = stepActor(aVisitor, dt); visitor.phase += dv * AC.stride(0); AC.posePerson(visitor, dt, time, dv > 0);
        if (storyId === 'dog') { const dd = stepActor(aDog, dt); dog.phase += dd * AC.DOG_STRIDE * 1.5; AC.poseDog(dog, dt, time, dd > 0, { sit: dogSitFlat, walk: true, wag: 1.3 }); AC.posePerson(parent, dt, time, false); }
        else { const dc = stepActor(aCat, dt); homeCat.phase += dc * AC.CAT_STRIDE; AC.poseCat(homeCat, dt, time, dc > 0, true); }
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
        let reach = 1e9; // never step past the point we are walking to, however slow the frame was
        if (tmp.lengthSq() === 0 && queue.length) {
          tmp.copy(queue[0]).sub(walker.g.position).setY(0); reach = tmp.length();
          if (reach < (queue.length > 1 ? 1.2 : 0.35)) { queue.shift(); if (!queue.length) marker.visible = false; tmp.set(0, 0, 0); }
        }
        if (tmp.lengthSq() > 0 && dogMode !== 'drink') {
          tmp.normalize(); const before = walker.g.position.clone();
          walker.g.position.addScaledVector(tmp, Math.min(SPEED * dt, reach)); collide(walker.g.position);
          const moved = walker.g.position.distanceTo(before); meters += moved; walker.phase += moved * AC.stride(PACE); moving = moved > 0.001;
          let d = Math.atan2(tmp.x, tmp.z) - walker.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); walker.g.rotation.y += d * Math.min(1, dt * 10);
          if (autoWalk || (queue.length && !drag)) { let yd = walker.g.rotation.y + Math.PI - yaw; yd = Math.atan2(Math.sin(yd), Math.cos(yd)); yaw += yd * Math.min(1, dt * 1.2); }
        }
        if (m === 'walk') { minutes += dt / 3; if (minutes >= 60) setM('ended'); }
        AC.posePerson(walker, dt, time, moving, PACE);

        // dog on the leash
        const dp = dog.g.position; const wrot = walker.g.rotation.y; let dogDest: THREE.Vector3;
        if (dogMode === 'go') dogDest = (ballFlight ? ballFlight.to : ball.position).clone().setY(0);
        else if (dogMode === 'drink') dogDest = V(38, 0, -2.12);
        else dogDest = walker.g.position.clone().add(V(Math.cos(wrot), 0, -Math.sin(wrot)).multiplyScalar(-0.8)).add(V(Math.sin(wrot), 0, Math.cos(wrot)).multiplyScalar(0.8));
        tmp.copy(dogDest).sub(dp).setY(0); const dd = tmp.length();
        const dogSpeed = dogMode === 'go' || dogMode === 'back' ? 7.5 : Math.min(6.5, dd * 5);
        let dogMoving = false;
        if (dd > 0.12 && dogMode !== 'sit' && !(dogMode === 'drink' && dd < 0.5)) {
          tmp.normalize(); const st = Math.min(dd, dogSpeed * dt); dp.addScaledVector(tmp, st); dog.phase += st * AC.DOG_STRIDE; dogMoving = st > 0.004;
          let d = Math.atan2(tmp.x, tmp.z) - dog.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); dog.g.rotation.y += d * Math.min(1, dt * 9);
        }
        const drinking = dogMode === 'drink' && dd < 0.6;
        if (drinking) { let d = Math.atan2(38 - dp.x, -1.6 - dp.z) - dog.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); dog.g.rotation.y += d * Math.min(1, dt * 6); }
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
        (inFlat ? visitor : walker).arms[0].end.getWorldPosition(lA);
        if (inFlat || dogMode === 'follow' || dogMode === 'sit' || dogMode === 'drink') dog.ring.getWorldPosition(lB);
        else lB.set(lA.x + Math.sin(time * 2.4) * 0.03, lA.y - 0.5, lA.z); // unclipped for fetch: it hangs looped from the hand
        drawLeash(leash, lA, lB);
      }

      // menu / end: slow aerial orbit of the whole community
      if (m === 'menu' || m === 'catdone') {
        // a high bird's-eye, like the master plan: all ten towers, with the pool and the track between the two rows
        const a = Math.PI / 2 + Math.sin(time * 0.06) * 0.32; tmp.set(10 + Math.cos(a) * 100, 395, 2 + Math.sin(a) * 100);
        if (camSnap) { camPos.copy(tmp); camLook.set(10, 0, 2); camSnap = false; } else { camPos.lerp(tmp, 0.04); camLook.lerp(tmp.set(10, 0, 2), 0.05); }
      }
      if (m === 'ended') followCam();
      if (dbg?.cam) { camPos.set(dbg.cam[0], dbg.cam[1], dbg.cam[2]); camLook.set(dbg.cam[3], dbg.cam[4], dbg.cam[5]); }
      if (dbg?.rel) { const r = walker.g.rotation.y, c = Math.cos(r), sn = Math.sin(r), o = dbg.rel; camPos.set(walker.g.position.x + o[0] * c + o[2] * sn, o[1], walker.g.position.z - o[0] * sn + o[2] * c); camLook.set(walker.g.position.x + (o[3] ?? 0) * c, o[4] ?? 0.85, walker.g.position.z - (o[3] ?? 0) * sn); }
      // behind the story cards the picture slides up, and behind the payment summary it slides aside, so nothing important is covered
      const wantShift = m === 'menu' ? (small ? 0.12 : 0.2) : m === 'ended' && small ? -0.33 : 0, wantSide = m === 'ended' && !small ? 0.34 : 0;
      if (Math.abs(wantShift - viewShift) > 0.001 || Math.abs(wantSide - sideShift) > 0.001) { const k = Math.min(1, Math.max(dt, 0.016) * 3); viewShift += (wantShift - viewShift) * k; sideShift += (wantSide - sideShift) * k; applyShift(); }
      camera.position.copy(camPos); camera.lookAt(camLook);

      // neighbours and traffic
      const tj = (time * 0.02) % 1; const pj = along(loop, tj, 1.3), pj2 = along(loop, (tj + 0.004) % 1, 1.3);
      jogger.g.position.copy(pj); jogger.g.lookAt(pj2.x, 0, pj2.z);
      jogger.phase = time * loopLen * 0.02 * AC.stride(1); AC.posePerson(jogger, dt, time, true, 1);
      const t2 = 1 - ((time * 0.008 + 0.4) % 1); const pr = along(loop, t2, -1.2), pr2 = along(loop, (t2 + 0.996) % 1, -1.2);
      resident.g.position.copy(pr); resident.g.lookAt(pr2.x, 0, pr2.z);
      resident.phase = time * loopLen * 0.008 * AC.stride(0); AC.posePerson(resident, dt, time, true, 0);
      const pd = along(loop, (t2 + 0.9955) % 1, -1.2), fx2 = pr2.x - pr.x, fz2 = pr2.z - pr.z, fl = Math.hypot(fx2, fz2) || 1;
      dog2.g.position.set(pd.x - (fz2 / fl) * 0.7, 0, pd.z + (fx2 / fl) * 0.7); dog2.g.lookAt(dog2.g.position.x + fx2, 0, dog2.g.position.z + fz2);
      dog2.phase = time * loopLen * 0.008 * AC.DOG_STRIDE * 1.5; AC.poseDog(dog2, dt, time, true, { walk: true });
      drawLeash(leash2, resident.arms[0].end.getWorldPosition(lA), dog2.ring.getWorldPosition(lB));
      const td = (time * 0.012) % 1; const pc = along(ring, td, -1.6), pc2 = ring.getTangentAt(td); driver.position.copy(pc); driver.rotation.y = Math.atan2(pc2.x, pc2.z);
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
      setRange(!inFlat && !walking && m !== 'ended');
      const focus = inFlat ? F : walking || m === 'ended' ? walker.g.position : tmp.set(12, 0, 2);
      sun.target.position.copy(focus); sun.position.copy(focus).add(SUN_OFF);
      nightF += (nightTarget - nightF) * Math.min(1, dt * 2.5);
      skyU.top.value.copy(DAY.top).lerp(NIGHT.top, nightF); skyU.bottom.value.copy(DAY.bottom).lerp(NIGHT.bottom, nightF);
      (scene.fog as THREE.Fog).color.copy(DAY.fog).lerp(NIGHT.fog, nightF);
      sun.intensity = 2.6 * (1 - nightF) + 0.25 * nightF; sun.color.set(nightF > 0.5 ? '#b9c9ff' : '#fff1d6'); hemi.intensity = 0.9 - nightF * 0.6;
      windowMats.forEach((w) => (w.emissiveIntensity = nightF * 1.3)); bulbs.forEach((b) => (b.emissiveIntensity = 0.1 + nightF * 2.6));
      scene.environmentIntensity = 0.35 - nightF * 0.25;
      if (inFlat) { sun.intensity *= 0.28; hemi.intensity *= 0.5; scene.environmentIntensity *= 0.6; }
      renderer.toneMappingExposure = inFlat ? 0.92 : 1.05;

      if (m === 'walk') {
        let n: StopId | null = null;
        for (const s of STOPS) { if (doneSet.has(s.id)) continue; if (Math.hypot(walker.g.position.x - s.pos[0], walker.g.position.z - s.pos[1]) < 4.5) { n = s.id; break; } }
        if (n !== nearId) { nearId = n; setNear(n); }
        if (time - lastHud > 0.25) { lastHud = time; setStats({ minutes, km: meters / 1000, photos: photoCount }); }
        for (const t of treats) {
          if (t.done || t.got > 0) continue;
          const g = t.g.position;
          if (Math.hypot(g.x - dog.g.position.x, g.z - dog.g.position.z) < 1.2 || Math.hypot(g.x - walker.g.position.x, g.z - walker.g.position.z) < 1.25) {
            t.got = 0.001; treatN++; setTreats(treatN); hearts(V(g.x, 0.9, g.z), 2, 0.24);
            if (treatN === 1) say('Biscuit found a treat. Seven more are waiting along the track.'); else if (treatN === treats.length) say('All eight treats found. Biscuit is thrilled.');
          }
        }
      }
      treats.forEach((t, i) => {
        if (t.done) return;
        t.b.rotation.y = time * 1.8 + i; t.g.position.y = 0.62 + Math.sin(time * 2.2 + i) * 0.07 + t.got * 2;
        if (t.got > 0) { t.got += dt; const k = t.got / 0.4; t.b.scale.setScalar(1.25 * (k < 0.5 ? 1 + k * 1.6 : Math.max(0.01, 3.6 * (1 - k)))); (t.sp.material as THREE.SpriteMaterial).opacity = Math.max(0, 1 - k); if (k >= 1) { t.done = true; t.g.visible = false; } }
        else t.sp.scale.setScalar(1.5 + Math.sin(time * 3 + i) * 0.2);
      });
      renderer.render(scene, camera);
      if (frames < 3 && ++frames === 3) setReady(true); // textures and shaders are in: let the picture fade up over the poster
    };
    let frames = 0;
    camPos.set(10, 395, 102); camLook.set(10, 0, 2);
    tick();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); dirOn = false; dirWaits = [];
      wrap.removeEventListener('pointerdown', realDown, true); wrap.removeEventListener('pointerup', realUp, true); wrap.removeEventListener('pointercancel', realCancel, true);
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); window.removeEventListener('blur', blur);
      scene.traverse((o) => {
        const me = o as THREE.Mesh; if (me.geometry) me.geometry.dispose();
        const mats = Array.isArray(me.material) ? me.material : me.material ? [me.material] : [];
        mats.forEach((mm) => { const sm = mm as THREE.MeshStandardMaterial; sm.map?.dispose(); sm.emissiveMap?.dispose(); mm.dispose(); });
      });
      pmrem.dispose(); renderer.dispose(); api.current = null;
    };
  }, []);

  useEffect(() => { api.current?.setNight(night); }, [night]);
  useEffect(() => { api.current?.sync(mode); }, [mode]);

  const takePhoto = () => { const url = api.current?.photo(); if (url) { setPhotos((p) => [url, ...p].slice(0, 3)); say('Photo sent to Ananya, Biscuit\'s parent.'); } };
  photoRef.current = takePhoto;
  const nearStop = STOPS.find((s) => s.id === near);
  const mins = Math.floor(stats.minutes);
  const share = Math.round(PRICE * 0.7 * 100) / 100;
  const glassBtn: React.CSSProperties = { ...glass, borderRadius: 999, padding: '10px 16px', fontFamily: head, fontWeight: 700, fontSize: 13.5, color: T.ink, cursor: 'pointer', minHeight: 42 };
  const kicker: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: T.leaf, marginBottom: 8 };

  const CARDS: { id: StoryId | 'free'; k: string; t: string; d: string; cta: string; img: string; pos: string }[] = [
    { id: 'dog', k: 'Story · 30 seconds', t: 'The dog walk', d: 'Ananya is on calls in her flat. Priya arrives at the door, says hello to Biscuit, clips the leash on and heads down to the track. Then you take over.', cta: 'Watch the dog walk', img: '/real/meet-greet.jpg', pos: '45% 40%' },
    { id: 'cat', k: 'Story · 35 seconds', t: 'The cat visit', d: 'Meera is travelling. Kabir lets himself in with a one-time code, then feeds Lily, cleans the litter and plays with her at home.', cta: 'Watch the cat visit', img: '/real/cat-visit.jpg', pos: '55% 40%' },
    { id: 'free', k: 'Free roam', t: 'Explore the community', d: 'Ten towers, the ring road, the jogging track, the pool, the clubhouse and the pet garden. Walk Biscuit wherever you like.', cta: 'Start walking', img: '/real/community.jpg', pos: '50% 60%' },
  ];

  return (
    <div ref={wrapRef} tabIndex={-1} className="pp-world" style={{ position: 'relative', height: 'clamp(600px, 84vh, 800px)', borderRadius: 'clamp(20px, 3vw, 30px)', overflow: 'hidden', background: '#9fc39a url(/real/world-poster.jpg) center / cover no-repeat', outline: 'none', boxShadow: '0 30px 80px rgba(20,48,31,.18)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', opacity: ready ? 1 : 0, transition: 'opacity .8s ease', touchAction: mode === 'walk' && dir === 'off' ? 'none' : 'pan-y', cursor: mode === 'walk' ? 'grab' : 'default' }} aria-label="3D model of a ten-tower gated community. Watch a story or walk Biscuit the dog through it." />

      <canvas ref={dissolveRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: 1 }} />
      {!webgl && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: T.leafPale, padding: 24, textAlign: 'center', fontFamily: body, color: T.sub }}>Your browser can't show the 3D community. Try the walk tracker below instead.</div>}

      {/* Story cards */}
      {webgl && mode === 'menu' && (
        <div className="pp-fade-in pp-world-menu" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(180deg, rgba(20,48,31,0) 30%, rgba(20,48,31,.45))', padding: 'clamp(12px, 2vw, 22px)', overflowY: 'auto' }}>
          <div className="pp-world-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'clamp(8px, 1.2vw, 14px)' }}>
            {CARDS.map((c) => (
              <div key={c.id} className="pp-world-card" style={{ ...glass, borderRadius: 22, padding: 'clamp(14px, 1.8vw, 20px)', display: 'flex', flexDirection: 'column' }}>
                <img className="pp-world-card-img" src={c.img} alt="" loading="lazy" style={{ width: '100%', height: 'clamp(84px, 13vh, 132px)', objectFit: 'cover', objectPosition: c.pos, borderRadius: 14, marginBottom: 12, display: 'block' }} />
                <div style={kicker}>{c.k}</div>
                <h3 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(18px, 1.8vw, 22px)', letterSpacing: '-0.02em', margin: '0 0 6px', color: T.ink }}>{c.t}</h3>
                <p className="pp-world-card-d" style={{ fontFamily: body, fontSize: 14, lineHeight: 1.55, color: T.sub, margin: '0 0 14px', flex: 1 }}>{c.d}</p>
                <button data-pp={`card-${c.id}`} className={`pp-glass-btn${c.id === 'dog' ? ' pp-glass-primary' : ''}`} style={{ fontSize: 14.5, padding: '11px 18px', minHeight: 44 }} onClick={() => (c.id === 'free' ? api.current?.explore() : api.current?.play(c.id))}>{c.cta}</button>
              </div>
            ))}
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
          <div className="pp-world-stats" style={{ ...glass, position: 'absolute', left: 12, top: 12, padding: '10px 14px', display: 'flex', gap: 16, fontFamily: body }}>
            {[[`${mins} min`, 'of 60'], [`${stats.km.toFixed(2)} km`, 'walked'], [`${stats.photos}`, 'photos'], [`${treats} of 8`, 'treats']].map(([v, l]) => (
              <div key={l}><div style={{ fontFamily: head, fontWeight: 800, fontSize: 17, color: T.ink, letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 11, color: T.muted }}>{l}</div></div>
            ))}
          </div>
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
          <div className="pp-world-hint" style={{ position: 'absolute', right: 14, bottom: 18, fontFamily: body, fontSize: 12, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>Arrow keys or WASD · drag to look · tap the ground to walk there</div>
        </>
      )}

      {/* Summaries */}
      {(mode === 'ended' || mode === 'catdone') && (
        <div className="pp-fade-in" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(20,48,31,.35)', padding: 14, overflowY: 'auto' }}>
          <div className="pp-modal-in" style={{ ...glass, background: 'rgba(255,255,255,.88)', borderRadius: 26, padding: 'clamp(18px, 3vw, 30px)', width: 'min(460px, 100%)', fontFamily: body }}>
            <div style={kicker}>{mode === 'ended' ? 'Walk complete' : 'Visit complete'}</div>
            <h3 style={{ fontFamily: head, fontWeight: 800, fontSize: 'clamp(21px, 2.6vw, 26px)', letterSpacing: '-0.02em', margin: '0 0 6px', color: T.ink }}>{mode === 'ended' ? 'The walk is over. Here\'s your payment.' : 'Lily is fed, clean and happy.'}</h3>
            <p style={{ fontSize: 14.5, color: T.sub, margin: '0 0 16px', lineHeight: 1.6 }}>
              {mode === 'ended'
                ? `${Math.max(1, mins)} min, ${stats.km.toFixed(2)} km, ${done.length} of 4 stops, ${treats} of 8 treats and ${stats.photos} photo${stats.photos === 1 ? '' : 's'} sent. Biscuit is home, towelled and happy.`
                : 'Food, water, litter, play and photos, all in her own home. Meera saw every step on her phone.'}
            </p>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: `1px solid ${T.line}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: head, fontWeight: 800, fontSize: 18, color: T.ink, marginBottom: 10 }}><span>{mode === 'ended' ? '1-hour walk' : '30-minute cat visit'}</span><span>₹{mode === 'ended' ? PRICE : 129}</span></div>
              <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}><div style={{ width: '70%', background: T.leafBright }} /><div style={{ flex: 1, background: T.marigold }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 13, color: T.sub }}><span>The neighbour: ₹{mode === 'ended' ? share.toFixed(2) : '90.30'}</span><span>ProxyPaw: ₹{mode === 'ended' ? (PRICE - share).toFixed(2) : '38.70'}</span></div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="pp-glass-btn pp-glass-primary" onClick={() => onJoin(mode === 'ended' ? '3d-walk' : '3d-cat-visit')} style={{ width: '100%' }}>Join the waitlist for the real thing</button>
              <button data-pp="back" className="pp-glass-btn" style={{ width: '100%' }} onClick={() => api.current?.menu()}>Back to the stories</button>
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
        @media (max-width: 860px) {
          .pp-world-cards { grid-template-columns: 1fr !important; }
          .pp-world-card-d { display: none; }
          .pp-world-card { flex-direction: row !important; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 14px !important; }
          .pp-world-card > div, .pp-world-card-img { display: none !important; }
          .pp-world-real { width: 72px !important; height: 56px !important; }
          .pp-world-card h3 { margin: 0 !important; flex: 1; }
          .pp-world-hint, .pp-world-photos { display: none !important; }
          .pp-world-dir { top: 62px !important; }
          .pp-world-stops { top: 110px !important; left: 10px !important; width: min(262px, calc(100% - 20px)) !important; padding: 9px !important; }
          .pp-world-stats { left: 10px !important; top: 10px !important; gap: 12px !important; padding: 8px 12px !important; }
          .pp-world-toast { bottom: 128px !important; }
        }
      `}</style>
    </div>
  );
}
