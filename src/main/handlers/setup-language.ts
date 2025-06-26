import { BrowserWindow, ipcMain } from 'electron'
import { LANGUAGE } from '../constants/ipc'
import { languageManager } from '../utils/language'

export default function setupLanguageHandlers(): void {
  // Obtener traducción simple
  ipcMain.on(
    LANGUAGE.QUERY,
    (event, key: string, placeholders?: Record<string, string | number>) => {
      try {
        let translation = languageManager.getString(key)

        // Reemplazar placeholders si existen
        if (placeholders) {
          Object.entries(placeholders).forEach(([key, value]) => {
            translation = translation.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
          })
        }

        event.returnValue = translation
      } catch (error) {
        console.error('Error getting translation:', error)
        event.returnValue = key
      }
    }
  )

  // Obtener traducción con pluralización
  ipcMain.on(
    LANGUAGE.PLURAL,
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
  ipcMain.on(LANGUAGE.FORMAT_DATE, (event, dateString: string, format: 'short' | 'long') => {
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
  ipcMain.on(LANGUAGE.FORMAT_NUMBER, (event, num: number) => {
    try {
      const formatted = languageManager.formatNumber(num)
      event.returnValue = formatted
    } catch (error) {
      console.error('Error formatting number:', error)
      event.returnValue = num.toString()
    }
  })

  // Cambiar idioma
  ipcMain.on(LANGUAGE.CHANGE, (_event, lang: string) => {
    try {
      languageManager.setLanguage(lang)
      // Notificar a todos los renderers sobre el cambio
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send(LANGUAGE.CHANGED, lang)
      })
      console.log('[+] Idioma cambiado a:', lang)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  })

  // Obtener idioma actual
  ipcMain.on(LANGUAGE.GET_CURRENT, (event) => {
    try {
      const currentLang = languageManager.getCurrentLanguage()
      event.returnValue = currentLang
    } catch (error) {
      console.error('Error getting current language:', error)
      event.returnValue = 'es'
    }
  })
}
