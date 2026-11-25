/**
 * Gated communities ProxyPaw covers, Financial District, Gachibowli,
 * Kokapet, Nanakramguda, Narsingi, Kondapur and Nallagandla.
 *
 * Used by the signup form's Community picker. "Other" must stay last: never
 * block a signup because someone's tower isn't listed yet, their answer tells
 * us where to expand next.
 */

/**
 * Pet-friendly communities ProxyPaw is building for first (researched 2026-11-26). These are the only
 * names shown on the marketing pages. Each is here for one of two reasons, and the site says so:
 *   plan    the developer's own brochure, master plan or site lists a pet park, pet garden or pet zone
 *   founder the founder knows first-hand that pets are welcome (no public statement was found)
 * A pet park on a plan is not a society's pet policy, so never write "allows pets" about a named community.
 * Left out on purpose: projects with a pet park that are not occupied yet (Rajapushpa Skyra, Godrej Madison
 * Avenue, Godrej Epoque, SAS Crown). Occupancy of ASBL Loft, Rajapushpa Pristinia and My Home 99 was not checked.
 */
export const PET_FRIENDLY: { name: string; area: string; basis: 'plan' | 'founder'; note: string }[] = [
  { name: 'Prestige High Fields', area: 'Financial District', basis: 'plan', note: 'Brochure master plan: "Pet Garden"' },
  { name: 'Myscape Courtyard', area: 'Puppalaguda', basis: 'founder', note: 'Founder: ProxyPaw operates here. No public pet statement found' },
  { name: 'The Olympus', area: 'Nanakramguda', basis: 'plan', note: 'Sumadhura brochure legend: "Pet\'s Park"' },
  { name: 'My Home Vihanga', area: 'Gachibowli', basis: 'founder', note: 'Founder: pets are welcome. No public pet statement found' },
  { name: 'ASBL Spectra', area: 'Financial District', basis: 'plan', note: 'Developer amenities page: "Pet Park"' },
  { name: 'ASBL Loft', area: 'Financial District', basis: 'plan', note: 'Master plan legend: "Pet\'s Park"' },
  { name: 'Rajapushpa Provincia', area: 'Financial District', basis: 'plan', note: 'Brochure: "Exclusive Pet Park"' },
  { name: 'Rajapushpa Pristinia', area: 'Kokapet', basis: 'plan', note: 'Developer amenity list: "Pet Park"' },
  { name: 'Aparna Zenon', area: 'Puppalaguda', basis: 'plan', note: 'Developer blog calls it ideal for "pet-friendly living" (no amenity listed)' },
  { name: 'My Home 99', area: 'Kokapet', basis: 'plan', note: 'Brochure legend: "Pet Zone"' },
];

/** The two communities the founder says ProxyPaw operates in today, plus the third she added to the explorer. */
export const EXPLORER_COMMUNITIES = ['Prestige High Fields', 'Myscape Courtyard', 'The Olympus'];

const REST: string[] = [
  // My Home
  'My Home Bhooja',
  'My Home Vihanga',
  'My Home Avatar',
  'My Home Abhra',
  'My Home Ankura',
  'My Home Tarkshya',
  'My Home Krishe',
  'My Home Nishada',
  'My Home Sayuk',
  'My Home Vipina',
  'My Home Jewel',
  'My Home Navadweepa',
  'My Home Mangala',

  // Aparna
  'Aparna Sarovar Zenith',
  'Aparna Sarovar Grande',
  'Aparna Cyber Life',
  'Aparna CyberZon',
  'Aparna Cyber Commune',
  'Aparna Luxor Park',
  'Aparna Westside',
  'Aparna Serene Park',
  'Aparna One',

  // Rajapushpa
  'Rajapushpa Atria',
  'Rajapushpa Regalia',
  'Rajapushpa Summit',
  'Rajapushpa Pristinia',
  'Rajapushpa Casa Luxura',
  'Rajapushpa Provincia',

  // Prestige
  'Prestige High Fields',
  'Prestige Ivy League',
  'Prestige Tranquil',

  // Landmark towers
  'Lanco Hills',
  'The Botanika',
  'Meenakshi Trident Towers',
  'Vertex Premio',
  'Vertex Panache',
  'Jayabheri Orange County',
  'Trendset Jayabheri Elevate',
  'SMR Vinay Iconia',
  'SMR Vinay Harmony',
  'Honer Vivantis',
  'Honer Aquantis',
  'Candeur 40',
  'Sumadhura Acropolis',
  'Sumadhura Olympus',
  'DSR Fortune Prime',
  'PBEL City',
  'Ramky Towers',
  'Ramky One Galaxia',
  'Aliens Space Station',
  'NCC Urban One',
  'Mantri Celestia',
  'Mantri Espana',
  'Purva Highlands',
  'Myscape Isle',
  'Myscape Courtyard',
  'Muppa Melody',
  'Muppa Indraprastha',
  'Vamsiram Jyothi Imperial',
  'Giridhari Homes',
  'Vessella Meadows',
  'Western Exotica',
  'Sri Aditya Athena',
  'Sri Aditya Casa Grande',
  'Pacifica Hillcrest',
  'Emaar Boulder Hills',
  'Emaar Palm Drive',
  'ASBL Spire',
  'ASBL Spectra',
  'Anvita Ivana',
  'Vasavi Atlantis',
  'Sattva Divinity',
  'Marina Skies',
  'Rainbow Vistas',
  'Lodha Bellezza',
  'Incor One City',
  'Indu Fortune Fields',
  'Kolte Patil Raaya',
  'Praneeth Pranav Antilia',
  'Ashoka Liviano',
  'Ashoka A La Maison',
  'Legend Estella',
  'Janapriya Nile Valley',

  // Always last.
  'Other, not listed yet',
];

export const OTHER_COMMUNITY = 'Other, not listed yet';

/**
 * The signup picker: the pet-friendly communities first, then every other community we know of, then "Other".
 * The long tail stays so that a signup from an unlisted tower still tells us where to open next.
 * "Sumadhura Olympus" is the older spelling of The Olympus and is dropped from the tail.
 */
export const COMMUNITIES: string[] = [
  ...PET_FRIENDLY.map((c) => c.name),
  ...REST.filter((c) => c !== 'Sumadhura Olympus' && !PET_FRIENDLY.some((x) => x.name === c)),
];
