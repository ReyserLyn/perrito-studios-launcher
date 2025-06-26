import { ipcRenderer } from 'electron'
import type LanguageAPI from './types'

export const languageAPI: LanguageAPI = {
  query: (key: string, placeholders?: Record<string, string | number>): string => {
    return ipcRenderer.sendSync('language-query', key, placeholders)
  },

  plural: (
    key: string,
    options: { count: number; zero?: string; one?: string; other?: string }
  ): string => {
    return ipcRenderer.sendSync('language-plural', key, options)
  },

  formatDate: (dateString: string, format: 'short' | 'long'): string => {
    return ipcRenderer.sendSync('language-format-date', dateString, format)
  },

  formatNumber: (num: number): string => {
    return ipcRenderer.sendSync('language-format-number', num)
  },

  change: (lang: string): void => {
    ipcRenderer.send('language-change', lang)
  },

  getCurrent: (): string => {
    return ipcRenderer.sendSync('language-get-current')
  },

  // Event listeners
  onLanguageChanged: (callback: (lang: string) => void): void => {
    ipcRenderer.on('language-changed', (_event, lang) => callback(lang))
  },
  removeLanguageListener: (): void => {
    ipcRenderer.removeAllListeners('language-changed')
  }
}
