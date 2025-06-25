import { ipcRenderer } from 'electron'
import { SHELL_OPCODE } from '../../main/constants/ipc'
import type { FilePathResult, ShellOperationResult } from './types'

/**
 * API del sistema para operaciones de archivos y carpetas
 */
export const systemAPI = {
  /**
   * Mueve un archivo a la papelera del sistema
   * @param filePath Ruta del archivo a eliminar
   * @returns Resultado de la operación
   */
  trashItem: (filePath: string): Promise<ShellOperationResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.TRASH_ITEM, filePath),

  /**
   * Abre una carpeta en el explorador del sistema
   * @param folderPath Ruta de la carpeta a abrir
   * @returns Resultado de la operación
   */
  openFolder: (folderPath: string): Promise<ShellOperationResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.OPEN_FOLDER, folderPath),

  /**
   * Muestra un archivo específico en el explorador del sistema
   * @param filePath Ruta del archivo a mostrar
   * @returns Resultado de la operación
   */
  showItemInFolder: (filePath: string): Promise<ShellOperationResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.SHOW_ITEM_IN_FOLDER, filePath),

  /**
   * Crea un archivo temporal a partir de un ArrayBuffer y devuelve su ruta
   * @param fileName Nombre del archivo
   * @param fileBuffer Buffer con el contenido del archivo
   * @returns Resultado con la ruta del archivo temporal creado
   */
  resolveFilePath: (fileName: string, fileBuffer: ArrayBuffer): Promise<FilePathResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.RESOLVE_FILE_PATH, fileName, fileBuffer),

  /**
   * Escucha el evento de finalización del índice de distribución
   * @param callback Función a ejecutar cuando se complete el índice
   */
  onDistributionIndexDone: (callback: (result: boolean) => void): void => {
    ipcRenderer.on('distributionIndexDone', (_, result) => callback(result))
  },

  /**
   * Remueve todos los listeners del evento de distribución
   */
  removeDistributionListener: (): void => {
    ipcRenderer.removeAllListeners('distributionIndexDone')
  }
}
