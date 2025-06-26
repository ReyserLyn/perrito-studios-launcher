import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { SHELL_OPCODE } from '../constants/ipc'
import * as ConfigManager from '../services/configManager'
import type { BaseResult, FilePathResult, SystemMemoryInfo } from '../types/system'

/**
 * Configurar handlers para operaciones del sistema
 * Incluye operaciones de archivos, carpetas y shell
 */
export default function setupSystemHandlers(): void {
  /**
   * Handler para obtener información de memoria del sistema
   */
  ipcMain.handle(SHELL_OPCODE.GET_SYSTEM_MEMORY, (): SystemMemoryInfo => {
    const BYTES_TO_GB = 1024 * 1024 * 1024
    const totalMemory = ConfigManager.getAbsoluteMaxRAM()

    // En Windows, os.freemem() puede reportar 0 cuando hay memoria disponible
    // Calculamos un estimado basado en la memoria total y el uso actual
    const usedMemory = Math.floor((os.totalmem() - os.freemem()) / BYTES_TO_GB)
    const freeMemory = Math.max(totalMemory - usedMemory, 0)

    return {
      total: totalMemory,
      free: freeMemory
    }
  })

  /**
   * Handler para obtener la versión de la aplicación
   */
  ipcMain.handle(SHELL_OPCODE.GET_APP_VERSION, (): string => {
    return app.getVersion()
  })

  /**
   * Handler para abrir las herramientas de desarrollo
   */
  ipcMain.on(SHELL_OPCODE.OPEN_DEV_TOOLS, () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools()
    }
  })

  /**
   * Handler para abrir URLs externas
   */
  ipcMain.handle(SHELL_OPCODE.OPEN_EXTERNAL, async (_event, url: string): Promise<BaseResult> => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error) {
      console.error('Error abriendo URL externa:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error abriendo URL externa'
      }
    }
  })

  /**
   * Handler para mover archivos a la papelera del sistema
   */
  ipcMain.handle(SHELL_OPCODE.TRASH_ITEM, async (_event, filePath: string): Promise<BaseResult> => {
    try {
      await shell.trashItem(filePath)
      return { success: true }
    } catch (error) {
      console.error('Error al mover archivo a papelera:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  })

  /**
   * Handler para abrir carpetas en el explorador del sistema
   */
  ipcMain.handle(
    SHELL_OPCODE.OPEN_FOLDER,
    async (_event, folderPath: string): Promise<BaseResult> => {
      try {
        await shell.openPath(folderPath)
        return { success: true }
      } catch (error) {
        console.error('Error al abrir carpeta:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error abriendo carpeta'
        }
      }
    }
  )

  /**
   * Handler para mostrar archivos en el explorador del sistema
   */
  ipcMain.handle(
    SHELL_OPCODE.SHOW_ITEM_IN_FOLDER,
    async (_event, filePath: string): Promise<BaseResult> => {
      try {
        shell.showItemInFolder(filePath)
        return { success: true }
      } catch (error) {
        console.error('Error al mostrar archivo:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error mostrando archivo'
        }
      }
    }
  )

  /**
   * Handler para crear archivos temporales desde ArrayBuffer
   * Utilizado principalmente para el drag & drop de archivos en Electron
   */
  ipcMain.handle(
    SHELL_OPCODE.RESOLVE_FILE_PATH,
    async (_event, fileName: string, fileBuffer: ArrayBuffer): Promise<FilePathResult> => {
      try {
        // Crear directorio temporal si no existe
        const tempDir = path.join(os.tmpdir(), 'perrito-launcher-drops')
        await fs.ensureDir(tempDir)

        // Sanear nombre de archivo para evitar problemas de sistema
        const sanitizedFileName = fileName.replace(/[<>:"/\\|?*]/g, '_')
        const timestamp = Date.now()
        const tempFilePath = path.join(tempDir, `${timestamp}_${sanitizedFileName}`)

        // Escribir el buffer al archivo
        await fs.writeFile(tempFilePath, Buffer.from(fileBuffer))

        return {
          success: true,
          path: tempFilePath
        }
      } catch (error) {
        console.error('Error creando archivo temporal:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error creando archivo temporal'
        }
      }
    }
  )

  // Seleccionar ejecutable de Java
  ipcMain.handle(SHELL_OPCODE.SELECT_JAVA_EXECUTABLE, async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Seleccionar Ejecutable de Java',
        filters: [
          {
            name: 'Ejecutable de Java',
            extensions: ['exe']
          }
        ],
        properties: ['openFile']
      })

      if (result.canceled) {
        return { success: false }
      }

      const selectedPath = result.filePaths[0]
      if (!selectedPath.toLowerCase().endsWith('javaw.exe')) {
        return {
          success: false,
          error: 'Por favor selecciona un archivo javaw.exe válido'
        }
      }

      return { success: true, path: selectedPath }
    } catch (error) {
      console.error('Error seleccionando ejecutable de Java:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error seleccionando ejecutable'
      }
    }
  })

  // Seleccionar carpeta
  ipcMain.handle(SHELL_OPCODE.SELECT_FOLDER, async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Seleccionar Carpeta',
        properties: ['openDirectory']
      })

      if (result.canceled) {
        return { success: false }
      }

      const selectedPath = result.filePaths[0]
      return { success: true, path: selectedPath }
    } catch (error) {
      console.error('Error seleccionando carpeta:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error seleccionando carpeta'
      }
    }
  })
}
