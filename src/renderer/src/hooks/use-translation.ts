import type { TranslationKey, TranslationParams } from '@/types/translation-keys'
import { useEffect, useState } from 'react'

interface PluralOptions {
  count: number
  zero?: string
  one?: string
  other?: string
}

interface TranslationHook {
  t: (key: TranslationKey, placeholders?: TranslationParams) => string
  plural: (key: TranslationKey, options: PluralOptions) => string
  formatDate: (date: Date, format?: 'short' | 'long') => string
  formatNumber: (num: number) => string
  currentLanguage: string
  changeLanguage: (lang: string) => void
  isReady: boolean
}

export function useTranslation(): TranslationHook {
  const [currentLanguage, setCurrentLanguage] = useState<string>('')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Obtener el idioma desde la configuración
        const configResponse = await window.api.config.getCurrentLanguage()
        if (configResponse.success && configResponse.language) {
          const newLanguage = configResponse.language
          setCurrentLanguage(newLanguage)

          // Solo cambiar idioma si es diferente al actual
          const currentLang = window.api.language.getCurrent()
          if (currentLang !== newLanguage) {
            window.api.language.change(newLanguage)
          }
        } else {
          const currentLang = window.api.language.getCurrent()
          setCurrentLanguage(currentLang)
        }
        setIsReady(true)
      } catch (error) {
        console.error('Error inicializando idioma:', error)
        setCurrentLanguage('es_ES')
        setIsReady(true)
      }
    }

    initializeLanguage()

    // Suscribirse a cambios de idioma
    window.api.language.onLanguageChanged((lang: string) => {
      setCurrentLanguage(lang)
    })

    return () => {
      window.api.language.removeLanguageListener()
    }
  }, [])

  const changeLanguage = async (lang: string) => {
    try {
      window.api.language.change(lang)
      const response = await window.api.config.setLanguage(lang)
      if (!response.success) {
        throw new Error(response.error || 'Error guardando idioma en configuración')
      }
      await window.api.config.save()
    } catch (error) {
      console.error('Error cambiando idioma:', error)
    }
  }

  const t = (key: TranslationKey, placeholders?: TranslationParams) => {
    return window.api.language.query(key, placeholders)
  }

  const plural = (
    key: TranslationKey,
    options: { count: number; zero?: string; one?: string; other?: string }
  ) => {
    return window.api.language.plural(key, options)
  }

  const formatDate = (date: Date, format: 'short' | 'long' = 'short') => {
    return window.api.language.formatDate(date.toISOString(), format)
  }

  const formatNumber = (num: number) => {
    return window.api.language.formatNumber(num)
  }

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
