import { BrowserWindow, ipcMain } from 'electron'
import { DISCORD_RPC, DISTRIBUTION } from './constants/ipc'
import setupAuthHandlers from './handlers/setup-auth'
import setupConfigHandlers from './handlers/setup-config-manager'
import setupDistributionHandlers from './handlers/setup-distribution-manager'
import setupDropinModHandlers from './handlers/setup-dropin-mod'
import setupProcessBuilderHandlers from './handlers/setup-process-builder'
import setupServerStatusHandlers from './handlers/setup-server-status'
import setupSystemHandlers from './handlers/setup-system'
import * as DiscordWrapper from './services/discordwrapper'
import { languageManager } from './utils/language'

export function setupIpcHandlers(): void {
  // Manejar distribución de índices
  ipcMain.on(DISTRIBUTION.INDEX_DONE, (event, res) => {
    event.sender.send(DISTRIBUTION.INDEX_DONE, res)
  })

  setupDiscordRpcHandlers()
  setupLanguageHandlers()

  // === SETUP DE HANDLERS ===
  setupSystemHandlers()
  setupAuthHandlers()
  setupConfigHandlers()
  setupDistributionHandlers()
  setupDropinModHandlers()
  setupProcessBuilderHandlers()
  setupServerStatusHandlers()
}

function setupDiscordRpcHandlers(): void {
  ipcMain.handle(
    DISCORD_RPC.INIT,
    async (
      _event,
      genSettings: DiscordWrapper.GeneralSettings,
      servSettings: DiscordWrapper.ServerSettings,
      initialDetails?: string
    ) => {
      try {
        DiscordWrapper.initRPC(genSettings, servSettings, initialDetails)
        return { success: true }
      } catch (error) {
        console.error('Error iniciando Discord RPC:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al iniciar RPC'
        }
      }
    }
  )

  ipcMain.handle(DISCORD_RPC.UPDATE_DETAILS, async (_event, details: string) => {
    try {
      DiscordWrapper.updateDetails(details)
      return { success: true }
    } catch (error) {
      console.error('Error actualizando detalles RPC:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar RPC'
      }
    }
  })

  ipcMain.handle(DISCORD_RPC.SHUTDOWN, async () => {
    try {
      DiscordWrapper.shutdownRPC()
      return { success: true }
    } catch (error) {
      console.error('Error cerrando Discord RPC:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al cerrar RPC'
      }
    }
  })
}

function setupLanguageHandlers(): void {
  // Obtener traducción con pluralización
  ipcMain.on(
    'language-plural',
    (
      event,
      key: string,
      options: { count: number; zero?: string; one?: string; other?: string }
    ) => {
      try {
        const translation = languageManager.plural(key, options)
        event.returnValue = translation
      } catch (error) {
        console.error('Error getting plural translation:', error)
        event.returnValue = key
      }
    }
  )

  // Formatear fecha
  ipcMain.on('language-format-date', (event, dateString: string, format: 'short' | 'long') => {
    try {
      const date = new Date(dateString)
      const formatted = languageManager.formatDate(date, format)
      event.returnValue = formatted
    } catch (error) {
      console.error('Error formatting date:', error)
      event.returnValue = dateString
    }
  })

  // Formatear número
  ipcMain.on('language-format-number', (event, num: number) => {
    try {
      const formatted = languageManager.formatNumber(num)
      event.returnValue = formatted
    } catch (error) {
      console.error('Error formatting number:', error)
      event.returnValue = num.toString()
    }
  })

  // Cambiar idioma
  ipcMain.on('language-change', (_event, lang: string) => {
    try {
      languageManager.setLanguage(lang)
      // Notificar a todos los renderers sobre el cambio
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('language-changed', lang)
      })
      console.log('[+] Idioma cambiado a:', lang)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  })

  // Obtener idioma actual
  ipcMain.on('language-get-current', (event) => {
    try {
      const currentLang = languageManager.getCurrentLanguage()
      event.returnValue = currentLang
    } catch (error) {
      console.error('Error getting current language:', error)
      event.returnValue = 'es'
    }
  })
}
