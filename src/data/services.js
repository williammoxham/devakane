import { photos as lib, own } from './photos.js';
const photos = { ...lib, own };
// "Get to know" cards on the home page. Each opens a full detail view.
// scene and tone use the same illustrated plates as the rest of the site.
export const services = [
  {
    id: 'buying',
    photo: photos.own.coastCliffs,
    eyebrow: 'Buying',
    title: 'Find the right home. Then win it.',
    scene: 'coast',
    tone: ['#B9D3D6', '#2F6377'],
    dark: false,
    body: [
      'Good homes here move quickly, so the work starts before the right one shows up. Get pre-approved, know your monthly number, and decide which tradeoffs you will and will not make.',
      'When it is time to write, the strongest offers are clear and clean: realistic price, sensible contingencies, and a timeline that works for the seller.',
    ],
    points: ['Pre-approval and a real monthly budget', 'Tours focused on what matters to you', 'Reading disclosures and inspections together', 'Offer strategy and negotiation'],
    cta: { label: 'Start a home search', to: '/contact?about=Buying' },
  },
  {
    id: 'selling',
    photo: photos.own.cove,
    eyebrow: 'Selling',
    title: 'Prepare. Price. Launch.',
    scene: 'village',
    tone: ['#E3D3C4', '#8A5A48'],
    dark: false,
    body: [
      'The first weekend on the market is the loudest your listing will ever be. Everything before it, from repairs to disclosures to photography, decides how buyers see your home.',
      'Pricing from real comparable sales protects you from the slow drift of a home that sat too long.',
    ],
    points: ['A walk-through and pricing range', 'Disclosures and inspections started early', 'Repairs, staging, and photography', 'A clear plan for showings and offers'],
    cta: { label: 'Talk about selling', to: '/contact?about=Selling' },
  },
  {
    id: 'first',
    photo: photos.own.aptosPier,
    eyebrow: 'First home',
    title: 'Your first home, one step at a time.',
    scene: 'hills',
    tone: ['#D6D9C0', '#6B6A43'],
    dark: false,
    body: [
      'Buying for the first time is mostly about knowing what happens next. From pre-approval to closing, each step has a purpose, a deadline, and a few decisions only you can make.',
    ],
    points: ['What lenders look at, and when', 'Down payment and closing cost basics', 'What an inspection can and cannot tell you', 'How escrow works, start to finish'],
    cta: { label: 'Ask a first-time question', to: '/contact?about=First%20home' },
  },
  {
    id: 'coastal',
    photo: photos.own.rockyCoast,
    eyebrow: 'Coastal and luxury',
    title: 'Homes on the edge of the continent.',
    scene: 'harbor',
    tone: ['#C7D9D2', '#3F6B67'],
    dark: true,
    body: [
      'Oceanfront and bluff-top properties come with their own questions: bluff erosion, coastal development permits, insurance, and what can and cannot be built.',
      'As a Coldwell Banker agent, Deva works within a brokerage that runs its own Global Luxury program.',
    ],
    points: ['Geology and bluff reports', 'Coastal permit history', 'Insurance quotes before you are in contract', 'Privacy-minded marketing for sellers'],
    cta: { label: 'Discuss a coastal home', to: '/contact?about=Coastal%20homes' },
    link: { label: 'Coldwell Banker Global Luxury', key: 'luxury' },
  },
  {
    id: 'moving',
    photo: photos.own.ridge,
    eyebrow: 'Moving here',
    title: 'New to Santa Cruz? Start with how you want to live.',
    scene: 'redwoods',
    tone: ['#CFD6C6', '#3D5640'],
    dark: true,
    body: [
      'Fog or sun. Highway 17 or a short drive to the beach. A walk to coffee or room for a garden. The county changes every few miles, and the right fit is easier to see in person.',
    ],
    points: ['A neighborhood tour built around your commute', 'Microclimates, schools, and daily errands', 'Short-term rental and timing advice', 'Remote planning for out-of-area buyers'],
    cta: { label: 'Plan a visit', to: '/contact?about=Moving%20to%20Santa%20Cruz' },
  },
  {
    id: 'rural',
    photo: photos['san-lorenzo-valley'],
    eyebrow: 'Rural property',
    title: 'Wells, septic, roads, and redwoods.',
    scene: 'farm',
    tone: ['#E1D7B8', '#7C6A34'],
    dark: false,
    body: [
      'Land in the mountains and the Pajaro Valley can be the best value in the county, as long as you understand the systems that come with it.',
    ],
    points: ['Well and water quality tests', 'Septic inspections and permits', 'Shared road maintenance agreements', 'Fire risk and insurance options'],
    cta: { label: 'Ask about rural homes', to: '/contact?about=Rural%20property' },
  },
];

export const highlights = [
  { photo: photos.own.soquelVillage, title: 'Priced from real sales, not from hope.', text: 'Recent comparable sales set a range you can defend when buyers push back.', scene: 'village', tone: ['#E3D3C4', '#8A5A48'] },
  { photo: photos.own.scottsValley, title: 'Disclosures done before day one.', text: 'Fewer surprises in escrow means fewer renegotiations.', scene: 'hills', tone: ['#CFD8C4', '#5E6E4E'] },
  { photo: photos.own.pantherBeach, title: 'A launch, not just a listing.', text: 'Photography, a floor plan, and a story about how it feels to live there.', scene: 'harbor', tone: ['#C7D9D2', '#3F6B67'] },
  { photo: photos.lighthouseField, title: 'Offers you can actually compare.', text: 'Price, terms, and timelines side by side, so the best offer is clear.', scene: 'coast', tone: ['#BFD8DD', '#2F6377'] },
  { photo: photos['san-lorenzo-valley'], title: 'Know the land before you buy it.', text: 'Wells, septic, roads, and fire insurance, explained before you commit.', scene: 'redwoods', tone: ['#C3CEBD', '#2E4632'] },
];
