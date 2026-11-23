// The Santa Cruz way of life: breaks, cams, trails and the local shops.
// Edit freely. Every place gets a directions link built from its name and town.
import { photos } from './photos.js';

export const directions = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

// Surf breaks, west to east. `cam` links go to live HD cams (Surfline hosts the Santa Cruz cams).
export const breaks = [
  {
    name: 'Steamer Lane',
    where: 'Lighthouse Point, West Cliff Drive',
    level: 'Advanced',
    note: 'The famous right-hand point off the lighthouse: several peaks, strong currents and a committed local crew. Watch from the cliff before you paddle out.',
    cam: 'https://www.surfline.com/surf-report/steamer-lane/5842041f4e65fad6a7708805',
    near: 'westside',
  },
  {
    name: 'Cowell’s',
    where: 'Cowell Beach, by the wharf',
    level: 'Beginner',
    note: 'A long, gentle wave in the lee of Lighthouse Point. The town’s classroom: foam boards, longboards and surf schools most mornings.',
    cam: 'https://www.surfline.com/surf-report/cowells/5842041f4e65fad6a7708806',
    near: 'downtown-midtown',
  },
  {
    name: 'Pleasure Point',
    where: 'East Cliff Drive, 36th to 41st Ave',
    level: 'Intermediate to advanced',
    note: 'A string of reef peaks along the East Cliff walkway that wakes up on south swells. Busy, friendly if you know the order, and right in front of the neighborhood.',
    cam: 'https://www.surfline.com/surf-report/pleasure-point-overview/5cc8b6e886e42100015d1f87',
    near: 'pleasure-point',
  },
  {
    name: 'The Hook',
    where: 'End of 41st Avenue',
    level: 'Intermediate to advanced',
    note: 'A right off the point at 41st, reached by the stairs at the end of the avenue. Longboards on small days, real wave on bigger ones.',
    near: 'pleasure-point',
  },
  {
    name: 'Manresa',
    where: 'Manresa State Beach, La Selva Beach',
    level: 'All levels, size dependent',
    note: 'Open beach break south of Aptos. Picks up more swell than town and often has room to spread out, but it can close out and the currents are real.',
    near: 'aptos',
  },
];

export const camsMore = {
  label: 'City of Santa Cruz surf cam, tides and wharf weather',
  url: 'https://www.santacruzca.gov/Services/Public-and-Environmental-Safety/Surf-Cam-Tides-Weather',
};

// Trails and parks.
export const outdoors = [
  { name: 'West Cliff Drive', town: 'Santa Cruz', kind: 'Walk, run, ride', note: 'The coastal path from the wharf to Natural Bridges, past Steamer Lane. Sunset laps are a local ritual.', near: 'westside', photo: photos.westside },
  { name: 'Wilder Ranch State Park', town: 'Santa Cruz', kind: 'Hike, mountain bike', note: 'Bluff-top trails above the ocean on one side and a big network of mountain bike loops inland on the other.', near: 'westside' },
  { name: 'Henry Cowell Redwoods State Park', town: 'Felton', kind: 'Hike', note: 'Old-growth redwoods along the San Lorenzo River, an easy loop for visitors and longer trails up to the observation deck.', near: 'san-lorenzo-valley', photo: photos['san-lorenzo-valley'] },
  { name: 'The Forest of Nisene Marks State Park', town: 'Aptos', kind: 'Hike, run, mountain bike', note: 'Second-growth redwoods up Aptos Creek, with a long fire road that climbs toward the Loma Prieta epicenter.', near: 'aptos' },
  { name: 'Soquel Demonstration State Forest', town: 'Soquel', kind: 'Mountain bike', note: '“Demo” to locals: the county’s best-known singletrack, reached from Highland Way above Soquel.', near: 'soquel' },
  { name: 'Pogonip and the UC Santa Cruz trails', town: 'Santa Cruz', kind: 'Hike, run', note: 'Meadows and forest a few minutes from downtown, linking up to the upper campus trails.', near: 'downtown-midtown' },
];

// Shops. Addresses checked November 2026; confirm hours before you go.
export const shops = {
  Surf: [
    { name: 'O’Neill Surf Shop', address: '1115 41st Ave, Capitola', note: 'The family business Jack O’Neill started. A deep wetsuit wall and hundreds of boards. There is also a shop at 400 Beach St by the Boardwalk.' },
    { name: 'Freeline Surf Shop', address: '821 41st Ave, Santa Cruz', note: 'Pleasure Point’s neighborhood shop since 1969.' },
    { name: 'Cowell’s Beach Surf Shop', address: '30 Front St, Santa Cruz', note: 'Across from Cowell’s. Rentals and lessons for first-timers.' },
    { name: 'Pearson Arrow Surf & Sport', address: '2100 Delaware Ave, Santa Cruz', note: 'Westside shop with a long local shaping history.' },
  ],
  Bike: [
    { name: 'Bicycle Trip', address: '1001 Soquel Ave, Santa Cruz', note: 'Independent and local since 1973: sales, service and fittings.' },
    { name: 'Another Bike Shop', address: '2361 Mission St, Santa Cruz', note: 'Westside mountain bike specialists since 1987, minutes from the UCSC and Wilder trails.' },
    { name: 'Epicenter Cycling', address: '1730 Mission St, Santa Cruz', note: 'Rentals, repairs and fittings, with a second shop at 8035 Soquel Dr in Aptos.' },
  ],
  Outdoors: [
    { name: 'Patagonia Outlet Santa Cruz', address: '415 River St #C, Santa Cruz', note: 'Open since 1997 in the old Farmers Exchange building, a few blocks off Highway 1.' },
  ],
};

// How the outdoors maps onto where people buy.
export const lifestyleMatch = [
  { want: 'Surf before work', areas: ['pleasure-point', 'westside', 'seabright'], note: 'Walk or bike to the water. Expect older cottages, small lots and quick sales.' },
  { want: 'Trails out the back door', areas: ['san-lorenzo-valley', 'scotts-valley', 'aptos'], note: 'More land and trees for the money. Ask about wells, septic and fire insurance early.' },
  { want: 'Village life and the beach', areas: ['capitola', 'soquel', 'live-oak'], note: 'Walkable main streets, good schools nearby, and a short ride to the sand.' },
];
