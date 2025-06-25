import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { LoggerUtil } from 'perrito-core'

const logger = LoggerUtil.getLogger('LanguageManager')

interface LanguageStrings {
  [key: string]: string | { [key: string]: string }
}

class LanguageManager {
  private currentLanguage: string = 'es'
  private strings: { [lang: string]: LanguageStrings } = {}
  private initialized: boolean = false

  public initialize(): void {
    if (this.initialized) {
      return
    }

    try {
      // Cargar todos los archivos de idioma
      const langDir = path.join(app.getAppPath(), 'resources', 'lang')
      const files = fs.readdirSync(langDir)

      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const lang = file.replace('.json', '')
          const content = fs.readFileSync(path.join(langDir, file), 'utf-8')
          this.strings[lang] = JSON.parse(content)
          logger.info(`Idioma cargado: ${lang}`)
        }
      })

      this.initialized = true
      logger.info('Sistema de idiomas inicializado')
    } catch (error) {
      logger.error('Error inicializando sistema de idiomas:', error)
      throw error
    }
  }

  public setLanguage(lang: string): void {
    if (!this.initialized) {
      this.initialize()
    }

    if (!this.strings[lang]) {
      throw new Error(`Idioma no soportado: ${lang}`)
    }

    this.currentLanguage = lang
    logger.info(`Idioma cambiado a: ${lang}`)
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public getString(key: string): string {
    if (!this.initialized) {
      this.initialize()
    }

    const parts = key.split('.')
    let current: any = this.strings[this.currentLanguage]

    for (const part of parts) {
      if (current[part] === undefined) {
        logger.warn(`Clave de idioma no encontrada: ${key}`)
        return key
      }
      current = current[part]
    }

    if (typeof current !== 'string') {
      logger.warn(`Clave de idioma inválida (no es string): ${key}`)
      return key
    }

    return current
  }

  public plural(
    key: string,
    options: { count: number; zero?: string; one?: string; other?: string }
  ): string {
    const count = options.count
    let form: string

    if (count === 0 && options.zero) {
      form = options.zero
    } else if (count === 1 && options.one) {
      form = options.one
    } else if (options.other) {
      form = options.other
    } else {
      form = this.getString(key)
    }

    return form.replace(/{count}/g, count.toString())
  }

  public formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    try {
      const options: Intl.DateTimeFormatOptions =
        format === 'long'
          ? {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }
          : {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }

      return new Intl.DateTimeFormat(this.currentLanguage, options).format(date)
    } catch (error) {
      logger.error('Error formateando fecha:', error)
      return date.toLocaleString()
    }
  }

  public formatNumber(num: number): string {
    try {
      return new Intl.NumberFormat(this.currentLanguage).format(num)
    } catch (error) {
      logger.error('Error formateando número:', error)
      return num.toString()
    }
  }
}

export const languageManager = new LanguageManager()
