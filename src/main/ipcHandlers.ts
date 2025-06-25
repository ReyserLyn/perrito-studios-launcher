import { BrowserWindow, ipcMain } from 'electron'
import { DISTRIBUTION } from './constants/ipc'
import setupAuthHandlers from './handlers/setup-auth'
import setupConfigManagerHandlers from './handlers/setup-config-manager'
import setupDiscordRpcHandlers from './handlers/setup-discord-rpc'
import setupDistributionManagerHandlers from './handlers/setup-distribution-manager'
import setupDropinModHandlers from './handlers/setup-dropin-mod'
import setupLanguageHandlers from './handlers/setup-language'
import setupProcessBuilderHandlers from './handlers/setup-process-builder'
import setupServerStatusHandlers from './handlers/setup-server-status'
import setupSystemHandlers from './handlers/setup-system'

export function setupIpcHandlers(): void {
  setupAuthHandlers()
  setupConfigManagerHandlers()
  setupDistributionManagerHandlers()
  setupDropinModHandlers()
  setupProcessBuilderHandlers()
  setupServerStatusHandlers()
  setupDiscordRpcHandlers()
  setupLanguageHandlers()
  setupSystemHandlers()

  // Distribution
  ipcMain.on(DISTRIBUTION.DISTRIBUTION_INDEX_DONE, (_, result) => {
    const windows = BrowserWindow.getAllWindows()
    windows.forEach((window) => {
      window.webContents.send(DISTRIBUTION.DISTRIBUTION_INDEX_DONE, result)
    })
  })
}
