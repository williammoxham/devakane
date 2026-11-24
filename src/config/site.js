import { headshot } from '../data/photos.js';

// Everything about Deva lives here. Edit this one file to update contact info site-wide.
export const site = {
  agent: {
    name: 'Deva Kane',
    fullName: 'Mandara "Deva" Kane',
    title: 'Realtor',
    tagline: 'Born and raised in Santa Cruz',
    brokerage: 'Coldwell Banker Realty',
    office: 'Coldwell Banker Realty, Santa Cruz',
    license: '02218487',
    phone: '(831) 706-1551',
    phoneHref: 'tel:+18317061551',
    officePhone: '(831) 469-8000',
    officePhoneHref: 'tel:+18314698000',
    email: 'deva.kane@cbrealty.com',
    // Shown under his title in the bio
    alsoKnownFor: 'Entrepreneur and local business owner',
    // Drop a portrait at /public/images/deva.jpg and set this to '/images/deva.jpg'
    portrait: headshot,
  },
  // TODO(Deva): replace with your real story. Kept in one place so it is easy to find.
  bio: [
    'Santa Cruz isn\u2019t just where Deva works. It\u2019s where he grew up, and he knows it the way only a local can: which streets catch the afternoon sun, where the fog likes to settle, and which corner caf\u00e9 feels like a second living room. He would love to help you find your place here.',
    'Deva is also a local entrepreneur and business owner: he is one of the newest partners in Woodhouse Blending & Brewing in Santa Cruz. He invests in this town, not just in its houses.',
    'This is a place where the details matter: microclimates, fog lines, school boundaries, septic versus sewer, which streets flood in a big winter. Deva would rather you know all of it before you write an offer.',
    'If you are thinking about a move, even a year out, reach out. The best transactions start with a conversation, not a showing.',
  ],

  // Deva's business outside real estate
  business: {
    name: 'Woodhouse Blending & Brewing',
    role: 'Partner',
    url: 'https://woodhousebrews.com',
    blurb: 'one of the newest partners in Woodhouse Blending & Brewing, the Santa Cruz craft brewery and event venue',
  },

  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },
  // Brokerage pages linked from the About menu. Confirm these with Coldwell Banker before launch.
  brokerage: {
    about: 'https://www.coldwellbanker.com',
    luxury: 'https://www.coldwellbankerluxury.com',
  },
  // Mirrors the "Sample Mortgage Rates" table on Deva's current site. Update these by hand,
  // or wire them to a rates feed later. They are always shown as samples, never as offers.
  sampleRates: {
    asOf: '2026-11-22',
    rows: [
      { label: '30-year fixed', rate: 7.5, term: 30 },
      { label: '15-year fixed', rate: 7.04, term: 15 },
    ],
  },
  usefulLinks: [
    { label: 'About Coldwell Banker', href: 'https://www.coldwellbanker.com' },
    { label: 'Coldwell Banker Global Luxury', href: 'https://www.coldwellbankerluxury.com' },
    { label: 'California DRE license lookup', href: 'https://www.dre.ca.gov' },
  ],
  // Optional YouTube video ID for the "Featured video" tile. Leave empty to hide the tile.
  featuredVideo: '',
  // Paste an IDX / MLS search URL here when ready. The Homes page links to it.
  idxSearchUrl: 'https://buyandsellsantacruz.com/search/#!/defaultsearch:true',
};
