import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
import { DISTRIBUTION, SHELL_OPCODE } from './constants/ipc'
import setupAuthHandlers from './handlers/setup-auth'
import setupConfigManagerHandlers from './handlers/setup-config-manager'
import setupDiscordRpcHandlers from './handlers/setup-discord-rpc'
import setupDistributionManagerHandlers from './handlers/setup-distribution-manager'
import setupDropinModHandlers from './handlers/setup-dropin-mod'
import setupLanguageHandlers from './handlers/setup-language'
import setupProcessBuilderHandlers from './handlers/setup-process-builder'
import setupServerStatusHandlers from './handlers/setup-server-status'

export function setupIpcHandlers(): void {
  setupAuthHandlers()
  setupConfigManagerHandlers()
  setupDistributionManagerHandlers()
  setupDropinModHandlers()
  setupProcessBuilderHandlers()
  setupServerStatusHandlers()
  setupDiscordRpcHandlers()
  setupLanguageHandlers()

  // Shell operations
  ipcMain.handle(SHELL_OPCODE.TRASH_ITEM, async (_, filePath) => {
    try {
      await shell.trashItem(filePath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(SHELL_OPCODE.OPEN_FOLDER, async (_, folderPath) => {
    try {
      await shell.openPath(folderPath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(SHELL_OPCODE.SHOW_ITEM_IN_FOLDER, async (_, filePath) => {
    try {
      await shell.showItemInFolder(filePath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle(SHELL_OPCODE.RESOLVE_FILE_PATH, async (_, fileName, fileBuffer) => {
    try {
      const tempPath = path.join(app.getPath('temp'), fileName)
      await fs.writeFile(tempPath, Buffer.from(fileBuffer))
      return { success: true, path: tempPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

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
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // Distribution
  ipcMain.on(DISTRIBUTION.DISTRIBUTION_INDEX_DONE, (_, result) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      window.webContents.send('distributionIndexDone', result)
    })
  })
}
