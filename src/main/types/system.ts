/**
 * Tipos para las operaciones del sistema
 */

export interface BaseResult {
  success: boolean
  error?: string
}

export interface FilePathResult extends BaseResult {
  path?: string
}

export interface SystemMemoryInfo {
  total: number
  free: number
}

export type DistributionEvent =
  | {
      type: 'distributionIndexDone'
      payload: boolean
    }
  | {
      type: 'distributionIndexError'
      payload: string
    }
