/**
 * VIN Decoder Utility for Booga Car
 * Integrates with NHTSA Public API and provides local fallbacks.
 */

export interface DecodedVehicle {
  make: string;
  model: string;
  year: string;
  engine?: string;
  trim?: string;
  transmission?: string;
  driveType?: string;
  bodyClass?: string;
  vin: string;
}

/**
 * Decodes a 17-character VIN using the NHTSA API.
 * Includes a timeout and local fallback mechanism.
 */
export async function decodeVIN(vin: string): Promise<DecodedVehicle | null> {
  const cleanVin = vin.trim().toUpperCase();
  
  if (cleanVin.length !== 17) return null;

  try {
    // 1. Try NHTSA Public API (Free, No Key Required)
    const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${cleanVin}?format=json`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 } // Cache for 24 hours in Next.js
    });

    if (!response.ok) throw new Error('NHTSA API Unreachable');

    const data = await response.json();
    const result = data.Results?.[0];

    if (result && result.Make) {
      return {
        make: result.Make,
        model: result.Model,
        year: result.ModelYear,
        engine: result.EngineHP ? `${result.EngineHP} HP ${result.DisplacementL}L` : result.EngineConfiguration,
        trim: result.Trim,
        driveType: result.DriveType,
        bodyClass: result.BodyClass,
        vin: cleanVin
      };
    }
  } catch (error) {
    console.error('VIN Decoding API Error:', error);
  }

  // 2. Local Fallback (Basic Mapping for Common Saudi Brands if API fails)
  // This is a simplified version of VIN decoding logic.
  const firstThree = cleanVin.substring(0, 3);
  
  const commonMakes: Record<string, string> = {
    '4T1': 'Toyota', // Toyota USA
    'JT1': 'Toyota', // Toyota Japan
    '5NP': 'Hyundai', // Hyundai USA
    'KMH': 'Hyundai', // Hyundai Korea
    '1FT': 'Ford',   // Ford USA
    'JTD': 'Toyota', // Toyota (Lexus)
    'SAL': 'Land Rover',
    'WBA': 'BMW',
    'WDC': 'Mercedes-Benz',
    'WVW': 'Volkswagen',
  };

  if (commonMakes[firstThree]) {
    // Extract year from 10th digit (Standard VIN Year Mapping)
    const yearDigit = cleanVin.charAt(9);
    const years: Record<string, string> = {
      'L': '2020', 'M': '2021', 'N': '2022', 'P': '2023', 'R': '2024',
      'K': '2019', 'J': '2018', 'H': '2017', 'G': '2016'
    };

    return {
      make: commonMakes[firstThree],
      model: 'Unknown Model', // Hard to get from First 3 without huge DB
      year: years[yearDigit] || '2022',
      vin: cleanVin
    };
  }

  return null;
}
