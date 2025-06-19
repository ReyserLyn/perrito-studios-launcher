import { BrowserWindow, ipcMain, shell } from 'electron'
import { DISTRIBUTION, SHELL_OPCODE } from './constants/ipc'
import * as AuthManager from './services/authManager'
import { languageManager } from './utils/language'

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
      console.log(`[+] Añadiendo cuenta Mojang: ${username}`)
      const account = await AuthManager.addAccount(username)
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
