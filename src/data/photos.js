// Every photo on the site, in one place.
// All are from Wikimedia Commons, which only hosts freely licensed or public domain images.
// Each license (usually Creative Commons) requires credit, which the /credits page provides.
// Before launch: open each "page" link, confirm the license, and fill in any missing author.
//
// To swap in your own photo: put the file in /public/images and set `src: '/images/name.jpg'`.
// Images load from Wikimedia at the width you ask for, so pages stay light.

const commons = (file, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file.replace(/ /g, '_'))}?width=${width}`;

const page = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, '_'))}`;

// Layout testing only: VITE_PHOTO_TEST=1 swaps in local stand-ins from /public/test.
const TEST = import.meta.env.VITE_PHOTO_TEST;

function photo(key, file, { author = '', license = '', title = '', focus = '50% 50%' } = {}) {
  return { key, file, author, license, title, focus, src: (w) => (TEST ? `/test/${key}.jpg` : commons(file, w)), page: page(file) };
}

// Will Moxham's own Santa Cruz photos, bundled with the site (location data removed).
function local(key, file, { title = '', focus = '50% 50%', author = 'Will Moxham', credit } = {}) {
  const url = `${import.meta.env.BASE_URL}images/sc/${file}`;
  return { key, file, author, credit, license: 'used with permission', title, focus, src: () => url, page: '' };
}

export const own = {
  sunset: local('sunset', 'sunset.jpg', { title: 'Sunset on the Santa Cruz coast', focus: '50% 52%' }),
  cliffs: local('cliffs', 'cliffs.jpg', { title: 'Cliffs on the Westside', focus: '40% 55%' }),
  redwoods: local('redwoods', 'redwoods.jpg', { title: 'Redwood grove', focus: '50% 60%' }),
  ridge: local('ridge', 'ridge-ride.jpg', { title: 'Morning ride above town', focus: '50% 38%' }),
  northCoast: local('northCoast', 'north-coast.jpg', { title: 'The north coast', focus: '50% 55%' }),
  aptos: local('aptos', 'aptos-deck.jpg', { title: 'Sunset from a deck in Aptos', focus: '50% 55%' }),
  downtown: local('downtown', 'downtown.jpg', { title: 'Pacific Avenue, downtown Santa Cruz', focus: '50% 42%' }),
  pleasurePoint: local('pleasurePoint', 'pleasure-point.jpg', { title: 'Pleasure Point from above', focus: '50% 45%', author: '', credit: 'Aerial photo provided by Will Moxham.' }),
  scottsValley: local('scottsValley', 'scotts-valley.jpg', { title: 'Scotts Valley from above', focus: '50% 55%', author: '', credit: 'Aerial photo provided by Will Moxham.' }),
  liveOak: local('liveOak', 'live-oak.jpg', { title: 'Live Oak from above', focus: '50% 50%', author: '', credit: 'Aerial photo provided by Will Moxham.' }),
  aptosPier: local('aptosPier', 'aptos-pier.jpg', { title: 'Seacliff pier at sunset, Aptos', focus: '55% 50%', author: '', credit: 'Photo provided by Will Moxham.' }),
  capitolaVillage: local('capitolaVillage', 'capitola-village.jpg', { title: 'The Venetian, Capitola Village', focus: '50% 40%', author: '', credit: 'Photo provided by Will Moxham.' }),
  seabrightLighthouse: local('seabrightLighthouse', 'seabright-lighthouse.jpg', { title: 'Walton Lighthouse, Santa Cruz Harbor', focus: '30% 50%', author: '', credit: 'Photo provided by Will Moxham.' }),
  watsonvilleFarms: local('watsonvilleFarms', 'watsonville-farms.jpg', { title: 'Farm fields of the Pajaro Valley', focus: '50% 55%', author: '', credit: 'Photo provided by Will Moxham.' }),
  soquelVillage: local('soquelVillage', 'soquel.jpg', { title: 'Soquel Village', focus: '50% 55%', author: '', credit: 'Photo provided by Will Moxham.' }),
  cliffSunset: local('cliffSunset', 'cliff-sunset.jpg', { title: 'Sunset over the cliffs', focus: '50% 50%' }),
  bluffMorning: local('bluffMorning', 'bluff-morning.jpg', { title: 'Morning light on the bluffs', focus: '50% 60%' }),
  coastCliffs: local('coastCliffs', 'coast-cliffs.jpg', { title: 'Cliffs and open beach on the north coast', focus: '50% 45%' }),
  davenportSunset: local('davenportSunset', 'davenport-sunset.jpg', { title: 'Sunset over the north coast', focus: '50% 42%' }),
  rockyCoast: local('rockyCoast', 'rocky-coast.jpg', { title: 'Headlands and open ocean', focus: '60% 50%' }),
  cove: local('cove', 'cove.jpg', { title: 'A wave wrapping into a coastal cove', focus: '50% 55%' }),
  pantherBeach: local('pantherBeach', 'panther-beach.jpg', { title: 'Beach and sandstone cliffs on the north coast', focus: '50% 45%' }),
  woodhouse: local('woodhouse', 'woodhouse-sunset.jpg', { title: 'Woodhouse Blending & Brewing at sunset', focus: '50% 40%' }),
};

export const photos = {
  hero: own.sunset,
  steamerLane: photo('steamerLane', 'Steamer Lane (21423069678).jpg', { title: 'Steamer Lane', focus: '50% 60%' }),
  surfer: photo('surfer', 'A surfer at the wave edit.jpg', { title: 'A surfer off Santa Cruz', author: 'Brocken Inaglory (Mbz1)', focus: '50% 45%' }),
  lighthouseField: photo('lighthouseField', 'Lighthouse Field State Beach.jpg', { title: 'Lighthouse Field State Beach', author: 'Don DeBold' }),
  boardwalk: photo('boardwalk', 'Giant Dipper (13698609225).jpg', { title: 'The Giant Dipper, Santa Cruz Beach Boardwalk' }),

  westside: own.cliffs,
  'downtown-midtown': own.downtown,
  pacificCathcart: photo('pacificCathcart', 'Intersection of Pacific and Cathcart, Downtown Santa Cruz.jpg', { title: 'Pacific Avenue at Cathcart', author: 'Techgeist' }),
  seabright: own.seabrightLighthouse,
  harborCommons: photo('harborCommons', 'Santa Cruz Harbor Lighthouses (8431156681).jpg', { title: 'Santa Cruz Harbor lighthouses', author: 'Anita Ritenour', focus: '50% 40%' }),
  'live-oak': own.liveOak,
  twinLakesCommons: photo('twinLakesCommons', 'Twin Lakes State Beach and lighthouse.jpg', { title: 'Twin Lakes State Beach' }),
  'pleasure-point': own.pleasurePoint,
  'scotts-valley': own.scottsValley,
  pleasurePointCommons: photo('pleasurePointCommons', 'Pleasure Point in Santa Cruz CA. - panoramio.jpg', { title: 'Pleasure Point', author: 'Noah_Loverbear', license: 'CC BY-SA 3.0' }),
  capitola: own.capitolaVillage,
  venetianCommons: photo('venetianCommons', 'Venetian Court, Capitola, California.jpg', { title: 'Venetian Court, Capitola', author: 'W Nowicki' }),
  soquel: own.soquelVillage,
  soquelCommons: photo('soquelCommons', 'Soquel, California January 5, 2007.jpg', { title: 'Soquel from Anna Jean Cummings Park', author: 'Roofus' }),
  aptos: own.aptos,
  cementShip: photo('cementShip', 'Palo Alto Cement Ship and the Seacliff Beach Pier (11811678255).jpg', { title: 'The cement ship at Seacliff State Beach' }),
  'san-lorenzo-valley': own.redwoods,
  watsonville: own.watsonvilleFarms,
  strawberryFestCommons: photo('strawberryFestCommons', 'Watsonville Strawberry Festival 2010.jpg', { title: 'Main Street during the Strawberry Festival', author: 'Phorenon' }),
};

// Deva's headshot, bundled with the site.
export const headshot = `${import.meta.env.BASE_URL}images/deva.jpg`;
// Close-up headshot for the Meet Deva section on the home page.
export const headshotCloseUp = `${import.meta.env.BASE_URL}images/deva-headshot.jpg`;

export const photoFor = (key) => photos[key] || null;
