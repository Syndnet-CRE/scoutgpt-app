// Mock data for development - swap to real API calls in services/api.js

export const MOCK_PROPERTIES = [
  {
    attom_id: 100001,
    address: '301 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    latitude: 30.2649,
    longitude: -97.7428,
    property_use: 'Commercial - Office',
    year_built: 2004,
    bedrooms: null,
    bathrooms: null,
    building_area: 681342,
    lot_area: 43560,
    stories: 30,
    assessed_value: 285000000,
    last_sale_date: '2021-06-15',
    last_sale_price: 310000000,
    owner: {
      name: 'Endeavor Real Estate Group',
      type: 'Corporate',
      is_absentee: false,
      is_owner_occupied: false,
      mail_address: '301 Congress Ave Ste 100, Austin TX 78701',
    },
    tax: {
      year: 2024,
      assessed_total: 285000000,
      assessed_land: 42000000,
      assessed_improvements: 243000000,
      tax_billed: 6270000,
      homeowner_exemption: false,
    },
    valuation: {
      estimated_value: 295000000,
      estimated_min: 265000000,
      estimated_max: 325000000,
      confidence: 82,
      rental_value: 2200000,
      ltv: 0.48,
      available_equity: 153400000,
    },
    climate: {
      heat: 72,
      storm: 45,
      wildfire: 12,
      drought: 68,
      flood: 35,
      total: 46,
    },
    loans: [
      { position: 1, amount: 150000000, type: 'Commercial', rate: 4.25, lender: 'Wells Fargo' },
    ],
    sales: [
      { date: '2021-06-15', price: 310000000, buyer: 'Endeavor Real Estate Group', seller: 'GlenStar Properties', arms_length: true },
      { date: '2014-03-22', price: 215000000, buyer: 'GlenStar Properties', seller: 'Lincoln Property Co', arms_length: true },
    ],
    permits: [
      { date: '2023-08-15', type: 'Renovation', description: 'Lobby renovation and elevator modernization', value: 4500000, status: 'Complete' },
    ],
  },
  {
    attom_id: 100002,
    address: '1100 S 1st St',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    latitude: 30.2510,
    longitude: -97.7530,
    property_use: 'Residential - Single Family',
    year_built: 1952,
    bedrooms: 3,
    bathrooms: 2,
    building_area: 1450,
    lot_area: 7200,
    stories: 1,
    assessed_value: 625000,
    last_sale_date: '2019-09-10',
    last_sale_price: 485000,
    owner: {
      name: 'Martinez, Roberto J',
      type: 'Individual',
      is_absentee: true,
      is_owner_occupied: false,
      mail_address: '4521 Far West Blvd, Austin TX 78731',
    },
    tax: {
      year: 2024,
      assessed_total: 625000,
      assessed_land: 410000,
      assessed_improvements: 215000,
      tax_billed: 13750,
      homeowner_exemption: false,
    },
    valuation: {
      estimated_value: 710000,
      estimated_min: 640000,
      estimated_max: 780000,
      confidence: 91,
      rental_value: 2800,
      ltv: 0.42,
      available_equity: 411800,
    },
    climate: {
      heat: 72,
      storm: 45,
      wildfire: 15,
      drought: 68,
      flood: 62,
      total: 52,
    },
    loans: [
      { position: 1, amount: 340000, type: 'Conventional', rate: 3.75, lender: 'Chase' },
    ],
    sales: [
      { date: '2019-09-10', price: 485000, buyer: 'Martinez, Roberto J', seller: 'Chen, Lisa W', arms_length: true },
      { date: '2012-04-18', price: 225000, buyer: 'Chen, Lisa W', seller: 'Davis, Mark A', arms_length: true },
    ],
    permits: [],
  },
  {
    attom_id: 100003,
    address: '2400 E Cesar Chavez St',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    latitude: 30.2555,
    longitude: -97.7260,
    property_use: 'Commercial - Retail',
    year_built: 1985,
    bedrooms: null,
    bathrooms: null,
    building_area: 12500,
    lot_area: 21780,
    stories: 1,
    assessed_value: 2100000,
    last_sale_date: '2022-11-03',
    last_sale_price: 3200000,
    owner: {
      name: 'ECC Holdings LLC',
      type: 'Corporate',
      is_absentee: true,
      is_owner_occupied: false,
      mail_address: '1200 Barton Springs Rd Ste 400, Austin TX 78704',
    },
    tax: {
      year: 2024,
      assessed_total: 2100000,
      assessed_land: 1400000,
      assessed_improvements: 700000,
      tax_billed: 46200,
      homeowner_exemption: false,
    },
    valuation: {
      estimated_value: 3500000,
      estimated_min: 3100000,
      estimated_max: 3900000,
      confidence: 78,
      rental_value: 18000,
      ltv: 0.57,
      available_equity: 1505000,
    },
    climate: {
      heat: 72,
      storm: 45,
      wildfire: 8,
      drought: 68,
      flood: 78,
      total: 54,
    },
    loans: [
      { position: 1, amount: 2000000, type: 'Commercial', rate: 5.50, lender: 'Frost Bank' },
    ],
    sales: [
      { date: '2022-11-03', price: 3200000, buyer: 'ECC Holdings LLC', seller: 'Austin Retail Partners', arms_length: true },
    ],
    permits: [
      { date: '2023-02-20', type: 'Remodel', description: 'Interior tenant buildout - restaurant', value: 180000, status: 'Complete' },
      { date: '2024-06-10', type: 'Sign', description: 'New illuminated sign installation', value: 8500, status: 'Active' },
    ],
  },
  {
    attom_id: 100004,
    address: '8900 Shoal Creek Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78757',
    latitude: 30.3680,
    longitude: -97.7400,
    property_use: 'Residential - Multi-Family',
    year_built: 1998,
    bedrooms: null,
    bathrooms: null,
    building_area: 186000,
    lot_area: 174240,
    stories: 3,
    assessed_value: 28500000,
    last_sale_date: '2023-03-28',
    last_sale_price: 42000000,
    owner: {
      name: 'Greystar Real Estate Partners',
      type: 'Corporate',
      is_absentee: true,
      is_owner_occupied: false,
      mail_address: '18 Broad St, Charleston SC 29401',
    },
    tax: {
      year: 2024,
      assessed_total: 28500000,
      assessed_land: 8000000,
      assessed_improvements: 20500000,
      tax_billed: 627000,
      homeowner_exemption: false,
    },
    valuation: {
      estimated_value: 40000000,
      estimated_min: 36000000,
      estimated_max: 44000000,
      confidence: 75,
      rental_value: 280000,
      ltv: 0.60,
      available_equity: 16000000,
    },
    climate: {
      heat: 72,
      storm: 45,
      wildfire: 20,
      drought: 68,
      flood: 22,
      total: 45,
    },
    loans: [
      { position: 1, amount: 25200000, type: 'Commercial', rate: 4.85, lender: 'CBRE Capital Markets' },
    ],
    sales: [
      { date: '2023-03-28', price: 42000000, buyer: 'Greystar Real Estate Partners', seller: 'Camden Property Trust', arms_length: true },
    ],
    permits: [],
  },
  {
    attom_id: 100005,
    address: '500 W 2nd St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    latitude: 30.2665,
    longitude: -97.7490,
    property_use: 'Commercial - Office',
    year_built: 2016,
    bedrooms: null,
    bathrooms: null,
    building_area: 375000,
    lot_area: 32670,
    stories: 22,
    assessed_value: 185000000,
    last_sale_date: '2020-01-15',
    last_sale_price: 200000000,
    owner: {
      name: 'Kilroy Realty Corp',
      type: 'Corporate',
      is_absentee: true,
      is_owner_occupied: false,
      mail_address: '12200 W Olympic Blvd, Los Angeles CA 90064',
    },
    tax: {
      year: 2024,
      assessed_total: 185000000,
      assessed_land: 28000000,
      assessed_improvements: 157000000,
      tax_billed: 4070000,
      homeowner_exemption: false,
    },
    valuation: {
      estimated_value: 195000000,
      estimated_min: 175000000,
      estimated_max: 215000000,
      confidence: 80,
      rental_value: 1400000,
      ltv: 0.51,
      available_equity: 95550000,
    },
    climate: {
      heat: 72,
      storm: 45,
      wildfire: 10,
      drought: 68,
      flood: 40,
      total: 47,
    },
    loans: [
      { position: 1, amount: 100000000, type: 'Commercial', rate: 3.95, lender: 'JP Morgan' },
    ],
    sales: [
      { date: '2020-01-15', price: 200000000, buyer: 'Kilroy Realty Corp', seller: 'Brandywine Realty', arms_length: true },
    ],
    permits: [
      { date: '2024-01-10', type: 'Alteration', description: 'HVAC system upgrade floors 15-22', value: 2200000, status: 'Active' },
    ],
  },
];

// Mock parcel GeoJSON for map rendering
export const MOCK_PARCELS_GEOJSON = {
  type: 'FeatureCollection',
  features: MOCK_PROPERTIES.map((p) => ({
    type: 'Feature',
    properties: {
      attom_id: p.attom_id,
      address: p.address,
      property_use: p.property_use,
      assessed_value: p.assessed_value,
      owner_name: p.owner.name,
      is_absentee: p.owner.is_absentee,
      is_corporate: p.owner.type === 'Corporate',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [generateParcelPolygon(p.longitude, p.latitude, p.lot_area)],
    },
  })),
};

// Generate a rough rectangular parcel polygon from center point + area
function generateParcelPolygon(lng, lat, areaSqFt) {
  const areaMeters = areaSqFt * 0.0929;
  const side = Math.sqrt(areaMeters);
  const dlat = (side / 111320) * 0.5;
  const dlng = (side / (111320 * Math.cos(lat * (Math.PI / 180)))) * 0.5;

  // Slight rotation for visual variety
  const skew = (lng * 1000) % 0.2 - 0.1;

  return [
    [lng - dlng + skew * dlng, lat - dlat],
    [lng + dlng + skew * dlng, lat - dlat * 0.8],
    [lng + dlng - skew * dlng, lat + dlat],
    [lng - dlng - skew * dlng, lat + dlat * 0.8],
    [lng - dlng + skew * dlng, lat - dlat],
  ];
}

// Mock flood zone GeoJSON
export const MOCK_FLOOD_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zone_type: 'AE', description: '1% Annual Chance Flood Hazard', is_sfha: true },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.76, 30.245],
          [-97.74, 30.245],
          [-97.73, 30.255],
          [-97.72, 30.260],
          [-97.73, 30.265],
          [-97.75, 30.260],
          [-97.76, 30.250],
          [-97.76, 30.245],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { zone_type: 'X', description: '0.2% Annual Chance Flood Hazard', is_sfha: false },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.77, 30.240],
          [-97.75, 30.238],
          [-97.73, 30.242],
          [-97.72, 30.255],
          [-97.73, 30.268],
          [-97.76, 30.265],
          [-97.77, 30.255],
          [-97.77, 30.240],
        ]],
      },
    },
  ],
};

// Mock school district GeoJSON
export const MOCK_SCHOOL_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Austin ISD', level: 'Unified', nces_id: '4827000' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.82, 30.22],
          [-97.68, 30.22],
          [-97.68, 30.35],
          [-97.82, 30.35],
          [-97.82, 30.22],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Round Rock ISD', level: 'Unified', nces_id: '4836510' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.80, 30.35],
          [-97.65, 30.35],
          [-97.65, 30.55],
          [-97.80, 30.55],
          [-97.80, 30.35],
        ]],
      },
    },
  ],
};

export const MOCK_CHAT_RESPONSES = {
  'find commercial properties': {
    text: 'I found 3 commercial properties in the current map view. Here are the results:',
    properties: [100001, 100003, 100005],
  },
  'absentee owners': {
    text: 'I found 4 properties with absentee owners in the current area:',
    properties: [100002, 100003, 100004, 100005],
  },
  default: {
    text: "I can help you search properties in Travis County. Try asking things like:\n\n• \"Find commercial properties in 78701\"\n• \"Show me absentee-owned properties\"\n• \"Properties with high flood risk\"\n• \"Recent sales over $1M\"\n\nI'll query the ATTOM database and show results on the map.",
    properties: [],
  },
};
