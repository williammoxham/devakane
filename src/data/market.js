// Santa Cruz market numbers shown on the home page.
// Every figure carries its source and the period it covers. Update monthly.
// Easy sources: FRED (Realtor.com series for Santa Cruz County), Redfin, Zillow,
// and the Santa Cruz County Association of Realtors monthly report.

export const marketAsOf = 'November 2026';

export const stats = [
  {
    value: 143,
    format: 'int',
    label: 'homes sold per month',
    detail: 'Average for January to June 2026, up 5.2% from a year earlier.',
    source: 'Redfin, Santa Cruz metro',
    url: 'https://stacker.com/stories/california/santa-cruz/santa-cruz-mid-year-housing-market-review',
  },
  {
    value: 1162058,
    format: 'money',
    label: 'typical home value',
    detail: 'Up 3.4% over the past year, through June 30, 2026.',
    source: 'Zillow Home Value Index, Santa Cruz County',
    url: 'https://www.zillow.com/home-values/3025/santa-cruz-county-ca/',
  },
  {
    value: 40.1,
    format: 'pct',
    label: 'price growth since 2019',
    detail: 'Median sale price rose from $807,500 (February 2019) to $1,131,250 (February 2026).',
    source: 'Redfin, Santa Cruz',
    url: 'https://stacker.com/stories/california/santa-cruz/are-home-prices-going-down-santa-cruz-2026',
  },
  {
    value: 27,
    format: 'int',
    label: 'median days on market',
    detail: 'January to June 2026. 29.5% of homes sold above their original list price.',
    source: 'Redfin, Santa Cruz metro',
    url: 'https://stacker.com/stories/california/santa-cruz/santa-cruz-mid-year-housing-market-review',
  },
];

// Median listing price, Santa Cruz County. Source: Realtor.com via FRED (series MEDLISPRI6087).
export const priceSeries = {
  source: 'Realtor.com via the Federal Reserve Bank of St. Louis (FRED)',
  url: 'https://fred.stlouisfed.org/series/MEDLISPRI6087',
  points: [
    ['2025-09', 1248750],
    ['2025-10', 1249750],
    ['2025-11', 1249000],
    ['2025-12', 1197500],
    ['2026-01', 1162500],
    ['2026-02', 1192250],
    ['2026-03', 1195000],
    ['2026-04', 1199500],
    ['2026-05', 1295000],
    ['2026-06', 1293750],
    ['2026-07', 1299500],
    ['2026-08', 1268000],
    ['2026-09', 1249750],
  ],
};
