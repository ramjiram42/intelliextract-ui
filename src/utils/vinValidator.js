/**
 * ISO 3779 standard VIN validation & Checksum Calculator
 */

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

const TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

export function validateVIN(vin) {
  if (!vin) {
    return { isValid: false, reason: 'VIN is required' };
  }

  const cleanVin = vin.trim().toUpperCase();

  if (cleanVin.length !== 17) {
    return {
      isValid: false,
      reason: `Length is ${cleanVin.length}/17 characters`,
      length: cleanVin.length
    };
  }

  // Check for forbidden characters (I, O, Q are disallowed in ISO VIN standards)
  const forbiddenChars = cleanVin.match(/[IOQ]/g);
  if (forbiddenChars) {
    return {
      isValid: false,
      reason: `Contains forbidden character(s): ${[...new Set(forbiddenChars)].join(', ')} (I, O, Q not permitted)`
    };
  }

  // Validate only alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
    return {
      isValid: false,
      reason: 'Contains invalid non-alphanumeric characters'
    };
  }

  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = cleanVin[i];
    const val = TRANSLITERATION[char];
    if (val === undefined) {
      return { isValid: false, reason: `Unrecognized character: ${char}` };
    }
    sum += val * VIN_WEIGHTS[i];
  }

  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 10 ? 'X' : String(remainder);
  const actualCheckDigit = cleanVin[8];

  if (actualCheckDigit !== expectedCheckDigit) {
    return {
      isValid: false,
      reason: `Check digit mismatch at position 9: found '${actualCheckDigit}', expected '${expectedCheckDigit}'`,
      expectedCheckDigit,
      actualCheckDigit
    };
  }

  return {
    isValid: true,
    reason: 'Valid 17-character ISO VIN checksum',
    cleanVin,
    wmi: cleanVin.substring(0, 3), // World Manufacturer Identifier
    vds: cleanVin.substring(3, 9), // Vehicle Descriptor Section
    vis: cleanVin.substring(9, 17) // Vehicle Identifier Section
  };
}

/**
 * Suggests an auto-fix for common OCR errors in a VIN
 * e.g., O -> 0, I -> 1, Q -> 0, or calculates the correct check digit
 */
export function autoCorrectVIN(vin) {
  if (!vin) return '';
  let corrected = vin.trim().toUpperCase()
    .replace(/O/g, '0')
    .replace(/Q/g, '0')
    .replace(/I/g, '1')
    .replace(/[^A-HJ-NPR-Z0-9]/g, '');

  if (corrected.length === 17) {
    // Recompute 9th char
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const val = TRANSLITERATION[corrected[i]] || 0;
      sum += val * VIN_WEIGHTS[i];
    }
    const remainder = sum % 11;
    const checkDigit = remainder === 10 ? 'X' : String(remainder);
    corrected = corrected.substring(0, 8) + checkDigit + corrected.substring(9);
  }

  return corrected;
}
