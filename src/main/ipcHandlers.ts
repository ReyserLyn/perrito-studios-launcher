import { BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import { DISCORD_RPC, DISTRIBUTION, DROPIN_MOD_OPCODE, SHELL_OPCODE } from './constants/ipc'
import setupAuthHandlers from './handlers/setup-auth'
import setupConfigHandlers from './handlers/setup-config-manager'
import setupDistributionHandlers from './handlers/setup-distribution-manager'
import setupProcessBuilderHandlers from './handlers/setup-process-builder'
import setupServerStatusHandlers from './handlers/setup-server-status'
import * as DiscordWrapper from './services/discordwrapper'
import * as DropinModUtil from './services/dropinModUtil'
import { languageManager } from './utils/language'

// Variable global para manejar el proceso del juego (removida - no se usa)

export function setupIpcHandlers(): void {
  // Manejar distribución de índices
  ipcMain.on(DISTRIBUTION.INDEX_DONE, (event, res) => {
    event.sender.send(DISTRIBUTION.INDEX_DONE, res)
  })

  // Manejar eliminación de archivos a la papelera
  ipcMain.handle(SHELL_OPCODE.TRASH_ITEM, async (_event, filePath: string) => {
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
  })

  // === HANDLERS DEL SISTEMA DE IDIOMAS ===
  setupLanguageHandlers()

  // === HANDLERS DE AUTENTICACIÓN ===
  setupAuthHandlers()

  // === HANDLERS DE CONFIGURACIÓN ===
  setupConfigHandlers()

  // === HANDLERS DE DISTRIBUCIÓN ===
  setupDistributionHandlers()

  // === HANDLERS DE PROCESS BUILDER ===
  setupProcessBuilderHandlers()

  // === HANDLERS DE MODS DROP-IN & SHADERPACKS ===
  setupDropinModHandlers()

  // === HANDLERS DE DISCORD RPC ===
  setupDiscordRpcHandlers()

  // === HANDLERS DE SERVER STATUS ===
  setupServerStatusHandlers()
}

function setupLanguageHandlers(): void {
  // Obtener traducción
  ipcMain.on(
    'language-query',
    (event, key: string, placeholders?: Record<string, string | number>) => {
      try {
        const translation = languageManager.query(key, placeholders)
        event.returnValue = translation
      } catch (error) {
        console.error('Error getting translation:', error)
        event.returnValue = key
      }
    }
  )

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

function setupDropinModHandlers(): void {
  type FileItem = { name: string; path: string }

  // Escanear mods
  ipcMain.handle(DROPIN_MOD_OPCODE.SCAN_MODS, async (_event, modsDir: string, version: string) => {
    try {
      const mods = DropinModUtil.scanForDropinMods(modsDir, version)
      return { success: true, mods }
    } catch (error) {
      console.error('Error escaneando mods:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al escanear mods'
      }
    }
  })

  // Añadir mods
  ipcMain.handle(DROPIN_MOD_OPCODE.ADD_MODS, async (_event, files: FileItem[], modsDir: string) => {
    try {
      DropinModUtil.addDropinMods(files, modsDir)
      return { success: true }
    } catch (error) {
      console.error('Error añadiendo mods:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al añadir mods'
      }
    }
  })

  // Eliminar mod
  ipcMain.handle(
    DROPIN_MOD_OPCODE.DELETE_MOD,
    async (_event, modsDir: string, fullName: string) => {
      try {
        const modPath = path.join(modsDir, fullName)
        await shell.trashItem(modPath)
        return { success: true }
      } catch (error) {
        console.error('Error eliminando mod:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al eliminar mod'
        }
      }
    }
  )

  // Activar / desactivar mod
  ipcMain.handle(
    DROPIN_MOD_OPCODE.TOGGLE_MOD,
    async (_event, modsDir: string, fullName: string, enable: boolean) => {
      try {
        await DropinModUtil.toggleDropinMod(modsDir, fullName, enable)
        return { success: true }
      } catch (error) {
        console.error('Error toggling mod:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al cambiar mod'
        }
      }
    }
  )

  // Escanear shaderpacks
  ipcMain.handle(DROPIN_MOD_OPCODE.SCAN_SHADERPACKS, async (_event, instanceDir: string) => {
    try {
      const packs = DropinModUtil.scanForShaderpacks(instanceDir)
      return { success: true, packs }
    } catch (error) {
      console.error('Error escaneando shaderpacks:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al escanear shaderpacks'
      }
    }
  })

  // Obtener shaderpack habilitado
  ipcMain.handle(DROPIN_MOD_OPCODE.GET_ENABLED_SHADERPACK, async (_event, instanceDir: string) => {
    try {
      const pack = DropinModUtil.getEnabledShaderpack(instanceDir)
      return { success: true, pack }
    } catch (error) {
      console.error('Error obteniendo shaderpack activo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener shaderpack'
      }
    }
  })

  // Establecer shaderpack habilitado
  ipcMain.handle(
    DROPIN_MOD_OPCODE.SET_ENABLED_SHADERPACK,
    async (_event, instanceDir: string, pack: string) => {
      try {
        DropinModUtil.setEnabledShaderpack(instanceDir, pack)
        return { success: true }
      } catch (error) {
        console.error('Error estableciendo shaderpack:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error desconocido al establecer shaderpack'
        }
      }
    }
  )

  // Añadir shaderpacks
  ipcMain.handle(
    DROPIN_MOD_OPCODE.ADD_SHADERPACKS,
    async (_event, files: FileItem[], instanceDir: string) => {
      try {
        DropinModUtil.addShaderpacks(files, instanceDir)
        return { success: true }
      } catch (error) {
        console.error('Error añadiendo shaderpacks:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al añadir shaderpacks'
        }
      }
    }
  )

  // Obtener estadísticas de mods
  ipcMain.handle(
    DROPIN_MOD_OPCODE.GET_MOD_STATS,
    async (_event, modsDir: string, version: string) => {
      try {
        const stats = DropinModUtil.getModStats(modsDir, version)
        return { success: true, stats }
      } catch (error) {
        console.error('Error obteniendo estadísticas de mods:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error desconocido al obtener estadísticas'
        }
      }
    }
  )
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
