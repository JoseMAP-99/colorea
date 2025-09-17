// import { differenceCiede2000, interpolate, formatHex, parseHex } from 'culori';
import seedrandom from 'seedrandom';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HexColor {
  hex: string;
}

/**
 * Calcula la precisión entre dos colores RGB usando ΔE2000
 * @param a Color RGB inicial
 * @param b Color RGB objetivo
 * @param maxD Distancia máxima para normalizar (default: 60)
 * @returns Porcentaje de precisión (0-100)
 */
// Función auxiliar para calcular la distancia euclidiana en RGB
const euclideanDistance = (a: RGB, b: RGB): number => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

export const precisionPercent = (a: RGB, b: RGB, maxD: number = 60): number => {
  // Validar que los colores sean válidos
  if (!a || !b || 
      a.r === undefined || a.g === undefined || a.b === undefined ||
      b.r === undefined || b.g === undefined || b.b === undefined) {
    console.warn('Invalid RGB values:', { a, b });
    return 0;
  }
  
  try {
    // Usar distancia euclidiana como fallback
    const distance = euclideanDistance(a, b);
    console.log('Euclidean distance:', distance);
    
    // Normalizar la distancia (máxima distancia posible en RGB es sqrt(3 * 255^2) ≈ 441)
    const maxPossibleDistance = Math.sqrt(3 * 255 * 255);
    const normalized = Math.max(0, Math.min(1, 1 - distance / maxPossibleDistance));
    const result = Math.round(normalized * 100);
    
    console.log('Precision calculation:', { distance, maxPossibleDistance, normalized, result });
    
    // Verificar que el resultado final sea válido
    if (isNaN(result) || !isFinite(result)) {
      console.warn('Invalid precision result:', result);
      return 0;
    }
    
    return result;
  } catch (error) {
    console.warn('Error calculating precision:', error);
    return 0;
  }
};

/**
 * Convierte RGB a hexadecimal
 */
export const rgbToHex = (rgb: RGB): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

/**
 * Convierte hexadecimal a RGB
 */
export const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Invalid hex color');
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
};

/**
 * Genera un color RGB aleatorio evitando extremos (rango 40-215)
 */
export const randRGB = (rng: () => number): RGB => {
  const min = 40;
  const max = 215;
  return {
    r: Math.floor(rng() * (max - min + 1)) + min,
    g: Math.floor(rng() * (max - min + 1)) + min,
    b: Math.floor(rng() * (max - min + 1)) + min,
  };
};

/**
 * Interpola entre dos colores hexadecimales usando RGB simple
 */
export const lerpHex = (a: string, b: string, t: number): string => {
  try {
    // Fallback to simple RGB interpolation
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    const rgb = {
      r: Math.round(rgbA.r + (rgbB.r - rgbA.r) * t),
      g: Math.round(rgbA.g + (rgbB.g - rgbA.g) * t),
      b: Math.round(rgbA.b + (rgbB.b - rgbA.b) * t),
    };
    return rgbToHex(rgb);
  } catch (error) {
    console.warn('Error interpolating colors:', error);
    return a; // Return original color if interpolation fails
  }
};

/**
 * Genera una semilla diaria basada en la fecha
 */
export const dailySeed = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Crea un generador de números aleatorios con semilla
 */
export const createSeededRNG = (seed: string) => {
  return seedrandom(seed);
};

/**
 * Genera un color RGB usando un generador con semilla
 */
export const generateSeededColor = (rng: () => number): RGB => {
  return randRGB(rng);
};

/**
 * Valida si un color RGB es válido
 */
export const isValidRGB = (rgb: RGB): boolean => {
  return (
    rgb.r >= 0 && rgb.r <= 255 &&
    rgb.g >= 0 && rgb.g <= 255 &&
    rgb.b >= 0 && rgb.b <= 255
  );
};

/**
 * Clamp un valor entre min y max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
