import { BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import {
  CONFIG_OPCODE,
  DISCORD_RPC,
  DISTRIBUTION,
  DROPIN_MOD_OPCODE,
  SHELL_OPCODE
} from './constants/ipc'
import * as ConfigManager from './services/configManager'
import * as DiscordWrapper from './services/discordwrapper'
import * as DropinModUtil from './services/dropinModUtil'
import { languageManager } from './utils/language'
import setupDistributionHandlers from './handlers/setup-distribution-manager'
import setupProcessBuilderHandlers from './handlers/setup-process-builder'
import setupServerStatusHandlers from './handlers/setup-server-status'
import setupAuthHandlers from './handlers/setup-auth'

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

function setupConfigHandlers(): void {
  // Obtener directorios
  ipcMain.handle(CONFIG_OPCODE.GET_LAUNCHER_DIRECTORY, async () => {
    try {
      return { success: true, directory: ConfigManager.getLauncherDirectory() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo directorio launcher'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_DATA_DIRECTORY, async (_event, def = false) => {
    try {
      return { success: true, directory: ConfigManager.getDataDirectory(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo directorio de datos'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_DATA_DIRECTORY, async (_event, dataDirectory: string) => {
    try {
      ConfigManager.setDataDirectory(dataDirectory)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo directorio de datos'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_COMMON_DIRECTORY, async () => {
    try {
      return { success: true, directory: ConfigManager.getCommonDirectory() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo directorio común'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_INSTANCE_DIRECTORY, async () => {
    try {
      return { success: true, directory: ConfigManager.getInstanceDirectory() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo directorio instancias'
      }
    }
  })

  // Operaciones de configuración
  ipcMain.handle(CONFIG_OPCODE.SAVE, async () => {
    try {
      ConfigManager.save()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error guardando configuración'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.LOAD, async () => {
    try {
      ConfigManager.load()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error cargando configuración'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.IS_FIRST_LAUNCH, async () => {
    try {
      return { success: true, isFirstLaunch: ConfigManager.isFirstLaunch() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error verificando primer lanzamiento'
      }
    }
  })

  // Configuraciones del juego
  ipcMain.handle(CONFIG_OPCODE.GET_GAME_WIDTH, async (_event, def = false) => {
    try {
      return { success: true, width: ConfigManager.getGameWidth(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo ancho del juego'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_GAME_WIDTH, async (_event, width: number) => {
    try {
      ConfigManager.setGameWidth(width)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo ancho del juego'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_GAME_HEIGHT, async (_event, def = false) => {
    try {
      return { success: true, height: ConfigManager.getGameHeight(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo altura del juego'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_GAME_HEIGHT, async (_event, height: number) => {
    try {
      ConfigManager.setGameHeight(height)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo altura del juego'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_FULLSCREEN, async (_event, def = false) => {
    try {
      return { success: true, fullscreen: ConfigManager.getFullscreen(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo modo pantalla completa'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_FULLSCREEN, async (_event, fullscreen: boolean) => {
    try {
      ConfigManager.setFullscreen(fullscreen)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo pantalla completa'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_AUTO_CONNECT, async (_event, def = false) => {
    try {
      return { success: true, autoConnect: ConfigManager.getAutoConnect(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo autoconexión'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_AUTO_CONNECT, async (_event, autoConnect: boolean) => {
    try {
      ConfigManager.setAutoConnect(autoConnect)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo autoconexión'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_LAUNCH_DETACHED, async (_event, def = false) => {
    try {
      return { success: true, launchDetached: ConfigManager.getLaunchDetached(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo lanzamiento independiente'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_LAUNCH_DETACHED, async (_event, launchDetached: boolean) => {
    try {
      ConfigManager.setLaunchDetached(launchDetached)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error estableciendo lanzamiento independiente'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_ALLOW_PRERELEASE, async (_event, def = false) => {
    try {
      return { success: true, allowPrerelease: ConfigManager.getAllowPrerelease(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo prerelease'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_ALLOW_PRERELEASE, async (_event, allowPrerelease: boolean) => {
    try {
      ConfigManager.setAllowPrerelease(allowPrerelease)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo prerelease'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_SYNC_LANGUAGE, async (_event, def = false) => {
    try {
      return { success: true, syncLanguage: ConfigManager.getSyncLanguage(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo sincronización idioma'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_SYNC_LANGUAGE, async (_event, syncLanguage: boolean) => {
    try {
      ConfigManager.setSyncLanguage(syncLanguage)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo sincronización idioma'
      }
    }
  })

  // Servidor seleccionado
  ipcMain.handle(CONFIG_OPCODE.GET_SELECTED_SERVER, async (_event, def = false) => {
    try {
      return { success: true, selectedServer: ConfigManager.getSelectedServer(def) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo servidor seleccionado'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_SELECTED_SERVER, async (_event, serverId: string) => {
    try {
      ConfigManager.setSelectedServer(serverId)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo servidor seleccionado'
      }
    }
  })

  // Configuración de Java
  ipcMain.handle(CONFIG_OPCODE.GET_MIN_RAM, async (_event, serverId: string) => {
    try {
      return { success: true, minRAM: ConfigManager.getMinRAM(serverId) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM mínima'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_MIN_RAM, async (_event, serverId: string, minRAM: string) => {
    try {
      ConfigManager.setMinRAM(serverId, minRAM)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo RAM mínima'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_MAX_RAM, async (_event, serverId: string) => {
    try {
      return { success: true, maxRAM: ConfigManager.getMaxRAM(serverId) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM máxima'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_MAX_RAM, async (_event, serverId: string, maxRAM: string) => {
    try {
      ConfigManager.setMaxRAM(serverId, maxRAM)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo RAM máxima'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_JAVA_EXECUTABLE, async (_event, serverId: string) => {
    try {
      return { success: true, javaExecutable: ConfigManager.getJavaExecutable(serverId) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo ejecutable Java'
      }
    }
  })

  ipcMain.handle(
    CONFIG_OPCODE.SET_JAVA_EXECUTABLE,
    async (_event, serverId: string, executable: string) => {
      try {
        ConfigManager.setJavaExecutable(serverId, executable)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error estableciendo ejecutable Java'
        }
      }
    }
  )

  ipcMain.handle(CONFIG_OPCODE.GET_JVM_OPTIONS, async (_event, serverId: string) => {
    try {
      return { success: true, jvmOptions: ConfigManager.getJVMOptions(serverId) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo opciones JVM'
      }
    }
  })

  ipcMain.handle(
    CONFIG_OPCODE.SET_JVM_OPTIONS,
    async (_event, serverId: string, jvmOptions: string[]) => {
      try {
        ConfigManager.setJVMOptions(serverId, jvmOptions)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error estableciendo opciones JVM'
        }
      }
    }
  )

  ipcMain.handle(
    CONFIG_OPCODE.ENSURE_JAVA_CONFIG,
    async (_event, serverId: string, effectiveJavaOptions: any, ram?: any) => {
      try {
        ConfigManager.ensureJavaConfig(serverId, effectiveJavaOptions, ram)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error asegurando configuración Java'
        }
      }
    }
  )

  ipcMain.handle(CONFIG_OPCODE.GET_ABSOLUTE_MIN_RAM, async (_event, ram?: any) => {
    try {
      return { success: true, absoluteMinRAM: ConfigManager.getAbsoluteMinRAM(ram) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM mínima absoluta'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_ABSOLUTE_MAX_RAM, async () => {
    try {
      return { success: true, absoluteMaxRAM: ConfigManager.getAbsoluteMaxRAM() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM máxima absoluta'
      }
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
