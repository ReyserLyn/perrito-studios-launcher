import { ipcMain } from 'electron'
import { CONFIG_OPCODE } from '../constants/ipc'
import * as ConfigManager from '../services/configManager'

export default function setupConfigHandlers(): void {
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
      return { success: true, detached: ConfigManager.getLaunchDetached(def) }
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

  // ===== SYNC LANGUAGE =====
  ipcMain.handle(CONFIG_OPCODE.GET_SYNC_LANGUAGE, async (_event, def = false) => {
    try {
      const syncLanguage = ConfigManager.getSyncLanguage(def)
      return {
        success: true,
        syncLanguage
      }
    } catch (error) {
      console.error('Error obteniendo sincronización de idioma:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo sincronización de idioma'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_SYNC_LANGUAGE, async (_event, syncLanguage: boolean) => {
    try {
      ConfigManager.setSyncLanguage(syncLanguage)
      return { success: true }
    } catch (error) {
      console.error('Error estableciendo sincronización de idioma:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Error estableciendo sincronización de idioma'
      }
    }
  })

  // ===== LANGUAGE =====
  ipcMain.handle(CONFIG_OPCODE.GET_CURRENT_LANGUAGE, async (_event, def = false) => {
    try {
      const language = ConfigManager.getCurrentLanguage(def)
      return {
        success: true,
        language
      }
    } catch (error) {
      console.error('Error obteniendo idioma actual:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo idioma actual'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.SET_LANGUAGE, async (_event, language: string) => {
    try {
      ConfigManager.setLanguage(language)
      return { success: true }
    } catch (error) {
      console.error('Error estableciendo idioma:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error estableciendo idioma'
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
      return { success: true, minRAM: ConfigManager.getAbsoluteMinRAM(ram) }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM mínima absoluta'
      }
    }
  })

  ipcMain.handle(CONFIG_OPCODE.GET_ABSOLUTE_MAX_RAM, async () => {
    try {
      return { success: true, maxRAM: ConfigManager.getAbsoluteMaxRAM() }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo RAM máxima absoluta'
      }
    }
  })
}
