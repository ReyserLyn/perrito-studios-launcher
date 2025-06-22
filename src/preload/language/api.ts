import { ipcRenderer } from 'electron'

export const languageAPI = {
  query: (key: string, placeholders?: Record<string, string | number>) =>
    ipcRenderer.sendSync('language-query', key, placeholders),
  plural: (key: string, options: { count: number; zero?: string; one?: string; other?: string }) =>
    ipcRenderer.sendSync('language-plural', key, options),
  formatDate: (dateString: string, format: 'short' | 'long') =>
    ipcRenderer.sendSync('language-format-date', dateString, format),
  formatNumber: (num: number) => ipcRenderer.sendSync('language-format-number', num),
  change: (lang: string) => ipcRenderer.send('language-change', lang),
  getCurrent: () => ipcRenderer.sendSync('language-get-current'),

  // Event listeners
  onLanguageChanged: (callback: (lang: string) => void) => {
    ipcRenderer.on('language-changed', (_, lang) => callback(lang))
  },
  removeLanguageListener: () => {
    ipcRenderer.removeAllListeners('language-changed')
  }
}
