import { ElectronAPI } from '@electron-toolkit/preload'

// Auth API Types
interface AuthAPI {
  // Mojang accounts
  addMojangAccount: (username: string) => Promise<any>
  removeMojangAccount: (uuid: string) => Promise<any>

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) => Promise<any>
  removeMicrosoftAccount: (uuid: string) => Promise<any>
  microsoftLogin: (authCode?: string) => Promise<any>

  // Account management
  getSelectedAccount: () => Promise<any>
  getAllAccounts: () => Promise<any>
  selectAccount: (uuid: string) => Promise<any>
  validateSelected: () => Promise<any>
  checkStatus: () => Promise<any>
  logout: () => Promise<any>
}

// Config API Types
interface ConfigAPI {
  // Directories
  getLauncherDirectory: () => Promise<any>
  getDataDirectory: (def?: boolean) => Promise<any>
  setDataDirectory: (directory: string) => Promise<any>
  getCommonDirectory: () => Promise<any>
  getInstanceDirectory: () => Promise<any>

  // Config operations
  save: () => Promise<any>
  load: () => Promise<any>
  isFirstLaunch: () => Promise<any>

  // Game settings
  getGameWidth: (def?: boolean) => Promise<any>
  setGameWidth: (width: number) => Promise<any>
  getGameHeight: (def?: boolean) => Promise<any>
  setGameHeight: (height: number) => Promise<any>
  getFullscreen: (def?: boolean) => Promise<any>
  setFullscreen: (fullscreen: boolean) => Promise<any>
  getAutoConnect: (def?: boolean) => Promise<any>
  setAutoConnect: (autoConnect: boolean) => Promise<any>
  getLaunchDetached: (def?: boolean) => Promise<any>
  setLaunchDetached: (detached: boolean) => Promise<any>
  getAllowPrerelease: (def?: boolean) => Promise<any>
  setAllowPrerelease: (allow: boolean) => Promise<any>
  getSyncLanguage: (def?: boolean) => Promise<any>
  setSyncLanguage: (sync: boolean) => Promise<any>

  // Server settings
  getSelectedServer: (def?: boolean) => Promise<any>
  setSelectedServer: (serverId: string) => Promise<any>

  // Java settings
  getMinRAM: (serverId: string) => Promise<any>
  setMinRAM: (serverId: string, minRAM: string) => Promise<any>
  getMaxRAM: (serverId: string) => Promise<any>
  setMaxRAM: (serverId: string, maxRAM: string) => Promise<any>
  getJavaExecutable: (serverId: string) => Promise<any>
  setJavaExecutable: (serverId: string, executable: string) => Promise<any>
  getJVMOptions: (serverId: string) => Promise<any>
  setJVMOptions: (serverId: string, options: string[]) => Promise<any>
  ensureJavaConfig: (serverId: string, effectiveJavaOptions: any, ram?: any) => Promise<any>
  getAbsoluteMinRAM: (ram?: any) => Promise<any>
  getAbsoluteMaxRAM: () => Promise<any>
}

// Distribution API Types
interface DistributionAPI {
  getDistribution: () => Promise<any>
  refreshDistribution: () => Promise<any>
  getServerById: (serverId: string) => Promise<any>
  getMainServer: () => Promise<any>
}

// Process API Types
interface ProcessAPI {
  launchGame: (options: any) => Promise<any>
  killProcess: () => Promise<any>
  getProcessStatus: () => Promise<any>
}

// Mods API Types
interface ModsAPI {
  // Mods
  scanMods: (modsDir: string, version: string) => Promise<any>
  addMods: (files: any[], modsDir: string) => Promise<any>
  deleteMod: (modsDir: string, fullName: string) => Promise<any>
  toggleMod: (modsDir: string, fullName: string, enable: boolean) => Promise<any>
  getModStats: (modsDir: string, version: string) => Promise<any>

  // Shaderpacks
  scanShaderpacks: (instanceDir: string) => Promise<any>
  getEnabledShaderpack: (instanceDir: string) => Promise<any>
  setEnabledShaderpack: (instanceDir: string, pack: string) => Promise<any>
  addShaderpacks: (files: any[], instanceDir: string) => Promise<any>
}

// Discord API Types
interface DiscordAPI {
  init: (genSettings: any, servSettings: any, initialDetails?: string) => Promise<any>
  updateDetails: (details: string) => Promise<any>
  shutdown: () => Promise<any>
}

// Language API Types
interface LanguageAPI {
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

// Updater API Types
interface UpdaterAPI {
  init: (allowPrerelease?: boolean) => void
  checkForUpdate: () => void
  allowPrereleaseChange: (allow: boolean) => void
  installNow: () => void

  // Event listeners
  onNotification: (callback: (event: string, data?: any) => void) => void
  removeNotificationListener: () => void
}

// Microsoft Auth API Types
interface MicrosoftAuthAPI {
  openLogin: (successCallback?: boolean, onCloseCallback?: boolean) => void
  openLogout: (uuid: string, isLastAccount: boolean) => void

  // Event listeners
  onLoginReply: (callback: (type: string, data: any, closeCallback?: boolean) => void) => void
  onLogoutReply: (callback: (type: string, uuid?: string, isLastAccount?: boolean) => void) => void
  removeLoginListener: () => void
  removeLogoutListener: () => void
}

// System API Types
interface SystemAPI {
  trashItem: (filePath: string) => Promise<any>
  showToast: (type: string, message: string) => void
  ping: () => void

  // Distribution events
  onDistributionIndexDone: (callback: (result: boolean) => void) => void
  removeDistributionListener: () => void
}

// Complete API interface
interface API {
  auth: AuthAPI
  config: ConfigAPI
  distribution: DistributionAPI
  process: ProcessAPI
  mods: ModsAPI
  discord: DiscordAPI
  language: LanguageAPI
  updater: UpdaterAPI
  microsoftAuth: MicrosoftAuthAPI
  system: SystemAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
