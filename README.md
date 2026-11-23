# Deva Kane | Santa Cruz Real Estate

A React + Vite site for Deva Kane, Realtor with Coldwell Banker Realty. Built to replace buyandsellsantacruz.com with a faster, more personal site and an interactive journal.

## What is in it

| Page | Path | What it does |
| --- | --- | --- |
| Home | `/` | Live sky over the bay that follows the real time in Santa Cruz, a scroll-lit statement, a pinned horizontal tour of 11 neighborhoods, latest articles, and a payment calculator |
| Journal | `/journal` | Topic filters, instant search (press `/`), featured article |
| Article | `/journal/:slug` | Reading progress, live table of contents, embedded calculators and quizzes, scroll-linked step guides, saved checklists, reader reactions, share |
| Neighborhoods | `/neighborhoods` | Clickable county map with filters (Beach, Sunny, Redwoods, Commute, and more) |
| Homes | `/homes` | Featured listings from a data file, plus a link to the full MLS search |
| Tools | `/tools` | Payment calculator, rent or buy model, neighborhood quiz |
| About, Contact | `/about`, `/contact` | Bio, credentials, and a lead form |

Preview any time of day on the home page with `?hour=18.5` (golden hour), `?hour=9` (morning fog), `?hour=1` (night).

## Edit content without touching code

- **Contact info, bio, socials, MLS search link:** `src/config/site.js`
- **Articles:** `src/data/posts/`. Copy an existing post file, change the text, then add it to `src/data/posts/index.js`.
- **Neighborhoods:** `src/data/neighborhoods.js`
- **Featured listings:** `src/data/listings.js` (empty until there are real ones; the page shows a sign-up prompt instead)
- **Photos:** put files in `public/images/` and reference them as `/images/name.jpg`. Every illustrated plate accepts a `photo` field (neighborhoods, post covers via `cover.photo`, listings, and `site.agent.portrait`).

### Article building blocks

```js
{ type: 'p', text: '...' }
{ type: 'h2', text: '...' }                  // also becomes a table of contents entry
{ type: 'list', items: ['...', '...'] }
{ type: 'quote', text: '...' }
{ type: 'callout', title: '...', text: '...' }
{ type: 'link', to: '/neighborhoods', text: '...' }
{ type: 'figure', photo: '/images/x.jpg', alt: '...', caption: '...' }
{ type: 'widget', name: 'PaymentCalculator' } // or RentVsBuy, NeighborhoodMatch
{ type: 'steps', items: [{ when: 'Week 1', title: '...', text: '...' }] }
{ type: 'checklist', id: 'unique-id', items: ['...', '...'] }
```

New widgets go in `src/components/widgets/` and get registered in `WIDGETS` inside `src/components/blocks/Blocks.jsx`.

## Photos

- **Neighborhood and section photos** come from Wikimedia Commons (free licenses) and are listed in `src/data/photos.js`. The `/credits` page credits each photographer automatically. Before launch, open each Commons link, confirm the license, and fill in any blank `author`.
- **Scotts Valley** has no photo yet. Add one to `src/data/photos.js` under the key `'scotts-valley'` and it shows up everywhere.
- **Deva's headshot** currently loads from his old site. Download it to `public/images/deva.png` and point `headshot` in `src/data/photos.js` at `/images/deva.png`, so it survives when the old site goes away.
- **Your own photos:** drop files in `public/images/` and set `src: () => '/images/name.jpg'` on any entry. Self-hosted photos are faster and never break.
- If any photo fails to load, the site shows its illustration instead, so the layout never breaks.

## Journal: connect Deva's Squarespace blog

The Journal page reads Deva's blog posts straight from Squarespace and shows them alongside the built-in guides.

1. In Vercel, open the project, then Settings > Environment Variables.
2. Add `SQUARESPACE_BLOG_URL` with the address of the blog page, for example `https://devakane.squarespace.com/blog` (no trailing slash).
3. Redeploy once. New posts show up on the site within about 10 minutes of publishing on Squarespace.

Posts open inside this site at `/journal/<post-url-slug>`. Post categories on Squarespace become the topic filters. The featured image becomes the cover.
How it works: `api/journal.js` asks Squarespace for the blog as JSON (`?format=json`, with RSS as a backup) and cleans it up.

## Listings: run them from Squarespace

Deva's listings come from a second blog page on his Squarespace site. Each home is one post:

| Squarespace field | What to put there |
| --- | --- |
| Title | Street address and town, e.g. `123 Seabright Ave, Santa Cruz` |
| Featured image | The main photo. Add more photos in the post body. |
| Excerpt | One or two sentences about the home |
| Tags | Price and facts: `$1,495,000`, `3 bd`, `2 ba`, `1,640 sqft`, `0.2 acres` |
| Category | Status: `Coming soon`, `Active`, `Pending` or `Sold` |
| Location (optional) | The address, so the site can place it in the right neighborhood |

Setup: in Vercel add `SQUARESPACE_LISTINGS_URL` (for example `https://devakane.squarespace.com/listings`) and redeploy once.
Listings show on the Properties page and, when any are for sale, on the home page. Changes appear within about 5 minutes.
Tapping a listing opens its Squarespace page full screen on this site, with an "Ask about this home" button.
Changing a home to Sold moves it to "Recently sold". Anything added by hand in `src/data/listings.js` still shows too.

## Surf Watch

`api/surf.js` collects live conditions from public U.S. government data, cached for 20 minutes:
swell height, period and water temperature from NDBC buoy 46236 (Monterey Canyon Outer, with 46042 as backup),
tides from NOAA station 9413745 (Santa Cruz), and wind and sky from the National Weather Service. No keys needed.
Surf breaks, cam links, trails and shops live in `src/data/santaCruzLife.js`.

## Deploy (GitHub + Vercel)

1. Upload this folder to a new GitHub repo (GitHub Desktop or the web uploader). Skip `node_modules`, `dist`, and `preview`.
2. In Vercel, import the repo. It detects Vite automatically. Build command `npm run build`, output `dist`.
3. `vercel.json` already routes every path to the app, so links like `/journal/...` work on refresh.

## Optional: Supabase

Without Supabase the site works fully: the contact form opens the visitor's email app with the message filled in, and reactions stay in the visitor's browser.

To store leads and count reactions across all readers:

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. In Vercel, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings > API).
3. Redeploy. Leads appear in the `leads` table.

## Before launch

- [ ] Deva reviews and edits the bio in `src/config/site.js` and all four starter articles
- [ ] Add a portrait and real neighborhood photos
- [ ] Add social links
- [ ] Confirm brokerage branding and disclosure requirements with Coldwell Banker compliance
- [ ] Point the domain at Vercel

## Local development

Node 16.14 or newer.

```
npm install
npm run dev
```
