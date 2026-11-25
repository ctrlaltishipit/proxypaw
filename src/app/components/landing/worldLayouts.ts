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
 * placeholders. Still to be modelled (layouts not written yet):
 *   My Home Vihanga (Gachibowli), ASBL Spectra, ASBL Loft and Rajapushpa
 *   Provincia (Financial District), Rajapushpa Pristinia and My Home 99
 *   (Kokapet), Aparna Zenon (Puppalaguda).
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
  ring: P2[];
  loop: P2[];
  /** link 0 is the entrance road; `road` links are streets, the rest are garden paths */
  links: { p: P2[]; road?: boolean }[];
  /** the public road outside the gate: x1, z1, x2, z2 */
  mainRoad: [number, number, number, number];
  gate: { x: number; z: number; rot: number };
  /** name ('' for an unlabelled wing of the same tower), x, z, rotation, floors, slab length in metres (34 if left out) */
  towers?: [string, number, number, number, number, number?][];
  /** the lift core that joins two slabs of one tower: x, z, width, depth, floors */
  cores?: [number, number, number, number, number][];
  villas?: Villa[];
  club: { x: number; z: number; rot: number; s: number; label: string };
  /** the water bowl by the clubhouse */
  bowl: P2;
  lagoon?: P2;
  pool: { x: number; z: number; rot: number };
  courts: { x: number; z: number; rot: number }[];
  bball?: P2;
  play: P2;
  /** a fenced pet garden, where the plan has one: x0, x1, z0, z1 */
  pet?: [number, number, number, number];
  /** what that community's plan calls it */
  petLabel?: string;
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
  /** south-west corner of the 320 x 210 m grass mask */
  mask: P2;
  /** the opening view: orbit centre x and z, camera height, orbit radius, the height it looks at (ground if left out),
   *  and the bearing the camera stands at in degrees (90, the default, is below the plan looking up it; 180 is its left end) */
  aerial: [number, number, number, number, number?, number?];
  /** the same for narrow (phone) screens, where a long, low community reads better seen along its length */
  aerialNarrow?: [number, number, number, number, number?, number?];
  /** extra name tags seen from the air: text, x, z */
  places?: [string, number, number][];
  /** words the stories use for this place */
  words: { home: string; walker: string; sitter: string; host: string; where: string };
}

const rr = (x0: number, z0: number, x1: number, z1: number, c = 10): P2[] => {
  // a rounded rectangle as control points for a closed smooth curve
  const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
  return [[x0 + c, z0], [mx, z0], [x1 - c, z0], [x1, z0 + c], [x1, mz], [x1, z1 - c], [x1 - c, z1], [mx, z1], [x0 + c, z1], [x0, z1 - c], [x0, mz], [x0, z0 + c]];
};

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

/* ---------------------------------- the registry ---------------------------------- */
/** Every community the explorer offers, in the order the picker lists them. */
export const COMMUNITIES: Layout[] = [PRESTIGE, MYSCAPE, OLYMPUS];
export const LAYOUTS: Record<CommunityId, Layout> = Object.fromEntries(COMMUNITIES.map((l) => [l.id, l]));
export const COMMUNITY_IDS: CommunityId[] = COMMUNITIES.map((l) => l.id);
