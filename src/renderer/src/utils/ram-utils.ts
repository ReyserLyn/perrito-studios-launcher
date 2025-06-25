/**
 * Convierte un string de RAM (ej: "5G") a número
 * @param ramString - String con formato de RAM (ej: "5G", "12GB")
 * @returns Número en GB
 */
export const parseRAMValue = (ramString: string): number => {
  return parseInt(ramString.replace(/[^\d]/g, '')) || 1
}

/**
 * Convierte un número a string de RAM con formato GB
 * @param ramNumber - Número en GB
 * @returns String con formato "XG"
 */
export const formatRAMValue = (ramNumber: number): string => {
  return `${ramNumber}G`
}

/**
 * Valida que los valores de RAM sean consistentes
 * @param minRAM - RAM mínima en GB
 * @param maxRAM - RAM máxima en GB
 * @returns true si son válidos (min <= max)
 */
export const validateRAMValues = (minRAM: number, maxRAM: number): boolean => {
  return minRAM <= maxRAM
}

/**
 * Corrige automáticamente valores de RAM inválidos
 * @param minRAM - RAM mínima actual
 * @param maxRAM - RAM máxima actual
 * @param totalMemory - Memoria total del sistema
 * @returns Objeto con valores corregidos
 */
export const autoCorrectRAMValues = (
  minRAM: number,
  maxRAM: number,
  totalMemory: number
): { minRAM: number; maxRAM: number } => {
  if (validateRAMValues(minRAM, maxRAM)) {
    return { minRAM, maxRAM }
  }

  // Si min > max, ajustar max a min
  if (minRAM > maxRAM) {
    return {
      minRAM,
      maxRAM: Math.min(minRAM, totalMemory)
    }
  }

  return { minRAM, maxRAM }
}
