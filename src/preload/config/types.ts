export default interface ConfigAPI {
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
