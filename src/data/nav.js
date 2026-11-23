// Main navigation. Mirrors the sections of Deva's current site:
// Properties, Buying & Selling, About Me, Neighborhood News, and the Blog.
import { site } from '../config/site.js';
import { neighborhoods } from './neighborhoods.js';

export const menus = [
  {
    id: 'homes',
    label: 'Properties',
    to: '/homes',
    columns: [
      {
        title: 'Properties',
        big: true,
        links: [
          { label: 'Property search', to: '/homes#search' },
          { label: 'My active listings', to: '/homes#featured' },
          { label: 'Get new listings first', to: '/contact?about=New%20listings' },
        ],
      },
      {
        title: 'Plan a sale',
        links: [
          { label: 'Selling: the first 30 days', to: '/journal/selling-your-home-the-first-30-days' },
          { label: 'Talk about your home', to: '/contact?about=Selling' },
        ],
      },
    ],
  },
  {
    id: 'buy-sell',
    label: 'Buying & Selling',
    to: '/tools',
    columns: [
      {
        title: 'Buying & selling tips',
        big: true,
        links: [
          { label: 'Buying', to: '/journal?topic=Buying' },
          { label: 'Selling', to: '/journal?topic=Selling' },
          { label: 'Money', to: '/journal?topic=Money' },
        ],
      },
      {
        title: 'Financial calculators',
        links: [
          { label: 'Monthly payment', to: '/tools#payment' },
          { label: 'Rent or buy', to: '/tools#rent-or-buy' },
          { label: 'Find your neighborhood', to: '/tools#match' },
        ],
      },
    ],
  },
  {
    id: 'neighborhoods',
    label: 'Neighborhoods',
    to: '/neighborhoods',
    columns: [
      {
        title: 'Explore the county',
        big: true,
        links: [
          { label: 'Open the map', to: '/neighborhoods' },
          { label: 'Neighborhood news', to: '/journal?topic=Neighborhoods' },
        ],
      },
      {
        title: 'On the coast',
        links: neighborhoods.filter((n) => n.traits.coast >= 2).map((n) => ({ label: n.name, to: `/neighborhoods#${n.slug}` })),
      },
      {
        title: 'Inland, hills, and valleys',
        links: neighborhoods.filter((n) => n.traits.coast < 2).map((n) => ({ label: n.name, to: `/neighborhoods#${n.slug}` })),
      },
    ],
  },
  {
    id: 'journal',
    label: 'Journal',
    to: '/journal',
    columns: null, // a page of its own, no dropdown
  },
  {
    id: 'about',
    label: 'About Me',
    to: '/about',
    columns: [
      {
        title: 'About me',
        big: true,
        links: [
          { label: 'My bio', to: '/about' },
          { label: 'Contact me', action: 'contact' },
        ],
      },
      {
        title: 'Coldwell Banker',
        links: [
          { label: 'About Coldwell Banker', href: site.brokerage.about },
          { label: 'Coldwell Banker Global Luxury', href: site.brokerage.luxury },
        ],
      },
    ],
  },
];
