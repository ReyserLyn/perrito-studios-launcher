import { app } from 'electron'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface Language {
  [key: string]: string | Language
}

interface Config {
  language?: string
  [key: string]: unknown
}

interface PluralOptions {
  count: number
  zero?: string
  one?: string
  other?: string
}

class LanguageManager {
  private currentLanguage: string = 'es'
  private translations: Language = {}
  private configPath: string

  constructor() {
    this.configPath = join(app.getPath('userData'), 'config.json')
    this.setupLanguage()
  }

  private setupLanguage(): void {
    try {
      // Cargar configuración del usuario
      if (existsSync(this.configPath)) {
        const config: Config = JSON.parse(readFileSync(this.configPath, 'utf8'))
        this.currentLanguage = config.language || 'es'
      } else {
        // Idioma por defecto basado en el sistema
        const systemLang = app.getLocale().split('-')[0]
        this.currentLanguage = ['es', 'en', 'fr'].includes(systemLang) ? systemLang : 'es'
      }

      // Cargar traducciones
      this.loadTranslations(this.currentLanguage)
    } catch (error) {
      console.warn('Error loading language configuration:', error)
      this.currentLanguage = 'es'
      this.loadDefaultTranslations()
    }
  }

  private loadTranslations(lang: string): void {
    try {
      const langPath = join(__dirname, '../../resources/lang', `${lang}.json`)
      if (existsSync(langPath)) {
        this.translations = JSON.parse(readFileSync(langPath, 'utf8'))
      } else {
        this.loadDefaultTranslations()
      }
    } catch (error) {
      console.warn(`Error loading translations for ${lang}:`, error)
      this.loadDefaultTranslations()
    }
  }

  private loadDefaultTranslations(): void {
    this.translations = {
      microsoft: {
        loginTitle: 'Iniciar Sesión con Microsoft',
        logoutTitle: 'Cerrar Sesión de Microsoft'
      },
      updater: {
        checking: 'Buscando actualizaciones...',
        available: 'Actualización disponible',
        downloading: 'Descargando actualización...',
        downloaded: 'Actualización descargada',
        notAvailable: 'No hay actualizaciones disponibles',
        error: 'Error al buscar actualizaciones'
      },
      general: {
        error: 'Error',
        success: 'Éxito',
        cancel: 'Cancelar',
        ok: 'Aceptar'
      }
    }
  }

  public query(key: string, placeholders?: Record<string, string | number>): string {
    const keys = key.split('.')
    let value: string | Language = this.translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Retorna la clave si no encuentra la traducción
      }
    }

    let result = typeof value === 'string' ? value : key

    // Reemplazar placeholders si existen
    if (placeholders) {
      for (const [placeholder, replacement] of Object.entries(placeholders)) {
        result = result.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), String(replacement))
      }
    }

    return result
  }

  // Método para pluralización básica
  public plural(key: string, options: PluralOptions): string {
    const { count, zero, one } = options

    let pluralKey: string
    if (count === 0 && zero) {
      pluralKey = `${key}.zero`
    } else if (count === 1 && one) {
      pluralKey = `${key}.one`
    } else {
      pluralKey = `${key}.other`
    }

    const translation = this.query(pluralKey, { count: count.toString() })
    return translation !== pluralKey ? translation : this.query(key, { count: count.toString() })
  }

  // Método para formateo de fechas simples
  public formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: 'long', day: 'numeric' }

    return new Intl.DateTimeFormat(this.currentLanguage, options).format(date)
  }

  // Método para formateo de números
  public formatNumber(num: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(num)
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public setLanguage(lang: string): void {
    this.currentLanguage = lang
    this.loadTranslations(lang)
  }
}

// Instancia singleton
export const languageManager = new LanguageManager()
export default languageManager
