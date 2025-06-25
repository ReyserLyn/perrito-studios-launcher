/**
 * Tipos para las operaciones del sistema
 */

export type ShellOperationResult =
  | {
      result: true
    }
  | {
      result: false
      error: string
    }

export type FilePathResult =
  | {
      success: true
      path: string
    }
  | {
      success: false
      error: string
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
