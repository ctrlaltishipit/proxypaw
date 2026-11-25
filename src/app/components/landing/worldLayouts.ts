/**
 * The communities the 3D explorer can show (see CommunityWorld.tsx).
 *
 * Each layout is an illustrative model based on that community's published
 * master plan: where the homes stand, the internal roads, the jogging track,
 * the pool, the clubhouse and the lawns. Distances are in metres; x runs to the
 * right of the published plan sheet and z runs down it (MyScape Courtyard's
 * sheet is drawn with north at the bottom, so nothing here prints a compass
 * direction). Proportions are read off the plans; they are not surveys, and
 * ProxyPaw is not affiliated with any developer. Never copy a brochure image
 * into the site.
 *
 * One engine builds every community, so every layout supplies the same
 * anchors: a road loop (`ring`), a jogging track (`loop`), link roads and
 * paths, the homes (`towers` or `villas`), the amenities, three benches, four
 * walk stops, and the cameras (`aerial`, `start`, `story`).
 *
 * TO ADD A COMMUNITY: write one `Layout` object below and add it to
 * `COMMUNITIES` at the foot of this file. Nothing else changes: the picker,
 * its area filter and the engine all read that list. A community is only
 * offered to visitors once its layout is in the list, so there are no
 * placeholders. A model still being checked can sit in `DRAFTS` instead: it is
 * then only reachable with #ppdraft in the address.
 *
 * Sizes: small sites are modelled at real size; large ones are scaled down to
 * fit the engine's ground (each layout's comment says by how much), and where
 * a site is about half size its tower heights are reduced to match.
 */
/** the areas of Hyderabad the picker can filter by, in the order shown */
export const AREAS = ['Financial District', 'Nanakramguda', 'Kokapet', 'Puppalaguda', 'Gachibowli'] as const;
export type Area = (typeof AREAS)[number];
/** a community's id is its key in `LAYOUTS`; see `COMMUNITY_IDS` for the ones that exist */
export type CommunityId = string;
export type StopId = 'water' | 'fetch' | 'hello' | 'cat';
export interface Stop { id: StopId; label: string; verb: string; pos: [number, number]; done: string }
type P2 = [number, number];

export interface Villa { n: number; x: number; z: number; w: number; d: number; big?: boolean; flat?: boolean; label?: boolean }

export interface Club { x: number; z: number; rot: number; s: number; label: string; kx?: number; kz?: number }

export interface Layout {
  id: CommunityId;
  /** full name on the switch */
  name: string;
  /** where it is, for the area filter */
  area: Area;
  /** what the homes are: `towers` or `villas` must be filled in to match */
  kind: 'towers' | 'villas';
  /** one line under the switch: what stands there */
  blurb: string;
  /** the internal road loop (closed) */
  ring: P2[];
  /** the walking circuit (closed): a charcoal jogging track, unless `loopIsPath` */
  loop: P2[];
  /** true where the plan draws no jogging track: the circuit is then laid as an ordinary garden path */
  loopIsPath?: boolean;
  /** link 0 is the entrance road; `road` links are streets, the rest are garden paths */
  links: { p: P2[]; road?: boolean }[];
  /** the public road outside the gate: x1, z1, x2, z2 */
  mainRoad: [number, number, number, number];
  gate: { x: number; z: number; rot: number };
  /** name ('' for an unlabelled wing of the same tower), x, z, rotation, floors, slab length in metres (34 if left out) */
  towers?: [string, number, number, number, number, number?][];
  /** how deep each block is front to back, in metres (18 if left out) */
  towerDepth?: number;
  /** the lift core that joins two slabs of one tower: x, z, width, depth, floors */
  cores?: [number, number, number, number, number][];
  villas?: Villa[];
  /** the clubhouse: centre, rotation, size (1 is about 24 x 18 m) and optional stretch along its length (kx) and depth (kz) */
  club?: Club;
  /** any further clubhouses on the plan */
  clubs?: Club[];
  /** the water bowl by the clubhouse */
  bowl: P2;
  lagoon?: P2;
  /** the outdoor pool; leave out where the plan keeps the pool indoors */
  pool?: { x: number; z: number; rot: number };
  courts: { x: number; z: number; rot: number }[];
  /** basketball court: x, z and, where it is not square to the plan, its rotation */
  bball?: [number, number, number?];
  play: P2;
  /** a fenced pet garden, where the plan has one: x0, x1, z0, z1 */
  pet?: [number, number, number, number];
  /** what that community's plan calls it */
  petLabel?: string;
  /** which fence the gate is in: w (left, the default), e, n (top) or s (bottom) */
  petGate?: 'w' | 'e' | 'n' | 's';
  /** a further turn, for a pet park that is not square to the plan */
  petRot?: number;
  /** where the fetch ball may land: x0, x1, z0, z1 */
  fetch: [number, number, number, number];
  /** x, z, rotation. The first is Lily's bench, the second has the neighbour on her phone */
  benches: [number, number, number][];
  /** the neighbour by the pool */
  rhea: P2;
  palms: [number, number, number][];
  rocks: [number, number, number][];
  golds: P2[];
  /** a scatter of trees: x0, z0, width, depth, count */
  grove: [number, number, number, number, number];
  /** the far tree belt: centre x, centre z, inner radius */
  far: [number, number, number];
  stops: Stop[];
  trackStart: P2;
  /** points on the track where a path joins it, so the hedge leaves a gap */
  hedgeGaps: P2[];
  /** free roam starts here: x, z, facing, camera yaw */
  start: [number, number, number, number];
  /** where the stories' flat interior hangs while a story plays: x, height, z. It must be clear air (no tower through it),
   *  with nothing between it and the afternoon sun, which comes from the lower left of the plan */
  flat: [number, number, number];
  /** the dog story comes out here (x, z, facing, camera yaw) and walks to `to` */
  story: { at: [number, number, number, number]; to: P2 };
  /** walkable area: x0, x1, z0, z1 */
  bounds: [number, number, number, number];
  /** the corner (least x, least z) of the grass mask, which must cover every road and path */
  mask: P2;
  /** its size in metres, 320 x 210 if left out */
  maskSize?: P2;
  /** the opening view: orbit centre x and z, camera height, orbit radius, the height it looks at (ground if left out),
   *  and the bearing the camera stands at in degrees (90, the default, is below the plan looking up it; 180 is its left end) */
  aerial: [number, number, number, number, number?, number?];
  /** the same for narrow (phone) screens, where a long, low community reads better seen along its length */
  aerialNarrow?: [number, number, number, number, number?, number?];
  /** extra name tags seen from the air: text, x, z */
  places?: [string, number, number][];
  /** words the stories use for this place */
  words: { home: string; walker: string; sitter: string; host: string; where: string; /** what this plan calls its circuit, if not a jogging track or garden path */ track?: string };
}

const rr = (x0: number, z0: number, x1: number, z1: number, c = 10): P2[] => {
  // a rounded rectangle as control points for a closed smooth curve
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  return [[x0 + c, z0], [mx, z0], [x1 - c, z0], [x1, z0 + c], [x1, mz], [x1, z1 - c], [x1 - c, z1], [mx, z1], [x0 + c, z1], [x0, z1 - c], [x0, mz], [x0, z0 + c]];
};

/**
 * Plan coordinates to model metres, so a layout can be typed in straight from the plan's own figures.
 * `s` is the scale and (cx, cy) the plan point that becomes the model's origin. `turn` lays the plan's down-axis
 * along the model's x (a quarter turn, never a mirror image); `up` is for plans measured with y running up;
 * `sz` scales the plan's y on its own where blocks need more room between rows.
 */
const frame = (s: number, cx: number, cy: number, o: { turn?: boolean; up?: boolean; sz?: number } = {}) => (x: number, y: number): P2 => {
  const dx = (x - cx) * s, dy = (o.up ? -(y - cy) : y - cy) * (o.sz ?? s);
  return o.turn ? [dy, -dx] : [dx, dy];
};
const r1 = (p: P2): P2 => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];

/* ----------------------------- Prestige High Fields ----------------------------- */

const PRESTIGE: Layout = {
  id: 'prestige', name: 'Prestige High Fields', area: 'Financial District', kind: 'towers', blurb: 'Ten towers around a central garden',
  ring: [[-104, -40], [-84, -58], [-40, -62], [8, -62], [58, -60], [108, -52], [124, -30], [126, -13], [126, 26], [126, 70], [88, 80], [34, 66], [-8, 54], [-50, 50], [-96, 42], [-106, 6]],
  loop: [[-54, -14], [-30, -19], [5, -18], [28, -14], [31, -4], [12, 2], [-10, 0], [-35, 0], [-52, -4]],
  links: [
    { p: [[-128, -40], [-104, -40]], road: true },
    { p: [[-106, 6], [-78, -8], [-54, -14]] },
    { p: [[5, -18], [9, -40], [8, -62]] },
    { p: [[31, -4], [40, -11], [72, -13], [100, -13], [126, -13]] },
    { p: [[100, -13], [100, -1]] },
    { p: [[126, 26], [131, 22], [136, 22]] },
    { p: [[12, 2], [-5, 27], [-8, 54]] },
  ],
  mainRoad: [-136, -220, -136, 220],
  gate: { x: -124, z: -40, rot: 0 },
  // tower centres and rotation, read off the master plan (1 plan px = 0.2 m)
  towers: [
    ['Tower 1', -66, -33, 0.42, 33], ['Tower 2', -16, -35, 0.42, 33], ['Tower 3', 36, -35, 0.42, 33], ['Tower 4', 86, -33, -0.35, 33], ['Tower 5', 96, 10, -0.5, 33],
    ['Tower 6', 96, 46, -0.6, 27], ['Tower 7', 48, 48, 0.45, 33], ['Tower 8', 22, 29, 0.42, 33], ['Tower 9', -28, 22, 0.42, 31], ['Tower 10', -76, 18, 0.42, 33],
  ],
  club: { x: 56, z: 4, rot: 0.42, s: 1, label: 'Clubhouse' },
  bowl: [38, -1.6],
  lagoon: [0, -9],
  pool: { x: 16, z: -7, rot: 0.42 },
  courts: [{ x: -44, z: -13, rot: 0.42 }, { x: -40, z: -5, rot: 0.42 }],
  bball: [22, -70],
  play: [-20, -9],
  pet: [132, 150, 12, 32], petLabel: 'Pet garden',
  fetch: [133.5, 148.5, 13.5, 30.5],
  benches: [[-30, 3.2, Math.PI], [-8, -21.5, 0], [22, 3.6, Math.PI - 0.3]],
  rhea: [5, -22],
  palms: [[-8, -15, 7], [9, -15.5, 8], [-9.5, -3, 6.5], [24, -12, 7.5], [26.5, -1.5, 7], [8.5, -1.5, 6], [36, -8, 7.5], [-22, -1.5, 6.5]],
  rocks: [[-8.6, -8, 0.9], [-7.8, -10.6, 0.6], [7.9, -12.4, 0.8], [-3, -15, 0.5], [3.4, -3.2, 0.7]],
  golds: [[-12, -12.5], [-12.6, -5], [-3, 5.2], [18, -20.4]],
  grove: [-60, -17, 34, 16, 26],
  far: [10, 0, 175],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea by the pool', verb: 'Say hi to Rhea', pos: [5, -19], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [36, -3], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the lawn bench', verb: 'Pet Lily', pos: [-30, 0.4], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet garden', verb: 'Throw the ball', pos: [136, 22], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [26, -1.2],
  hedgeGaps: [[-54, -14], [5, -18], [31, -4], [12, 2]],
  start: [70, -13, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [56, 62, 2],
  story: { at: [100, -8.5, Math.PI, Math.PI - 0.75], to: [31, -4] },
  bounds: [-128, 151, -78, 92],
  mask: [-150, -100],
  aerial: [10, 4, 240, 225, 26],
  words: { home: 'Tower 5, flat 1204', walker: 'Tower 3', sitter: 'Tower 8', host: 'Tower 1', where: 'Ten towers, the ring road, the jogging track, the pool, the clubhouse and the pet garden' },
};

/* ------------------------------- MyScape Courtyard ------------------------------- */
// Read off the published master plan and drawn the way its sheet is drawn (the sheet has north at the
// bottom, so "top" and "left" below are sheet directions, not compass ones). About three-quarters of
// real size. A row of large villas along the top, a column down the left edge, the amenity block on the
// left (entrance court, the Central Park lawn, the club patio, the pool and the tennis court), and four
// back-to-back blocks of villas on a grid of streets to the right, with the garden boulevard between them.
// The plan marks the jogging track on the top street; the model's track is a circuit of the park that
// runs beside that street. The plan shows no pet park, so there is none here: fetch is on the park lawn.

const myVillas = (): Villa[] => {
  const v: Villa[] = [];
  const northX = [-138, -120.6, -103, -84.6, -66, -51.6, -30, -18, -1.5, 13.5, 28.5, 41, 55.5, 69, 82, 95, 109];
  northX.forEach((x, i) => v.push({ n: 63 - i, x, z: -55, w: i < 6 ? 13 : 10.5, d: 12, big: true, flat: i % 4 === 1, label: i === 8 }));
  [-22.5, -10, 4, 18, 30.6, 44].forEach((z, i) => v.push({ n: 64 + i, x: -143, z, w: 12, d: 9.5, flat: i % 3 === 1 }));
  [22, 36.5, 51].forEach((z, i) => v.push({ n: 70 + i, x: -114, z, w: 10, d: 9.5, flat: i === 1, label: i === 0 }));
  const up = [-22.5, -11, 2], low = [27, 39.6, 52.5];
  // blocks: [west column x, east column x, numbers west column top-down, numbers east column top-down]
  const blocks: [number, number, number[], number[], number[], number[]][] = [
    [-21, -1.5, [5, 4, 3], [6, 7, 8], [2, 1], [9, 10]],
    [23.4, 40.5, [17, 16, 15], [18, 19, 20], [14, 13, 12], [21, 121, 22]],
    [67, 82.5, [28, 27, 26], [29, 30, 31], [25, 24, 23], [32, 33, 34]],
    [103.5, 120, [40, 39, 38], [41, 42, 43], [37, 36, 35], []],
  ];
  blocks.forEach(([xa, xb, ua, ub, la, lb], bi) => {
    ua.forEach((n, i) => v.push({ n, x: xa, z: up[i], w: 11, d: 9, flat: (n + bi) % 4 === 0, label: n === 16 || n === 40 }));
    ub.forEach((n, i) => v.push({ n, x: xb, z: up[i], w: 11, d: 9, flat: (n + bi) % 5 === 0 }));
    la.forEach((n, i) => v.push({ n, x: bi === 3 ? 107 : xa, z: low[i], w: 11, d: 9, flat: n % 4 === 1, label: n === 2 || n === 24 }));
    lb.forEach((n, i) => v.push({ n: n === 121 ? 21 : n, x: xb, z: low[i], w: 11, d: 9, flat: n % 5 === 2 }));
  });
  v.push({ n: 11, x: -1.5, z: 52.5, w: 11, d: 9 });
  [-22.5, -11, 2].forEach((z, i) => v.push({ n: 46 - i, x: 146, z, w: 10, d: 9, flat: i === 1 }));
  return v;
};

const MYSCAPE: Layout = {
  id: 'myscape', name: 'MyScape Courtyard', area: 'Puppalaguda', kind: 'villas', blurb: '73 villas beside the Central Park',
  ring: rr(-41, -38, 133, 64),
  loop: [[-110, -30], [-85, -31], [-62, -30], [-53, -21], [-52, 5], [-53, 30], [-60, 44], [-76, 48], [-94, 45], [-102, 33], [-103, 18], [-112, 12], [-123, 6], [-124, -12], [-120, -25]],
  links: [
    { p: [[-76.5, 80], [-76.5, 64]], road: true },
    { p: [[-41, 64], [-76.5, 64], [-131, 64]], road: true },
    { p: [[-131, 64], [-131, 12], [-131, -38]], road: true },
    { p: [[-131, -38], [-86, -38], [-41, -38]], road: true },
    { p: [[10.5, -38], [10.5, 13], [10.5, 64]], road: true },
    { p: [[54, -38], [54, 13], [54, 64]], road: true },
    { p: [[93, -38], [93, 13], [93, 64]], road: true },
    { p: [[-41, 16.5], [46, 16.5], [133, 16.5]] },
    { p: [[-41, 5], [-52, 5]] },
    { p: [[-76.5, 64], [-76, 48]] },
    { p: [[-131, -12], [-124, -12]] },
  ],
  mainRoad: [-260, 82, 260, 82],
  gate: { x: -76.5, z: 72, rot: Math.PI / 2 },
  villas: myVillas(),
  club: { x: -68, z: -10, rot: 0, s: 0.8, label: 'Club patio' },
  bowl: [-55.6, -13.4],
  pool: { x: -90, z: -2, rot: 0 },
  courts: [{ x: -112, z: -6, rot: Math.PI / 2 }],
  play: [-63, 10.5],
  fetch: [-90, -62, 21, 35],
  benches: [[-76, 51.2, Math.PI], [-72, -33.6, 0], [-99.3, 25, -Math.PI / 2]],
  rhea: [-88, -27.4],
  palms: [[-99, -8, 7], [-81, -8, 7.5], [-99, 5, 6.5], [-81, 5, 7], [-90, -11, 6.5]],
  rocks: [],
  golds: [[-66, 19], [-92, 15], [-59, 38], [-70, -23]],
  grove: [-36, 9.5, 166, 13, 30],
  far: [0, 5, 215],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the track', verb: 'Say hi to Rhea', pos: [-88, -30.9], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the club patio', verb: 'Give Biscuit water', pos: [-53, -13], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the park bench', verb: 'Pet Lily', pos: [-76, 48], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch on the central lawn', verb: 'Throw the ball', pos: [-76, 40.5], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-64, 45.5],
  hedgeGaps: [[-52, 5], [-76, 48], [-124, -12]],
  start: [-64, 45.5, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [56, 62, 2],
  story: { at: [-41, 30, Math.PI, Math.PI - 0.6], to: [-52, 5] },
  bounds: [-152, 152, -62, 70],
  mask: [-160, -103],
  aerial: [-4, 8, 160, 200],
  aerialNarrow: [22, 8, 200, 349, 0, 180],
  places: [['Central Park', -76, 30]],
  words: { home: 'Villa 2', walker: 'Villa 9', sitter: 'Villa 16', host: 'Villa 40', where: 'Seventy-three villas, tree-lined streets, the central park, the pool, the tennis court and the jogging track' },
};

/* ---------------------------- The Olympus by Sumadhura ---------------------------- */
// Read off the developer's published site layout (about 0.16 m per plan pixel, north up): two 44-floor
// towers side by side, each a cluster of wings around a core, with a driveway looping the whole site from
// Gate One on the main road. Between the towers runs the central court (drop-off island, raised deck, open
// lawn, boardwalk) down to the clubhouse and its pool. South of Tower B: the Pet's Park, a half basketball
// court and the children's play area. The plan marks the jogging track north of Tower B; the model carries
// it on around that tower as a circuit. Each tower is modelled as two parallel slabs joined by a core.

const OLYMPUS: Layout = {
  id: 'olympus', name: 'The Olympus', area: 'Nanakramguda', kind: 'towers', blurb: 'Two 44-floor towers, one central court',
  ring: [[-84, -31], [-75, -47], [-35, -50], [3, -50], [32, -46], [54, -42], [63, -28], [70, -6], [78, 19], [76, 35], [48, 38], [24, 37.5], [6, 42], [-20, 48], [-48, 42], [-69, 35], [-82, 19], [-84, -6]],
  loop: [[12, -36.5], [26, -37], [40, -36.5], [51, -33], [58.5, -21], [62.5, -6], [66.5, 10], [66, 24], [58, 30], [36, 30.5], [18, 30], [10, 24], [8.7, 12], [8.5, 0], [9, -22], [9.5, -32]],
  links: [
    { p: [[-97, -31], [-84, -31]], road: true },
    { p: [[14, -48.6], [12.6, -36.7]] },
    { p: [[-2, -50], [-4, -40], [-8, -30], [-9, -20], [-9, -8], [-11, 8], [-10, 22]] },
    { p: [[-26, -12], [-9, -10], [8.6, -8]] },
    { p: [[-10, 22], [0, 24], [9.6, 24]] },
    { p: [[16, 30.2], [10.5, 36], [8.5, 42]] },
    { p: [[8.5, 42], [8.5, 50], [11, 54.5], [18, 54.5]] },
    { p: [[74.5, 8.5], [66.5, 10]] },
  ],
  mainRoad: [-104, -220, -104, 220],
  gate: { x: -90, z: -31, rot: 0 },
  towers: [
    ['', -61.5, -13, Math.PI / 2, 44, 56], ['Tower A', -38.5, -13, -Math.PI / 2, 44, 56],
    ['Tower B', 24, -4, Math.PI / 2, 44, 52], ['', 46, 4, -Math.PI / 2, 44, 40],
  ],
  cores: [[-50, -13, 5.4, 44, 44], [35, 3, 4.4, 32, 44]],
  club: { x: -12, z: 34.5, rot: 0, s: 0.75, label: 'Clubhouse' },
  bowl: [-6, 26.5],
  pool: { x: -34, z: 35.5, rot: 0 },
  courts: [],
  bball: [42, 50],
  play: [68, 49],
  pet: [14, 30, 44.5, 60.5], petLabel: 'Pet park',
  fetch: [15.5, 28.5, 46, 59],
  benches: [[11.9, 12, -Math.PI / 2], [11.9, -20, -Math.PI / 2], [44, 33.7, Math.PI]],
  rhea: [26, -40.2],
  palms: [[-16, -42, 7.5], [-12, -42.5, 7], [-14, -39, 8], [-43.5, 29.5, 7], [-25, 29, 7.5], [-44, 38, 6.5]],
  rocks: [],
  golds: [[-20, -24], [-1, -22], [-21, 4], [-2, 14]],
  grove: [-70, 19, 28, 12, 9],
  far: [0, 0, 135],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the jogging track', verb: 'Say hi to Rhea', pos: [26, -36.9], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [-6, 23.6], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the lawn bench', verb: 'Pet Lily', pos: [8.7, 12], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet park', verb: 'Throw the ball', pos: [18, 54.5], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [8.7, -14],
  hedgeGaps: [[12.6, -36.7], [8.6, -8], [9.6, 24], [16, 30.2], [66.5, 10]],
  start: [40, -36.5, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-45, 62, 32],
  story: { at: [-24.5, -12.3, Math.PI / 2, Math.PI / 2 - 0.75], to: [8.6, -8] },
  bounds: [-94, 98, -56, 62],
  mask: [-160, -105],
  aerial: [-4, 0, 235, 240, 58],
  places: [['Central court', -9, -14]],
  words: { home: 'Tower A, flat 2104', walker: 'Tower B', sitter: 'Tower A', host: 'Tower B', where: 'Two 44-floor towers, the central court, the clubhouse and pool, the jogging track and the pet park' },
};

/* ----------------------------------- ASBL Loft ----------------------------------- */
// From the developer's site plan: a strip about 68 m wide and 295 m long, laid here with the road at the left. Two
// towers end to end on the centre line with a plaza between, a jogging loop inside a cycle loop around both, and the
// clubhouse across the far end (its pool is indoors, so no pool is shown). The Pet's Park is a narrow strip on one long
// edge. Real size, except that the towers are a little shorter so the loops clear their ends.

const LOFT: Layout = {
  id: 'loft', name: 'ASBL Loft', area: 'Financial District', kind: 'towers', blurb: 'Two towers inside a jogging loop and a cycle loop',
  ring: rr(-121.5, -25, 102, 20, 9),
  loop: rr(-113.5, -17, 94, 12.5, 7),
  links: [
    { p: [[-152, 10], [-121.5, 10]], road: true },
    { p: [[-121.5, 4], [-113.5, 2]] },
    { p: [[-10, -17], [-10, -2], [-10, 12.5]] },
    { p: [[-42, -17], [-42, -25], [-42, -33.5]] },
    { p: [[94, 6], [102, 6]] },
    { p: [[18, 12.5], [18, 20]] },
  ],
  mainRoad: [-160, -220, -160, 220],
  gate: { x: -142, z: 10, rot: 0 },
  towers: [['Tower A', -64, -2, 0, 46, 84], ['Tower B', 45, -2, Math.PI, 46, 84]],
  club: { x: 124, z: 0, rot: 0, s: 1.3, kz: 1.45, label: 'Clubhouse' },
  bowl: [106.9, 6],
  courts: [],
  bball: [-22, 28.6],
  play: [18, 29.2],
  pet: [-57, -27, -39.5, -30.5], petLabel: 'Pet park', petGate: 's',
  fetch: [-55.5, -28.5, -38.3, -32],
  benches: [[-13.3, -2, Math.PI / 2], [-60, 9.3, 0], [40, -13.8, Math.PI]],
  rhea: [-78, -13.9],
  palms: [[-133, 3, 7], [-133, 17, 7.5], [-127, 26, 6.5], [112, -28, 7], [112, 28, 7.5]],
  rocks: [],
  golds: [[-6, -9], [-14, 6], [-84, 27], [60, 28]],
  grove: [-104, 25, 34, 7, 7],
  far: [0, 0, 190],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the jogging loop', verb: 'Say hi to Rhea', pos: [-78, -17], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [104.6, 6], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the plaza bench', verb: 'Pet Lily', pos: [-10, -2], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet park', verb: 'Throw the ball', pos: [-42, -33.5], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-30, -17],
  hedgeGaps: [[-113.5, 2], [-10, -17], [-10, 12.5], [-42, -17], [94, 6], [18, 12.5], [-64, -17]],
  start: [30, -17, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-134, 62, -6],
  story: { at: [-64, -14.6, Math.PI, Math.PI - 0.75], to: [-64, -17] },
  bounds: [-156, 142, -44, 38],
  mask: [-160, -105],
  aerial: [-8, 0, 250, 255, 55],
  aerialNarrow: [-8, 0, 300, 330, 55, 128],
  words: { home: 'Tower A, flat 2104', walker: 'Tower B', sitter: 'Tower A', host: 'Tower B', track: 'jogging loop', where: 'Two towers, the jogging loop, the cycle loop, the plaza, the clubhouse and the pet park' },
};

/* ----------------------------------- My Home 99 ----------------------------------- */
// From the developer's site layout: one tower of 99 homes on a small corner plot, with roads on two sides. The plan
// draws no jogging track, so the circuit is a garden path around the tower; there is no separate clubhouse or outdoor
// pool on it, so none is shown. The pet zone is the small fenced corner the plan marks. Real size.

const P99 = frame(1, 50, 43, { up: true });
const MYHOME99: Layout = {
  id: 'myhome99', name: 'My Home 99', area: 'Kokapet', kind: 'towers', blurb: 'One tower of 99 homes on a garden plot',
  ring: [[-22, -35], [-14, -31], [-13, -23], [-20, -17], [-28, -19], [-31, -28]],
  loop: rr(-15, -25, 23, 34, 7), loopIsPath: true,
  links: [
    { p: [[-51, -24], [-31, -26]], road: true },
    { p: [[-13, -23], [-10.5, -23.5]] },
    { p: [[11, -25], [11, -36], [11, -45], [11, -49]] },
    { p: [[-15, 4], [-11, 4]] },
  ],
  mainRoad: [-58, -220, -58, 220],
  gate: { x: -42, z: -25, rot: 0 },
  towers: [['My Home 99', 4, 4, Math.PI / 2, 54, 44]], towerDepth: 22,
  bowl: [-12.4, 8.4],
  courts: [{ x: 30, z: 2, rot: Math.PI / 2 }],
  play: r1(P99(83, 7)),
  pet: [5, 17, -53, -45], petLabel: 'Pet zone', petGate: 's',
  fetch: [6.5, 15.5, -52, -47],
  benches: [[-2, 37.2, Math.PI], [26.2, 18, -Math.PI / 2], [-18.2, 14, Math.PI / 2]],
  rhea: [-4, -28.2],
  palms: [[-23.5, -27, 7], [-20.5, -24.5, 7.5]],
  rocks: [],
  golds: [[-27, 6], [-25, 24], [10, 41]],
  grove: [-36, 33, 16, 9, 5],
  far: [0, 0, 105],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the garden path', verb: 'Say hi to Rhea', pos: [-4, -25], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break by the lobby', verb: 'Give Biscuit water', pos: [-15, 8.4], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the deck bench', verb: 'Pet Lily', pos: [-2, 34], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet zone', verb: 'Throw the ball', pos: [11, -49], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-15, -4],
  hedgeGaps: [[-15, 4], [11, -25]],
  start: [14, -25, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-34, 62, 28],
  story: { at: [-11.2, 4, -Math.PI / 2, -Math.PI / 2 - 0.75], to: [-15, 4] },
  bounds: [-50, 46, -55, 45],
  mask: [-160, -105],
  aerial: [0, 0, 240, 270, 82, 150],
  words: { home: 'a flat on the 21st floor', walker: 'the same tower', sitter: 'the same tower', host: 'the same tower', where: 'One tower, its drop-off, the garden path around it and the pet zone' },
};

/* ---------------------------------- ASBL Spectra ---------------------------------- */
// From the developer's master plan, at about four-fifths of real size and laid with the road at the left: a flag-shaped
// site. The neck holds the entry roundabout, the long clubhouse with its pool alongside and the festival lawn; the body
// holds four parallel towers (A; B and C end to end with a plaza between; D) inside one walking and cycling loop.
// Positions are given along the towers (a) and across them (b), in real metres from the plaza.

const sA = (a: number, b: number): P2 => r1([40 + 0.52 * a + 0.608 * b, 14.4 - 0.608 * a + 0.52 * b]);
const SR = 0.863; // the bearing the four towers lie on
const SU: P2 = [0.65, -0.76], SV: P2 = [0.76, 0.65]; // one metre along the towers, and one across them
const off = (p: P2, d: P2, m: number): P2 => r1([p[0] + d[0] * m, p[1] + d[1] * m]);
const circle = (cx: number, cz: number, r: number, n = 8): P2[] => Array.from({ length: n }, (_, i) => r1([cx + Math.cos((i / n) * Math.PI * 2) * r, cz + Math.sin((i / n) * Math.PI * 2) * r]));

const SPECTRA: Layout = {
  id: 'spectra', name: 'ASBL Spectra', area: 'Financial District', kind: 'towers', blurb: 'Four towers inside one walking and cycling loop',
  ring: circle(-105.6, -2.4, 7),
  loop: ([[-50, -59], [0, -62], [60, -62], [76, -50], [77, 0], [76, 50], [62, 62], [0, 62], [-44, 62], [-59, 52], [-65, 38], [-70, 10], [-76, -20], [-66, -46]] as P2[]).map(([a, b]) => sA(a, b)),
  links: [
    { p: [[-126, -3], [-112.6, -2.4]], road: true },
    { p: [[-98.6, -2.4], [-92.8, 13.6], [-68.8, 25.3], [-44.8, 36.9], [-24.8, 46.6], sA(-71, -33)], road: true },
    { p: [sA(-75.6, -21), sA(0, -21), sA(76.6, -21)], road: true },
    { p: [sA(-68, 22), sA(0, 22), sA(76.6, 22)], road: true },
    { p: [sA(-2, -21), sA(-2, 0), sA(-2, 22)] },
    { p: [off(sA(14.7, -42.8), SV, 11.8), sA(14.7, -21)] },
    { p: [sA(-66.4, 30), off(sA(-76, 30), SU, 4), off(sA(-76, 30), SU, 2.2)] },
  ],
  mainRoad: [-134, -220, -134, 220],
  gate: { x: -121, z: -3, rot: 0 },
  towers: [
    ['Tower A', ...sA(14.7, -42.8), SR + Math.PI, 40, 80], ['Tower B', ...sA(-35.6, 1.5), SR, 40, 44],
    ['Tower C', ...sA(32.4, 2.5), SR + Math.PI, 40, 44], ['Tower D', ...sA(-1.9, 42.4), SR, 40, 80],
  ],
  towerDepth: 16,
  club: { x: -62, z: 14, rot: -0.25, s: 0.95, kx: 1.9, label: 'Clubhouse' },
  bowl: [-90.2, 11.6],
  pool: { x: -64, z: -2.4, rot: -0.25 },
  courts: [],
  bball: [23.2, -62.4, SR],
  play: [73.6, 73.6],
  pet: [14.7, 22.7, 63.2, 89.2], petLabel: 'Pet park', petGate: 'e', petRot: SR,
  fetch: [16.1, 21.3, 73.6, 78.8],
  benches: [[...off(sA(10, 62), SV, 3.2), -2.278], [...off(sA(20, -62), SV, -3.2), 0.863], [...off(sA(77, 10), SU, 3.2), -0.707]],
  rhea: off(sA(-20, -61.2), SV, 3),
  palms: [[-30, 24, 7], [-21, 22, 7.5], [-27, 31, 6.5], [-17, 29, 7], [-105.6, -2.4, 7]],
  rocks: [],
  golds: [[-100, -22], [-94, -30], [-36, -8]],
  grove: [-112, -40, 18, 14, 5],
  far: [0, 0, 170],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the walking loop', verb: 'Say hi to Rhea', pos: sA(-20, -61.2), done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [-92.8, 13.6], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the loop bench', verb: 'Pet Lily', pos: sA(10, 62), done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet park', verb: 'Throw the ball', pos: off(sA(-76, 30), SU, 2.2), done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: sA(30, -62),
  hedgeGaps: [sA(-71, -33), sA(-75.6, -21), sA(76.6, -21), sA(-68, 22), sA(76.6, 22), sA(-66.4, 30)],
  start: [...sA(30, -62), -0.707, 2.134],
  flat: [-40, 62, 74],
  story: { at: [...off(sA(14.7, -42.8), SV, 11.8), 0.863, 0.113], to: sA(14.7, -21) },
  bounds: [-128, 114, -84, 96],
  mask: [-160, -105],
  aerial: [8, 4, 250, 252, 40],
  places: [['Festival lawn', -24, 27]],
  words: { home: 'Tower A, flat 1204', walker: 'Tower C', sitter: 'Tower B', host: 'Tower D', track: 'walking loop', where: 'Four towers, the walking and cycling loop, the clubhouse and pool, the festival lawn and the pet park' },
};

/* ------------------------------- Rajapushpa Pristinia ------------------------------- */
// From the developer's master plan at about nine-tenths of real size, road along the top. Two near-square towers
// (Astrid, Flavia) by the road and four slabs (Begonia, Celesta, Destiny, Emerald) behind, a long clubhouse, and a
// central band with the pool, the central park lawn, the play area and the pet park. The plan shows a cycle track
// around the perimeter and pathways around the towers, but no jogging track, so the walking circuit is a garden path.

const PP = frame(0.9, 162.5, 102.5);
const PRISTINIA: Layout = {
  id: 'pristinia', name: 'Rajapushpa Pristinia', area: 'Kokapet', kind: 'towers', blurb: 'Six towers around a central park',
  ring: [[-40, -84], [40, -84], [128, -84], [138, -74], [138, 0], [138, 74], [128, 84], [0, 84], [-128, 84], [-138, 74], [-138, 20], [-138, -22], [-128, -30], [-90, -30], [-66, -31], [-58, -40], [-58, -72], [-50, -83]],
  loop: rr(-4, -19.5, 112, 4.5, 8), loopIsPath: true,
  links: [
    { p: [[25, -101], [25, -84]], road: true },
    { p: [[25, -84], [25, -54], [24, -30], [24, -19.5]] },
    { p: [[-4, -7.5], [-14.5, -7.5]] },
    { p: [[28, 4.5], [28, 40], [28, 84]] },
    { p: [[-2, -15], [-30, -25.5], [-58, -33]] },
    { p: [[112, -7.5], [118, -4], [121.5, -4]] },
    { p: [[72.5, -27.6], [72.5, -19.5]] },
  ],
  mainRoad: [-260, -108, 260, -108],
  gate: { x: 25, z: -93, rot: Math.PI / 2 },
  towers: [
    ['Flavia', -23.5, -64.2, 0, 38, 44], ['', -23.5, -41.2, Math.PI, 38, 44],
    ['', 72.5, -64.2, 0, 38, 44], ['Astrid', 72.5, -41.2, Math.PI, 38, 44],
    ['Emerald', ...r1(PP(37, 113)), -Math.PI / 2, 42, 62], ['Destiny', ...r1(PP(86, 118)), -Math.PI / 2, 42, 62],
    ['Celesta', ...r1(PP(170, 146)), Math.PI / 2, 42, 62], ['Begonia', ...r1(PP(218, 146)), -Math.PI / 2, 42, 62],
  ],
  cores: [[-23.5, -52.7, 30, 5.4, 38], [72.5, -52.7, 30, 5.4, 38]],
  club: { x: -27.5, z: 26.6, rot: -Math.PI / 2, s: 1.2, kx: 3.2, label: 'Clubhouse' },
  bowl: [-15.2, -7.5],
  pool: { x: 14, z: -7.5, rot: 0 },
  courts: [{ x: 131, z: -64, rot: Math.PI / 2 }, { x: 117.5, z: -41, rot: 0 }],
  bball: [112, -72],
  play: [92, -7.5],
  pet: [118, 134, -14, 2], petLabel: 'Pet park',
  fetch: [119.5, 132.5, -12.5, 0.5],
  benches: [[60, 7.7, Math.PI], [40, -22.7, 0], [80, 7.7, Math.PI]],
  rhea: [44, -16.4],
  palms: [[3, -14, 7], [25, -14, 7.5], [3, -1, 6.5], [25, -1, 7]],
  rocks: [],
  golds: [[52, -13], [66, -2], [-100, 62], [100, 60]],
  grove: [44, -15, 34, 15, 8],
  far: [0, 0, 200],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the park path', verb: 'Say hi to Rhea', pos: [44, -19.5], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [-12.2, -7.5], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the park bench', verb: 'Pet Lily', pos: [60, 4.5], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet park', verb: 'Throw the ball', pos: [121.5, -4], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [30, -19.5],
  hedgeGaps: [[24, -19.5], [-4, -7.5], [28, 4.5], [112, -7.5], [72.5, -19.5]],
  start: [36, -19.5, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-96, 62, 70],
  story: { at: [72.5, -27.6, 0, -0.75], to: [72.5, -19.5] },
  bounds: [-146, 146, -92, 92],
  mask: [-160, -116], maskSize: [320, 222],
  aerial: [0, 0, 258, 262, 46],
  places: [['Central park', 60, -8]],
  words: { home: 'Astrid, flat 1204', walker: 'Begonia', sitter: 'Celesta', host: 'Flavia', where: 'Six towers, the long clubhouse, the pool, the central park lawn, the courts and the pet park' },
};

/* ------------------------------- Rajapushpa Provincia ------------------------------- */
// From the developer's master plan at about half of real size (the site is 420 m across), road along the bottom, with
// tower heights reduced to match. Eleven towers named Astra to Kiara ring a central court with the Central Commons
// lawn, Club Odyssey and its pool, the courts and Club Oasis. The pet park is the small green on the top boundary
// between Elena and Fiona. The plan lists a walking track; the model shows it as a circuit of the central court.

const PV = frame(0.5, 210.5, 202);
const PT = (n: string, x: number, y: number, east: boolean): [string, number, number, number, number, number] => [n, ...r1(PV(x, y)), east ? Math.PI / 2 : -Math.PI / 2, 26, 34];
const PROVINCIA: Layout = {
  id: 'provincia', name: 'Rajapushpa Provincia', area: 'Financial District', kind: 'towers', blurb: 'Eleven named towers around a central court',
  ring: rr(-101, -97, 101, 97, 12),
  loop: rr(-42, 4, 12, 32, 9),
  links: [
    { p: [[1.3, 104], [1.3, 97]], road: true },
    { p: [[1.3, 97], [1.3, 63.5], [0, 43]], road: true },
    { p: [[0, 43], [0, 32]] },
    { p: [[-30, 4], [-30, -8], [-30, -19]] },
    { p: [[12, 22], [30, 22], [52.5, 25]] },
    { p: [[-42, 18], [-46, 32], [-70, 32.2], [-101, 32]] },
    { p: [[-59, -97], [-59, -103]] },
    { p: [[-47, 10], [-42, 10]] },
  ],
  mainRoad: [-260, 111, 260, 111],
  gate: { x: 1.3, z: 103, rot: Math.PI / 2 },
  towers: [
    PT('Elena', 47, 58, false), PT('Fiona', 97, 64, true), PT('Gemini', 146, 76, false), PT('Harmony', 197, 98, true),
    PT('Daphne', 76, 142, false), PT('Ivy', 246, 164, true), PT('Coral', 94, 222, false),
    PT('Basil', 115, 311, false), PT('Astra', 165, 311, true), PT('Kiara', 254, 329, false), PT('Juniper', 304, 329, true),
  ],
  club: { x: -34.3, z: -33, rot: 0, s: 1.1, label: 'Club Odyssey' },
  clubs: [{ x: 64.3, z: 29, rot: 0, s: 0.8, label: 'Club Oasis' }],
  bowl: [-30, -21.7],
  pool: { x: -10, z: -14, rot: 0 },
  courts: [{ x: 35.8, z: 31.5, rot: 0 }],
  bball: [25.5, 12.5],
  play: [-33, 22.5],
  pet: [-67, -51, -116.5, -100.5], petLabel: 'Pet park', petGate: 's',
  fetch: [-65.5, -52.5, -115, -102],
  benches: [[8.8, 18, Math.PI / 2], [-15, 0.8, 0], [-20, 35.2, Math.PI]],
  rhea: [-16, 7.2],
  palms: [[-22, -22, 7], [-2, -22, 7.5], [-21, -7, 6.5], [1, -7, 7]],
  rocks: [],
  golds: [[-6, 14], [-24, 12], [-10, 26], [80, 20]],
  grove: [70, 12, 24, 18, 8],
  far: [0, 0, 180],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the walking track', verb: 'Say hi to Rhea', pos: [-16, 4], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at Club Odyssey', verb: 'Give Biscuit water', pos: [-30, -19], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the Commons bench', verb: 'Pet Lily', pos: [12, 18], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the pet park', verb: 'Throw the ball', pos: [-59, -103], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-10, 4],
  hedgeGaps: [[0, 32], [-30, 4], [12, 22], [-42, 18], [-42, 10]],
  start: [-4, 4, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-126, 44, 72],
  story: { at: [-46.6, 10, Math.PI / 2, Math.PI / 2 - 0.75], to: [-42, 10] },
  bounds: [-108, 108, -118, 103],
  mask: [-160, -124], maskSize: [320, 246],
  aerial: [0, -4, 250, 250, 14],
  places: [['Central Commons', 2, 20]],
  words: { home: 'Coral, flat 1204', walker: 'Ivy', sitter: 'Astra', host: 'Kiara', track: 'walking track', where: 'Eleven towers, the Central Commons, Club Odyssey and its pool, the courts, Club Oasis and the pet park' },
};

/* ---------------------------------- Aparna Zenon ---------------------------------- */
// From the developer's site plan at about half of real size (the site is 570 m long), laid with the entrance at the
// left, with block heights reduced to match. Fourteen blocks, A to N, in two columns either side of a garden spine
// (party lawn, lap pool, clubhouse, tennis, bonfire lawn), with blocks I and J beyond the green belt at the far end.
// A driveway loops the main body with the cycle track around it; the dog park is in the top-left lobe.

const PZ = frame(0.52, 174, 285.5, { turn: true });
const ZB = (n: string, x: number, y: number, r: number): [string, number, number, number, number, number] => [`Block ${n}`, ...r1(PZ(x, y)), r, 21, 34];
const ZENON: Layout = {
  id: 'zenon', name: 'Aparna Zenon', area: 'Puppalaguda', kind: 'towers', blurb: 'Fourteen blocks along a garden spine',
  ring: rr(-140, -70, 84, 82, 12),
  loop: rr(-148, -78, 92, 90, 15),
  links: [
    { p: [[-154, 53], [-140, 53]], road: true },
    { p: [[-148, 24], [-140, 24], [-128, 24], [-60, 24], [0, 24], [70, 24], [84, 24], [92, 24]] },
    { p: [[84, 19.2], [100, 19.2], [132, 19.2]], road: true },
    { p: [[-128, 24], [-128, -8], [-128.5, -22], [-128.5, -27]] },
    { p: [[-44.4, 49.4], [-40.5, 36], [-40, 24]] },
  ],
  mainRoad: [-162, -220, -162, 220],
  gate: { x: -151, z: 53, rot: 0 },
  towers: [
    ZB('C', 63, 75, -Math.PI / 2), ZB('B', 79, 127, Math.PI / 2), ZB('A', 79, 178, -Math.PI / 2), ZB('N', 72, 258, Math.PI / 2), ZB('M', 74, 307, -Math.PI / 2), ZB('L', 72, 361, Math.PI / 2), ZB('K', 72, 411, -Math.PI / 2),
    ZB('D', 242, 75, -Math.PI / 2), ZB('E', 210, 127, Math.PI / 2), ZB('F', 181, 305, -Math.PI / 2), ZB('G', 201, 359, Math.PI / 2), ZB('H', 201, 409, -Math.PI / 2),
    ZB('J', 111, 503, Math.PI), ZB('I', 163, 503, 0),
  ],
  club: { x: -24.2, z: 5.2, rot: 0, s: 1.3, label: 'Clubhouse' },
  bowl: [-24, 21],
  pool: { x: -58.5, z: 9, rot: 0 },
  courts: [{ x: 41.3, z: 13.5, rot: 0 }],
  play: [-35, 61],
  pet: [-135, -122, -43, -27], petLabel: 'Dog park', petGate: 's',
  fetch: [-133.5, -123.5, -41.5, -29],
  benches: [[-79, 20.8, 0], [20, 27.2, Math.PI], [60, 20.8, 0]],
  rhea: [-144.8, 36],
  palms: [[-68, 3, 7], [-49, 3, 7.5], [-68, 15, 6.5], [-49, 15, 7]],
  rocks: [],
  golds: [[-86, 14], [-72, 10], [62, 14], [70, 28]],
  grove: [-96, 6, 30, 14, 8],
  far: [-10, 0, 210],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the cycle track', verb: 'Say hi to Rhea', pos: [-148, 36], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the clubhouse', verb: 'Give Biscuit water', pos: [-24, 24], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the party lawn bench', verb: 'Pet Lily', pos: [-79, 24], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch in the dog park', verb: 'Throw the ball', pos: [-128.5, -30], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-148, 10],
  hedgeGaps: [[-148, 24], [92, 24], [-148, 53]],
  start: [-100, 24, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-110, 44, 100],
  story: { at: [-44.4, 49.4, Math.PI, Math.PI - 0.75], to: [-40, 24] },
  bounds: [-156, 136, -86, 97],
  mask: [-170, -105], maskSize: [320, 210],
  aerial: [-12, 4, 235, 240, 10],
  aerialNarrow: [10, 4, 215, 385, 0, 180],
  places: [['Party lawn', -80, 12]],
  words: { home: 'Block A, flat 1204', walker: 'Block E', sitter: 'Block M', host: 'Block H', track: 'cycle track', where: 'Fourteen blocks, the garden spine with its lawn, lap pool and clubhouse, the cycle track and the dog park' },
};

/* --------------------------------- My Home Vihanga --------------------------------- */
// From the developer's master plan at about two-thirds of real size, road at the left, with block heights reduced a
// little to match. Twenty blocks stand in facing pairs, two rows either side of a central green with the play areas,
// the oval lawn, the courts and the Club House; Club House 2 and the pool are on the top boundary. The plan shows no
// jogging track (the circuit is a garden path around the green) and no pet park (fetch is on the central lawn).

const PH = frame(0.66, 226.5, 104, { sz: 0.9 });
const VB = (n: number, x: number, y: number, outerTop: boolean): [string, number, number, number, number, number] => [`Block ${n}`, ...r1(PH(x, y)), outerTop ? 0 : Math.PI, 14, 34];
const VIHANGA: Layout = {
  id: 'vihanga', name: 'My Home Vihanga', area: 'Gachibowli', kind: 'towers', blurb: 'Twenty blocks around a central green',
  ring: rr(-141, -86, 141, 86, 12),
  loop: rr(-118, -6, 112, 26, 10), loopIsPath: true,
  links: [
    { p: [[-152, 10.8], [-141, 10.8]], road: true },
    { p: [[-141, 10.8], [-118, 10.8]] },
    { p: [[14, -6], [14, 2]] },
    { p: [[-38, -6], [-38, -40], [-38, -64]] },
    { p: [[-102.6, -10.4], [-102.6, -6]] },
    { p: [[112, 1], [114.6, 1]] },
  ],
  mainRoad: [-160, -220, -160, 220],
  gate: { x: -147, z: 10.8, rot: 0 },
  towers: [
    VB(12, 71, 58, true), VB(11, 71, 81, false), VB(14, 137, 58, true), VB(13, 137, 81, false), VB(16, 201, 58, true), VB(15, 201, 81, false),
    VB(18, 300, 36, true), VB(17, 300, 62, false), VB(20, 369, 36, true), VB(19, 369, 62, false),
    VB(10, 71, 151, true), VB(9, 71, 173, false), VB(8, 139, 151, true), VB(7, 139, 173, false), VB(6, 208, 151, true), VB(5, 208, 173, false),
    VB(4, 297, 148, true), VB(3, 297, 173, false), VB(2, 369, 148, true), VB(1, 369, 173, false),
  ],
  towerDepth: 12,
  club: { x: 126, z: 1, rot: 0, s: 0.75, kz: 3.2, label: 'Club House' },
  clubs: [{ x: -12.9, z: -73.5, rot: 0, s: 0.7, label: 'Club House 2' }],
  bowl: [115.6, 1],
  pool: { x: -47.2, z: -73.5, rot: 0 },
  courts: [{ x: 69, z: 10, rot: 0 }],
  bball: [94, 10],
  play: [-62, 10],
  fetch: [4, 24, -1, 15],
  benches: [[14, 22.8, 0], [-30, -2.8, 0], [60, 22.8, 0]],
  rhea: [-80, -2.8],
  palms: [[-56, -66, 7], [-38.6, -67, 7.5]],
  rocks: [],
  golds: [[-88, 8], [-36, 12], [40, 4], [40, 18]],
  grove: [-110, 0, 22, 20, 7],
  far: [0, 0, 205],
  stops: [
    { id: 'hello', label: 'Say hi to Rhea on the garden path', verb: 'Say hi to Rhea', pos: [-80, -6], done: 'Rhea: "Morning! Biscuit looks so happy today."' },
    { id: 'water', label: 'Water break at the Club House', verb: 'Give Biscuit water', pos: [113.4, 1], done: 'Biscuit drank half the bowl. Hydrated and happy.' },
    { id: 'cat', label: 'Meet Lily on the lawn bench', verb: 'Pet Lily', pos: [14, 26], done: 'Lily purred. Biscuit stayed polite and sat.' },
    { id: 'fetch', label: 'Fetch on the central lawn', verb: 'Throw the ball', pos: [14, 2], done: 'Fetch done. Zoomies achieved.' },
  ],
  trackStart: [-60, -6],
  hedgeGaps: [[-118, 10.8], [14, -6], [-38, -6], [-102.6, -6], [112, 1]],
  start: [40, -6, -Math.PI / 2, Math.PI / 2 - 0.3],
  flat: [-128, 30, 100],
  story: { at: [-102.6, -10.4, 0, -0.75], to: [-102.6, -6] },
  bounds: [-150, 146, -92, 92],
  mask: [-168, -105],
  aerial: [0, 0, 200, 225, 0],
  aerialNarrow: [10, 0, 205, 365, 0, 180],
  places: [['Central green', 14, 10]],
  words: { home: 'Block 11, flat 804', walker: 'Block 7', sitter: 'Block 15', host: 'Block 3', where: 'Twenty blocks in facing pairs, the central green with its lawn and courts, the Club House and the pool' },
};

/* ---------------------------------- the registry ---------------------------------- */
/** Every community the explorer offers, in the order the picker lists them. */
export const COMMUNITIES: Layout[] = [PRESTIGE, SPECTRA, LOFT, PROVINCIA, OLYMPUS, PRISTINIA, MYHOME99, MYSCAPE, ZENON, VIHANGA];
/** Built but not yet offered: models still being checked from the air and on foot. They only appear with #ppdraft in the address. */
export const DRAFTS: Layout[] = [];
export const LAYOUTS: Record<CommunityId, Layout> = Object.fromEntries([...COMMUNITIES, ...DRAFTS].map((l) => [l.id, l]));
export const COMMUNITY_IDS: CommunityId[] = COMMUNITIES.map((l) => l.id);
