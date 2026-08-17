/**
 * Utility functions for Master Workshop Sync Codes
 * Facilitates Master Atelier & Apprentice Sync / Pairing
 * Format: TP-[BRAND_ABBREVIATION]-[4-CHAR-KEY]-[YEAR] e.g. TP-MSS-8F92-2026
 */

// Safe alphanumeric character set (excluding visually ambiguous chars like O, 0, I, 1)
const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Extracts a 2 to 4 letter brand abbreviation from a studio name
 * e.g. "Mokars Stitches Studio" -> "MSS"
 * e.g. "Tailor Pro Studio" -> "TPS"
 * e.g. "Kausar Couture" -> "KC"
 */
export function getBrandAbbreviation(studioName?: string): string {
  if (!studioName || !studioName.trim()) return 'MSS';

  const cleanWords = studioName
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, '').toUpperCase())
    .filter(Boolean);

  if (cleanWords.length >= 2) {
    const initials = cleanWords.map((w) => w[0]).join('').slice(0, 4);
    if (initials.length >= 2) return initials;
  }

  if (cleanWords.length === 1 && cleanWords[0].length > 0) {
    const single = cleanWords[0];
    if (single.length >= 3) return single.slice(0, 3);
    return single.padEnd(3, 'S');
  }

  return 'MSS';
}

/**
 * Generates a unique Master Workshop Code based on brand abbreviation
 * Format: TP-[BRAND_ABBREVIATION]-[4-char random key]-[Year] e.g. TP-MSS-8F92-2026
 */
export function generateMasterWorkshopCode(studioName?: string): string {
  const currentYear = new Date().getFullYear() || 2026;
  const brandAbbrev = getBrandAbbreviation(studioName);

  // Create 4 random characters from safe character set
  let randomSegment = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * CHAR_SET.length);
    randomSegment += CHAR_SET[randomIndex];
  }

  return `TP-${brandAbbrev}-${randomSegment}-${currentYear}`;
}

/**
 * Validates a Master Workshop Sync Code format
 * Must match TP-[BRAND_ABBREVIATION]-[4-CHAR-KEY]-[YEAR] e.g. TP-MSS-8F92-2026
 */
export function validateWorkshopCode(code: string): { isValid: boolean; normalizedCode: string; error?: string } {
  if (!code || typeof code !== 'string') {
    return { isValid: false, normalizedCode: '', error: 'Workshop Sync Code is required.' };
  }

  // Clean and normalize
  let normalized = code.trim().toUpperCase();

  // If user omitted prefix 'TP-', try auto-prefixing
  if (!normalized.startsWith('TP-')) {
    normalized = `TP-${normalized.replace(/^TP-?/, '')}`;
  }

  // Regex pattern matching TP-[BRAND_ABBREVIATION]-[4-CHAR-KEY]-[YEAR/KEY]
  const pattern = /^TP-[A-Z0-9]{2,6}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  if (!pattern.test(normalized)) {
    return {
      isValid: false,
      normalizedCode: normalized,
      error: 'Invalid code format. Master Workshop Code must be formatted like TP-MSS-8F92-2026'
    };
  }

  return {
    isValid: true,
    normalizedCode: normalized
  };
}

/**
 * Formats user input as they type to automatically enforce TP- prefix and uppercase
 */
export function formatWorkshopCodeInput(input: string): string {
  let val = input.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  if (val.length === 0) return '';
  if (!val.startsWith('TP-')) {
    val = `TP-${val.replace(/^TP-?/, '')}`;
  }

  return val;
}
