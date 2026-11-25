/**
 * CommunityWorld: a 3D gated community you can watch and walk through.
 *
 * The layout follows the published master plan of a ten-tower Hyderabad
 * community (ring road, inner walking loop, pool, clubhouse, pet garden).
 * Two watchable stories play inside a flat (the dog walker arriving at the
 * door, and a cat home visit); the dog story then hands you the leash: WASD or
 * arrow keys walk, dragging looks around, tapping the ground walks there along
 * the paths, and the checklist can auto-walk you to each stop. Built with
 * three.js, loaded lazily, rendered only while on screen.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { T, head, body } from './ui';

type StopId = 'water' | 'fetch' | 'hello' | 'cat';
interface Stop { id: StopId; label: string; verb: string; pos: [number, number]; done: string }
const STOPS: Stop[] = [
  { id: 'hello', label: 'Say hi to Priya by the pool', verb: 'Say hi to Priya', pos: [5, -19], done: 'Priya: "Morning! Biscuit looks so happy today."' },
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

/* ---------- characters ---------- */

function makePerson(shirt: string, pants: string, skin: string, hair: string) {
  const g = new THREE.Group();
  const mSkin = std(skin, 0.7), mShirt = std(shirt, 0.9), mPants = std(pants, 0.9), mHair = std(hair, 0.8), mShoe = std('#f2f2ee', 0.6);
  const legs: THREE.Group[] = [], arms: THREE.Group[] = [];
  for (const sx of [-0.11, 0.11]) {
    const p = new THREE.Group(); p.position.set(sx, 0.92, 0);
    p.add(mesh(new THREE.CapsuleGeometry(0.085, 0.66, 4, 10), mPants, 0, -0.44, 0));
    p.add(mesh(new THREE.BoxGeometry(0.13, 0.08, 0.26), mShoe, 0, -0.88, 0.04));
    g.add(p); legs.push(p);
  }
  g.add(mesh(new THREE.CapsuleGeometry(0.2, 0.42, 4, 12), mShirt, 0, 1.27, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.34, 14), mShirt, 0, 0.98, 0));
  const mEye = std('#1d1a17', 0.4);
  for (const sx of [-0.05, 0.05]) g.add(mesh(new THREE.SphereGeometry(0.017, 8, 6), mEye, sx, 1.77, 0.125, false));
  for (const sx of [-0.27, 0.27]) {
    const p = new THREE.Group(); p.position.set(sx, 1.47, 0);
    p.add(mesh(new THREE.CapsuleGeometry(0.065, 0.46, 4, 8), mShirt, 0, -0.22, 0));
    p.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), mSkin, 0, -0.52, 0));
    g.add(p); arms.push(p);
  }
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), mSkin, 0, 1.6, 0));
  g.add(mesh(new THREE.SphereGeometry(0.135, 20, 16), mSkin, 0, 1.75, 0));
  const hairM = mesh(new THREE.SphereGeometry(0.142, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), mHair, 0, 1.77, -0.012);
  g.add(hairM);
  return { g, legs, arms, shirt: mShirt };
}

function makeDog() {
  const g = new THREE.Group();
  const coat = std('#d9a05b', 0.92), light = std('#ecc58c', 0.92), dark = std('#b97c3d', 0.9), black = std('#1d1a17', 0.4);
  const bodyM = mesh(new THREE.CapsuleGeometry(0.25, 0.62, 6, 14), coat, 0, 0.62, 0); bodyM.rotation.x = Math.PI / 2; g.add(bodyM);
  g.add(mesh(new THREE.SphereGeometry(0.27, 16, 12), light, 0, 0.66, 0.3));
  const headG = new THREE.Group(); headG.position.set(0, 0.86, 0.46); g.add(headG);
  headG.add(mesh(new THREE.SphereGeometry(0.2, 18, 14), coat, 0, 0.1, 0.06));
  const snout = mesh(new THREE.CapsuleGeometry(0.085, 0.14, 4, 10), light, 0, 0.03, 0.24); snout.rotation.x = Math.PI / 2; headG.add(snout);
  headG.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), black, 0, 0.06, 0.35));
  for (const sx of [-0.075, 0.075]) headG.add(mesh(new THREE.SphereGeometry(0.026, 8, 6), black, sx, 0.15, 0.22));
  for (const sx of [-0.16, 0.16]) { const e = mesh(new THREE.SphereGeometry(0.1, 12, 10), dark, sx, 0.06, 0.0); e.scale.set(0.55, 1.35, 0.6); headG.add(e); }
  const collar = mesh(new THREE.TorusGeometry(0.15, 0.03, 8, 20), std('#e0662f', 0.6), 0, 0.8, 0.4); collar.rotation.x = Math.PI / 2.4; g.add(collar);
  const legs: THREE.Group[] = [];
  for (const [x, z] of [[-0.13, 0.28], [0.13, 0.28], [-0.13, -0.3], [0.13, -0.3]]) {
    const p = new THREE.Group(); p.position.set(x, 0.52, z);
    p.add(mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.46, 8), coat, 0, -0.23, 0));
    p.add(mesh(new THREE.SphereGeometry(0.075, 10, 8), light, 0, -0.47, 0.025));
    g.add(p); legs.push(p);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.72, -0.42); g.add(tail);
  const tm = mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8), light, 0, 0.2, 0); tm.scale.z = 1.5; tail.add(tm); tail.rotation.x = -0.95;
  return { g, legs, tail, headG };
}

function makeCat() {
  const g = new THREE.Group();
  const fur = std('#e8954a', 0.95), cream = std('#f6dcc0', 0.95), pink = std('#f3a1a6', 0.6), black = std('#1d1a17', 0.4);
  const b = mesh(new THREE.SphereGeometry(0.17, 16, 12), fur, 0, 0.17, 0); b.scale.set(1, 1.15, 1.25); g.add(b);
  g.add(mesh(new THREE.SphereGeometry(0.1, 12, 10), cream, 0, 0.17, 0.14));
  g.add(mesh(new THREE.SphereGeometry(0.12, 16, 12), fur, 0, 0.4, 0.07));
  for (const sx of [-0.07, 0.07]) {
    const ear = mesh(new THREE.ConeGeometry(0.045, 0.09, 4), fur, sx, 0.52, 0.06); ear.rotation.z = -sx * 2; g.add(ear);
    g.add(mesh(new THREE.SphereGeometry(0.018, 8, 6), black, sx * 0.65, 0.42, 0.18));
  }
  g.add(mesh(new THREE.SphereGeometry(0.016, 8, 6), pink, 0, 0.385, 0.19));
  const tail = new THREE.Group(); tail.position.set(0, 0.06, -0.18); g.add(tail);
  const tm = mesh(new THREE.CapsuleGeometry(0.035, 0.32, 4, 8), fur, 0.1, 0.02, -0.12); tm.rotation.z = 1.2; tm.rotation.y = 0.6; tail.add(tm);
  return { g, tail };
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
  } | null>(null);

  const [mode, setMode] = useState<Mode>('menu');
  const [story, setStory] = useState<StoryId | null>(null);
  const [caption, setCaption] = useState<{ text: string; i: number; n: number; img?: string } | null>(null);
  const [near, setNear] = useState<StopId | null>(null);
  const [done, setDone] = useState<StopId[]>([]);
  const [stats, setStats] = useState<Stats>({ minutes: 0, km: 0, photos: 0 });
  const [photos, setPhotos] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [night, setNight] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [listOpen, setListOpen] = useState(true);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.35;
    const DAY = { top: new THREE.Color('#6fb4e4'), bottom: new THREE.Color('#e6f2ee'), fog: new THREE.Color('#dcebe8') };
    const NIGHT = { top: new THREE.Color('#0c1a2e'), bottom: new THREE.Color('#2a3d4d'), fog: new THREE.Color('#1c2c38') };
    scene.fog = new THREE.Fog(DAY.fog.clone(), 120, 520);
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1600);

    const skyU = { top: { value: DAY.top.clone() }, bottom: { value: DAY.bottom.clone() } };
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(900, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y*1.5+0.06,0.0,1.0); gl_FragColor = vec4(mix(bottom, top, h),1.0); }',
      }),
    ));
    const hemi = new THREE.HemisphereLight('#dff3ff', '#5d8a4a', 0.9); scene.add(hemi);
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
      Object.assign(sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r }); sun.shadow.camera.updateProjectionMatrix();
      const f = scene.fog as THREE.Fog; f.near = aerial ? 320 : 120; f.far = aerial ? 1100 : 520;
    };

    /* ---- ground, roads, paths ---- */
    const grassTex = canvasTex(512, 512, (g) => {
      g.fillStyle = '#5f9c45'; g.fillRect(0, 0, 512, 512);
      const r = rand(7);
      for (let i = 0; i < 26000; i++) {
        g.strokeStyle = ['#4f8a3a', '#6fae4f', '#5a9440', '#7dbb5b', '#659f48', '#88c064', '#487f35'][Math.floor(r() * 7)];
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
        const grd = g.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, dark ? 'rgba(30,70,30,.34)' : 'rgba(190,225,120,.3)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = grd; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    });
    patchTex.wrapS = patchTex.wrapT = THREE.RepeatWrapping; patchTex.repeat.set(5, 5);
    const patches = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshBasicMaterial({ map: patchTex, transparent: true, depthWrite: false }));
    patches.rotation.x = -Math.PI / 2; patches.position.y = 0.012; scene.add(patches);

    const asphaltTex = canvasTex(64, 256, (g) => {
      g.fillStyle = '#8f9390'; g.fillRect(0, 0, 64, 256);
      const r = rand(3); for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? '#868a87' : '#999d9a'; g.fillRect(r() * 64, r() * 256, 2, 2); }
      g.fillStyle = '#e9e7df'; g.fillRect(0, 0, 3, 256); g.fillRect(61, 0, 3, 256);
      g.fillStyle = '#f4f2ea'; g.fillRect(30, 20, 4, 90);
    });
    asphaltTex.wrapS = asphaltTex.wrapT = THREE.RepeatWrapping;
    const roadM = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.95 });
    const graniteTex = canvasTex(128, 128, (g) => {
      g.fillStyle = '#c9cbc6'; g.fillRect(0, 0, 128, 128);
      const r = rand(5); for (let i = 0; i < 1600; i++) { g.fillStyle = ['#bfc1bc', '#d3d5d0', '#b4b6b1'][Math.floor(r() * 3)]; g.fillRect(r() * 128, r() * 128, 2, 2); }
      g.strokeStyle = '#aeb0ab'; g.lineWidth = 2; g.strokeRect(0, 0, 128, 128);
    });
    graniteTex.wrapS = graniteTex.wrapT = THREE.RepeatWrapping;
    const pathM = new THREE.MeshStandardMaterial({ map: graniteTex, roughness: 0.9 });
    const curve = (pts: [number, number][], closed: boolean): THREE.Curve<THREE.Vector3> => pts.length === 2 ? new THREE.LineCurve3(V(pts[0][0], 0, pts[0][1]), V(pts[1][0], 0, pts[1][1])) : new THREE.CatmullRomCurve3(pts.map(([x, z]) => V(x, 0, z)), closed, 'catmullrom', 0.5);
    const ring = curve(RING, true), loop = curve(LOOP, true);
    scene.add(ribbon(ring, 7, 500, 0.03, roadM));
    scene.add(ribbon(loop, 3.4, 300, 0.05, pathM));
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
      const lb = label(name, { scale: 1.5 }); lb.position.set(0, 7.5, -12.5); t.add(lb);
      scene.add(t); block(x, z, 19, 11, rot, 110);
    });

    /* ---- clubhouse, pools, courts, play area ---- */
    const club = new THREE.Group(); club.position.set(56, 0, 4); club.rotation.y = 0.42; scene.add(club);
    club.add(mesh(new THREE.BoxGeometry(24, 7, 18), std('#d6c2ab', 0.8), 0, 3.5, 0));
    const checker = canvasTex(128, 128, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#e9c9bd' : '#f6efe8'; g.fillRect(i * 16, j * 16, 16, 16); } });
    const roofTop = mesh(new THREE.PlaneGeometry(23, 17), new THREE.MeshStandardMaterial({ map: checker, roughness: 0.9 }), 0, 7.03, 0, false); roofTop.rotation.x = -Math.PI / 2; club.add(roofTop);
    club.add(mesh(new THREE.BoxGeometry(0.3, 4, 12), new THREE.MeshStandardMaterial({ color: '#9cc6d6', roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.8 }), -12.1, 2.6, 0, false));
    const clb = label('Clubhouse', { scale: 1.2 }); clb.position.set(-13, 6.5, 0); club.add(clb);
    block(56, 4, 13.5, 10.5, 0.42, 8);
    scene.add(mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.16, 20), std('#cfd6d8', 0.2, 0.9), 38, 0.08, -1.6));
    const bowlWater = mesh(new THREE.CircleGeometry(0.27, 20), new THREE.MeshStandardMaterial({ color: '#5fa8c9', roughness: 0.05 }), 38, 0.15, -1.6, false); bowlWater.rotation.x = -Math.PI / 2; scene.add(bowlWater);

    const poolTex = canvasTex(128, 128, (g) => { g.fillStyle = '#3f9fd0'; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, 128); g.moveTo(0, i * 16); g.lineTo(128, i * 16); g.stroke(); } });
    poolTex.wrapS = poolTex.wrapT = THREE.RepeatWrapping; poolTex.repeat.set(3, 2);
    const poolM = new THREE.MeshStandardMaterial({ map: poolTex, roughness: 0.05, metalness: 0.1 });
    const deckM = std('#e6dccb', 0.9);
    const lagoonDeck = mesh(new THREE.CircleGeometry(1, 48), deckM, 0, 0.04, -9, false); lagoonDeck.scale.set(8.6, 6.4, 1); lagoonDeck.rotation.x = -Math.PI / 2; scene.add(lagoonDeck);
    const lagoon = mesh(new THREE.CircleGeometry(1, 48), poolM, 0, 0.09, -9, false); lagoon.scale.set(7, 5, 1); lagoon.rotation.x = -Math.PI / 2; scene.add(lagoon);
    const rp = new THREE.Group(); rp.position.set(16, 0, -7); rp.rotation.y = 0.42; scene.add(rp);
    const rpd = mesh(new THREE.PlaneGeometry(15, 9), deckM, 0, 0.05, 0, false); rpd.rotation.x = -Math.PI / 2; rp.add(rpd);
    const rpw = mesh(new THREE.PlaneGeometry(12, 6), poolM, 0, 0.1, 0, false); rpw.rotation.x = -Math.PI / 2; rp.add(rpw);
    for (let i = 0; i < 4; i++) rp.add(mesh(new THREE.BoxGeometry(0.7, 0.25, 1.8), std('#f6f4ee', 0.7), -5 + i * 3.3, 0.3, 3.8));
    block(0, -9, 7.6, 5.6); block(16, -7, 6.6, 3.6, 0.42);

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
    const dpl = label('Pet garden', { scale: 1.1 }); dpl.position.set(141, 4, 22); scene.add(dpl);

    /* ---- garden: trees, palms, shrubs, beds, hedges ---- */
    const inBlock = (x: number, z: number, pad = 2) => blockers.some((b) => { const dx = x - b.x, dz = z - b.z; return Math.abs(dx * b.c - dz * b.s) < b.hw + pad && Math.abs(dx * b.s + dz * b.c) < b.hd + pad; });
    const tr = rand(42);
    const along = (c: THREE.Curve<THREE.Vector3>, t: number, off: number) => { const p = c.getPointAt(((t % 1) + 1) % 1), tan = c.getTangentAt(((t % 1) + 1) % 1); return V(p.x - tan.z * off, 0, p.z + tan.x * off); };
    const onPaving = (x: number, z: number) => {
      const near = (c: THREE.Curve<THREE.Vector3>, w: number, n: number) => { for (let i = 0; i <= n; i++) { const p = c.getPointAt(i / n); if (Math.hypot(p.x - x, p.z - z) < w) return true; } return false; };
      return near(ring, 5, 160) || near(loop, 2.6, 90) || linkCurves.some((c, i) => near(c, i === 0 ? 5 : 2.8, 24));
    };
    const free = (x: number, z: number, pad = 1.5) => !inBlock(x, z, pad) && !onPaving(x, z);

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
    const leafMat = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, vertexColors: true });
    const leafMs = ['#3f8f4f', '#4c9d55', '#5aa85c', '#37834a', '#6bb05f'].map(leafMat);
    const blossomMs = [leafMat('#e8556a'), leafMat('#f28a45'), leafMat('#f4b8c8')];
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
    const cards = new THREE.InstancedMesh(cardGeo, skyNormal(new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.4, roughness: 0.9 })), CARDS_MAX);
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
      if (!free(x, z, 1)) return;
      const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = tr() * 6.3;
      const h = (2.6 + tr() * 1.2) * s;
      const tk = mesh(trunkGeo, trunkM, 0, h / 2, 0); tk.scale.set(s, h, s); t.add(tk);
      const blossom = kind === 9, lm = blossom ? blossomMs[Math.floor(tr() * 3)] : leafMs[kind % leafMs.length];
      const tint = '#' + lm.color.getHexString();
      const n = 4 + Math.floor(tr() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 6.283 + tr(), rad = i === 0 ? 0 : (0.7 + tr() * 0.7) * s, br = (i === 0 ? 1.7 : 1.05 + tr() * 0.5) * s;
        const bx = Math.cos(a) * rad, bz = Math.sin(a) * rad, by = h + (i === 0 ? 1.1 * s : (0.3 + tr() * 1.1) * s);
        const c = mesh(canopyGeos[i % 3], i % 2 && blossom ? leafMs[1] : lm, bx, by, bz); c.scale.setScalar(br); c.rotation.y = tr() * 6.3; t.add(c);
        if (i > 0) { const b = mesh(branchGeo, trunkM, bx * 0.5, h * 0.9 + (by - h) * 0.3, bz * 0.5); b.scale.set(s, Math.hypot(rad, by - h * 0.8), s); b.lookAt(bx, by * 3, bz); b.rotateX(Math.PI / 2 - Math.atan2(by - h * 0.8, rad)); t.add(b); }
        if (detail) addCards(x + (bx * Math.cos(t.rotation.y) + bz * Math.sin(t.rotation.y)), by, z + (-bx * Math.sin(t.rotation.y) + bz * Math.cos(t.rotation.y)), br, small ? 5 : 9, tint);
      }
      scene.add(t); trees.push(t);
    }
    for (let i = 0; i < 34; i++) { const p = along(loop, i / 34 + tr() * 0.01, (i % 2 ? 5 : -5) + (tr() - 0.5) * 2); tree(p.x, p.z, 0.75 + tr() * 0.4, i % 6 === 0 ? 9 : i); }
    for (let i = 0; i < 72; i++) { const p = along(ring, i / 72 + tr() * 0.006, (i % 2 ? 7.5 : -7.5) + (tr() - 0.5) * 2.5); tree(p.x, p.z, 0.9 + tr() * 0.5, i % 8 === 0 ? 9 : i); }
    for (let i = 0; i < 26; i++) tree(-60 + tr() * 34, -17 + tr() * 16, 0.7 + tr() * 0.4, i % 5 === 0 ? 9 : i);
    for (let i = 0; i < 110; i++) { const a = tr() * Math.PI * 2, r = 175 + tr() * 170; tree(Math.cos(a) * r + 10, Math.sin(a) * r, 1.1 + tr() * 0.8, Math.floor(tr() * 5), false); }

    // palms by the pools
    const frondGeo = (() => {
      const g0 = new THREE.PlaneGeometry(0.9, 3.4, 2, 8); const pos = g0.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) + 1.7, t = y / 3.4, x = pos.getX(i); pos.setXYZ(i, x * (1 - t * 0.85), y, -t * t * 1.5 - Math.abs(x) * 0.5); }
      g0.computeVertexNormals(); return g0;
    })();
    const frondM = new THREE.MeshStandardMaterial({ color: '#4c9d55', roughness: 0.8, side: THREE.DoubleSide });
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
    const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 6, 5), new THREE.MeshStandardMaterial({ roughness: 0.6 }), small ? 1400 : 3200);
    const soil = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 20), std('#7a5230', 1), 60);
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
      if (soilN >= 60 || !free(x, z, 0.5)) return;
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
      const hide = [[-54, -14], [5, -18], [31, -4], [12, 2], [-30, 0.4]].some(([x, z]) => Math.hypot(p.x - x, p.z - z) < 3.6);
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
      g.beginPath(); g.ellipse(X(0), Z(-9), 9 * k, 6.8 * k, 0, 0, 6.3); g.fill(); rect(16, -7, 7.9, 4.9, 0.42);
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
      grass.setMatrixAt(i, mtx); grass.setColorAt(i, col.set(['#5a9a42', '#6cab50', '#4f8f3e', '#7bb858', '#63a249', '#86bf60', '#94bd62'][Math.floor(tr() * 7)]));
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
    // benches
    const benchSeat = std('#c8d6c5', 0.8), benchLeg = std('#2f4a3a', 0.6, 0.4);
    function bench(x: number, z: number, rot: number, parent: THREE.Object3D = scene) {
      const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rot;
      b.add(mesh(new THREE.BoxGeometry(2.2, 0.1, 0.55), benchSeat, 0, 0.5, 0)); b.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 0.08), benchSeat, 0, 0.8, -0.26));
      for (const sx of [-0.95, 0.95]) b.add(mesh(new THREE.BoxGeometry(0.08, 0.5, 0.5), benchLeg, sx, 0.25, 0));
      parent.add(b); return b;
    }
    bench(-30, 3.2, Math.PI); bench(-8, -21.5, 0); bench(22, 3.6, Math.PI - 0.3);
    const cat = makeCat(); cat.g.position.set(-29.6, 0.55, 3.1); cat.g.rotation.y = Math.PI; scene.add(cat.g);

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
    for (let i = 0; i < 9; i++) { const c = new THREE.Group(); c.position.set(-300 + i * 75, 190 + (i % 3) * 25, -260 + (i % 4) * 150); for (let k = 0; k < 4; k++) { const s = mesh(new THREE.SphereGeometry(14 + k * 3, 12, 10), cloudM, k * 16, (k % 2) * 4, 0, false); s.scale.y = 0.5; c.add(s); } scene.add(c); clouds.push(c); }
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
    const parent = makePerson('#c6a3e8', '#3b3b46', '#b98562', '#1a1512'); flat.add(parent.g);
    parent.g.position.set(2.3, -0.4, -2.35); parent.g.rotation.y = Math.PI; parent.legs.forEach((l) => (l.rotation.x = -1.5));
    const visitor = makePerson('#2e7d4f', '#33424a', '#c08a63', '#1f1a17'); flat.add(visitor.g);
    const homeCat = makeCat(); flat.add(homeCat.g);
    const pLabel = label('Ananya', { scale: 0.2 }); pLabel.position.set(2.3, 1.75, -2.35); flat.add(pLabel);
    const vLabel = label('Priya', { scale: 0.2 }); flat.add(vLabel);

    /* ---- world people and pets ---- */
    const walker = makePerson('#2e7d4f', '#33424a', '#c08a63', '#1f1a17'); walker.g.position.set(70, 0, -13); scene.add(walker.g);
    const dog = makeDog(); dog.g.position.set(69.4, 0, -11.7); scene.add(dog.g);
    const priya = makePerson('#e0662f', '#2c3a50', '#9a6a4a', '#14110f'); priya.g.position.set(5, 0, -22); scene.add(priya.g);
    const pl = label('Priya', { scale: 0.7 }); pl.position.set(5, 2.6, -22); scene.add(pl);
    const jogger = makePerson('#f0b429', '#22313a', '#d1a07a', '#3a2a1f'); scene.add(jogger.g);
    const resident = makePerson('#6fa8c9', '#3a3a3a', '#a87656', '#16120f'); scene.add(resident.g);
    const dog2 = makeDog(); dog2.g.scale.setScalar(0.8); dog2.g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && (m.material as THREE.MeshStandardMaterial).color.getHexString() === 'd9a05b') m.material = std('#2b2622', 0.9); }); scene.add(dog2.g);
    const sitter = makePerson('#c6a3e8', '#3b3b46', '#b07a58', '#1a1512'); sitter.g.position.set(-8.4, -0.38, -21.4); sitter.legs.forEach((l) => (l.rotation.x = -1.4)); scene.add(sitter.g);

    const leashPts = Array.from({ length: 12 }, () => V());
    const leashGeo = new THREE.BufferGeometry().setFromPoints(leashPts);
    const leash = new THREE.Line(leashGeo, new THREE.LineBasicMaterial({ color: '#e0662f' })); leash.frustumCulled = false; scene.add(leash);
    const ball = mesh(new THREE.SphereGeometry(0.12, 12, 10), std('#d4e157', 0.6), 138, 0.12, 20); scene.add(ball);

    const ringGeo = new THREE.RingGeometry(1.1, 1.35, 40);
    const rings = new Map<StopId, THREE.Mesh>();
    for (const s of STOPS) { const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#e0662f', transparent: true, opacity: 0.85, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.set(s.pos[0], 0.09, s.pos[1]); scene.add(r); rings.set(s.id, r); }
    const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.5, 28), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false }));
    marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);

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
    let yaw = Math.PI * 0.5, pitch = 0.38; const dist = 10.5;
    let m: Mode = 'menu';
    let minutes = 0, meters = 0, photoCount = 0;
    const doneSet = new Set<StopId>();
    let nightF = 0, nightTarget = 0;
    let dogMode: 'follow' | 'go' | 'back' | 'drink' | 'sit' = 'follow';
    let dogTimer = 0;
    let ballFlight: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
    let ballHeld = false, walkPhase = 0, dogPhase = 0, nearId: StopId | null = null, lastHud = 0, wave = 0, visible = true;
    let autoWalk = false;

    const camPos = V(), camLook = V(); let camDist = dist, camSnap = false;
    const camHit = (x: number, y: number, z: number) => blockers.some((b) => { if (y > b.h) return false; const dx = x - b.x, dz = z - b.z; return Math.abs(dx * b.c - dz * b.s) < b.hw - 0.6 && Math.abs(dx * b.s + dz * b.c) < b.hd - 0.6; });
    function followCam(snap = false) {
      const tgt = walker.g.position.clone().add(V(0, 1.4, 0));
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
    interface Actor { g: THREE.Group; legs: THREE.Group[]; dest: THREE.Vector3 | null; speed: number; phase: number; sign: number[] }
    const actor = (o: { g: THREE.Group; legs: THREE.Group[] }, speed: number, sign: number[]): Actor => ({ g: o.g, legs: o.legs, dest: null, speed, phase: 0, sign });
    const aVisitor = actor(visitor, 1.7, [1, -1]);
    const aDog = actor(dog, 2.6, [1, -1, -1, 1]);
    const aCat: Actor = { g: homeCat.g, legs: [], dest: null, speed: 1.4, phase: 0, sign: [] };
    function stepActor(a: Actor, dt: number) {
      let moving = false;
      if (a.dest) {
        const d = a.dest.clone().sub(a.g.position); d.y = 0; const len = d.length();
        if (len < 0.06) a.dest = null; else {
          d.normalize(); const st = Math.min(len, a.speed * dt); a.g.position.addScaledVector(d, st); a.phase += st * (a.legs.length === 4 ? 9 : 4.5); moving = true;
          let r = Math.atan2(d.x, d.z) - a.g.rotation.y; r = Math.atan2(Math.sin(r), Math.cos(r)); a.g.rotation.y += r * Math.min(1, dt * 10);
        }
      }
      a.legs.forEach((l, i) => (l.rotation.x = moving ? Math.sin(a.phase) * 0.6 * a.sign[i] : 0));
      return moving;
    }

    /* ---- stories ---- */
    interface Beat { dur: number; text: string; img?: string; cam: [number, number, number, number, number, number]; start?: () => void; update?: (t: number, dt: number) => void }
    let beats: Beat[] = [], bi = -1, bt = 0, storyId: StoryId | null = null, leashInFlat = false, doorOpen = 0, doorTarget = 0, fill = 0, fillTarget = 0;
    const F = flat.position;
    const fc = (x: number, y: number, z: number, lx: number, ly: number, lz: number): Beat['cam'] => [F.x + x, F.y + y, F.z + z, F.x + lx, F.y + ly, F.z + lz];
    const wpos = (o: THREE.Object3D, y = 0.6) => o.getWorldPosition(V()).add(V(0, y, 0));
    function setupFlat(id: StoryId) {
      flat.visible = true; doorOpen = doorTarget = 0; leashInFlat = false; fill = fillTarget = id === 'cat' ? 0 : 1;
      visitor.g.position.set(-8, 0, 1.6); visitor.g.rotation.set(0, Math.PI / 2, 0); aVisitor.dest = null;
      wand.position.y = -5;
      if (id === 'dog') {
        parent.g.visible = pLabel.visible = true; homeCat.g.visible = false; visitor.shirt.color.set('#2e7d4f');
        vLabel.material.map?.dispose(); const nl = label('Priya', { scale: 0.2 }); vLabel.material = nl.material; vLabel.scale.copy(nl.scale);
        flat.add(dog.g); dog.g.position.set(1.2, 0, -1.9); dog.g.rotation.set(0, 1.2, 0); aDog.dest = null;
      } else {
        parent.g.visible = pLabel.visible = false; homeCat.g.visible = true; visitor.shirt.color.set('#6fa8c9');
        const nl = label('Kabir', { scale: 0.2 }); vLabel.material = nl.material; vLabel.scale.copy(nl.scale);
        homeCat.g.position.set(-1.6, 0.48, -3.25); homeCat.g.rotation.set(0, 0.3, 0); aCat.dest = null;
      }
    }
    const L = (x: number, z: number) => V(x, 0, z);
    const DOG_BEATS: Beat[] = [
      { dur: 6, text: '9:40 am, Tower 5, flat 1204. Ananya has calls until noon. Biscuit has other plans.', cam: fc(-0.5, 2.6, 7.6, 0.8, 1, -1.5), start: () => { aDog.dest = L(-1.5, 1.2); } , update: (t) => { if (t > 3.6) dog.g.rotation.y += (-1.5 - dog.g.rotation.y) * 0.08; } },
      { dur: 5.5, img: '/real/meet-greet.jpg', text: 'The doorbell. Priya lives in Tower 3, is Aadhaar-verified, and met Biscuit at last week\'s meet-and-greet.', cam: fc(-1.2, 2, 6.2, -3.2, 1, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); }, update: (t) => { if (t > 1.6) doorTarget = 1; if (t > 2.4 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-3.2, 1.5); if (t > 2.2) aDog.dest = L(-2.2, 1.3); } },
      { dur: 5, text: 'A proper hello first. Then the leash goes on, with poop bags and a towel packed.', cam: fc(-1.6, 1.5, 4.6, -2.7, 0.8, 1.4), start: () => { hearts(wpos(dog.g, 1), 6, 0.22); parent.arms[1].rotation.z = -2.5; }, update: (t) => { visitor.g.rotation.x = t < 3 ? Math.min(0.2, t * 0.4) : Math.max(0, 0.2 - (t - 3) * 0.4); visitor.arms[1].rotation.x = t < 3 ? -0.9 : 0.3; if (t > 2.6) leashInFlat = true; if (t > 3.5) parent.arms[1].rotation.z = 0; } },
      { dur: 4.5, text: 'Out they go. Ananya is back on her call before the lift arrives.', cam: fc(1.5, 2.4, 7, -2.5, 1, 0.8), start: () => { visitor.g.rotation.x = 0; aVisitor.dest = L(-8.5, 1.6); }, update: (t) => { if (t > 0.5) aDog.dest = L(-8, 1.2); if (t > 3.2) doorTarget = 0; } },
      { dur: 9, img: '/real/hero.jpg', text: 'Down to the walking loop. Live GPS and a photo every 15 minutes go to Ananya\'s phone.', cam: [0, 0, 0, 0, 0, 0], start: () => { toWorld(); queue = routeTo(walker.g.position, V(31, 0, -4)); autoWalk = true; } },
    ];
    const CAT_BEATS: Beat[] = [
      { dur: 5, img: '/real/cat-window.jpg', text: 'Meera is travelling for work. Lily stays home, where cats are happiest.', cam: fc(0.5, 2.6, 7.6, -0.8, 0.9, -1.5) },
      { dur: 5.5, text: 'Kabir from Tower 8 lets himself in with a one-time door code. Meera gets a ping the moment it opens.', cam: fc(-1.2, 2, 6.2, -3.2, 1, 1.2), start: () => { aVisitor.dest = L(-5.6, 1.6); }, update: (t) => { if (t > 1.5) doorTarget = 1; if (t > 2.3 && !aVisitor.dest && visitor.g.position.x < -4) aVisitor.dest = L(-2.6, 1.4); if (t > 4.5) doorTarget = 0; } },
      { dur: 6, text: 'Fresh food and fresh water first. Lily supervises.', cam: fc(1.2, 1.8, 6.4, 3, 0.4, 2.2), start: () => { aVisitor.dest = L(2.7, 2.3); }, update: (t) => { if (t > 2.2) { fillTarget = 1; visitor.g.rotation.x = 0.2; } if (t > 1.5 && homeCat.g.position.y > 0.1) { homeCat.g.position.y = 0; homeCat.g.position.z = -2.4; } if (t > 1.5) aCat.dest = L(3.5, 2.0); if (t > 4.6) visitor.g.rotation.x = 0; } },
      { dur: 5, text: 'Litter scooped and the box wiped clean.', cam: fc(1.5, 2, 5.8, 3.8, 0.4, 0.6), start: () => { visitor.g.rotation.x = 0; aVisitor.dest = L(3.5, 0.7); }, update: (t) => { if (t > 2) { visitor.g.rotation.x = 0.2; (litter.material as THREE.MeshStandardMaterial).color.set('#f8f5ea'); } if (t > 4.2) visitor.g.rotation.x = 0; } },
      { dur: 6.5, img: '/real/cat-visit.jpg', text: 'Ten minutes of play, then chin scratches. This is the part Lily booked it for.', cam: fc(-0.3, 1.5, 5, -0.3, 0.4, 0.6), start: () => { visitor.g.rotation.x = 0; aVisitor.dest = L(0.5, 0.9); aCat.dest = L(-0.6, 0.5); }, update: (t) => { if (t > 2 && t < 4.4) { wand.position.set(-0.2 + Math.sin(t * 5) * 0.5, 0.5 + Math.abs(Math.sin(t * 7)) * 0.3, 0.6); homeCat.g.position.y = Math.abs(Math.sin(t * 7)) * 0.12; } if (t > 4.4) { wand.position.y = -5; homeCat.g.position.y = 0; visitor.g.rotation.x = 0.2; visitor.arms[1].rotation.x = -0.9; if (Math.random() < 0.08) hearts(wpos(homeCat.g, 0.5), 1, 0.2); } } },
      { dur: 5, text: 'Photos sent to Meera. Visit done in 30 minutes: ₹129, and ₹90.30 of it goes to Kabir.', cam: fc(0.5, 2.6, 7.6, -0.3, 0.9, -0.5), start: () => { visitor.g.rotation.x = 0; visitor.arms[1].rotation.x = 0; aVisitor.dest = L(-3.4, 1.5); } },
    ];
    function toWorld(fromFlat = true) {
      flat.visible = false; scene.add(dog.g); leashInFlat = false; dogMode = 'follow';
      if (fromFlat) { walker.g.position.set(100, 0, -8.5); walker.g.rotation.y = Math.PI; dog.g.position.set(101.3, 0, -8.8); dog.g.rotation.set(0, Math.PI, 0); yaw = Math.PI - 0.75; pitch = 0.3; }
      else { walker.g.position.set(70, 0, -13); walker.g.rotation.y = -Math.PI / 2; dog.g.position.set(69.4, 0, -11.7); dog.g.rotation.set(0, -Math.PI / 2, 0); yaw = Math.PI / 2 - 0.25; pitch = 0.34; }
      followCam(true);
    }
    function resetWalk() {
      minutes = 0; meters = 0; photoCount = 0; doneSet.clear(); setDone([]); rings.forEach((r) => (r.visible = true)); setPhotos([]);
      ballFlight = null; ballHeld = false; ball.position.set(138, 0.12, 20); queue = []; marker.visible = false; autoWalk = false;
    }
    function nextBeat() {
      bi++; bt = 0;
      if (bi >= beats.length) {
        if (storyId === 'dog') { autoWalk = false; m = 'walk'; setMode('walk'); setCaption(null); say('Your turn. Walk Biscuit to the four stops.'); }
        else { m = 'catdone'; setMode('catdone'); setCaption(null); flat.visible = false; camSnap = true; }
        beats = []; return;
      }
      setCaption({ text: beats[bi].text, i: bi, n: beats.length, img: beats[bi].img }); beats[bi].start?.();
    }
    const setM = (x: Mode) => { m = x; setMode(x); };

    const handPos = (p: { arms: THREE.Group[] }) => p.arms[1].localToWorld(V(0, -0.55, 0));
    const collarPos = () => dog.g.localToWorld(V(0, 0.82, 0.42));

    api.current = {
      setNight: (n) => { nightTarget = n ? 1 : 0; },
      sync: (x) => { m = x; },
      play: (id) => { resetWalk(); storyId = id; setStory(id); setupFlat(id); beats = id === 'dog' ? DOG_BEATS : CAT_BEATS; bi = -1; camSnap = true; setM('story'); nextBeat(); },
      skip: () => { if (storyId === 'dog') { if (flat.visible) toWorld(); bi = beats.length; nextBeat(); } else { bi = beats.length; nextBeat(); } },
      explore: () => { resetWalk(); storyId = 'dog'; setStory('dog'); toWorld(false); setCaption(null); setM('walk'); wrap.focus({ preventScroll: true }); },
      menu: () => { flat.visible = false; if (dog.g.parent !== scene) scene.add(dog.g); beats = []; setCaption(null); camSnap = true; setM('menu'); },
      goTo: (id) => { const s = STOPS.find((x) => x.id === id)!; goToPoint(V(s.pos[0], 0, s.pos[1])); },
      act: (id) => {
        const s = STOPS.find((x) => x.id === id)!;
        if (id === 'cat') { hearts(cat.g.position.clone().add(V(0, 0.5, 0)), 8); dogMode = 'sit'; dogTimer = 2; finish(s.done, id); }
        if (id === 'hello') {
          wave = 2.4; if (bubble) scene.remove(bubble);
          bubble = label('Morning! Biscuit looks so happy.', { scale: 0.75 }); bubble.position.set(priya.g.position.x, 3.3, priya.g.position.z); scene.add(bubble); bubbleT = 4;
          finish(s.done, id);
        }
        if (id === 'water') { dogMode = 'drink'; dogTimer = 0; say('Biscuit is drinking...'); }
        if (id === 'fetch' && !ballFlight && dogMode === 'follow') {
          const from = handPos(walker);
          const fwd = V(142, 0, 22).sub(walker.g.position).setY(0).normalize();
          const to = walker.g.position.clone().add(fwd.multiplyScalar(8));
          to.x = THREE.MathUtils.clamp(to.x, px0 + 1.5, px1 - 1.5); to.z = THREE.MathUtils.clamp(to.z, pz0 + 1.5, pz1 - 1.5); to.y = 0.12;
          ballFlight = { from, to, t: 0 }; ballHeld = false; dogMode = 'go'; say('Go get it, Biscuit!');
        }
      },
      photo: () => {
        renderer.render(scene, camera);
        const c = document.createElement('canvas'); c.width = 240; c.height = 160;
        const g = c.getContext('2d')!; const src = renderer.domElement;
        const ar = 240 / 160, sw = Math.min(src.width, src.height * ar), sh = sw / ar;
        g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, 240, 160);
        photoCount++; hearts(dog.g.position.clone().add(V(0, 1.1, 0)), 3);
        return c.toDataURL('image/jpeg', 0.8);
      },
    };

    /* ---- input ---- */
    const onKey = (e: KeyboardEvent) => {
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

    const resize = () => { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 64 : 52; camera.updateProjectionMatrix(); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 }); io.observe(wrap);

    /* ---- loop ---- */
    const clock = new THREE.Clock(); let raf = 0;
    const tmp = V(), fwd = V(), right = V();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      const time = clock.elapsedTime;
      const inFlat = m === 'story' && flat.visible;
      const walking = m === 'walk' || (m === 'story' && !flat.visible);

      // story timeline
      if (m === 'story' && bi >= 0 && bi < beats.length) { bt += dt; beats[bi].update?.(bt, dt); if (bt >= beats[bi].dur) nextBeat(); }
      if (inFlat) {
        stepActor(aVisitor, dt); if (storyId === 'dog') { stepActor(aDog, dt); dog.tail.rotation.z = Math.sin(time * 14) * 0.6; }
        else { const mv = stepActor(aCat, dt); homeCat.tail.rotation.y = Math.sin(time * (mv ? 6 : 2.2)) * 0.4; }
        doorOpen += (doorTarget - doorOpen) * Math.min(1, dt * 4); door.rotation.y = doorOpen * 1.45;
        fill += (fillTarget - fill) * Math.min(1, dt * 2); food.scale.setScalar(Math.max(0.01, fill)); drink.scale.setScalar(Math.max(0.01, fill));
        parent.arms[0].rotation.x = -1.1 + Math.sin(time * 9) * 0.05; if (parent.arms[1].rotation.z === 0) parent.arms[1].rotation.x = -1.1 + Math.cos(time * 8) * 0.05; else parent.arms[1].rotation.x = 0;
        vLabel.position.set(visitor.g.position.x, 2.12, visitor.g.position.z);
        const c = beats[bi]?.cam; if (c) { camPos.lerp(tmp.set(c[0], c[1], c[2]), camSnap ? 1 : 0.06); camLook.lerp(tmp.set(c[3], c[4], c[5]), camSnap ? 1 : 0.08); camSnap = false; }
      }

      // movement in the community
      let moving = false;
      if (walking) {
        fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw)); right.set(-fwd.z, 0, fwd.x); tmp.set(0, 0, 0);
        if (m === 'walk') { if (keys.has('w')) tmp.add(fwd); if (keys.has('s')) tmp.sub(fwd); if (keys.has('d')) tmp.add(right); if (keys.has('a')) tmp.sub(right); }
        if (tmp.lengthSq() === 0 && queue.length) {
          tmp.copy(queue[0]).sub(walker.g.position).setY(0);
          if (tmp.length() < (queue.length > 1 ? 1.2 : 0.35)) { queue.shift(); if (!queue.length) marker.visible = false; tmp.set(0, 0, 0); }
        }
        if (tmp.lengthSq() > 0 && dogMode !== 'drink') {
          tmp.normalize(); const before = walker.g.position.clone();
          walker.g.position.addScaledVector(tmp, 4.6 * dt); collide(walker.g.position);
          const moved = walker.g.position.distanceTo(before); meters += moved; walkPhase += moved * 3; moving = moved > 0.001;
          let d = Math.atan2(tmp.x, tmp.z) - walker.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); walker.g.rotation.y += d * Math.min(1, dt * 10);
          if (autoWalk || (queue.length && !drag)) { let yd = walker.g.rotation.y + Math.PI - yaw; yd = Math.atan2(Math.sin(yd), Math.cos(yd)); yaw += yd * Math.min(1, dt * 1.2); }
        }
        if (m === 'walk') { minutes += dt / 3; if (minutes >= 60) setM('ended'); }
        const sw = moving ? Math.sin(walkPhase) * 0.6 : 0;
        walker.legs[0].rotation.x = sw; walker.legs[1].rotation.x = -sw; walker.arms[0].rotation.x = -sw * 0.7; walker.arms[1].rotation.x = moving ? 0.35 : 0.25;
        walker.g.position.y = moving ? Math.abs(Math.sin(walkPhase)) * 0.04 : 0;

        // dog on the leash
        const dp = dog.g.position; const wrot = walker.g.rotation.y; let dogDest: THREE.Vector3;
        if (dogMode === 'go') dogDest = (ballFlight ? ballFlight.to : ball.position).clone().setY(0);
        else if (dogMode === 'drink') dogDest = V(38, 0, -2.2);
        else dogDest = walker.g.position.clone().add(V(Math.cos(wrot), 0, -Math.sin(wrot)).multiplyScalar(-1.3)).add(V(Math.sin(wrot), 0, Math.cos(wrot)).multiplyScalar(0.5));
        tmp.copy(dogDest).sub(dp).setY(0); const dd = tmp.length();
        const dogSpeed = dogMode === 'go' || dogMode === 'back' ? 8.5 : Math.min(7, dd * 2.6);
        let dogMoving = false;
        if (dd > 0.12 && dogMode !== 'sit' && !(dogMode === 'drink' && dd < 0.5)) {
          tmp.normalize(); const st = Math.min(dd, dogSpeed * dt); dp.addScaledVector(tmp, st); dogPhase += st * 5; dogMoving = st > 0.004;
          let d = Math.atan2(tmp.x, tmp.z) - dog.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); dog.g.rotation.y += d * Math.min(1, dt * 9);
        }
        const ls = dogMoving ? Math.sin(dogPhase) * 0.7 : 0;
        dog.legs[0].rotation.x = ls; dog.legs[3].rotation.x = ls; dog.legs[1].rotation.x = -ls; dog.legs[2].rotation.x = -ls;
        dog.tail.rotation.z = Math.sin(time * (dogMode === 'sit' ? 18 : 11)) * 0.5;
        dog.headG.rotation.x = dogMode === 'drink' && dd < 0.6 ? 0.75 + Math.sin(time * 8) * 0.08 : Math.sin(time * 1.3) * 0.05;
        dp.y = dogMoving ? Math.abs(Math.sin(dogPhase)) * 0.05 : 0;
        if (dogMode === 'drink' && dd < 0.6) { dogTimer += dt; if (dogTimer > 2.4) { dogMode = 'follow'; finish(STOPS.find((s) => s.id === 'water')!.done, 'water'); } }
        if (dogMode === 'sit') { dogTimer -= dt; if (dogTimer <= 0) dogMode = 'follow'; }
        if (ballFlight) { ballFlight.t += dt / 0.9; const t = Math.min(1, ballFlight.t); ball.position.lerpVectors(ballFlight.from, ballFlight.to, t); ball.position.y += Math.sin(Math.PI * t) * 3.5; if (t >= 1) ballFlight = null; }
        else if (dogMode === 'go' && dp.distanceTo(ball.position.clone().setY(0)) < 0.6) { ballHeld = true; dogMode = 'back'; }
        if (ballHeld) ball.position.copy(dog.headG.localToWorld(V(0, 0.02, 0.34)));
        if (dogMode === 'back' && dp.distanceTo(walker.g.position) < 1.9) { dogMode = 'follow'; ballHeld = false; ball.position.set(dp.x + 0.4, 0.12, dp.z + 0.4); finish(STOPS.find((s) => s.id === 'fetch')!.done, 'fetch'); hearts(dp.clone().add(V(0, 1, 0)), 4); }
        followCam();
      }

      // leash: always between a hand and the collar
      const leashOn = inFlat ? leashInFlat : (walking || m === 'ended') && (dogMode === 'follow' || dogMode === 'sit' || dogMode === 'drink');
      leash.visible = leashOn;
      if (leashOn) {
        const a = handPos(inFlat ? visitor : walker), b = collarPos(); const sag = Math.max(0.05, 1.8 - a.distanceTo(b)) * 0.35;
        for (let i = 0; i < 12; i++) { const t = i / 11; leashPts[i].lerpVectors(a, b, t); leashPts[i].y -= Math.sin(Math.PI * t) * sag; }
        leashGeo.setFromPoints(leashPts);
      }

      // menu / end: slow aerial orbit of the whole community
      if (m === 'menu' || m === 'catdone') {
        const a = time * 0.045 + 2.2; tmp.set(10 + Math.cos(a) * 205, 132, Math.sin(a) * 175);
        if (camSnap) { camPos.copy(tmp); camLook.set(12, 14, 2); camSnap = false; } else { camPos.lerp(tmp, 0.04); camLook.lerp(tmp.set(12, 14, 2), 0.05); }
      }
      if (m === 'ended') followCam();
      camera.position.copy(camPos); camera.lookAt(camLook);

      // neighbours and traffic
      const tj = (time * 0.02) % 1; const pj = loop.getPointAt(tj), pj2 = loop.getPointAt((tj + 0.004) % 1);
      jogger.g.position.copy(pj); jogger.g.lookAt(pj2.x, 0, pj2.z);
      const jp = time * 9; jogger.legs[0].rotation.x = Math.sin(jp) * 0.8; jogger.legs[1].rotation.x = -Math.sin(jp) * 0.8; jogger.arms[0].rotation.x = -Math.sin(jp) * 0.8; jogger.arms[1].rotation.x = Math.sin(jp) * 0.8;
      const t2 = 1 - ((time * 0.008 + 0.4) % 1); const pr = loop.getPointAt(t2), pr2 = loop.getPointAt((t2 + 0.996) % 1);
      resident.g.position.copy(pr); resident.g.lookAt(pr2.x, 0, pr2.z);
      const rpz = time * 5; resident.legs[0].rotation.x = Math.sin(rpz) * 0.5; resident.legs[1].rotation.x = -Math.sin(rpz) * 0.5;
      const pd = loop.getPointAt((t2 + 0.992) % 1); dog2.g.position.set(pd.x + 0.7, 0, pd.z + 0.4); dog2.g.lookAt(pr2.x + 0.7, 0, pr2.z + 0.4);
      dog2.legs.forEach((l, i) => (l.rotation.x = Math.sin(rpz * 1.4 + (i % 2) * Math.PI) * 0.6)); dog2.tail.rotation.z = Math.sin(time * 10) * 0.5;
      const td = (time * 0.012) % 1; const pc = along(ring, td, -1.6), pc2 = ring.getTangentAt(td); driver.position.copy(pc); driver.rotation.y = Math.atan2(pc2.x, pc2.z);
      priya.arms[1].rotation.z = wave > 0 ? -2.4 + Math.sin(time * 10) * 0.3 : 0; if (wave > 0) wave -= dt;
      if (walker.g.position.distanceTo(priya.g.position) < 9) priya.g.rotation.y = Math.atan2(walker.g.position.x - priya.g.position.x, walker.g.position.z - priya.g.position.z);
      sitter.arms[0].rotation.x = -0.6 + Math.sin(time * 3) * 0.15;
      cat.tail.rotation.y = Math.sin(time * 2.2) * 0.35;
      clouds.forEach((c, i) => { c.position.x += dt * (2 + i * 0.3); if (c.position.x > 420) c.position.x = -420; });
      trees.forEach((t, i) => { if (i < 90) t.rotation.z = Math.sin(time * 0.9 + i) * 0.01; });
      palms.forEach((c, i) => { c.rotation.z = Math.sin(time * 1.1 + i * 2) * 0.04; c.rotation.x = Math.cos(time * 0.8 + i) * 0.03; });
      grassU.uTime.value = time;
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

      if (m === 'walk') {
        let n: StopId | null = null;
        for (const s of STOPS) { if (doneSet.has(s.id)) continue; if (Math.hypot(walker.g.position.x - s.pos[0], walker.g.position.z - s.pos[1]) < 4.5) { n = s.id; break; } }
        if (n !== nearId) { nearId = n; setNear(n); }
        if (time - lastHud > 0.25) { lastHud = time; setStats({ minutes, km: meters / 1000, photos: photoCount }); }
      }
      renderer.render(scene, camera);
    };
    camPos.set(10 + Math.cos(2.2) * 205, 132, Math.sin(2.2) * 175); camLook.set(12, 14, 2);
    tick();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
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
  const nearStop = STOPS.find((s) => s.id === near);
  const mins = Math.floor(stats.minutes);
  const share = Math.round(PRICE * 0.7 * 100) / 100;
  const glassBtn: React.CSSProperties = { ...glass, borderRadius: 999, padding: '10px 16px', fontFamily: head, fontWeight: 700, fontSize: 13.5, color: T.ink, cursor: 'pointer', minHeight: 42 };
  const kicker: React.CSSProperties = { fontFamily: body, fontWeight: 700, fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: T.leaf, marginBottom: 8 };

  const CARDS: { id: StoryId | 'free'; k: string; t: string; d: string; cta: string; img: string; pos: string }[] = [
    { id: 'dog', k: 'Story · 30 seconds', t: 'The dog walk', d: 'Ananya is on calls in her flat. Priya arrives at the door, says hello to Biscuit, clips the leash on and heads to the loop. Then you take over.', cta: 'Watch the dog walk', img: '/real/meet-greet.jpg', pos: '45% 40%' },
    { id: 'cat', k: 'Story · 35 seconds', t: 'The cat visit', d: 'Meera is travelling. Kabir lets himself in with a one-time code, then feeds Lily, cleans the litter and plays with her at home.', cta: 'Watch the cat visit', img: '/real/cat-visit.jpg', pos: '55% 40%' },
    { id: 'free', k: 'Free roam', t: 'Explore the community', d: 'Ten towers, the ring road, the walking loop, the pool, the clubhouse and the pet garden. Walk Biscuit wherever you like.', cta: 'Start walking', img: '/real/community.jpg', pos: '50% 60%' },
  ];

  return (
    <div ref={wrapRef} tabIndex={-1} className="pp-world" style={{ position: 'relative', height: 'clamp(600px, 84vh, 800px)', borderRadius: 'clamp(20px, 3vw, 30px)', overflow: 'hidden', background: '#d9ebe4', outline: 'none', boxShadow: '0 30px 80px rgba(20,48,31,.18)' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: mode === 'walk' ? 'none' : 'pan-y', cursor: mode === 'walk' ? 'grab' : 'default' }} aria-label="3D model of a ten-tower gated community. Watch a story or walk Biscuit the dog through it." />

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
                <button className={`pp-glass-btn${c.id === 'dog' ? ' pp-glass-primary' : ''}`} style={{ fontSize: 14.5, padding: '11px 18px', minHeight: 44 }} onClick={() => (c.id === 'free' ? api.current?.explore() : api.current?.play(c.id))}>{c.cta}</button>
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
            {[[`${mins} min`, 'of 60'], [`${stats.km.toFixed(2)} km`, 'walked'], [`${stats.photos}`, 'photos']].map(([v, l]) => (
              <div key={l}><div style={{ fontFamily: head, fontWeight: 800, fontSize: 17, color: T.ink, letterSpacing: '-0.02em' }}>{v}</div><div style={{ fontSize: 11, color: T.muted }}>{l}</div></div>
            ))}
          </div>
          <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '50%' }}>
            <button className="pp-glass-btn" style={glassBtn} onClick={() => setNight((n) => !n)}>{night ? 'Morning' : 'Evening'}</button>
            <button className="pp-glass-btn" style={glassBtn} onClick={() => setMode('ended')}>End walk</button>
          </div>

          <div className="pp-world-stops" style={{ ...glass, position: 'absolute', left: 12, top: 82, padding: 12, width: 262, fontFamily: body }}>
            <button onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer', fontFamily: head, fontWeight: 800, fontSize: 14, color: T.ink }}>
              <span>Walk checklist · {done.length}/4</span><span style={{ color: T.leaf, fontSize: 12.5 }}>{listOpen ? 'Hide' : 'Show'}</span>
            </button>
            {listOpen && STOPS.map((s, i) => {
              const ok = done.includes(s.id);
              return (
                <button key={s.id} onClick={() => api.current?.goTo(s.id)} disabled={ok} className="pp-world-stop"
                  style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'baseline', textAlign: 'left', background: 'none', border: 'none', padding: '7px 4px', borderRadius: 10, cursor: ok ? 'default' : 'pointer', fontFamily: body, fontSize: 13, color: ok ? T.muted2 : T.ink, opacity: ok ? 0.7 : 1 }}>
                  <span style={{ fontFamily: head, fontWeight: 800, color: ok ? T.leafBright : T.marigold, width: 14 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: ok ? T.leafBright : T.leaf }}>{ok ? 'Done' : 'Go'}</span>
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
            {nearStop && <button className="pp-glass-btn pp-glass-primary pp-fade-in" onClick={() => api.current?.act(nearStop.id)} style={{ fontSize: 15 }}>{nearStop.verb}</button>}
            <button className="pp-glass-btn" style={{ ...glassBtn, fontSize: 14.5 }} onClick={takePhoto}>Send a photo update</button>
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
                ? `${Math.max(1, mins)} min, ${stats.km.toFixed(2)} km, ${done.length} of 4 stops and ${stats.photos} photo${stats.photos === 1 ? '' : 's'} sent. Biscuit is home, towelled and happy.`
                : 'Food, water, litter, play and photos, all in her own home. Meera saw every step on her phone.'}
            </p>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, border: `1px solid ${T.line}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: head, fontWeight: 800, fontSize: 18, color: T.ink, marginBottom: 10 }}><span>{mode === 'ended' ? '1-hour walk' : '30-minute cat visit'}</span><span>₹{mode === 'ended' ? PRICE : 129}</span></div>
              <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}><div style={{ width: '70%', background: T.leafBright }} /><div style={{ flex: 1, background: T.marigold }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 13, color: T.sub }}><span>The neighbour: ₹{mode === 'ended' ? share.toFixed(2) : '90.30'}</span><span>ProxyPaw: ₹{mode === 'ended' ? (PRICE - share).toFixed(2) : '38.70'}</span></div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="pp-glass-btn pp-glass-primary" onClick={() => onJoin(mode === 'ended' ? '3d-walk' : '3d-cat-visit')} style={{ width: '100%' }}>Join the waitlist for the real thing</button>
              <button className="pp-glass-btn" style={{ width: '100%' }} onClick={() => api.current?.menu()}>Back to the stories</button>
            </div>
            <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 10, textAlign: 'center' }}>A demo. Nothing is charged.</div>
          </div>
        </div>
      )}

      <style>{`
        .pp-world-stop:not(:disabled):hover { background: rgba(46,125,79,.1) !important; }
        @media (max-width: 860px) {
          .pp-world-cards { grid-template-columns: 1fr !important; }
          .pp-world-card-d { display: none; }
          .pp-world-card { flex-direction: row !important; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 14px !important; }
          .pp-world-card > div, .pp-world-card-img { display: none !important; }
          .pp-world-real { width: 72px !important; height: 56px !important; }
          .pp-world-card h3 { margin: 0 !important; flex: 1; }
          .pp-world-hint, .pp-world-photos { display: none !important; }
          .pp-world-stops { top: 70px !important; left: 10px !important; width: min(262px, calc(100% - 20px)) !important; padding: 9px !important; }
          .pp-world-stats { left: 10px !important; top: 10px !important; gap: 12px !important; padding: 8px 12px !important; }
          .pp-world-toast { bottom: 128px !important; }
        }
      `}</style>
    </div>
  );
}
