import { ipcMain, shell } from 'electron'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { SHELL_OPCODE } from '../constants/ipc'
import type { FilePathResult, ShellOperationResult } from '../types/system'

/**
 * Configurar handlers para operaciones del sistema
 * Incluye operaciones de archivos, carpetas y shell
 */
export default function setupSystemHandlers(): void {
  /**
   * Handler para mover archivos a la papelera del sistema
   */
  ipcMain.handle(
    SHELL_OPCODE.TRASH_ITEM,
    async (_event, filePath: string): Promise<ShellOperationResult> => {
      try {
        await shell.trashItem(filePath)
        return { result: true }
      } catch (error) {
        console.error('Error al mover archivo a papelera:', error)
        return {
          result: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }
    }
  )

  /**
   * Handler para abrir carpetas en el explorador del sistema
   */
  ipcMain.handle(
    SHELL_OPCODE.OPEN_FOLDER,
    async (_event, folderPath: string): Promise<ShellOperationResult> => {
      try {
        await shell.openPath(folderPath)
        return { result: true }
      } catch (error) {
        console.error('Error al abrir carpeta:', error)
        return {
          result: false,
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
    async (_event, filePath: string): Promise<ShellOperationResult> => {
      try {
        shell.showItemInFolder(filePath)
        return { result: true }
      } catch (error) {
        console.error('Error al mostrar archivo:', error)
        return {
          result: false,
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
}
