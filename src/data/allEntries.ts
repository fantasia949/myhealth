// This file imports all individual label modules and exports them as a single array
// to replace the dynamic imports in index.ts

import module200811 from "./20200811.js";
import module201116 from "./20201116.js";
import module210304 from "./20210304.js";
import module210621 from "./20210621.js";
import module220406 from "./20220406.js";
import module221227, { notes as notes221227 } from "./20221227.js";
import module230316, { notes as notes230316 } from "./20230316.js";
import module230714 from "./20230714.js";
import module231016 from "./20231016.js";
import module240319 from "./20240319.js";
import module240417 from "./20240417.js";
import module240531 from "./20240531.js";
import module240801 from "./20240801.js";
import module240903 from "./20240903.js";
import module241019 from "./20241019.js";
import module241206 from "./20241206.js";
import module241228 from "./20241228.js";
import module250214 from "./20250214.js";
import module250315 from "./20250315.js";
import module250426 from "./20250426.js";
import module250525 from "./20250525.js";
import module250702 from "./20250702.js";
import module250812 from "./20250812.js";

// Normalize the data format to handle different export patterns
const normalizeEntry = (module: any, notes?: any[]): RawEntry => {
  // Check if it's an object with entries property (ES6 default import of object)
  if (module && typeof module === 'object' && Array.isArray(module.entries)) {
    // Format: { entries: [...], notes?: [...] }
    return {
      entries: module.entries,
      notes: module.notes || []
    };
  } 
  // Check if it's an array directly (ES6 default import of array)
  else if (Array.isArray(module)) {
    // Format: [...] - use external notes if provided
    return { 
      entries: module, 
      notes: notes || []
    };
  } 
  else {
    // Fallback for any other format
    console.warn('Unexpected module format:', module);
    return { entries: [] };
  }
};

// Export all entries in the same order as the labels array
export const allEntries: Array<RawEntry> = [
  normalizeEntry(module200811),
  normalizeEntry(module201116),
  normalizeEntry(module210304),
  normalizeEntry(module210621),
  normalizeEntry(module220406),
  normalizeEntry(module221227, notes221227),
  normalizeEntry(module230316, notes230316),
  normalizeEntry(module230714),
  normalizeEntry(module231016),
  normalizeEntry(module240319),
  normalizeEntry(module240417),
  normalizeEntry(module240531),
  normalizeEntry(module240801),
  normalizeEntry(module240903),
  normalizeEntry(module241019),
  normalizeEntry(module241206),
  normalizeEntry(module241228),
  normalizeEntry(module250214),
  normalizeEntry(module250315),
  normalizeEntry(module250426),
  normalizeEntry(module250525),
  normalizeEntry(module250702),
  normalizeEntry(module250812),
];