/**
 * Characters for CommunityWorld: people, Biscuit the dog and Lily the cat.
 *
 * Everything is built in code (no downloaded models): smooth bodies swept
 * along a spine, jointed limbs, painted fur and a small pose rig per
 * character. Imported only by CommunityWorld, so it ships inside the lazy 3D
 * chunk. Convention: +Z is the way a character faces, +X is its left side,
 * a negative rotation.x swings a hanging limb forward.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const lerp = THREE.MathUtils.lerp;
const TAU = Math.PI * 2;
const MARIGOLD = '#e0662f';

/* ---------- geometry helpers ---------- */

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

/** A copy of `geo`, scaled, rotated and moved. */
export function xf(geo: THREE.BufferGeometry, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const g = geo.clone();
  g.applyMatrix4(_m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz)));
  return g;
}
/** Bake one flat colour into a geometry (for parts that share the vertex-colour material). */
export function paint(geo: THREE.BufferGeometry, color: string) {
  const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return geo;
}
export function merge(parts: THREE.BufferGeometry[]) {
  const g = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return g;
}

/** [position along the axis, centre offset, half-width, half-depth] */
type Ring = [number, number, number, number];

/** Catmull-Rom through the control rings, so a few numbers give a smooth body. */
function smooth(ctrl: Ring[], per = 3): Ring[] {
  const out: Ring[] = [], n = ctrl.length;
  const cr = (a: number, b: number, c: number, d: number, t: number) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  for (let i = 0; i < n - 1; i++) {
    const a = ctrl[Math.max(0, i - 1)], b = ctrl[i], c = ctrl[i + 1], d = ctrl[Math.min(n - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      out.push([lerp(b[0], c[0], t), cr(a[1], b[1], c[1], d[1], t), Math.max(0.002, cr(a[2], b[2], c[2], d[2], t)), Math.max(0.002, cr(a[3], b[3], c[3], d[3], t))]);
    }
  }
  out.push(ctrl[n - 1]);
  return out;
}
function ringAt(rings: Ring[], t: number): Ring {
  for (let i = 0; i < rings.length - 1; i++) {
    if (t <= rings[i + 1][0]) { const a = rings[i], b = rings[i + 1], k = THREE.MathUtils.clamp((t - a[0]) / (b[0] - a[0]), 0, 1); return [t, lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
  }
  return rings[rings.length - 1];
}
/**
 * Elliptical tube through the rings. axis 'z': a body lying along Z (u = 0.5 is
 * the underside). axis 'y': an upright body (u = 0.5 is the front).
 */
function tube(rings: Ring[], seg: number, axis: 'y' | 'z') {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], n = rings.length;
  for (let i = 0; i < n; i++) {
    const [t, c, ra, rb] = rings[i];
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * TAU;
      if (axis === 'z') pos.push(ra * Math.sin(a), c + rb * Math.cos(a), t); else pos.push(ra * Math.sin(a), t, c - rb * Math.cos(a));
      uv.push(j / seg, i / (n - 1));
    }
  }
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < seg; j++) { const a = i * (seg + 1) + j, b = a + seg + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const nr = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) { // weld the seam so the shading has no line down the back
    const a = i * (seg + 1), b = a + seg;
    _p.set(nr.getX(a) + nr.getX(b), nr.getY(a) + nr.getY(b), nr.getZ(a) + nr.getZ(b)).normalize();
    nr.setXYZ(a, _p.x, _p.y, _p.z); nr.setXYZ(b, _p.x, _p.y, _p.z);
  }
  return g;
}

/* ---------- public shapes ---------- */

export interface Limb { up: THREE.Group; mid?: THREE.Group; low: THREE.Group; end: THREE.Object3D }
export interface PoseCtl { sit: number; seat: number; crouch: number; reach: [number, number]; wave: [number, number]; type: number; phone: number; leash: number; twist: number; look: number }
export interface Person {
  g: THREE.Group; hips: THREE.Group; torso: THREE.Group; head: THREE.Group; chest: THREE.Mesh; pony?: THREE.Group;
  legs: Limb[]; arms: Limb[]; shirt: THREE.MeshStandardMaterial;
  /** what the story asks for; `k` eases towards it every frame */
  c: PoseCtl; k: PoseCtl; w: number; phase: number; scale: number; seed: number;
}
export interface PersonOpts {
  shirt: string; pants: string; skin: string; hair: string;
  style?: 'crop' | 'pony' | 'long' | 'bun'; build?: 'f' | 'm'; height?: number; lanyard?: boolean; shorts?: boolean; shoe?: string;
}
export interface Dog {
  g: THREE.Group; body: THREE.Group; neck: THREE.Group; head: THREE.Group; jaw: THREE.Group; tongue: THREE.Mesh;
  legs: Limb[]; tail: THREE.Group[]; ears: THREE.Group[]; ring: THREE.Object3D; mouth: THREE.Object3D;
  w: number; phase: number; sitK: number; drinkK: number; scale: number;
}
export interface DogOpts { coat?: string; cream?: string; dark?: string; scale?: number; harness?: string }
export interface Cat { g: THREE.Group; body: THREE.Group; head: THREE.Group; legs: Limb[]; tail: THREE.Group[]; w: number; phase: number; sitK: number; scale: number }

const LT = 0.42, LS = 0.40, FOOT = 0.06, UA = 0.27, BASE_H = 1.72;

export function createActors(aniso = 4) {
  const geos = new Map<string, THREE.BufferGeometry>();
  const G = (key: string, make: () => THREE.BufferGeometry) => { let g = geos.get(key); if (!g) { g = make(); geos.set(key, g); } return g; };
  const sphT = new THREE.SphereGeometry(1, 16, 12), sphLo = new THREE.SphereGeometry(1, 10, 8), boxT = new THREE.BoxGeometry(1, 1, 1);
  /** ellipsoid */
  const el = (rx: number, ry: number, rz: number, x = 0, y = 0, z = 0, lo = false, rotx = 0, roty = 0, rotz = 0) => xf(lo ? sphLo : sphT, rx, ry, rz, x, y, z, rotx, roty, rotz);
  /** tapered limb segment hanging down from the origin */
  const cyl = (r1: number, r2: number, len: number, seg = 12) => { const g = new THREE.CylinderGeometry(r1, r2, len, seg, 1, true); g.translate(0, -len / 2, 0); return g; };
  const box = (w: number, h: number, d: number, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => xf(boxT, w, h, d, x, y, z, rx, ry, rz);
  /** thin rod between two points */
  const rod = (a: [number, number, number], b: [number, number, number], r: number) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va), len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, 6, 1, false);
    g.applyMatrix4(new THREE.Matrix4().compose(va.add(vb).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()), new THREE.Vector3(1, 1, 1)));
    return g;
  };
  const mk = (geo: THREE.BufferGeometry, mat: THREE.Material, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; return m; };
  const grp = (parent: THREE.Object3D, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

  /** one material for every small painted detail (faces, shoes, ID cards, harnesses) */
  const paintM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 });
  const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
    const t = new THREE.CanvasTexture(c); t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  /** short hair strokes lying along the canvas Y axis */
  const strokes = (g: CanvasRenderingContext2D, w: number, h: number, n: number, cols: string[], len = 9, alpha = 0.3) => {
    g.globalAlpha = alpha; g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      g.strokeStyle = cols[Math.floor(rnd() * cols.length)]; g.lineWidth = 0.7 + rnd() * 1.1;
      const x = rnd() * w, y = rnd() * h, l = len * (0.5 + rnd());
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y + l); g.stroke();
    }
    g.globalAlpha = 1;
  };
  const furBump = tex(128, 128, (g) => { g.fillStyle = '#808080'; g.fillRect(0, 0, 128, 128); strokes(g, 128, 128, 3200, ['#b4b4b4', '#5c5c5c', '#9a9a9a', '#6c6c6c'], 7, 0.45); }, false);
  furBump.repeat.set(3, 3);
  const furDetail = tex(128, 128, (g) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, 128, 128); strokes(g, 128, 128, 2600, ['#ffffff', '#d6d6d6', '#e6e6e6', '#cacaca'], 7, 0.3); });
  const shade = (hex: string, k: number) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
  const mix = (a: string, b: string, k: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  const fur = (o: { color?: string; map?: THREE.Texture; sheen: string }) => {
    const m = new THREE.MeshPhysicalMaterial({ color: o.color ?? '#ffffff', map: o.map ?? furDetail, roughness: 0.92, bumpMap: furBump, bumpScale: 0.45, sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(o.sheen) });
    return m;
  };

  /* ================= people ================= */

  function makePerson(o: PersonOpts): Person {
    const f = o.build !== 'm';
    const sh = f ? 0.93 : 1.02, wa = f ? 0.9 : 1.03, hp = f ? 1.04 : 0.98, lk = f ? 0.93 : 1.05, bust = f ? 0.014 : 0;
    const scale = (o.height ?? (f ? 1.63 : 1.75)) / BASE_H;
    const mSkin = new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.62 });
    const mShirt = new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.9 });
    const mPants = new THREE.MeshStandardMaterial({ color: o.pants, roughness: 0.88 });
    const mHair = new THREE.MeshStandardMaterial({ color: o.hair, roughness: 0.48 });
    const shoe = o.shoe ?? '#f2f2ee', style = o.style ?? (f ? 'pony' : 'crop');
    const bk = f ? 'f' : 'm';

    const g = new THREE.Group();
    const rig = grp(g); rig.scale.setScalar(scale);
    const hips = grp(rig, 0, LT + LS + FOOT, 0);
    hips.add(mk(G(`pelvis:${bk}`, () => tube(smooth([[-0.16, 0, 0.004, 0.004], [-0.145, 0, 0.07 * hp, 0.06], [-0.09, -0.005, 0.148 * hp, 0.098], [-0.02, -0.005, 0.154 * hp, 0.102], [0.04, 0, 0.142 * hp, 0.094], [0.085, 0, 0.12, 0.08], [0.095, 0, 0.004, 0.004]]), 16, 'y')), mPants));

    const legs: Limb[] = [], arms: Limb[] = [];
    for (const sg of [-1, 1]) {
      const up = grp(hips, sg * 0.09 * hp, 0, 0); up.scale.set(lk, 1, lk);
      up.add(mk(G('thigh', () => merge([el(0.088, 0.088, 0.088), cyl(0.086, 0.06, LT), el(0.06, 0.06, 0.06, 0, -LT, 0, true)])), mPants));
      const low = grp(up, 0, -LT, 0);
      low.add(mk(G('shin', () => merge([cyl(0.058, 0.04, LS), el(0.046, 0.1, 0.052, 0, -0.14, -0.012, true), el(0.04, 0.04, 0.04, 0, -LS, 0, true)])), o.shorts ? mSkin : mPants));
      const end = grp(low, 0, -LS, 0);
      end.add(mk(G(`shoe:${shoe}`, () => merge([paint(el(0.046, 0.04, 0.11, 0, -0.022, 0.052), shoe), paint(el(0.043, 0.042, 0.05, 0, -0.02, -0.012, true), shoe), paint(box(0.092, 0.02, 0.245, 0, -0.05, 0.045), '#e9e6de')])), paintM));
      legs.push({ up, low, end });
    }

    const torso = grp(hips, 0, 0.08, 0);
    const chest = mk(G(`torso:${bk}`, () => tube(smooth([[-0.09, -0.004, 0.16 * hp, 0.108], [-0.02, -0.003, 0.152 * hp, 0.102], [0.08, 0, 0.132 * wa, 0.09], [0.2, 0.006 + bust * 0.4, 0.15 * sh, 0.1], [0.31, 0.01 + bust, 0.168 * sh, 0.108], [0.385, 0.004, 0.18 * sh, 0.094], [0.43, 0, 0.14 * sh, 0.074], [0.463, -0.002, 0.064, 0.058], [0.475, -0.002, 0.004, 0.004]], 4), 18, 'y')), mShirt);
    torso.add(chest);
    torso.add(mk(G(`neck:${bk}`, () => xf(cyl(0.046, 0.05, 0.1), lk, 1, lk, 0, 0.54, 0.002)), mSkin));

    for (const sg of [-1, 1]) {
      const up = grp(torso, sg * 0.17 * sh, 0.385, 0); up.scale.set(lk, 1, lk);
      up.add(mk(G('sleeve', () => merge([el(0.052, 0.054, 0.052), cyl(0.051, 0.046, 0.15)])), mShirt));
      up.add(mk(G('upperarm', () => merge([cyl(0.044, 0.039, UA), el(0.04, 0.04, 0.04, 0, -UA, 0, true)])), mSkin));
      const low = grp(up, 0, -UA, 0);
      low.add(mk(G('forearm', () => merge([cyl(0.039, 0.029, 0.235), el(0.029, 0.029, 0.029, 0, -0.235, 0, true), el(0.02, 0.048, 0.036, 0, -0.277, 0.006, true), el(0.011, 0.024, 0.013, 0, -0.262, 0.036, true)])), mSkin));
      const end = new THREE.Object3D(); end.position.set(0, -0.285, 0.012); low.add(end);
      arms.push({ up, low, end });
    }

    const head = grp(torso, 0, 0.635, 0.008);
    head.add(mk(G('head', () => merge([
      tube(smooth([[-0.118, 0.022, 0.004, 0.004], [-0.108, 0.02, 0.03, 0.034], [-0.085, 0.014, 0.052, 0.062], [-0.045, 0.006, 0.071, 0.084], [0.005, 0, 0.078, 0.094], [0.055, -0.004, 0.078, 0.097], [0.095, -0.008, 0.058, 0.075], [0.113, -0.008, 0.028, 0.035], [0.118, -0.008, 0.004, 0.004]], 4), 20, 'y'),
      el(0.011, 0.028, 0.018, -0.078, -0.005, -0.008, true), el(0.011, 0.028, 0.018, 0.078, -0.005, -0.008, true), el(0.0125, 0.02, 0.016, 0, -0.022, 0.093, true),
    ])), mSkin));
    const lip = mix(o.skin, '#9c3b3d', 0.5);
    head.add(mk(G(`face:${o.hair}:${lip}`, () => merge([-1, 1].flatMap((sg) => [
      paint(el(0.0155, 0.0105, 0.006, sg * 0.0335, 0.006, 0.0835, true), '#f7f3ee'),
      paint(el(0.0086, 0.009, 0.004, sg * 0.0335, 0.0058, 0.0868, true), '#2c1a10'),
      paint(el(0.0022, 0.0022, 0.002, sg * 0.0335 + 0.003, 0.009, 0.0902, true), '#ffffff'),
      paint(box(0.031, 0.0024, 0.005, sg * 0.0335, 0.0168, 0.0858), '#1a1210'),
      paint(box(0.03, 0.0036, 0.006, sg * 0.0345, 0.0365, 0.0868, 0, 0, -sg * 0.07), shade(o.hair, 0.9)),
    ]).concat([paint(xf(new THREE.TorusGeometry(0.019, 0.0032, 5, 12, Math.PI * 0.62), 1, 1, 1, 0, -0.047, 0.083, 0.1, 0, Math.PI * 1.19), shade(lip, 0.82))]))), paintM, false));
    // hair: one full shell set back and up from the skull, so the hairline is simply where the two meet
    const cap = () => el(f ? 0.088 : 0.086, f ? 0.097 : 0.094, f ? 0.1 : 0.098, 0, 0.03, -0.022);
    head.add(mk(G(`hair:${style}:${bk}`, () => merge(
      style === 'long' ? [cap(), el(0.088, 0.165, 0.055, 0, -0.1, -0.058), el(0.024, 0.1, 0.035, -0.078, -0.085, -0.01), el(0.024, 0.1, 0.035, 0.078, -0.085, -0.01)]
        : style === 'bun' ? [cap(), el(0.043, 0.043, 0.043, 0, 0.055, -0.118)]
          : style === 'pony' ? [cap(), el(0.022, 0.022, 0.022, 0, 0.045, -0.117, true)]
            : [cap()])), mHair));
    let pony: THREE.Group | undefined;
    if (style === 'pony') {
      pony = grp(head, 0, 0.045, -0.118);
      pony.add(mk(G('ponytail', () => merge([el(0.03, 0.03, 0.03, 0, -0.02, -0.004), xf(cyl(0.03, 0.013, 0.2), 1, 1, 1, 0, -0.02, 0), el(0.013, 0.022, 0.013, 0, -0.222, 0)])), mHair));
    }

    if (o.lanyard) {
      const zc = 0.113 + (f ? 0.014 : 0);
      torso.add(mk(G(`lanyard:${bk}`, () => merge([
        ...[-1, 1].flatMap((sg) => [paint(rod([sg * 0.045, 0.462, 0.056], [sg * 0.028, 0.4, 0.102], 0.0055), MARIGOLD), paint(rod([sg * 0.028, 0.4, 0.102], [0, 0.3, zc + 0.006], 0.0055), MARIGOLD)]),
        paint(box(0.06, 0.082, 0.006, 0, 0.258, zc + 0.008), '#fbfaf6'), paint(box(0.06, 0.02, 0.0066, 0, 0.289, zc + 0.0085), '#2e7d4f'),
        paint(box(0.022, 0.028, 0.0066, -0.012, 0.25, zc + 0.0085), '#c9a987'), paint(box(0.02, 0.004, 0.0066, 0.014, 0.257, zc + 0.0085), '#9aa69c'), paint(box(0.02, 0.004, 0.0066, 0.014, 0.245, zc + 0.0085), '#9aa69c'),
      ])), paintM, false));
    }

    const ctl = (): PoseCtl => ({ sit: 0, seat: 0.55, crouch: 0, reach: [0, 0], wave: [0, 0], type: 0, phone: 0, leash: -1, twist: 0, look: 0 });
    return { g, hips, torso, head, chest, pony, legs, arms, shirt: mShirt, c: ctl(), k: ctl(), w: 0, phase: 0, scale, seed: rnd() * 6 };
  }

  /** metres of travel → gait phase; pace 0 is a walk, 1 an easy jog */
  const stride = (pace: number) => TAU / lerp(1.5, 2.8, pace);

  function posePerson(p: Person, dt: number, time: number, moving: boolean, pace = 0) {
    const s = Math.min(1, dt * 7), c = p.c, k = p.k;
    p.w += ((moving ? 1 : 0) - p.w) * s;
    k.sit += (c.sit - k.sit) * s; k.crouch += (c.crouch - k.crouch) * Math.min(1, dt * 4.5); k.type += (c.type - k.type) * s; k.phone += (c.phone - k.phone) * s;
    k.twist += (c.twist - k.twist) * Math.min(1, dt * 4); k.look += (c.look - k.look) * Math.min(1, dt * 4);
    for (let i = 0; i < 2; i++) { k.reach[i] += (c.reach[i] - k.reach[i]) * Math.min(1, dt * 5); k.wave[i] += (c.wave[i] - k.wave[i]) * Math.min(1, dt * 6); }
    const w = p.w, cr = k.crouch, sit = k.sit, ph0 = p.phase;
    const A = lerp(0.42, 0.66, pace), K = lerp(0.95, 1.6, pace);

    let reachY = 0;
    for (let i = 0; i < 2; i++) {
      const ph = ph0 + i * Math.PI, leg = p.legs[i];
      let a = -A * Math.sin(ph) * w - 0.95 * cr;
      let kn = (K * Math.max(0, Math.cos(ph + 0.35)) ** 2 + 0.1) * w + 1.75 * cr;
      a = lerp(a, -1.5, sit); kn = lerp(kn, 1.5, sit);
      leg.up.rotation.x = a; leg.low.rotation.x = kn;
      leg.end.rotation.x = -(a + kn) * lerp(1, 0.72, w * (1 - cr) * (1 - sit));
      reachY = Math.max(reachY, LT * Math.cos(a) + LS * Math.cos(a + kn));
    }
    // the lower foot stays on the ground; a jog adds a little flight
    const stand = reachY + FOOT + lerp(0, 0.05, pace) * w * (0.5 - 0.5 * Math.cos(2 * ph0));
    p.hips.position.y = lerp(stand, c.seat / p.scale, sit);

    for (let i = 0; i < 2; i++) {
      const sg = i === 0 ? -1 : 1, arm = p.arms[i], sn = Math.sin(ph0 + i * Math.PI);
      let ux = lerp(0.5, 0.8, pace) * sn * w + 0.03;
      let lx = -(0.15 + w * (lerp(0.45, 0.3, pace) * (0.5 - 0.5 * sn) + lerp(0, 1.15, pace)));
      let uz = sg * 0.07, lz = 0;
      if (c.leash === i) { ux = lerp(ux, -0.32 + 0.05 * Math.sin(2 * ph0) * w, 0.85); lx = lerp(lx, -0.85, 0.85); uz = sg * 0.1; }
      ux = lerp(ux, -0.55, k.type); lx = lerp(lx, -1.1 + Math.sin(time * 9 + i * 1.7) * 0.05, k.type);
      if (i === 0) { ux = lerp(ux, -0.5, k.phone); lx = lerp(lx, -1.6, k.phone); uz = lerp(uz, sg * -0.1, k.phone); }
      const r = k.reach[i]; ux = lerp(ux, -1.15, r); lx = lerp(lx, -0.3, r);
      const wv = k.wave[i]; ux = lerp(ux, 0, wv); lx = lerp(lx, 0, wv); uz = lerp(uz, sg * 2.45, wv); lz = sg * wv * (0.55 + Math.sin(time * 9) * 0.35);
      arm.up.rotation.set(ux, 0, uz); arm.low.rotation.set(lx, 0, lz);
    }
    const lean = lerp(0.02, 0.1, pace) * w + 0.55 * cr + 0.05 * k.type + 0.12 * k.phone;
    p.torso.rotation.set(lean, -0.1 * Math.sin(ph0) * w + k.twist, 0);
    p.chest.scale.z = 1 + Math.sin(time * 1.7 + p.seed) * 0.014;
    p.head.rotation.set(-lean * 0.55 + 0.3 * cr + 0.32 * k.phone + 0.08 * k.type, 0.08 * Math.sin(ph0) * w + k.look, 0);
    if (p.pony) p.pony.rotation.set(0.3 + lean * 0.5 + 0.14 * w * Math.sin(2 * ph0 + 0.6), 0, 0.22 * w * Math.sin(ph0));
  }

  /* ================= Biscuit ================= */

  function makeDog(o: DogOpts = {}): Dog {
    const coat = o.coat ?? '#d9a05b', cream = o.cream ?? '#f0d2a0', dark = o.dark ?? '#b97c3d', scale = o.scale ?? 1, strap = o.harness ?? MARIGOLD;
    const sheen = mix(cream, '#ffffff', 0.35);
    // painted coats: u = 0.5 is the belly / throat, v runs from the rump to the chest
    const bodyTex = tex(256, 256, (g) => {
      g.fillStyle = coat; g.fillRect(0, 0, 256, 256);
      let gr = g.createLinearGradient(0, 0, 256, 0);
      gr.addColorStop(0, shade(coat, 0.84)); gr.addColorStop(0.16, 'rgba(0,0,0,0)'); gr.addColorStop(0.84, 'rgba(0,0,0,0)'); gr.addColorStop(1, shade(coat, 0.84));
      g.fillStyle = gr; g.globalAlpha = 0.9; g.fillRect(0, 0, 256, 256); g.globalAlpha = 1;
      for (let y = 0; y < 256; y += 4) { // cream underside, widening into a chest bib
        const v = y / 256, half = lerp(34, 96, THREE.MathUtils.smoothstep(v, 0.55, 0.95));
        gr = g.createLinearGradient(128 - half, 0, 128 + half, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.35, cream); gr.addColorStop(0.65, cream); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(128 - half, y, half * 2, 4);
      }
      strokes(g, 256, 256, 7000, [shade(coat, 1.1), shade(coat, 0.88), coat, mix(coat, cream, 0.5)], 7, 0.16);
    });
    const headTex = tex(128, 128, (g) => {
      g.fillStyle = coat; g.fillRect(0, 0, 128, 128);
      let gr = g.createLinearGradient(0, 62, 0, 92); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, cream);
      g.fillStyle = gr; g.fillRect(0, 62, 128, 66);
      gr = g.createLinearGradient(34, 0, 94, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, cream); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(34, 0, 60, 128);
      strokes(g, 128, 128, 2000, [shade(coat, 1.1), shade(coat, 0.88), mix(coat, cream, 0.5)], 5, 0.16);
    });
    const bibTex = tex(128, 64, (g) => {
      g.fillStyle = coat; g.fillRect(0, 0, 128, 64);
      const gr = g.createLinearGradient(20, 0, 108, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.4, cream); gr.addColorStop(0.6, cream); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(20, 0, 88, 64);
      strokes(g, 128, 64, 1200, [shade(coat, 1.1), shade(coat, 0.88), mix(coat, cream, 0.5)], 6, 0.16);
    });
    const mBody = fur({ map: bodyTex, sheen }), mHead = fur({ map: headTex, sheen }), mNeck = fur({ map: bibTex, sheen });
    const mCoat = fur({ color: coat, sheen }), mCream = fur({ color: cream, sheen }), mDark = fur({ color: dark, sheen });

    const g = new THREE.Group();
    const rig = grp(g); rig.scale.setScalar(scale);
    const body = grp(rig, 0, 0.4, 0.2);            // pivots at the shoulders, so a sit drops the hips
    const off = grp(body, 0, -0.4, -0.2);          // everything below is in plain model coordinates

    const rings = smooth([[-0.335, 0.5, 0.004, 0.004], [-0.32, 0.5, 0.055, 0.06], [-0.28, 0.485, 0.098, 0.105], [-0.21, 0.465, 0.118, 0.13], [-0.11, 0.475, 0.106, 0.11], [-0.01, 0.465, 0.114, 0.125], [0.09, 0.445, 0.126, 0.15], [0.18, 0.44, 0.126, 0.155], [0.25, 0.455, 0.108, 0.135], [0.295, 0.47, 0.07, 0.09], [0.315, 0.48, 0.004, 0.004]], 3);
    off.add(mk(G('dogbody', () => tube(rings, 18, 'z')), mBody));

    const legs: Limb[] = [];
    for (const sg of [-1, 1]) { // front legs: shoulder, forearm, pastern and paw
      const up = grp(off, sg * 0.085, 0.4, 0.2);
      up.add(mk(G('dFU', () => merge([el(0.05, 0.062, 0.056, 0, -0.01, 0, true), cyl(0.046, 0.034, 0.16), el(0.034, 0.034, 0.034, 0, -0.16, 0, true)])), mCoat));
      const mid = grp(up, 0, -0.16, 0);
      mid.add(mk(G('dFM', () => merge([cyl(0.033, 0.026, 0.17), el(0.027, 0.027, 0.027, 0, -0.17, 0, true)])), mCoat));
      const low = grp(mid, 0, -0.17, 0);
      low.add(mk(G('dFL', () => merge([cyl(0.026, 0.025, 0.05), el(0.034, 0.025, 0.046, 0, -0.052, 0.014, true)])), mCream));
      legs.push({ up, mid, low, end: low });
    }
    for (const sg of [-1, 1]) { // hind legs: thigh, shank, hock and paw
      const up = grp(off, sg * 0.082, 0.46, -0.22);
      up.add(mk(G('dHU', () => merge([el(0.06, 0.088, 0.082, 0, -0.035, 0.012), xf(cyl(0.055, 0.037, 0.2), 1, 1, 1.25), el(0.038, 0.038, 0.04, 0, -0.2, 0, true)])), mCoat));
      const mid = grp(up, 0, -0.2, 0);
      mid.add(mk(G('dHM', () => merge([cyl(0.036, 0.024, 0.2), el(0.025, 0.025, 0.025, 0, -0.2, 0, true)])), mCoat));
      const low = grp(mid, 0, -0.2, 0);
      low.add(mk(G('dHL', () => merge([cyl(0.024, 0.022, 0.09), el(0.032, 0.024, 0.045, 0, -0.09, 0.014, true)])), mCream));
      legs.push({ up, mid, low, end: low });
    }

    const neck = grp(off, 0, 0.5, 0.235);
    neck.add(mk(G('dogneck', () => tube(smooth([[-0.07, -0.01, 0.088, 0.1], [0, 0, 0.08, 0.09], [0.08, 0.004, 0.067, 0.073], [0.15, 0.006, 0.06, 0.064], [0.19, 0.006, 0.052, 0.052]], 3), 14, 'y')), mNeck));
    neck.add(mk(G(`collar:${strap}`, () => merge([paint(xf(new THREE.TorusGeometry(0.068, 0.011, 6, 18), 1, 1.08, 1, 0, 0.1, 0.004, Math.PI / 2), strap), paint(xf(new THREE.CylinderGeometry(0.017, 0.017, 0.005, 10), 1, 1, 1, 0, 0.076, 0.084, Math.PI / 2 - 0.3), '#e8c04a')])), paintM, false));
    const head = grp(neck, 0, 0.165, 0.012); head.scale.setScalar(1.14);
    head.add(mk(G('doghead', () => tube(smooth([[-0.062, 0.02, 0.004, 0.004], [-0.048, 0.02, 0.05, 0.05], [0, 0.03, 0.078, 0.078], [0.045, 0.03, 0.076, 0.072], [0.085, 0.012, 0.06, 0.057], [0.12, -0.008, 0.047, 0.045], [0.165, -0.014, 0.043, 0.041], [0.198, -0.016, 0.035, 0.033], [0.214, -0.016, 0.004, 0.004]], 3), 16, 'z')), mHead));
    head.add(mk(G('dogface', () => merge([
      ...[-1, 1].flatMap((sg) => [paint(el(0.0125, 0.0125, 0.009, sg * 0.041, 0.044, 0.087, true), '#2a1c14'), paint(el(0.0034, 0.0034, 0.003, sg * 0.038, 0.049, 0.0945, true), '#ffffff')]),
      paint(el(0.022, 0.017, 0.016, 0, -0.004, 0.206, true), '#1d1a17'), paint(el(0.02, 0.004, 0.045, 0, -0.054, 0.16, true), '#4a2f25'),
    ])), paintM, false));
    const ears: THREE.Group[] = [];
    for (const sg of [-1, 1]) { const e = grp(head, sg * 0.064, 0.074, -0.004); e.add(mk(G(`dogear${sg}`, () => el(0.015, 0.07, 0.043, sg * 0.012, -0.06, 0.008)), mDark)); ears.push(e); }
    const jaw = grp(head, 0, -0.04, 0.1);
    jaw.add(mk(G('dogjaw', () => el(0.027, 0.012, 0.055, 0, -0.008, 0.05)), mCream, false));
    const tongue = mk(G('dogtongue', () => merge([paint(el(0.014, 0.005, 0.045, 0, 0.005, 0.066, true), '#ee8496'), paint(el(0.013, 0.005, 0.022, 0, -0.004, 0.108, true, 0.5), '#ee8496')])), paintM, false);
    jaw.add(tongue);
    const mouth = new THREE.Object3D(); mouth.position.set(0, -0.03, 0.2); head.add(mouth);

    const tail: THREE.Group[] = [];
    let tp: THREE.Object3D = off;
    for (let i = 0; i < 5; i++) {
      const t = grp(tp, 0, i === 0 ? 0.545 : 0, i === 0 ? -0.315 : -0.068);
      const r1 = 0.029 - i * 0.0035, r2 = 0.0255 - i * 0.0035;
      t.add(mk(G(`dtail${i}`, () => merge([xf(cyl(r1, r2, 0.068), 1, 1, 1, 0, 0, 0, Math.PI / 2), el(r2, r2, r2, 0, 0, -0.068, true), el(0.011, 0.03 - i * 0.004, 0.058, 0, -0.022, -0.036, true)])), mCream));
      tail.push(t); tp = t;
    }

    // marigold harness with a leash ring on the back
    const band = (z0: number, z1: number) => { const a = ringAt(rings, z0), b = ringAt(rings, z1); return tube([[z0, a[1], a[2] + 0.006, a[3] + 0.006], [z1, b[1], b[2] + 0.006, b[3] + 0.006]], 18, 'z'); };
    const top = ringAt(rings, 0.16);
    off.add(mk(G(`harness:${strap}`, () => merge([
      paint(band(0.07, 0.104), strap), paint(band(0.236, 0.266), strap), paint(box(0.034, 0.008, 0.2, 0, top[1] + top[3] + 0.006, 0.168), strap),
      paint(xf(new THREE.TorusGeometry(0.015, 0.004, 5, 12), 1, 1, 1, 0, top[1] + top[3] + 0.022, 0.15, 0, Math.PI / 2), '#c9ccce'),
    ])), paintM));
    const ring = new THREE.Object3D(); ring.position.set(0, top[1] + top[3] + 0.03, 0.15); off.add(ring);
    return { g, body, neck, head, jaw, tongue, legs, tail, ears, ring, mouth, w: 0, phase: 0, sitK: 0, drinkK: 0, scale };
  }

  /** metres of travel → trot phase */
  const DOG_STRIDE = TAU / 1.25;

  function poseDog(d: Dog, dt: number, time: number, moving: boolean, o: { sit?: boolean; drink?: boolean; wag?: number; walk?: boolean } = {}) {
    d.w += ((moving ? 1 : 0) - d.w) * Math.min(1, dt * 8);
    d.sitK += ((o.sit && !moving ? 1 : 0) - d.sitK) * Math.min(1, dt * 5);
    d.drinkK += ((o.drink ? 1 : 0) - d.drinkK) * Math.min(1, dt * 5);
    const w = d.w, st = d.sitK, dk = d.drinkK, amp = o.walk ? 0.7 : 1;
    for (let i = 0; i < 4; i++) {
      const front = i < 2, ph = d.phase + (i === 0 || i === 3 ? 0 : Math.PI);
      const sn = Math.sin(ph) * amp, lift = Math.max(0, Math.cos(ph + 0.3)) ** 1.5 * amp, L = d.legs[i];
      if (front) { L.up.rotation.x = 0.3 - 0.44 * sn * w + 0.72 * st; L.mid!.rotation.x = -0.3 - 0.3 * lift * w; L.low.rotation.x = -0.05 + 1.25 * lift * w; }
      else { L.up.rotation.x = -0.45 - 0.38 * sn * w - 0.03 * st; L.mid!.rotation.x = 1.05 + 0.45 * lift * w + 1.4 * st; L.low.rotation.x = -0.6 - 0.42 * lift * w - 2.1 * st; }
    }
    d.body.rotation.x = -0.72 * st + 0.05 * dk;
    d.body.position.y = 0.4 + 0.014 * Math.cos(2 * d.phase) * w;
    d.body.rotation.z = 0.03 * Math.sin(d.phase) * w;
    const neckRot = 0.75 + 0.5 * st + 1.55 * dk + 0.05 * Math.sin(2 * d.phase + 0.5) * w;
    d.neck.rotation.x = neckRot;
    const pitch = 0.92 * dk + (dk > 0.5 ? Math.sin(time * 8) * 0.07 : 0) + 0.04 * Math.sin(2 * d.phase) * w + Math.sin(time * 1.3) * 0.03 - 0.12 * st;
    d.head.rotation.x = -(neckRot + d.body.rotation.x) + pitch;
    d.head.rotation.z = st * Math.sin(time * 0.9) * 0.12;
    const wag = o.wag ?? 1, speed = st > 0.5 ? 15 : 10.5;
    d.tail.forEach((t, i) => { t.rotation.y = wag * (0.18 + i * 0.12) * Math.sin(time * speed - i * 0.55); t.rotation.x = i === 0 ? 0.5 + 0.3 * st - 0.25 * dk : 0.13; });
    d.ears.forEach((e, i) => { const sg = i === 0 ? -1 : 1; e.rotation.z = sg * (0.2 + 0.2 * w * Math.abs(Math.sin(d.phase))); e.rotation.x = 0.16 * w * Math.sin(2 * d.phase - 0.8) + 0.5 * dk; });
    const pant = (1 - dk) * (0.55 + 0.45 * w);
    d.jaw.rotation.x = pant * (0.24 + 0.05 * Math.sin(time * 13));
    d.tongue.visible = pant > 0.2;
  }

  /* ================= Lily ================= */

  function makeCat(scale = 1): Cat {
    const coat = '#e8954a', stripe = '#c56f2a', cream = '#f8e3ca';
    const sheen = '#ffe9cf';
    const bodyTex = tex(256, 256, (g) => {
      g.fillStyle = coat; g.fillRect(0, 0, 256, 256);
      g.lineCap = 'round';
      for (let i = 0; i < 13; i++) { // tabby bands over the back, fading towards the belly
        const y = 14 + i * 19 + rnd() * 5;
        for (const side of [0, 1]) {
          g.strokeStyle = stripe; g.lineWidth = 5 + rnd() * 3; g.globalAlpha = 0.85; g.beginPath();
          for (let k = 0; k <= 8; k++) { const x = side ? 256 - k * 11 : k * 11, yy = y + Math.sin(k * 0.9 + i) * 4 + k * 1.2; if (k) g.lineTo(x, yy); else g.moveTo(x, yy); }
          g.stroke();
        }
      }
      g.globalAlpha = 1;
      for (let y = 0; y < 256; y += 4) {
        const half = lerp(26, 70, THREE.MathUtils.smoothstep(y / 256, 0.5, 0.95)), gr = g.createLinearGradient(128 - half, 0, 128 + half, 0);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.4, cream); gr.addColorStop(0.6, cream); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(128 - half, y, half * 2, 4);
      }
      strokes(g, 256, 256, 5200, [shade(coat, 1.1), shade(coat, 0.9), mix(coat, cream, 0.5)], 6, 0.14);
    });
    const headTex = tex(128, 128, (g) => {
      g.fillStyle = coat; g.fillRect(0, 0, 128, 128);
      g.strokeStyle = stripe; g.lineWidth = 3.5; g.globalAlpha = 0.85; g.lineCap = 'round';
      for (const x of [0, 9, 119, 128, 20, 108]) { g.beginPath(); g.moveTo(x, 18); g.lineTo(x + (x < 64 ? 3 : -3), 70); g.stroke(); }
      g.globalAlpha = 1;
      let gr = g.createLinearGradient(0, 80, 0, 104); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, cream);
      g.fillStyle = gr; g.fillRect(0, 80, 128, 48);
      gr = g.createLinearGradient(30, 0, 98, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, cream); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(30, 40, 68, 88);
      strokes(g, 128, 128, 1600, [shade(coat, 1.1), shade(coat, 0.9), mix(coat, cream, 0.5)], 5, 0.14);
    });
    const mBody = fur({ map: bodyTex, sheen }), mHead = fur({ map: headTex, sheen });
    const mCoat = fur({ color: coat, sheen }), mStripe = fur({ color: stripe, sheen }), mCream = fur({ color: cream, sheen });

    const g = new THREE.Group();
    const rig = grp(g); rig.scale.setScalar(scale);
    const body = grp(rig, 0, 0.17, 0.11), off = grp(body, 0, -0.17, -0.11);
    off.add(mk(G('catbody', () => tube(smooth([[-0.185, 0.215, 0.003, 0.003], [-0.172, 0.215, 0.04, 0.045], [-0.12, 0.205, 0.066, 0.072], [-0.03, 0.2, 0.065, 0.068], [0.07, 0.2, 0.063, 0.07], [0.14, 0.212, 0.052, 0.058], [0.178, 0.224, 0.03, 0.035], [0.192, 0.228, 0.003, 0.003]], 3), 16, 'z')), mBody));
    const legs: Limb[] = [];
    for (const sg of [-1, 1]) {
      const up = grp(off, sg * 0.04, 0.17, 0.11);
      up.add(mk(G('cFU', () => merge([el(0.026, 0.034, 0.03, 0, -0.005, 0, true), cyl(0.024, 0.018, 0.085, 8), el(0.018, 0.018, 0.018, 0, -0.085, 0, true)])), mCoat));
      const low = grp(up, 0, -0.085, 0);
      low.add(mk(G('cFL', () => merge([cyl(0.017, 0.015, 0.068, 8), el(0.019, 0.016, 0.026, 0, -0.068, 0.007, true)])), mCream));
      legs.push({ up, low, end: low });
    }
    for (const sg of [-1, 1]) {
      const up = grp(off, sg * 0.045, 0.19, -0.11);
      up.add(mk(G('cHU', () => merge([el(0.032, 0.048, 0.046, 0, -0.02, 0.008, true), xf(cyl(0.03, 0.019, 0.1, 8), 1, 1, 1.2), el(0.019, 0.019, 0.02, 0, -0.1, 0, true)])), mCoat));
      const low = grp(up, 0, -0.1, 0);
      low.add(mk(G('cHL', () => merge([cyl(0.018, 0.015, 0.095, 8), el(0.019, 0.016, 0.027, 0, -0.095, 0.008, true)])), mCream));
      legs.push({ up, low, end: low });
    }
    const head = grp(off, 0, 0.262, 0.195);
    head.add(mk(G('cathead', () => tube(smooth([[-0.058, 0, 0.003, 0.003], [-0.046, 0, 0.035, 0.034], [-0.01, 0.004, 0.058, 0.052], [0.02, 0, 0.057, 0.05], [0.045, -0.008, 0.043, 0.038], [0.06, -0.014, 0.026, 0.022], [0.068, -0.014, 0.003, 0.003]], 3), 16, 'z')), mHead));
    const earGeo = () => new THREE.ConeGeometry(1, 1, 10);
    head.add(mk(G('catears', () => merge([-1, 1].map((sg) => xf(earGeo(), 0.026, 0.056, 0.014, sg * 0.036, 0.062, -0.006, -0.12, 0, -sg * 0.3)))), mCoat));
    head.add(mk(G('catface', () => merge([
      ...[-1, 1].flatMap((sg) => [
        paint(xf(earGeo(), 0.016, 0.04, 0.006, sg * 0.036, 0.058, 0.002, -0.12, 0, -sg * 0.3), '#f3a1a6'),
        paint(el(0.0115, 0.0105, 0.006, sg * 0.024, 0.008, 0.049, true, 0, sg * 0.35), '#a9c94e'),
        paint(el(0.003, 0.0088, 0.004, sg * 0.0255, 0.008, 0.0535, true, 0, sg * 0.35), '#15120f'),
        paint(el(0.013, 0.011, 0.012, sg * 0.011, -0.02, 0.058, true), '#fbeedd'),
        ...[0, 1, 2].map((k) => paint(rod([sg * 0.018, -0.02 + k * 0.003, 0.06], [sg * 0.075, -0.026 + k * 0.012, 0.05], 0.0008), '#ffffff')),
      ]),
      paint(el(0.006, 0.0045, 0.004, 0, -0.011, 0.068, true), '#e98c95'), paint(el(0.014, 0.01, 0.012, 0, -0.03, 0.052, true), '#fbeedd'),
    ])), paintM, false));
    const tail: THREE.Group[] = [];
    let tp: THREE.Object3D = off;
    for (let i = 0; i < 6; i++) {
      const t = grp(tp, 0, i === 0 ? 0.232 : 0, i === 0 ? -0.176 : -0.055);
      const r1 = 0.019 - i * 0.0012, r2 = 0.018 - i * 0.0012;
      t.add(mk(G(`ctail${i}`, () => merge([xf(cyl(r1, r2, 0.055, 8), 1, 1, 1, 0, 0, 0, Math.PI / 2), el(r2, r2, r2, 0, 0, -0.055, true)])), i === 5 ? mCream : i % 2 ? mStripe : mCoat));
      tail.push(t); tp = t;
    }
    return { g, body, head, legs, tail, w: 0, phase: 0, sitK: 1, scale };
  }

  const CAT_STRIDE = TAU / 0.5;

  function poseCat(c: Cat, dt: number, time: number, moving: boolean, sit = true) {
    c.w += ((moving ? 1 : 0) - c.w) * Math.min(1, dt * 8);
    c.sitK += ((sit && !moving ? 1 : 0) - c.sitK) * Math.min(1, dt * 4);
    const w = c.w, st = c.sitK;
    for (let i = 0; i < 4; i++) {
      const front = i < 2, ph = c.phase + (i === 0 || i === 3 ? 0 : Math.PI), sn = Math.sin(ph), lift = Math.max(0, Math.cos(ph + 0.3)), L = c.legs[i];
      if (front) { L.up.rotation.x = 0.2 - 0.5 * sn * w + 0.68 * st; L.low.rotation.x = -0.2 + 0.7 * lift * w; }
      else { L.up.rotation.x = -0.5 - 0.45 * sn * w - 0.27 * st; L.low.rotation.x = 0.95 + 0.5 * lift * w + 1.5 * st; }
    }
    c.body.rotation.x = -0.68 * st;
    c.body.position.y = 0.17 + 0.006 * Math.cos(2 * c.phase) * w;
    c.head.rotation.x = 0.68 * st + Math.sin(time * 0.8) * 0.04; c.head.rotation.y = st * Math.sin(time * 0.5) * 0.25;
    c.tail.forEach((t, i) => {
      // sitting: laid on the ground and curled round; walking: carried high with a hooked tip
      t.rotation.x = i === 0 ? lerp(1.15, 0.72, st) : lerp(i > 3 ? -0.3 : 0.06, 0.02, st);
      t.rotation.y = lerp(Math.sin(time * 3 - i * 0.6) * 0.12, 0.42 + (i > 3 ? Math.sin(time * 2.2) * 0.3 : 0), st);
    });
  }

  return { makePerson, posePerson, stride, makeDog, poseDog, DOG_STRIDE, makeCat, poseCat, CAT_STRIDE };
}
