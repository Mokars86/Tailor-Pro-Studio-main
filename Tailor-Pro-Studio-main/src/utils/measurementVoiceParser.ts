import { GarmentMeasurements } from '../types';

export interface MeasurementFieldDef {
  key: keyof Omit<GarmentMeasurements, 'genderCategory' | 'segment' | 'garmentType'>;
  label: string;
  category: 'upper' | 'lower' | 'full';
  aliases: string[];
}

export const MEASUREMENT_FIELD_DEFS: MeasurementFieldDef[] = [
  { key: 'bust', label: 'Bust', category: 'upper', aliases: ['bust', 'bustline', 'bust line', 'bust circumference'] },
  { key: 'chest', label: 'Chest', category: 'upper', aliases: ['chest', 'chestline', 'chest line', 'chest width', 'across chest'] },
  { key: 'waist', label: 'Waist', category: 'upper', aliases: ['waist', 'waistline', 'natural waist', 'waist size'] },
  { key: 'hips', label: 'Hips', category: 'lower', aliases: ['hips', 'hip', 'hipline', 'hip circumference'] },
  { key: 'shoulder', label: 'Shoulder', category: 'upper', aliases: ['shoulder', 'shoulder width', 'across shoulder', 'shoulder point'] },
  { key: 'underbust', label: 'Underbust', category: 'upper', aliases: ['underbust', 'under bust', 'shoulder to underbust', 'ribcage'] },
  { key: 'breastLength', label: 'Breast Length (Apex)', category: 'upper', aliases: ['breast length', 'shoulder to bust', 'apex', 'bust point', 'nipple point'] },
  { key: 'neck', label: 'Neck', category: 'upper', aliases: ['neck', 'neckline', 'collar', 'neck circumference'] },
  { key: 'sleeveLength', label: 'Sleeve Length', category: 'upper', aliases: ['sleeve length', 'sleeve', 'arm length', 'long sleeve', 'short sleeve length'] },
  { key: 'roundSleeves', label: 'Round Sleeves (Bicep)', category: 'upper', aliases: ['round sleeve', 'round sleeves', 'bicep', 'armhole', 'round arm', 'muscle'] },
  { key: 'topLength', label: 'Top / Shirt Length', category: 'upper', aliases: ['top length', 'shirt length', 'blouse length', 'kaftan length', 'jacket length'] },
  { key: 'skirtLength', label: 'Skirt Length', category: 'lower', aliases: ['skirt length', 'skirt', 'waist to skirt'] },
  { key: 'fullLength', label: 'Full / Gown Length', category: 'full', aliases: ['full length', 'gown length', 'dress length', 'total length', 'maxi length'] },
  { key: 'thigh', label: 'Thigh Circumference', category: 'lower', aliases: ['thigh', 'upper leg', 'lap', 'round thigh'] },
  { key: 'knee', label: 'Knee Circumference', category: 'lower', aliases: ['knee', 'round knee', 'knee line'] },
  { key: 'ankle', label: 'Ankle / Hem Opening', category: 'lower', aliases: ['ankle', 'cuff', 'leg opening', 'bottom opening'] },
  { key: 'inseam', label: 'Inseam / Trouser Length', category: 'lower', aliases: ['inseam', 'trouser length', 'pant length', 'inside leg', 'outseam', 'pant', 'trousers'] },
];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

/**
 * Converts natural spoken number phrases into decimal strings.
 * e.g. "thirty six and a half" -> "36.5"
 * "forty two point five" -> "42.5"
 * "18 1/2" -> "18.5"
 * "28 and quarter" -> "28.25"
 * "14 and three quarters" -> "14.75"
 */
export function normalizeSpokenTextToNumbers(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // Normalize common filler / separator words
  normalized = normalized.replace(/\b(inches|inch|in\b)/gi, '');
  
  // Replace fractions
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?1\/2\b/g, '$1.5');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?1\/4\b/g, '$1.25');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?3\/4\b/g, '$1.75');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?half\b/g, '$1.5');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?(?:a\s+)?quarter\b/g, '$1.25');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?three\s+quarters\b/g, '$1.75');
  normalized = normalized.replace(/\b(\d+)\s+point\s+(\d+)\b/g, '$1.$2');

  // Replace words for numbers (tens + units, e.g. "twenty five", "thirty six")
  const tens = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const units = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

  tens.forEach((t) => {
    units.forEach((u) => {
      const regex = new RegExp(`\\b${t}[-\\s]+${u}\\b`, 'gi');
      const val = (NUMBER_WORDS[t] || 0) + (NUMBER_WORDS[u] || 0);
      normalized = normalized.replace(regex, val.toString());
    });
    // Tens alone
    const regexTens = new RegExp(`\\b${t}\\b`, 'gi');
    if (NUMBER_WORDS[t]) {
      normalized = normalized.replace(regexTens, NUMBER_WORDS[t].toString());
    }
  });

  // Single words like "ten", "twelve", "fourteen", etc.
  Object.keys(NUMBER_WORDS).forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(regex, NUMBER_WORDS[word].toString());
  });

  // Re-run fractions on newly converted numbers e.g. "36 and a half"
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?1\/2\b/g, '$1.5');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?1\/4\b/g, '$1.25');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?3\/4\b/g, '$1.75');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?(?:a\s+)?half\b/g, '$1.5');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?(?:a\s+)?quarter\b/g, '$1.25');
  normalized = normalized.replace(/\b(\d+)\s+(?:and\s+)?three\s+quarters\b/g, '$1.75');
  normalized = normalized.replace(/\b(\d+)\s+point\s+(\d+)\b/g, '$1.$2');

  return normalized;
}

/**
 * Parses spoken or written text into a structured dictionary of garment measurements.
 */
export function extractMeasurementsFromTranscript(rawTranscript: string): Record<string, string> {
  if (!rawTranscript || !rawTranscript.trim()) return {};

  const normalized = normalizeSpokenTextToNumbers(rawTranscript);
  const results: Record<string, string> = {};

  // Sort field defs with longest aliases first to avoid greedy matching
  const sortedDefs = [...MEASUREMENT_FIELD_DEFS].sort((a, b) => {
    const maxA = Math.max(...a.aliases.map((al) => al.length));
    const maxB = Math.max(...b.aliases.map((al) => al.length));
    return maxB - maxA;
  });

  sortedDefs.forEach((item) => {
    for (const alias of item.aliases) {
      // Pattern: alias followed optionally by 'is', '=', ':', 'to', 'at' and then decimal or integer number
      // e.g. "bust 36", "bust is 36.5", "shoulder: 18.5"
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(
        `(?:\\b|^)${escapedAlias}\\s*(?:is|=|:|to|at)?\\s*(\\d+(?:\\.\\d+)?)\\b`,
        'i'
      );
      const match = normalized.match(regex);
      if (match && match[1]) {
        const numVal = parseFloat(match[1]);
        if (!isNaN(numVal) && numVal > 0 && numVal <= 200) {
          results[item.key] = match[1];
          break; // alias matched for this key
        }
      }
    }
  });

  return results;
}
