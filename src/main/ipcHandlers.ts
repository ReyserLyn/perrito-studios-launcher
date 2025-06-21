import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import { validateLocalFile } from 'perrito-core/common'
import {
  DistributionIndexProcessor,
  downloadFile,
  FullRepair,
  MojangIndexProcessor
} from 'perrito-core/dl'
import {
  discoverBestJvmInstallation,
  ensureJavaDirIsRoot,
  extractJdk,
  javaExecFromRoot,
  latestOpenJDK,
  validateSelectedJvm
} from 'perrito-core/java'
import { getServerStatus } from 'perrito-core/mojang'
import {
  CONFIG_OPCODE,
  DISCORD_RPC,
  DISTRIBUTION,
  DISTRIBUTION_OPCODE,
  DROPIN_MOD_OPCODE,
  PROCESS_BUILDER_OPCODE,
  SHELL_OPCODE
} from './constants/ipc'
import * as AuthManager from './services/authManager'
import * as ConfigManager from './services/configManager'
import * as DiscordWrapper from './services/discordwrapper'
import { DistroAPI } from './services/distributionManager'
import * as DropinModUtil from './services/dropinModUtil'
import { ProcessBuilder } from './services/processBuilder'
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

  // Mostrar toast (notificaciones)
  ipcMain.on('show-toast', (_event, { type, message }) => {
    console.log(`[TOAST ${type.toUpperCase()}]:`, message)
  })

  // IPC test (mantener para compatibilidad)
  ipcMain.on('ping', () => console.log('pong'))
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

function setupAuthHandlers(): void {
  // === HANDLERS DE CUENTAS MOJANG ===

  // Añadir cuenta Mojang
  ipcMain.handle('auth:add-mojang-account', async (_event, username: string) => {
    try {
      console.log(`[IPC Handler] Recibida solicitud para añadir cuenta Mojang: ${username}`)
      const account = await AuthManager.addAccount(username)
      console.log(`[IPC Handler] Cuenta añadida exitosamente:`, account)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error añadiendo cuenta Mojang:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error añadiendo cuenta Mojang'
      }
    }
  })

  // Remover cuenta Mojang
  ipcMain.handle('auth:remove-mojang-account', async (_event, uuid: string) => {
    try {
      console.log(`[+] Removiendo cuenta Mojang: ${uuid}`)
      await AuthManager.removeMojangAccount(uuid)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removiendo cuenta Mojang:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error removiendo cuenta Mojang'
      }
    }
  })

  // === HANDLERS DE CUENTAS MICROSOFT ===

  // Añadir cuenta Microsoft
  ipcMain.handle('auth:add-microsoft-account', async (_event, authCode: string) => {
    try {
      console.log('[+] Añadiendo cuenta Microsoft...')
      const account = await AuthManager.addMicrosoftAccount(authCode)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error añadiendo cuenta Microsoft:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error añadiendo cuenta Microsoft'
      }
    }
  })

  // Remover cuenta Microsoft
  ipcMain.handle('auth:remove-microsoft-account', async (_event, uuid: string) => {
    try {
      console.log(`[+] Removiendo cuenta Microsoft: ${uuid}`)
      await AuthManager.removeMicrosoftAccount(uuid)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removiendo cuenta Microsoft:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error removiendo cuenta Microsoft'
      }
    }
  })

  // === HANDLERS DE GESTIÓN DE CUENTAS ===

  // Obtener cuenta seleccionada
  ipcMain.handle('auth:get-selected-account', async () => {
    try {
      const account = AuthManager.getSelectedAccount()
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error obteniendo cuenta seleccionada:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo cuenta seleccionada'
      }
    }
  })

  // Obtener todas las cuentas
  ipcMain.handle('auth:get-all-accounts', async () => {
    try {
      const accounts = AuthManager.getAuthAccounts()
      return {
        success: true,
        accounts
      }
    } catch (error) {
      console.error('Error obteniendo cuentas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo cuentas'
      }
    }
  })

  // Seleccionar cuenta
  ipcMain.handle('auth:select-account', async (_event, uuid: string) => {
    try {
      console.log(`[+] Seleccionando cuenta: ${uuid}`)
      const account = AuthManager.setSelectedAccount(uuid)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error seleccionando cuenta:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error seleccionando cuenta'
      }
    }
  })

  // Validar cuenta seleccionada
  ipcMain.handle('auth:validate-selected', async () => {
    try {
      console.log('[+] Validando cuenta seleccionada...')
      const isValid = await AuthManager.validateSelected()
      return {
        success: true,
        isValid
      }
    } catch (error) {
      console.error('Error validando cuenta:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando cuenta'
      }
    }
  })

  // === HANDLERS DE COMPATIBILIDAD ===

  // Verificar estado de autenticación
  ipcMain.handle('auth:check-status', async () => {
    try {
      const account = AuthManager.getSelectedAccount()
      return {
        success: true,
        user: account
          ? {
              id: account.uuid,
              username: account.displayName,
              email: account.username,
              provider: account.type || 'mojang'
            }
          : null
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : 'Error verificando estado'
      }
    }
  })

  // Login con Microsoft
  ipcMain.handle('auth:microsoft-login', async (_event, authCode?: string) => {
    try {
      console.log('[+] Iniciando autenticación Microsoft...')

      // Si no se proporciona authCode, usar uno por defecto para testing
      const code = authCode || 'default_auth_code'
      const account = await AuthManager.addMicrosoftAccount(code)

      return {
        success: true,
        user: {
          id: account.uuid,
          username: account.displayName,
          email: account.username,
          provider: 'microsoft'
        }
      }
    } catch (error) {
      console.error('Error Microsoft auth:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en la autenticación con Microsoft'
      }
    }
  })

  // Logout
  ipcMain.handle('auth:logout', async () => {
    try {
      console.log('[+] Cerrando sesión...')
      const account = AuthManager.getSelectedAccount()

      if (account) {
        if (account.type === 'microsoft') {
          await AuthManager.removeMicrosoftAccount(account.uuid)
        } else {
          await AuthManager.removeMojangAccount(account.uuid)
        }
      }

      console.log('[+] Sesión cerrada exitosamente')
      return { success: true }
    } catch (error) {
      console.error('Error logout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      }
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

function setupDistributionHandlers(): void {
  // Obtener distribución
  ipcMain.handle(DISTRIBUTION_OPCODE.GET_DISTRIBUTION, async () => {
    try {
      const distribution = await DistroAPI.getDistribution()
      return {
        success: true,
        distribution
      }
    } catch (error) {
      console.error('Error obteniendo distribución:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo distribución'
      }
    }
  })

  // Refrescar distribución
  ipcMain.handle(DISTRIBUTION_OPCODE.REFRESH_DISTRIBUTION, async () => {
    try {
      const distribution = await DistroAPI.refreshDistributionOrFallback()
      return {
        success: true,
        distribution
      }
    } catch (error) {
      console.error('Error refrescando distribución:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error refrescando distribución'
      }
    }
  })

  // Obtener servidor por ID
  ipcMain.handle(DISTRIBUTION_OPCODE.GET_SERVER_BY_ID, async (_event, serverId: string) => {
    try {
      const distribution = await DistroAPI.getDistribution()
      if (distribution) {
        const server = (distribution as any).getServerById(serverId)
        return {
          success: true,
          server
        }
      }
      return {
        success: false,
        error: 'Distribución no disponible'
      }
    } catch (error) {
      console.error('Error obteniendo servidor:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo servidor'
      }
    }
  })
}

function setupProcessBuilderHandlers(): void {
  // Helper para emitir eventos de progreso
  const emitProgress = (stage: string, progress: number, details?: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:progress', stage, progress, details)
    })
  }

  const emitError = (error: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:error', error)
    })
  }

  const emitSuccess = () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:success')
    })
  }

  const emitLog = (type: 'stdout' | 'stderr', data: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:log', type, data)
    })
  }

  // Validación inicial del lanzamiento
  ipcMain.handle(PROCESS_BUILDER_OPCODE.VALIDATE_LAUNCH, async () => {
    try {
      const selectedAccount = ConfigManager.getSelectedAccount()
      const selectedServer = ConfigManager.getSelectedServer()

      if (!selectedAccount) {
        throw new Error('No hay cuenta seleccionada')
      }

      if (!selectedServer) {
        throw new Error('No hay servidor seleccionado')
      }

      const distro = await DistroAPI.getDistribution()
      const server = distro.getServerById(selectedServer)

      if (!server) {
        throw new Error('Servidor no encontrado en la distribución')
      }

      return { success: true, server, account: selectedAccount }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Escaneo del sistema (Java)
  ipcMain.handle(PROCESS_BUILDER_OPCODE.SYSTEM_SCAN, async (_event, serverId: string) => {
    try {
      emitProgress('java-scan', 0, 'Verificando instalación de Java...')

      const distro = await DistroAPI.getDistribution()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error('Servidor no encontrado')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      const jExe = ConfigManager.getJavaExecutable(serverId)

      if (jExe) {
        emitProgress('java-scan', 50, 'Validando Java existente...')
        const details = await validateSelectedJvm(
          ensureJavaDirIsRoot(jExe),
          server.effectiveJavaOptions.supported
        )

        if (details) {
          emitProgress('java-scan', 100, 'Java válido encontrado')
          return { success: true, javaPath: jExe, needsDownload: false }
        }
      }

      emitProgress('java-scan', 75, 'Buscando instalaciones de Java...')
      const jvmDetails = await discoverBestJvmInstallation(
        ConfigManager.getDataDirectory(),
        server.effectiveJavaOptions.supported
      )

      if (jvmDetails) {
        const javaExec = javaExecFromRoot(jvmDetails.path)
        ConfigManager.setJavaExecutable(serverId, javaExec)
        ConfigManager.save()

        emitProgress('java-scan', 100, 'Java encontrado y configurado')
        return { success: true, javaPath: javaExec, needsDownload: false }
      }

      emitProgress('java-scan', 100, 'Java no encontrado, descarga requerida')
      return {
        success: true,
        needsDownload: true,
        suggestedMajor: server.effectiveJavaOptions.suggestedMajor
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error en escaneo de Java')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Descarga de Java
  ipcMain.handle(PROCESS_BUILDER_OPCODE.DOWNLOAD_JAVA, async (_event, serverId: string) => {
    try {
      // Usar imports ya definidos al inicio del archivo

      emitProgress('java-download', 0, 'Preparando descarga de Java...')

      const distro = await DistroAPI.getDistribution()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error('Servidor no encontrado')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      const asset = await latestOpenJDK(
        server.effectiveJavaOptions.suggestedMajor,
        ConfigManager.getDataDirectory(),
        server.effectiveJavaOptions.distribution
      )

      if (!asset) {
        throw new Error('No se pudo encontrar una versión de Java compatible')
      }

      emitProgress(
        'java-download',
        10,
        `Descargando Java ${server.effectiveJavaOptions.suggestedMajor}...`
      )

      let received = 0
      await downloadFile(asset.url, asset.path, ({ transferred }) => {
        received = transferred
        const progress = Math.trunc((transferred / asset.size) * 80) + 10 // 10-90%
        emitProgress(
          'java-download',
          progress,
          `Descargando Java... ${Math.trunc((transferred / asset.size) * 100)}%`
        )
      })

      if (received !== asset.size) {
        if (!(await validateLocalFile(asset.path, asset.algo, asset.hash))) {
          throw new Error('El archivo de Java descargado está corrupto')
        }
      }

      emitProgress('java-download', 90, 'Extrayendo Java...')
      const newJavaExec = await extractJdk(asset.path)

      ConfigManager.setJavaExecutable(serverId, newJavaExec)
      ConfigManager.save()

      emitProgress('java-download', 100, 'Java instalado exitosamente')
      return { success: true, javaPath: newJavaExec }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error descargando Java')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Validación de archivos
  ipcMain.handle(PROCESS_BUILDER_OPCODE.VALIDATE_FILES, async (_event, serverId: string) => {
    try {
      emitProgress('file-validation', 0, 'Iniciando validación de archivos...')

      // Refrescar distribución para asegurar que tenemos la información más actualizada
      console.log(`[FullRepair] Refrescando distribución...`)
      const distro = await DistroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error(`Servidor ${serverId} no encontrado en la distribución`)
      }

      console.log(`[FullRepair] Iniciando validación para servidor: ${serverId}`)
      console.log(`[FullRepair] Versión de Minecraft: ${server.rawServer.minecraftVersion}`)
      console.log(`[FullRepair] Common directory: ${ConfigManager.getCommonDirectory()}`)
      console.log(`[FullRepair] Instance directory: ${ConfigManager.getInstanceDirectory()}`)
      console.log(`[FullRepair] Launcher directory: ${ConfigManager.getLauncherDirectory()}`)
      console.log(`[FullRepair] Dev mode: ${DistroAPI.isDevMode()}`)

      const fullRepairModule = new FullRepair(
        ConfigManager.getCommonDirectory(),
        ConfigManager.getInstanceDirectory(),
        ConfigManager.getLauncherDirectory(),
        serverId,
        DistroAPI.isDevMode()
      )

      fullRepairModule.spawnReceiver()

      // Configurar listeners para obtener más información
      fullRepairModule.childProcess.on('error', (err) => {
        console.error('[FullRepair] Error en proceso hijo durante validación:', err)
      })

      fullRepairModule.childProcess.on('close', (code, signal) => {
        console.log(
          `[FullRepair] Proceso hijo de validación cerrado con código: ${code}, señal: ${signal}`
        )
        if (code !== 0) {
          console.error(
            `[FullRepair] Proceso hijo de validación terminó con código de error: ${code}`
          )
        }
      })

      // Configurar listener para stdout/stderr del proceso hijo
      if (fullRepairModule.childProcess.stdout) {
        fullRepairModule.childProcess.stdout.on('data', (data) => {
          console.log(`[FullRepair] validación stdout: ${data.toString().trim()}`)
        })
      }

      if (fullRepairModule.childProcess.stderr) {
        fullRepairModule.childProcess.stderr.on('data', (data) => {
          console.error(`[FullRepair] validación stderr: ${data.toString().trim()}`)
        })
      }

      console.log('[FullRepair] Iniciando validación...')
      const invalidFileCount = await fullRepairModule.verifyFiles((percent: number) => {
        console.log(`[FullRepair] Progreso de validación: ${percent}%`)
        emitProgress('file-validation', percent, 'Validando integridad de archivos...')
      })
      console.log('[FullRepair] Validación terminada')

      fullRepairModule.destroyReceiver()

      console.log(`[FullRepair] Validación completada. Archivos inválidos: ${invalidFileCount}`)

      emitProgress(
        'file-validation',
        100,
        `Validación completada. ${invalidFileCount} archivos necesitan descarga`
      )
      return { success: true, invalidFileCount }
    } catch (error) {
      console.error('[FullRepair] Error en validación:', error)
      emitError(error instanceof Error ? error.message : 'Error validando archivos')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Descarga de archivos
  ipcMain.handle(PROCESS_BUILDER_OPCODE.DOWNLOAD_FILES, async (_event, serverId: string) => {
    try {
      emitProgress('file-download', 0, 'Iniciando descarga de archivos...')

      // Refrescar distribución para asegurar que tenemos la información más actualizada
      console.log(`[FullRepair] Refrescando distribución para descarga...`)
      const distro = await DistroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error(`Servidor ${serverId} no encontrado en la distribución`)
      }

      console.log(`[FullRepair] Iniciando descarga para servidor: ${serverId}`)
      console.log(`[FullRepair] Versión de Minecraft: ${server.rawServer.minecraftVersion}`)

      const fullRepairModule = new FullRepair(
        ConfigManager.getCommonDirectory(),
        ConfigManager.getInstanceDirectory(),
        ConfigManager.getLauncherDirectory(),
        serverId,
        DistroAPI.isDevMode()
      )

      fullRepairModule.spawnReceiver()

      // Configurar listeners para obtener más información
      fullRepairModule.childProcess.on('error', (err) => {
        console.error('[FullRepair] Error en proceso hijo durante descarga:', err)
      })

      fullRepairModule.childProcess.on('close', (code, signal) => {
        console.log(`[FullRepair] Proceso hijo cerrado con código: ${code}, señal: ${signal}`)
        if (code !== 0) {
          console.error(`[FullRepair] Proceso hijo terminó con código de error: ${code}`)
        }
      })

      // Configurar listener para stdout/stderr del proceso hijo
      if (fullRepairModule.childProcess.stdout) {
        fullRepairModule.childProcess.stdout.on('data', (data) => {
          console.log(`[FullRepair] stdout: ${data.toString().trim()}`)
        })
      }

      if (fullRepairModule.childProcess.stderr) {
        fullRepairModule.childProcess.stderr.on('data', (data) => {
          console.error(`[FullRepair] stderr: ${data.toString().trim()}`)
        })
      }

      console.log('[FullRepair] Iniciando descarga...')
      await fullRepairModule.download((percent: number) => {
        console.log(`[FullRepair] Progreso de descarga: ${percent}%`)
        emitProgress('file-download', percent, 'Descargando archivos...')
      })
      console.log('[FullRepair] Descarga terminada')

      fullRepairModule.destroyReceiver()

      console.log('[FullRepair] Descarga completada exitosamente')

      emitProgress('file-download', 100, 'Descarga de archivos completada')
      return { success: true }
    } catch (error) {
      console.error('[FullRepair] Error en descarga:', error)
      emitError(error instanceof Error ? error.message : 'Error descargando archivos')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Handler combinado de validación y descarga (como en el código original)
  ipcMain.handle(PROCESS_BUILDER_OPCODE.VALIDATE_AND_DOWNLOAD, async (_event, serverId: string) => {
    let fullRepairModule: FullRepair | null = null

    try {
      // Refrescar distribución para asegurar que tenemos la información más actualizada
      console.log(`[FullRepair] Refrescando distribución para validación y descarga...`)
      const distro = await DistroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error(`Servidor ${serverId} no encontrado en la distribución`)
      }

      console.log(`[FullRepair] Iniciando validación y descarga para servidor: ${serverId}`)
      console.log(`[FullRepair] Versión de Minecraft: ${server.rawServer.minecraftVersion}`)
      console.log(`[FullRepair] Common directory: ${ConfigManager.getCommonDirectory()}`)
      console.log(`[FullRepair] Instance directory: ${ConfigManager.getInstanceDirectory()}`)
      console.log(`[FullRepair] Launcher directory: ${ConfigManager.getLauncherDirectory()}`)
      console.log(`[FullRepair] Dev mode: ${DistroAPI.isDevMode()}`)

      // Crear UNA SOLA instancia de FullRepair (como en el código original)
      fullRepairModule = new FullRepair(
        ConfigManager.getCommonDirectory(),
        ConfigManager.getInstanceDirectory(),
        ConfigManager.getLauncherDirectory(),
        serverId,
        DistroAPI.isDevMode()
      )

      fullRepairModule.spawnReceiver()

      // Configurar listeners
      fullRepairModule.childProcess.on('error', (err) => {
        console.error('[FullRepair] Error en proceso hijo:', err)
      })

      fullRepairModule.childProcess.on('close', (code, signal) => {
        console.log(`[FullRepair] Proceso hijo cerrado con código: ${code}, señal: ${signal}`)
        if (code !== 0) {
          console.error(`[FullRepair] Proceso hijo terminó con código de error: ${code}`)
        }
      })

      if (fullRepairModule.childProcess.stdout) {
        fullRepairModule.childProcess.stdout.on('data', (data) => {
          console.log(`[FullRepair] stdout: ${data.toString().trim()}`)
        })
      }

      if (fullRepairModule.childProcess.stderr) {
        fullRepairModule.childProcess.stderr.on('data', (data) => {
          console.error(`[FullRepair] stderr: ${data.toString().trim()}`)
        })
      }

      // PASO 1: Validación de archivos
      emitProgress('file-validation', 0, 'Validando integridad de archivos...')
      console.log('[FullRepair] Iniciando validación...')

      const invalidFileCount = await fullRepairModule.verifyFiles((percent: number) => {
        console.log(`[FullRepair] Progreso de validación: ${percent}%`)
        emitProgress('file-validation', percent, 'Validando integridad de archivos...')
      })

      console.log(`[FullRepair] Validación completada. Archivos inválidos: ${invalidFileCount}`)

      // PASO 2: Descarga de archivos (si es necesario)
      if (invalidFileCount > 0) {
        emitProgress('file-download', 0, 'Descargando archivos necesarios...')
        console.log('[FullRepair] Iniciando descarga...')

        await fullRepairModule.download((percent: number) => {
          console.log(`[FullRepair] Progreso de descarga: ${percent}%`)
          emitProgress('file-download', percent, 'Descargando archivos...')
        })

        console.log('[FullRepair] Descarga completada')
      } else {
        console.log('[FullRepair] No hay archivos que descargar, omitiendo descarga')
      }

      // Destruir la instancia al final
      fullRepairModule.destroyReceiver()
      fullRepairModule = null

      emitProgress('file-download', 100, 'Validación y descarga completadas')
      return {
        success: true,
        invalidFileCount,
        downloadPerformed: invalidFileCount > 0
      }
    } catch (error) {
      console.error('[FullRepair] Error en validación y descarga:', error)

      // Limpiar en caso de error
      if (fullRepairModule) {
        try {
          fullRepairModule.destroyReceiver()
        } catch (cleanupError) {
          console.error('[FullRepair] Error limpiando FullRepair:', cleanupError)
        }
      }

      emitError(error instanceof Error ? error.message : 'Error validando y descargando archivos')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Preparación del lanzamiento
  ipcMain.handle(PROCESS_BUILDER_OPCODE.PREPARE_LAUNCH, async (_event, serverId: string) => {
    try {
      emitProgress('launch-prep', 0, 'Preparando lanzamiento...')

      const distro = await DistroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)
      const authUser = ConfigManager.getSelectedAccount()

      if (!server || !authUser) {
        throw new Error('Servidor o cuenta no encontrados')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      // Verificar que Java esté configurado
      const javaExec = ConfigManager.getJavaExecutable(serverId)
      if (!javaExec) {
        throw new Error('Java no está configurado. Ejecuta primero el escaneo del sistema.')
      }

      emitProgress('launch-prep', 25, 'Procesando manifiestos...')

      const mojangIndexProcessor = new MojangIndexProcessor(
        ConfigManager.getCommonDirectory(),
        server.rawServer.minecraftVersion
      )

      const distributionIndexProcessor = new DistributionIndexProcessor(
        ConfigManager.getCommonDirectory(),
        distro,
        server.rawServer.id
      )

      emitProgress('launch-prep', 50, 'Cargando datos de versión...')

      let modLoaderData, versionData

      try {
        ;[modLoaderData, versionData] = await Promise.all([
          distributionIndexProcessor.loadModLoaderVersionJson(),
          mojangIndexProcessor.getVersionJson()
        ])
      } catch (manifestError) {
        // Si fallan los manifiestos, significa que no se descargaron correctamente
        throw new Error(
          `Error cargando manifiestos: ${manifestError instanceof Error ? manifestError.message : 'Error desconocido'}. Asegúrate de que la validación y descarga de archivos se completó correctamente.`
        )
      }

      emitProgress('launch-prep', 100, 'Preparación completada')

      return {
        success: true,
        server,
        authUser,
        modLoaderData,
        versionData
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error preparando lanzamiento')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Lanzamiento del juego
  ipcMain.handle(PROCESS_BUILDER_OPCODE.LAUNCH_GAME, async (_event, launchData: any) => {
    try {
      emitProgress('launching', 0, 'Construyendo proceso de Minecraft...')

      const { server, authUser, modLoaderData, versionData } = launchData

      const distro = await DistroAPI.refreshDistributionOrFallback()
      const heliosServer = distro.getServerById(server.rawServer?.id || server.id)

      if (!heliosServer) {
        throw new Error(`No se pudo encontrar el servidor ${server.rawServer?.id || server.id}`)
      }

      console.log(`[ProcessBuilder] Servidor reconstruido: ${heliosServer.rawServer.id}`)
      console.log(`[ProcessBuilder] Módulos en servidor: ${heliosServer.modules.length}`)
      console.log(
        `[ProcessBuilder] Primer módulo tipo: ${heliosServer.modules[0]?.rawModule?.type}`
      )

      const pb = new ProcessBuilder({
        distroServer: heliosServer,
        vanillaManifest: versionData,
        modManifest: modLoaderData,
        authUser,
        launcherVersion: app.getVersion()
      })

      // console.log(server, versionData, modLoaderData, authUser)

      emitProgress('launching', 50, 'Iniciando Minecraft...')

      const proc = await pb.build()

      // Configurar listeners para logs
      proc.stdout?.on('data', (data: string) => {
        emitLog('stdout', data.toString())
      })

      proc.stderr?.on('data', (data: string) => {
        emitLog('stderr', data.toString())
      })

      proc.on('close', (code: number | null) => {
        if (code !== 0) {
          emitError(`Minecraft cerró con código: ${code}`)
        }
      })

      emitProgress('launching', 100, 'Minecraft iniciado exitosamente')
      emitSuccess()

      return { success: true, pid: proc.pid }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error lanzando Minecraft')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Terminar proceso
  ipcMain.handle(PROCESS_BUILDER_OPCODE.KILL_PROCESS, async () => {
    try {
      // Implementar lógica para terminar el proceso de Minecraft
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Estado del proceso
  ipcMain.handle(PROCESS_BUILDER_OPCODE.GET_PROCESS_STATUS, async () => {
    try {
      // Implementar lógica para obtener estado del proceso
      return { success: true, status: 'idle' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
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

function setupServerStatusHandlers(): void {
  // Obtener estado del servidor
  ipcMain.handle('server:get-status', async (_event, hostname: string, port: number) => {
    try {
      const servStat = await getServerStatus(47, hostname, port)

      return {
        success: true,
        status: {
          status: 'online',
          players: {
            online: servStat.players.online,
            max: servStat.players.max,
            label: `${servStat.players.online}/${servStat.players.max} jugadores conectados`
          },
          version: servStat.version?.name || 'Desconocido',
          motd: servStat.description?.text || 'Servidor en línea'
        }
      }
    } catch (error) {
      console.warn(`Unable to connect to server ${hostname}:${port}, assuming offline.`, error)

      return {
        success: true,
        status: {
          status: 'offline',
          players: {
            online: 0,
            max: 0,
            label: 'Fuera de línea'
          },
          version: 'Desconocido',
          motd: 'Servidor fuera de línea'
        }
      }
    }
  })
}
