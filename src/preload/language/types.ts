export default interface LanguageAPI {
  query: (key: string, placeholders?: Record<string, string | number>) => string
  plural: (
    key: string,
    options: { count: number; zero?: string; one?: string; other?: string }
  ) => string
  formatDate: (dateString: string, format: 'short' | 'long') => string
  formatNumber: (num: number) => string
  change: (lang: string) => void
  getCurrent: () => string

  // Event listeners
  onLanguageChanged: (callback: (lang: string) => void) => void
  removeLanguageListener: () => void
}
