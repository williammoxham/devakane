// Area facts for the 3D map. Every number names its source, geography, and date.
// Update home values and rents a few times a year. Population is the 2020 Census.
// School lists are the public districts serving most of each area; boundaries vary by address.

const SRC = {
  census: 'U.S. Census Bureau, 2020 Census',
  zillow: 'Zillow Home Value Index',
};

export const county = {
  name: 'Santa Cruz County',
  population: { value: 270861, note: 'County, 2020 Census' },
  homeValue: { value: 1162058, change: 3.4, note: 'County, June 2026 (Zillow)' },
  rent: { value: 3539, note: 'County average asking rent (Zillow)' },
};

export const areas = {
  westside: {
    latlon: [36.958, -122.045],
    population: { value: 62956, note: 'City of Santa Cruz, 2020 Census' },
    homeValue: { value: 1337278, change: null, note: 'ZIP 95060, Feb 2026 (Zillow)' },
    rent: { value: 3487, note: 'City of Santa Cruz average, Nov 2025 (Zillow)' },
    schools: { district: 'Santa Cruz City Schools', names: ['Bay View Elementary', 'Mission Hill Middle', 'Santa Cruz High'] },
    facts: ['Natural Bridges State Beach and West Cliff Drive', 'Closest neighborhood to UC Santa Cruz', 'Mild summers under the marine layer'],
  },
  'downtown-midtown': {
    latlon: [36.974, -122.026],
    population: { value: 62956, note: 'City of Santa Cruz, 2020 Census' },
    homeValue: { value: 1271645, change: 1.3, note: 'City of Santa Cruz, Jan 2026 (Zillow)' },
    rent: { value: 3487, note: 'City of Santa Cruz average, Nov 2025 (Zillow)' },
    schools: { district: 'Santa Cruz City Schools', names: ['Gault Elementary', 'Branciforte Middle', 'Santa Cruz High'] },
    facts: ['Pacific Avenue shops, dining, and the farmers market', 'A short walk to the Beach Boardwalk, open since 1907', 'The most walkable blocks in the county'],
  },
  seabright: {
    latlon: [36.965, -122.008],
    population: { value: 62956, note: 'City of Santa Cruz, 2020 Census' },
    homeValue: { value: 1271645, change: 1.3, note: 'City of Santa Cruz, Jan 2026 (Zillow)' },
    rent: { value: 3487, note: 'City of Santa Cruz average, Nov 2025 (Zillow)' },
    schools: { district: 'Santa Cruz City Schools', names: ['Gault Elementary', 'Branciforte Middle', 'Harbor High'] },
    facts: ['Seabright State Beach at the end of the street', 'Santa Cruz Harbor and the Walton Lighthouse', 'Home of the Museum of Natural History'],
  },
  'live-oak': {
    latlon: [36.98, -121.985],
    population: { value: 17038, note: 'Live Oak CDP, 2020 Census. Greater Live Oak with Twin Lakes and Pleasure Point: 27,921' },
    homeValue: { value: 1271645, change: 1.3, note: 'Santa Cruz area, Jan 2026 (Zillow)' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'Live Oak School District (K to 8)', names: ['Del Mar Elementary', 'Green Acres Elementary', 'Shoreline Middle'] },
    facts: ['Unincorporated, with county services', 'Twin Lakes State Beach and Schwan Lake', 'Larger lots than inside the city'],
  },
  'pleasure-point': {
    latlon: [36.958, -121.968],
    population: { value: 27921, note: 'Greater Live Oak incl. Pleasure Point, 2020 Census' },
    homeValue: { value: 1271645, change: 1.3, note: 'Santa Cruz area, Jan 2026 (Zillow)' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'Live Oak School District (K to 8)', names: ['Del Mar Elementary', 'Shoreline Middle', 'Soquel High'] },
    facts: ['Surf breaks for every level along East Cliff', 'East Cliff walkway and Portola Drive cafes', 'Beach cottages and rebuilt modern homes'],
  },
  capitola: {
    latlon: [36.975, -121.953],
    population: { value: 9930, note: 'City of Capitola, 2020 Census' },
    homeValue: { value: 1237690, change: 6.8, note: 'Capitola, Aug 2026 (Zillow)' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'Soquel Union Elementary', names: ['Main Street Elementary', 'New Brighton Middle', 'Soquel High'] },
    facts: ['Capitola Wharf and the colorful Venetian Court', 'A walkable beach village with its own city services', 'Sunnier than most of the coast'],
  },
  soquel: {
    latlon: [36.988, -121.957],
    population: { value: 9980, note: 'Soquel CDP, 2020 Census' },
    homeValue: { value: 1375103, change: 6.2, note: 'Soquel, 2026 (Zillow)' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'Soquel Union Elementary', names: ['Main Street Elementary', 'New Brighton Middle', 'Soquel High'] },
    facts: ['Soquel Village and Soquel Creek', 'Wineries and acreage up Old San Jose Road', 'Often sunny when the coast is gray'],
  },
  aptos: {
    latlon: [36.977, -121.899],
    population: { value: 6664, note: 'Aptos CDP, 2020 Census (greater Aptos is larger)' },
    homeValue: { value: 1345447, change: 0.7, note: 'Aptos, May 2026 (Zillow)' },
    rent: { value: 3800, note: 'Aptos average, Jun 2026 (Trulia)' },
    schools: { district: 'Pajaro Valley Unified', names: ['Rio del Mar Elementary', 'Aptos Junior High', 'Aptos High'] },
    facts: ['Forest of Nisene Marks State Park', 'Seacliff State Beach and its cement ship', 'Rio Del Mar and Seascape beach neighborhoods'],
  },
  'scotts-valley': {
    latlon: [37.051, -122.013],
    population: { value: 12224, note: 'City of Scotts Valley, 2020 Census' },
    homeValue: { value: 1262486, change: 2.3, note: 'Scotts Valley, May 2026 (Zillow)' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'Scotts Valley Unified', names: ['Vine Hill Elementary', 'Scotts Valley Middle', 'Scotts Valley High'] },
    facts: ['Right on Highway 17 for the South Bay commute', 'Incorporated in 1966. Netflix was founded here in 1997', 'Often above the fog line'],
  },
  'san-lorenzo-valley': {
    latlon: [37.075, -122.085],
    population: { value: 5429, note: 'Boulder Creek CDP alone, 2020 Census (Felton and Ben Lomond are separate)' },
    homeValue: { value: 816471, change: 5.5, note: 'Felton, Aug 2026 (Zillow). Boulder Creek: $736,837, Sep 2026' },
    rent: { value: 3539, note: 'County average asking rent (Zillow)' },
    schools: { district: 'San Lorenzo Valley Unified', names: ['San Lorenzo Valley Elementary', 'San Lorenzo Valley Middle', 'San Lorenzo Valley High'] },
    facts: ['Henry Cowell Redwoods State Park in Felton', 'Big Basin, California’s oldest state park, above Boulder Creek', 'Ask early about wells, septic, and fire insurance'],
  },
  watsonville: {
    latlon: [36.91, -121.757],
    population: { value: 52590, note: 'City of Watsonville, 2020 Census' },
    homeValue: { value: 813218, change: 1.5, note: 'Watsonville, Sep 2026 (Zillow)' },
    rent: { value: 3197, note: 'Watsonville average, Oct 2026 (Zumper)' },
    schools: { district: 'Pajaro Valley Unified', names: ['Watsonville High', 'Pajaro Valley High', 'Many K to 8 options'] },
    facts: ['Farm country of the Pajaro Valley', 'Historic downtown plaza', 'The most home for the dollar in the county'],
  },
};

export const areaSources = [
  { label: SRC.census, url: 'https://www.census.gov/quickfacts/' },
  { label: SRC.zillow, url: 'https://www.zillow.com/santa-cruz-county-ca/home-values/' },
  { label: 'Trulia and Zumper rent reports', url: 'https://www.trulia.com/for_rent/Aptos,CA/' },
  { label: 'California Department of Education school directory', url: 'https://www.cde.ca.gov/SchoolDirectory/' },
];
