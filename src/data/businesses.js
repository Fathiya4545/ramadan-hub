// Muslim-owned and halal businesses in Washington State.
//
// Supplied by the owner — every entry is a real business with a working site.
// Nothing here is invented: a directory that sends someone across town to a
// shop that does not exist is worse than a short one.
//
// Shape: id, name, category (must be in CATEGORIES), city, description,
// website, and mapSearch — the text handed to Google Maps. Leave mapSearch
// empty for an entry that has no single address, and no Directions button is
// shown for it.

export const CATEGORIES = ['All', 'Directory', 'Halal Market', 'Restaurant', 'Clothing'];

export const businesses = [
  {
    id: 1,
    name: 'Muslims in Washington Directory',
    category: 'Directory',
    city: 'Washington State',
    description:
      'Find halal markets, restaurants, mosques, caterers, and Muslim community services.',
    website: 'https://muslimwa.com/',
    mapSearch: '',
  },
  {
    id: 2,
    name: 'IFB Market',
    category: 'Halal Market',
    city: 'Seattle',
    description: 'International groceries and fresh Zabiha halal meat.',
    website: 'https://ifbmarkets.com/',
    mapSearch: 'IFB Market Seattle Washington',
  },
  {
    id: 3,
    name: 'Mayuri International Foods',
    category: 'Halal Market',
    city: 'Seattle Area',
    description: 'South Asian groceries with halal meat locations in the Seattle area.',
    website: 'https://mayuriseattle.com/',
    mapSearch: 'Mayuri International Foods Washington',
  },
];
