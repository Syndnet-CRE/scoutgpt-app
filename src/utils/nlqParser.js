/**
 * NLQ Parser — Natural Language Query → UI Control Bridge
 * Intercepts chat messages that are layer/filter commands
 * Returns an action object if matched, null if no match (fall through to Claude)
 */

// ============================================================
// LAYER COMMANDS
// ============================================================

const LAYER_ALIASES = {
  // GIS layers (handled by handleGisLayerChange)
  zoning_districts: {
    show: [/\b(show|display|turn on|enable|add|activate|what'?s|whats|what is)\b.*\b(zoning|zone|zones)\b/i,
           /\b(zoning|zone|zones)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(zoning|zone|zones)\b/i,
           /\b(no|off)\b.*\b(zoning|zone|zones)\b/i],
  },
  floodplains: {
    show: [/\b(show|display|turn on|enable|add|activate|what'?s|whats|what is)\b.*\b(flood|floodplain|floodplains|flood zone|flood zones|fema)\b/i,
           /\b(flood|floodplain|floodplains|flood zone|flood zones|fema)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(flood|floodplain|floodplains|flood zone|flood zones|fema)\b/i,
           /\b(no|off)\b.*\b(flood|floodplain|floodplains|flood zone|flood zones)\b/i],
  },
  water_lines: {
    show: [/\b(show|display|turn on|enable|add|activate)\b.*\b(water|water line|water lines|water main|water mains|water infrastructure)\b/i,
           /\b(water|water line|water lines|water main|water mains)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(water|water line|water lines|water main|water mains)\b/i],
  },
  wastewater_lines: {
    show: [/\b(show|display|turn on|enable|add|activate)\b.*\b(sewer|wastewater|waste water|sewer line|sewer lines|sewer main|sewer mains)\b/i,
           /\b(sewer|wastewater|waste water|sewer line|sewer lines)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(sewer|wastewater|waste water|sewer line|sewer lines)\b/i],
  },
  stormwater_lines: {
    show: [/\b(show|display|turn on|enable|add|activate)\b.*\b(storm|stormwater|storm water|storm drain|storm drains|storm line|storm lines)\b/i,
           /\b(storm|stormwater|storm water|storm drain|storm drains)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(storm|stormwater|storm water|storm drain|storm drains)\b/i],
  },
};

// Basic layers (handled by handleLayerChange)
const BASIC_LAYER_ALIASES = {
  parcels: {
    show: [/\b(show|display|turn on|enable|add|activate)\b.*\b(parcel|parcels|parcel boundar|boundaries|boundary)\b/i,
           /\b(parcel|parcels|boundar|boundaries)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(parcel|parcels|parcel boundar|boundaries|boundary)\b/i],
  },
  schools: {
    show: [/\b(show|display|turn on|enable|add|activate)\b.*\b(school|schools|school district|school districts|school zone|school zones)\b/i,
           /\b(school|schools|school district|school districts)\b.*\b(layer|overlay|map|on)\b/i],
    hide: [/\b(hide|remove|turn off|disable|clear|deactivate)\b.*\b(school|schools|school district|school districts)\b/i],
  },
};

// ============================================================
// FILTER COMMANDS
// ============================================================

const FILTER_COMMANDS = [
  // Foreclosure
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(foreclosure|foreclosures|pre-?foreclosure|pre-?foreclosures)\b/i,
      /\b(foreclosure|foreclosures)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(foreclosure|foreclosures)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'hasForeclosure',
    filterValue: true,
    clearValue: false,
    label: 'Foreclosure',
    tab: 'Risk',
  },
  // Absentee owners
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(absentee|absent|non-?owner|out of (state|town|area))\b/i,
      /\b(absentee|absent)\b.*\b(owner|owners|owned|filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(absentee|absent)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'absenteeOnly',
    filterValue: true,
    clearValue: false,
    label: 'Absentee Owner',
    tab: 'Ownership',
  },
  // Corporate owners
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(corporate|corp|llc|company|companies)\b.*\b(owner|owners|owned|properties)?\b/i,
      /\b(corporate|corp|llc|company)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(corporate|corp|llc|company)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'ownerType',
    filterValue: ['corporate'],
    clearValue: [],
    isArray: true,
    label: 'Corporate Owners',
    tab: 'Ownership',
  },
  // Flood zone filter
  {
    patterns: [
      /\b(filter|find|show|highlight)\b.*\b(in|within)\b.*\b(flood zone|flood|floodplain|fema)\b/i,
      /\b(flood zone|floodplain|fema)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(flood)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'inFloodZone',
    filterValue: true,
    clearValue: false,
    label: 'In Flood Zone',
    tab: 'Risk',
  },
  // Distressed properties
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(distress|distressed)\b/i,
      /\b(distress|distressed)\b.*\b(filter|only|properties|score)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(distress|distressed)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'distressScoreMin',
    filterValue: '30',
    clearValue: '',
    label: 'Distressed (score ≥ 30)',
    tab: 'Risk',
  },
  // High LTV
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(high ltv|overleveraged|high leverage|underwater)\b/i,
      /\b(high ltv|overleveraged)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(high ltv|overleveraged|leverage)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'highLtvOnly',
    filterValue: true,
    clearValue: false,
    label: 'High LTV (>80%)',
    tab: 'Financial',
  },
  // Recent sales
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(recent sale|recent sales|recently sold|sold recently|recent transaction|recent transactions)\b/i,
      /\b(recent sale|recent sales|recently sold)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(recent sale|recent sales|recently sold)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'soldWithinDays',
    filterValue: '365',
    clearValue: '',
    label: 'Recent Sales (last 12 months)',
    tab: 'Sales',
  },
  // Investor purchases
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(investor|investors)\b.*\b(purchase|purchases|buy|buys|bought|properties)?\b/i,
      /\b(investor|investors)\b.*\b(filter|only|properties)\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(investor|investors)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'investorOnly',
    filterValue: true,
    clearValue: false,
    label: 'Investor Purchases',
    tab: 'Sales',
  },
  // High equity
  {
    patterns: [
      /\b(show|filter|find|display|highlight)\b.*\b(high equity|equity rich|equity)\b.*\b(properties|filter|only)?\b/i,
    ],
    clearPatterns: [
      /\b(remove|clear|hide|turn off|disable|reset)\b.*\b(equity)\b.*\b(filter)?\b/i,
    ],
    filterKey: 'equityMin',
    filterValue: '100000',
    clearValue: '',
    label: 'High Equity (≥$100K)',
    tab: 'Financial',
  },
];

// ============================================================
// CLEAR ALL COMMANDS
// ============================================================

const CLEAR_ALL_PATTERNS = [
  /\b(clear|reset|remove)\b.*\b(all|every)\b.*\b(filter|filters|layer|layers)\b/i,
  /\b(clear|reset|remove)\b.*\b(filter|filters)\b$/i,
  /\b(turn off|hide|remove)\b.*\b(all|every)\b.*\b(layer|layers)\b/i,
];

// ============================================================
// MAIN PARSER
// ============================================================

export function parseNLQCommand(message) {
  const text = message.trim();
  console.log('[NLQ] Parsing:', text);
  if (!text) return null;

  // --- Check for clear-all ---
  for (const pattern of CLEAR_ALL_PATTERNS) {
    if (pattern.test(text)) {
      console.log('[NLQ] MATCHED clear_all');
      return {
        type: 'clear_all',
        confirmationText: '✅ All filters and layers cleared.',
      };
    }
  }

  // --- Check GIS layer commands ---
  for (const [layerKey, aliases] of Object.entries(LAYER_ALIASES)) {
    for (const pattern of aliases.hide) {
      if (pattern.test(text)) {
        console.log('[NLQ] MATCHED gis_layer hide:', layerKey);
        return {
          type: 'gis_layer',
          action: 'hide',
          layerKey,
          confirmationText: `✅ ${formatLayerName(layerKey)} layer hidden.`,
        };
      }
    }
    for (const pattern of aliases.show) {
      if (pattern.test(text)) {
        console.log('[NLQ] MATCHED gis_layer show:', layerKey);
        return {
          type: 'gis_layer',
          action: 'show',
          layerKey,
          confirmationText: `✅ ${formatLayerName(layerKey)} layer is now visible.`,
        };
      }
    }
  }

  // --- Check basic layer commands ---
  for (const [layerKey, aliases] of Object.entries(BASIC_LAYER_ALIASES)) {
    for (const pattern of aliases.hide) {
      if (pattern.test(text)) {
        console.log('[NLQ] MATCHED basic_layer hide:', layerKey);
        return {
          type: 'basic_layer',
          action: 'hide',
          layerKey,
          confirmationText: `✅ ${formatLayerName(layerKey)} layer hidden.`,
        };
      }
    }
    for (const pattern of aliases.show) {
      if (pattern.test(text)) {
        console.log('[NLQ] MATCHED basic_layer show:', layerKey);
        return {
          type: 'basic_layer',
          action: 'show',
          layerKey,
          confirmationText: `✅ ${formatLayerName(layerKey)} layer is now visible.`,
        };
      }
    }
  }

  // --- Check filter commands ---
  for (const cmd of FILTER_COMMANDS) {
    // Check clear patterns first
    if (cmd.clearPatterns) {
      for (const pattern of cmd.clearPatterns) {
        if (pattern.test(text)) {
          console.log('[NLQ] MATCHED filter clear:', cmd.filterKey);
          return {
            type: 'filter',
            action: 'clear',
            filterKey: cmd.filterKey,
            filterValue: cmd.clearValue,
            isArray: cmd.isArray || false,
            confirmationText: `✅ ${cmd.label} filter cleared.`,
          };
        }
      }
    }
    // Check set patterns
    for (const pattern of cmd.patterns) {
      if (pattern.test(text)) {
        console.log('[NLQ] MATCHED filter set:', cmd.filterKey);
        return {
          type: 'filter',
          action: 'set',
          filterKey: cmd.filterKey,
          filterValue: cmd.filterValue,
          isArray: cmd.isArray || false,
          tab: cmd.tab,
          confirmationText: `✅ ${cmd.label} filter applied. Check the Filters panel (${cmd.tab} tab) to see results.`,
        };
      }
    }
  }

  // --- No match — fall through to Claude ---
  console.log('[NLQ] No match for:', text);
  return null;
}

// ============================================================
// HELPERS
// ============================================================

function formatLayerName(key) {
  const names = {
    zoning_districts: 'Zoning',
    floodplains: 'Floodplains',
    water_lines: 'Water Lines',
    wastewater_lines: 'Sewer Lines',
    stormwater_lines: 'Stormwater',
    parcels: 'Parcel Boundaries',
    schools: 'School Districts',
  };
  return names[key] || key;
}
