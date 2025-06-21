import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Auth API
const authAPI = {
  // Mojang accounts
  addMojangAccount: (username: string) => ipcRenderer.invoke('auth:add-mojang-account', username),
  removeMojangAccount: (uuid: string) => ipcRenderer.invoke('auth:remove-mojang-account', uuid),

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) =>
    ipcRenderer.invoke('auth:add-microsoft-account', authCode),
  removeMicrosoftAccount: (uuid: string) =>
    ipcRenderer.invoke('auth:remove-microsoft-account', uuid),
  microsoftLogin: (authCode?: string) => ipcRenderer.invoke('auth:microsoft-login', authCode),

  // Account management
  getSelectedAccount: () => ipcRenderer.invoke('auth:get-selected-account'),
  getAllAccounts: () => ipcRenderer.invoke('auth:get-all-accounts'),
  selectAccount: (uuid: string) => ipcRenderer.invoke('auth:select-account', uuid),
  validateSelected: () => ipcRenderer.invoke('auth:validate-selected'),
  checkStatus: () => ipcRenderer.invoke('auth:check-status'),
  logout: () => ipcRenderer.invoke('auth:logout')
}

// Config API
const configAPI = {
  // Directories
  getLauncherDirectory: () => ipcRenderer.invoke('config:get-launcher-directory'),
  getDataDirectory: (def = false) => ipcRenderer.invoke('config:get-data-directory', def),
  setDataDirectory: (directory: string) =>
    ipcRenderer.invoke('config:set-data-directory', directory),
  getCommonDirectory: () => ipcRenderer.invoke('config:get-common-directory'),
  getInstanceDirectory: () => ipcRenderer.invoke('config:get-instance-directory'),

  // Config operations
  save: () => ipcRenderer.invoke('config:save'),
  load: () => ipcRenderer.invoke('config:load'),
  isFirstLaunch: () => ipcRenderer.invoke('config:is-first-launch'),

  // Game settings
  getGameWidth: (def = false) => ipcRenderer.invoke('config:get-game-width', def),
  setGameWidth: (width: number) => ipcRenderer.invoke('config:set-game-width', width),
  getGameHeight: (def = false) => ipcRenderer.invoke('config:get-game-height', def),
  setGameHeight: (height: number) => ipcRenderer.invoke('config:set-game-height', height),
  getFullscreen: (def = false) => ipcRenderer.invoke('config:get-fullscreen', def),
  setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('config:set-fullscreen', fullscreen),
  getAutoConnect: (def = false) => ipcRenderer.invoke('config:get-auto-connect', def),
  setAutoConnect: (autoConnect: boolean) =>
    ipcRenderer.invoke('config:set-auto-connect', autoConnect),
  getLaunchDetached: (def = false) => ipcRenderer.invoke('config:get-launch-detached', def),
  setLaunchDetached: (detached: boolean) =>
    ipcRenderer.invoke('config:set-launch-detached', detached),
  getAllowPrerelease: (def = false) => ipcRenderer.invoke('config:get-allow-prerelease', def),
  setAllowPrerelease: (allow: boolean) => ipcRenderer.invoke('config:set-allow-prerelease', allow),
  getSyncLanguage: (def = false) => ipcRenderer.invoke('config:get-sync-language', def),
  setSyncLanguage: (sync: boolean) => ipcRenderer.invoke('config:set-sync-language', sync),

  // Server settings
  getSelectedServer: (def = false) => ipcRenderer.invoke('config:get-selected-server', def),
  setSelectedServer: (serverId: string) =>
    ipcRenderer.invoke('config:set-selected-server', serverId),

  // Java settings
  getMinRAM: (serverId: string) => ipcRenderer.invoke('config:get-min-ram', serverId),
  setMinRAM: (serverId: string, minRAM: string) =>
    ipcRenderer.invoke('config:set-min-ram', serverId, minRAM),
  getMaxRAM: (serverId: string) => ipcRenderer.invoke('config:get-max-ram', serverId),
  setMaxRAM: (serverId: string, maxRAM: string) =>
    ipcRenderer.invoke('config:set-max-ram', serverId, maxRAM),
  getJavaExecutable: (serverId: string) =>
    ipcRenderer.invoke('config:get-java-executable', serverId),
  setJavaExecutable: (serverId: string, executable: string) =>
    ipcRenderer.invoke('config:set-java-executable', serverId, executable),
  getJVMOptions: (serverId: string) => ipcRenderer.invoke('config:get-jvm-options', serverId),
  setJVMOptions: (serverId: string, options: string[]) =>
    ipcRenderer.invoke('config:set-jvm-options', serverId, options),
  ensureJavaConfig: (serverId: string, effectiveJavaOptions: any, ram?: any) =>
    ipcRenderer.invoke('config:ensure-java-config', serverId, effectiveJavaOptions, ram),
  getAbsoluteMinRAM: (ram?: any) => ipcRenderer.invoke('config:get-absolute-min-ram', ram),
  getAbsoluteMaxRAM: () => ipcRenderer.invoke('config:get-absolute-max-ram')
}

// Distribution API
const distributionAPI = {
  getDistribution: () => ipcRenderer.invoke('distro:get-distribution'),
  refreshDistribution: () => ipcRenderer.invoke('distro:refresh-distribution'),
  getServerById: (serverId: string) => ipcRenderer.invoke('distro:get-server-by-id', serverId)
}

// Server Status API
const serverAPI = {
  getStatus: (hostname: string, port: number) =>
    ipcRenderer.invoke('server:get-status', hostname, port)
}

// Process Builder API
const processAPI = {
  launchGame: (options: any) => ipcRenderer.invoke('process:launch-game', options),
  killProcess: () => ipcRenderer.invoke('process:kill-process'),
  getProcessStatus: () => ipcRenderer.invoke('process:get-process-status'),
  // Nuevas APIs para lanzamiento completo
  validateLaunch: () => ipcRenderer.invoke('process:validate-launch'),
  systemScan: (serverId: string) => ipcRenderer.invoke('process:system-scan', serverId),
  downloadJava: (serverId: string) => ipcRenderer.invoke('process:download-java', serverId),
  validateFiles: (serverId: string) => ipcRenderer.invoke('process:validate-files', serverId),
  downloadFiles: (serverId: string) => ipcRenderer.invoke('process:download-files', serverId),
  validateAndDownload: (serverId: string) =>
    ipcRenderer.invoke('process:validate-and-download', serverId),
  prepareLaunch: (serverId: string) => ipcRenderer.invoke('process:prepare-launch', serverId)
}

// Launch API con eventos
const launchAPI = {
  // Event listeners para progreso de lanzamiento
  onProgress: (callback: (stage: string, progress: number, details?: string) => void) => {
    ipcRenderer.on('launch:progress', (_, stage, progress, details) =>
      callback(stage, progress, details)
    )
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('launch:error', (_, error) => callback(error))
  },
  onSuccess: (callback: () => void) => {
    ipcRenderer.on('launch:success', () => callback())
  },
  onLog: (callback: (type: 'stdout' | 'stderr', data: string) => void) => {
    ipcRenderer.on('launch:log', (_, type, data) => callback(type, data))
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('launch:progress')
  },
  removeErrorListener: () => {
    ipcRenderer.removeAllListeners('launch:error')
  },
  removeSuccessListener: () => {
    ipcRenderer.removeAllListeners('launch:success')
  },
  removeLogListener: () => {
    ipcRenderer.removeAllListeners('launch:log')
  }
}

// Dropin Mods API
const modsAPI = {
  // Mods
  scanMods: (modsDir: string, version: string) =>
    ipcRenderer.invoke('dropin:scan-mods', modsDir, version),
  addMods: (files: any[], modsDir: string) => ipcRenderer.invoke('dropin:add-mods', files, modsDir),
  deleteMod: (modsDir: string, fullName: string) =>
    ipcRenderer.invoke('dropin:delete-mod', modsDir, fullName),
  toggleMod: (modsDir: string, fullName: string, enable: boolean) =>
    ipcRenderer.invoke('dropin:toggle-mod', modsDir, fullName, enable),
  getModStats: (modsDir: string, version: string) =>
    ipcRenderer.invoke('dropin:get-mod-stats', modsDir, version),

  // Shaderpacks
  scanShaderpacks: (instanceDir: string) =>
    ipcRenderer.invoke('dropin:scan-shaderpacks', instanceDir),
  getEnabledShaderpack: (instanceDir: string) =>
    ipcRenderer.invoke('dropin:get-enabled-shaderpack', instanceDir),
  setEnabledShaderpack: (instanceDir: string, pack: string) =>
    ipcRenderer.invoke('dropin:set-enabled-shaderpack', instanceDir, pack),
  addShaderpacks: (files: any[], instanceDir: string) =>
    ipcRenderer.invoke('dropin:add-shaderpacks', files, instanceDir)
}

// Discord RPC API
const discordAPI = {
  init: (genSettings: any, servSettings: any, initialDetails?: string) =>
    ipcRenderer.invoke('discord:init', genSettings, servSettings, initialDetails),
  updateDetails: (details: string) => ipcRenderer.invoke('discord:update-details', details),
  shutdown: () => ipcRenderer.invoke('discord:shutdown')
}

// Language API
const languageAPI = {
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

// Auto Updater API
const updaterAPI = {
  init: (allowPrerelease?: boolean) =>
    ipcRenderer.send('autoUpdateAction', 'initAutoUpdater', allowPrerelease),
  checkForUpdate: () => ipcRenderer.send('autoUpdateAction', 'checkForUpdate'),
  allowPrereleaseChange: (allow: boolean) =>
    ipcRenderer.send('autoUpdateAction', 'allowPrereleaseChange', allow),
  installNow: () => ipcRenderer.send('autoUpdateAction', 'installUpdateNow'),

  // Event listeners
  onNotification: (callback: (event: string, data?: any) => void) => {
    ipcRenderer.on('autoUpdateNotification', (_, event, data) => callback(event, data))
  },
  removeNotificationListener: () => {
    ipcRenderer.removeAllListeners('autoUpdateNotification')
  }
}

// Microsoft Auth API
const microsoftAuthAPI = {
  openLogin: (successCallback?: boolean, onCloseCallback?: boolean) =>
    ipcRenderer.send('MSFT_AUTH_OPEN_LOGIN', successCallback, onCloseCallback),
  openLogout: (uuid: string, isLastAccount: boolean) =>
    ipcRenderer.send('MSFT_AUTH_OPEN_LOGOUT', uuid, isLastAccount),

  // Event listeners
  onLoginReply: (callback: (type: string, data: any, closeCallback?: boolean) => void) => {
    ipcRenderer.on('MSFT_AUTH_REPLY_LOGIN', (_, type, data, closeCallback) =>
      callback(type, data, closeCallback)
    )
  },
  onLogoutReply: (callback: (type: string, uuid?: string, isLastAccount?: boolean) => void) => {
    ipcRenderer.on('MSFT_AUTH_REPLY_LOGOUT', (_, type, uuid, isLastAccount) =>
      callback(type, uuid, isLastAccount)
    )
  },
  removeLoginListener: () => {
    ipcRenderer.removeAllListeners('MSFT_AUTH_REPLY_LOGIN')
  },
  removeLogoutListener: () => {
    ipcRenderer.removeAllListeners('MSFT_AUTH_REPLY_LOGOUT')
  }
}

// System API
const systemAPI = {
  trashItem: (filePath: string) => ipcRenderer.invoke('TRASH_ITEM', filePath),
  showToast: (type: string, message: string) => ipcRenderer.send('show-toast', { type, message }),
  ping: () => ipcRenderer.send('ping'),

  // Distribution events
  onDistributionIndexDone: (callback: (result: boolean) => void) => {
    ipcRenderer.on('distributionIndexDone', (_, result) => callback(result))
  },
  removeDistributionListener: () => {
    ipcRenderer.removeAllListeners('distributionIndexDone')
  }
}

// Complete API object
const api = {
  auth: authAPI,
  config: configAPI,
  distribution: distributionAPI,
  process: processAPI,
  launch: launchAPI,
  mods: modsAPI,
  discord: discordAPI,
  language: languageAPI,
  updater: updaterAPI,
  microsoftAuth: microsoftAuthAPI,
  system: systemAPI,
  server: serverAPI
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
