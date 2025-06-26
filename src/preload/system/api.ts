import { ipcRenderer } from 'electron'
import { DISCORD_RPC, LANGUAGE, SHELL_OPCODE } from '../../main/constants/ipc'
import type { BaseResult, FilePathResult, SystemApi } from './types'

/**
 * API del sistema para operaciones de archivos y carpetas
 */
export const systemAPI: SystemApi = {
  /**
   * Mueve un archivo a la papelera del sistema
   * @param filePath Ruta del archivo a eliminar
   * @returns Resultado de la operación
   */
  trashItem: (filePath: string): Promise<BaseResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.TRASH_ITEM, filePath),

  /**
   * Abre una carpeta en el explorador del sistema
   * @param folderPath Ruta de la carpeta a abrir
   * @returns Resultado de la operación
   */
  openFolder: (folderPath: string): Promise<BaseResult> =>
    ipcRenderer.invoke(SHELL_OPCODE.OPEN_FOLDER, folderPath),

  /**
   * Muestra un archivo específico en el explorador del sistema
   * @param filePath Ruta del archivo a mostrar
   * @returns Resultado de la operación
   */
  showItemInFolder: (filePath: string): Promise<BaseResult> =>
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
   * Abre un diálogo para seleccionar el ejecutable de Java
   * @returns Resultado con la ruta del ejecutable seleccionado
   */
  selectJavaExecutable: (): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke(SHELL_OPCODE.SELECT_JAVA_EXECUTABLE),

  /**
   * Abre un diálogo para seleccionar una carpeta
   * @returns Resultado con la ruta de la carpeta seleccionada
   */
  selectFolder: (): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke(SHELL_OPCODE.SELECT_FOLDER),

  /**
   * Escucha el evento de finalización del índice de distribución
   * @param callback Función a ejecutar cuando se complete el índice
   */
  onDistributionIndexDone: (callback: (result: boolean) => void): void => {
    ipcRenderer.on('distribution:index-done', (_, result) => callback(result))
  },

  /**
   * Remueve todos los listeners del evento de distribución
   */
  removeDistributionListener: (): void => {
    ipcRenderer.removeAllListeners('distribution:index-done')
  },

  // Language
  changeLanguage: (lang: string) => ipcRenderer.send(LANGUAGE.CHANGE, lang),
  getCurrentLanguage: () => ipcRenderer.sendSync(LANGUAGE.GET_CURRENT),
  getPlural: (key: string, options: any) => ipcRenderer.sendSync(LANGUAGE.PLURAL, key, options),
  formatDate: (dateString: string, format: string) =>
    ipcRenderer.sendSync(LANGUAGE.FORMAT_DATE, dateString, format),
  formatNumber: (num: number) => ipcRenderer.sendSync(LANGUAGE.FORMAT_NUMBER, num),
  onLanguageChanged: (callback: (lang: string) => void) =>
    ipcRenderer.on(LANGUAGE.CHANGED, (_, lang) => callback(lang)),

  // Discord RPC
  initializeDiscordRpc: () => ipcRenderer.invoke(DISCORD_RPC.INITIALIZE),
  destroyDiscordRpc: () => ipcRenderer.invoke(DISCORD_RPC.DESTROY),
  updateDiscordActivity: (activity: any) =>
    ipcRenderer.invoke(DISCORD_RPC.UPDATE_ACTIVITY, activity),

  // Shell operations
  getSystemMemory: () => ipcRenderer.invoke(SHELL_OPCODE.GET_SYSTEM_MEMORY)
}
