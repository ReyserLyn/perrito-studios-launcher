import { BrowserWindow, ipcMain, shell } from 'electron'
import { DISTRIBUTION, SHELL_OPCODE } from './constants/ipc'
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
  // Verificar estado de autenticación
  ipcMain.handle('auth:check-status', async () => {
    try {
      // Aquí podrías verificar si hay tokens guardados, sesión activa, etc.
      return { user: null }
    } catch (error) {
      console.error('Error checking auth status:', error)
      return { user: null }
    }
  })

  // Login con Microsoft
  ipcMain.handle('auth:microsoft-login', async () => {
    try {
      console.log('[+] Iniciando autenticación Microsoft...')

      // Por ahora simulamos una autenticación exitosa
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const user = {
        id: 'microsoft_' + Date.now(),
        username: 'Usuario Microsoft',
        email: 'usuario@microsoft.com',
        provider: 'microsoft' as const
      }

      console.log('[+] Autenticación Microsoft exitosa')
      return {
        success: true,
        user
      }
    } catch (error) {
      console.error('Error Microsoft auth:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en la autenticación'
      }
    }
  })

  // Logout
  ipcMain.handle('auth:logout', async () => {
    try {
      console.log('[+] Cerrando sesión...')
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
