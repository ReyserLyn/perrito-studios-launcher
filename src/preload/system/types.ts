import type { BaseResult, FilePathResult } from '../../main/types/system'

/**
 * API del sistema disponible en el proceso de renderizado
 */
export interface SystemApi {
  // Shell operations
  trashItem: (filePath: string) => Promise<{ success: boolean; error?: string }>
  openFolder: (folderPath: string) => Promise<{ success: boolean; error?: string }>
  showItemInFolder: (filePath: string) => Promise<{ success: boolean; error?: string }>
  resolveFilePath: (
    fileName: string,
    fileBuffer: ArrayBuffer
  ) => Promise<{ success: boolean; path?: string; error?: string }>
  selectJavaExecutable: () => Promise<{ success: boolean; path?: string; error?: string }>
  getSystemMemory: () => Promise<{ total: number; free: number }>

  // Language
  changeLanguage: (lang: string) => void
  getCurrentLanguage: () => string
  getPlural: (
    key: string,
    options: { count: number; zero?: string; one?: string; other?: string }
  ) => string
  formatDate: (dateString: string, format: 'short' | 'long') => string
  formatNumber: (num: number) => string
  onLanguageChanged: (callback: (lang: string) => void) => void

  // Discord RPC
  initializeDiscordRpc: () => Promise<{ success: boolean; error?: string }>
  destroyDiscordRpc: () => Promise<{ success: boolean; error?: string }>
  updateDiscordActivity: (activity: {
    state?: string
    details?: string
    startTimestamp?: number
    endTimestamp?: number
    largeImageKey?: string
    largeImageText?: string
    smallImageKey?: string
    smallImageText?: string
    partyId?: string
    partySize?: number
    partyMax?: number
    matchSecret?: string
    spectateSecret?: string
    joinSecret?: string
    instance?: boolean
    buttons?: Array<{
      label: string
      url: string
    }>
  }) => Promise<{ success: boolean; error?: string }>

  // Events de distribución
  onDistributionIndexDone: (callback: (result: boolean) => void) => void
  removeDistributionListener: () => void
}

export type { BaseResult, FilePathResult }
