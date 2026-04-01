/**
 * VIN Decoder Utility for Booga Car
 * Integrates with NHTSA Public API with expanded local fallback for Saudi market.
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

/** Decode the model year from the 10th VIN character */
function decodeYearFromVin(vin: string): string {
  const c = vin.charAt(9).toUpperCase();
  // Single-char year codes — 2010+ reuse the same letters (cycle repeats every 30 years)
  // For modern cars we assume the later cycle (2010–2039)
  const map: Record<string, string> = {
    'A': '2010', 'B': '2011', 'C': '2012', 'D': '2013', 'E': '2014',
    'F': '2015', 'G': '2016', 'H': '2017', 'J': '2018', 'K': '2019',
    'L': '2020', 'M': '2021', 'N': '2022', 'P': '2023', 'R': '2024',
    'S': '2025', 'T': '2026', 'V': '2027', 'W': '2028', 'X': '2029',
    'Y': '2000', '1': '2001', '2': '2002', '3': '2003', '4': '2004',
    '5': '2005', '6': '2006', '7': '2007', '8': '2008', '9': '2009',
  };
  return map[c] || '';
}

// Expanded WMI database for Saudi/Gulf market cars
const WMI_DATABASE: Record<string, string> = {
  // Toyota (Japan, USA, Canada, etc.)
  'JT1': 'Toyota', 'JT2': 'Toyota', 'JT3': 'Toyota', 'JT4': 'Toyota',
  'JT6': 'Toyota', 'JT8': 'Toyota', 'JTD': 'Toyota', 'JTE': 'Toyota',
  'JTF': 'Toyota', 'JTK': 'Toyota', 'JTL': 'Toyota',
  'JTM': 'Toyota', 'JTN': 'Toyota', 'JTP': 'Toyota', 'JTR': 'Toyota',
  'JTS': 'Toyota', 'JTW': 'Toyota', '4T1': 'Toyota', '4T3': 'Toyota',
  '2T1': 'Toyota', '5T3': 'Toyota', '5TD': 'Toyota', '6T1': 'Toyota',

  // Lexus
  'JTH': 'Lexus', 'JTJ': 'Lexus',

  // Nissan (Japan, USA)
  'JN1': 'Nissan', 'JN3': 'Nissan', 'JN6': 'Nissan', 'JN8': 'Nissan',
  '1N4': 'Nissan', '5N1': 'Nissan', '3N1': 'Nissan',

  // Hyundai
  'KMH': 'Hyundai', '5NP': 'Hyundai', 'KM8': 'Hyundai',

  // Kia
  'KNA': 'Kia', 'KND': 'Kia', 'KNB': 'Kia',

  // Honda (Japan, USA, UK)
  'JHM': 'Honda', 'SHH': 'Honda', '2HG': 'Honda', '19X': 'Honda',
  '5FN': 'Honda', 'JHL': 'Honda',

  // GMC / Chevrolet
  '1GK': 'GMC', '2GK': 'GMC', '1GC': 'Chevrolet', '1G1': 'Chevrolet',
  '2G1': 'Chevrolet', '1GT': 'GMC',

  // Ford
  '1FA': 'Ford', '1FB': 'Ford', '1FC': 'Ford', '1FD': 'Ford',
  '1FE': 'Ford', '1FM': 'Ford', '1FT': 'Ford', '2FM': 'Ford',

  // BMW
  'WBA': 'BMW', 'WBS': 'BMW', 'WBX': 'BMW', 'WBY': 'BMW',

  // Mercedes-Benz
  'WDC': 'Mercedes-Benz', 'WDB': 'Mercedes-Benz', 'WDD': 'Mercedes-Benz',
  'WDF': 'Mercedes-Benz', 'W1N': 'Mercedes-Benz',

  // Volkswagen
  'WVW': 'Volkswagen', '3VW': 'Volkswagen',

  // Audi
  'WAU': 'Audi', 'WA1': 'Audi',

  // Land Rover / Range Rover
  'SAL': 'Land Rover',

  // Jaguar
  'SAJ': 'Jaguar',

  // Jeep / Dodge / Chrysler
  '1C4': 'Jeep', '1J4': 'Jeep', '1C3': 'Chrysler', '2C4': 'Chrysler',
  '1D3': 'Dodge', '2B3': 'Dodge',

  // Mazda (Japan, USA)
  'JM1': 'Mazda', 'JM3': 'Mazda', 'JM6': 'Mazda', '4F2': 'Mazda',

  // Mitsubishi
  'JA3': 'Mitsubishi', 'JA4': 'Mitsubishi', 'ML3': 'Mitsubishi',

  // Subaru
  'JF1': 'Subaru', 'JF2': 'Subaru', '4S3': 'Subaru',

  // Suzuki
  'JS1': 'Suzuki', 'JS2': 'Suzuki', 'JS3': 'Suzuki',

  // Porsche
  'WP0': 'Porsche', 'WP1': 'Porsche',

  // Infiniti (Nissan luxury)
  'JNK': 'Infiniti', 'JNR': 'Infiniti',

  // Acura (Honda luxury)
  'JH4': 'Acura', '19U': 'Acura',

  // Cadillac
  '1GY': 'Cadillac', '1G6': 'Cadillac',

  // Lincoln
  '5LM': 'Lincoln', '2LM': 'Lincoln',

  // Ram Trucks
  '1D7': 'Ram', '3D7': 'Ram',

  // Volvo
  'YV1': 'Volvo', 'YV4': 'Volvo',

  // Tesla
  '5YJ': 'Tesla', '7SA': 'Tesla',

  // Peugeot / Citroën
  'VF3': 'Peugeot', 'VF7': 'Peugeot', 'VF6': 'Citroën',

  // Renault
  'VF1': 'Renault',
};

/**
 * Decodes a 17-character VIN using the NHTSA API with local fallback.
 */
export async function decodeVIN(vin: string): Promise<DecodedVehicle | null> {
  const cleanVin = vin.trim().toUpperCase();
  if (cleanVin.length !== 17) return null;

  // 1. Try NHTSA Public API with a 5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${cleanVin}?format=json`,
      { method: 'GET', signal: controller.signal }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const result = data.Results?.[0];
      if (result?.Make && result.Make.trim() !== '') {
        return {
          make: result.Make,
          model: result.Model || '',
          year: result.ModelYear || decodeYearFromVin(cleanVin),
          engine: result.EngineHP ? `${result.EngineHP} HP` : result.EngineConfiguration || undefined,
          trim: result.Trim || undefined,
          driveType: result.DriveType || undefined,
          bodyClass: result.BodyClass || undefined,
          vin: cleanVin,
        };
      }
    }
  } catch {
    // API failed (network error or timeout) — fall through to local fallback
  }

  // 2. Local WMI fallback
  const localMake = WMI_DATABASE[cleanVin.substring(0, 3)];
  if (localMake) {
    return {
      make: localMake,
      model: '',
      year: decodeYearFromVin(cleanVin),
      vin: cleanVin,
    };
  }

  return null;
}
