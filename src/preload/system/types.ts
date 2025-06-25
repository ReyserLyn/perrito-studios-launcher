import type { FilePathResult, ShellOperationResult } from '../../main/types/system'

/**
 * API del sistema disponible en el proceso de renderizado
 */
export default interface SystemAPI {
  trashItem: (filePath: string) => Promise<ShellOperationResult>
  openFolder: (folderPath: string) => Promise<ShellOperationResult>
  showItemInFolder: (filePath: string) => Promise<ShellOperationResult>
  resolveFilePath: (fileName: string, fileBuffer: ArrayBuffer) => Promise<FilePathResult>

  // Events de distribución
  onDistributionIndexDone: (callback: (result: boolean) => void) => void
  removeDistributionListener: () => void
}

export type { FilePathResult, ShellOperationResult }
