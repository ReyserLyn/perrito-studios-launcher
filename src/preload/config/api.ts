import { ipcRenderer } from 'electron'

export const configAPI = {
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
