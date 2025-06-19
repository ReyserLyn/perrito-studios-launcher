import { useCallback, useEffect, useState } from 'react'

interface PluralOptions {
  count: number
  zero?: string
  one?: string
  other?: string
}

interface TranslationHook {
  t: (key: string, placeholders?: Record<string, string | number>) => string
  plural: (key: string, options: PluralOptions) => string
  formatDate: (date: Date, format?: 'short' | 'long') => string
  formatNumber: (num: number) => string
  currentLanguage: string
  changeLanguage: (lang: string) => void
  isReady: boolean
}

export function useTranslation(): TranslationHook {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es')
  const [isReady, setIsReady] = useState<boolean>(false)

  // Función para obtener traducciones desde el main process
  const t = useCallback((key: string, placeholders?: Record<string, string | number>): string => {
    if (!window.electron?.ipcRenderer) {
      console.warn('IPC Renderer no disponible')
      return key
    }

    try {
      // Enviar solicitud síncrona al main process
      const result = window.electron.ipcRenderer.sendSync('language-query', key, placeholders)
      return result || key
    } catch (error) {
      console.warn('Error getting translation for key:', key, error)
      return key
    }
  }, [])

  // Función para pluralización
  const plural = useCallback((key: string, options: PluralOptions): string => {
    if (!window.electron?.ipcRenderer) {
      console.warn('IPC Renderer no disponible')
      return key
    }

    try {
      const result = window.electron.ipcRenderer.sendSync('language-plural', key, options)
      return result || key
    } catch (error) {
      console.warn('Error getting plural translation for key:', key, error)
      return key
    }
  }, [])

  // Función para formatear fechas
  const formatDate = useCallback((date: Date, format: 'short' | 'long' = 'short'): string => {
    if (!window.electron?.ipcRenderer) {
      return date.toLocaleDateString()
    }

    try {
      const result = window.electron.ipcRenderer.sendSync(
        'language-format-date',
        date.toISOString(),
        format
      )
      return result || date.toLocaleDateString()
    } catch (error) {
      console.warn('Error formatting date:', error)
      return date.toLocaleDateString()
    }
  }, [])

  // Función para formatear números
  const formatNumber = useCallback((num: number): string => {
    if (!window.electron?.ipcRenderer) {
      return num.toString()
    }

    try {
      const result = window.electron.ipcRenderer.sendSync('language-format-number', num)
      return result || num.toString()
    } catch (error) {
      console.warn('Error formatting number:', error)
      return num.toString()
    }
  }, [])

  // Función para cambiar idioma
  const changeLanguage = useCallback((lang: string): void => {
    if (!window.electron?.ipcRenderer) {
      console.warn('IPC Renderer no disponible')
      return
    }

    try {
      window.electron.ipcRenderer.send('language-change', lang)
      setCurrentLanguage(lang)
    } catch (error) {
      console.warn('Error changing language:', error)
    }
  }, [])

  // Obtener idioma actual al cargar
  useEffect(() => {
    if (!window.electron?.ipcRenderer) {
      setIsReady(true)
      return
    }

    try {
      const lang = window.electron.ipcRenderer.sendSync('language-get-current')
      setCurrentLanguage(lang || 'es')
      setIsReady(true)
    } catch (error) {
      console.warn('Error getting current language:', error)
      setIsReady(true)
    }
  }, [])

  // Escuchar cambios de idioma
  useEffect(() => {
    if (!window.electron?.ipcRenderer) return

    const handleLanguageChange = (_event: Electron.IpcRendererEvent, newLang: string) => {
      setCurrentLanguage(newLang)
    }

    window.electron.ipcRenderer.on('language-changed', handleLanguageChange)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('language-changed')
    }
  }, [])

  return {
    t,
    plural,
    formatDate,
    formatNumber,
    currentLanguage,
    changeLanguage,
    isReady
  }
}
