import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { LoggerUtil } from 'perrito-core'
import * as ConfigManager from '../services/configManager'

const logger = LoggerUtil.getLogger('LanguageManager')

class LanguageManager {
  private translations: Record<string, Record<string, string>> = {}
  private currentLanguage = 'es_ES'

  constructor() {
    this.loadLanguages()
    this.syncWithConfig()
  }

  private loadLanguages(): void {
    let langDir: string

    if (is.dev) {
      langDir = path.join(process.cwd(), 'resources', 'lang')
    } else {
      langDir = path.join(app.getAppPath(), '..', 'lang')
    }

    try {
      if (!fs.existsSync(langDir)) {
        throw new Error(`Directorio de idiomas no encontrado: ${langDir}`)
      }

      const files = fs.readdirSync(langDir)
      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const langCode = file.replace('.json', '')
          const content = fs.readFileSync(path.join(langDir, file), 'utf-8')
          this.translations[langCode] = JSON.parse(content)
        }
      })

      if (Object.keys(this.translations).length === 0) {
        throw new Error('No se encontraron archivos de idioma')
      }
    } catch (error) {
      logger.error('Error cargando idiomas:', error)
      this.translations['es_ES'] = {
        'general.loading': 'Cargando...',
        'general.error': 'Error',
        'launcher.ready': 'Listo'
      }
      this.translations['en_US'] = {
        'general.loading': 'Loading...',
        'general.error': 'Error',
        'launcher.ready': 'Ready'
      }
    }
  }

  private syncWithConfig(): void {
    try {
      const configLang = ConfigManager.getCurrentLanguage()
      if (configLang && this.translations[configLang]) {
        this.currentLanguage = configLang
      }
    } catch (error) {
      logger.warn('Error sincronizando idioma desde config:', error)
    }
  }

  public setLanguage(lang: string): void {
    if (!this.translations[lang]) {
      throw new Error(`Idioma no soportado: ${lang}`)
    }
    this.currentLanguage = lang

    // Sincronizar con la configuración y guardar
    try {
      ConfigManager.setLanguage(lang)
      ConfigManager.save()
    } catch (error) {
      logger.error('Error guardando idioma en config:', error)
      throw error
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public getString(key: string): string {
    const translation = this.translations[this.currentLanguage]
    if (!translation) {
      return key
    }

    const value = this.getNestedValue(translation, key)
    if (value === undefined) {
      return key
    }

    return value
  }

  private getNestedValue(obj: any, path: string): string | undefined {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === undefined || current === null) return undefined
      current = current[key]
    }

    return typeof current === 'string' ? current : undefined
  }

  public plural(
    key: string,
    options: { count: number; zero?: string; one?: string; other?: string }
  ): string {
    const count = options.count
    let translation: string

    if (count === 0 && options.zero) {
      translation = options.zero
    } else if (count === 1 && options.one) {
      translation = options.one
    } else if (options.other) {
      translation = options.other
    } else {
      translation = this.getString(key)
    }

    return translation.replace('{{count}}', count.toString())
  }

  public formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    try {
      return date.toLocaleDateString(this.currentLanguage, {
        dateStyle: format
      } as Intl.DateTimeFormatOptions)
    } catch {
      return date.toLocaleDateString()
    }
  }

  public formatNumber(num: number): string {
    try {
      return num.toLocaleString(this.currentLanguage)
    } catch {
      return num.toString()
    }
  }
}

export const languageManager = new LanguageManager()
