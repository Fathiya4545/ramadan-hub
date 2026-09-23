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

export const CATEGORIES = ['All', 'Directory', 'Shopping Mall', 'Halal Market', 'Restaurant', 'Cafe', 'Clothing'];

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
  {
    id: 4,
    name: 'Mall of Africa',
    category: 'Shopping Mall',
    city: 'SeaTac',
    description: 'African shops, groceries and food under one roof on International Boulevard.',
    address: '21031 International Blvd, SeaTac, WA 98198',
    mapSearch: 'Mall of Africa 21031 International Blvd SeaTac WA',
    mapUrl: 'https://share.google/UcvDCuTj3UTBehNPc',
  },
  {
    id: 5,
    name: 'SeaTac International Mall',
    category: 'Shopping Mall',
    city: 'SeaTac',
    description: 'International shops and restaurants, including East African food and clothing.',
    address: '20804 International Blvd, SeaTac, WA 98198',
    mapSearch: 'SeaTac International Mall 20804 International Blvd SeaTac WA',
    mapUrl: 'https://share.google/aLhmrVmSC09GGjOhn',
  },
  {
    id: 6,
    name: 'Juba Shopping Mall',
    category: 'Shopping Mall',
    city: 'Tukwila',
    description: 'Clothing, textiles and small shops on Tukwila International Boulevard.',
    address: '14225 Tukwila International Blvd, Tukwila, WA 98168',
    website: 'https://jubamalltukwila.com/',
    mapSearch: 'Juba Shopping Mall 14225 Tukwila International Blvd Tukwila WA',
    mapUrl: 'https://share.google/Le3XOG1aTHmA7MVWS',
  },
  {
    id: 7,
    name: 'Bananas Grill',
    category: 'Restaurant',
    city: 'Seattle',
    description: 'Halal Mediterranean and East African food in Columbia City.',
    address: '4556 Martin Luther King Jr Way S, Seattle, WA 98108',
    mapSearch: 'Bananas Grill 4556 Martin Luther King Jr Way S Seattle WA',
  },
  {
    id: 8,
    name: 'Qamaria Yemeni Coffee',
    category: 'Cafe',
    city: 'Redmond',
    description: 'Yemeni coffee house serving traditional coffee, tea and desserts.',
    address: '17565 NE 67th Ct, Redmond, WA 98052',
    website: 'https://www.qamariacoffee.com/',
    mapSearch: 'Qamaria Yemeni Coffee 17565 NE 67th Ct Redmond WA',
  },
];
