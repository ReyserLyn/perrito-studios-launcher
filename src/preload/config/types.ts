type getLauncherResponse = { success: true; directory: string } | { success: false; error: string }

type getDataDirectoryResponse =
  | { success: true; directory: string }
  | { success: false; error: string }

type setDataDirectoryResponse = { success: true } | { success: false; error: string }

type getCommonDirectoryResponse =
  | { success: true; directory: string }
  | { success: false; error: string }

type getInstanceDirectoryResponse =
  | { success: true; directory: string }
  | { success: false; error: string }

type saveResponse = { success: true } | { success: false; error: string }

type loadResponse = { success: true } | { success: false; error: string }

type isFirstLaunchResponse =
  | { success: true; isFirstLaunch: boolean }
  | { success: false; error: string }

type getGameWidthResponse = { success: true; width: number } | { success: false; error: string }

type setGameWidthResponse = { success: true } | { success: false; error: string }

type getGameHeightResponse = { success: true; height: number } | { success: false; error: string }

type setGameHeightResponse = { success: true } | { success: false; error: string }

type getFullscreenResponse =
  | { success: true; fullscreen: boolean }
  | { success: false; error: string }

type setFullscreenResponse = { success: true } | { success: false; error: string }

type getAutoConnectResponse =
  | { success: true; autoConnect: boolean }
  | { success: false; error: string }

type setAutoConnectResponse = { success: true } | { success: false; error: string }

type getLaunchDetachedResponse =
  | { success: true; detached: boolean }
  | { success: false; error: string }

type setLaunchDetachedResponse = { success: true } | { success: false; error: string }

type getAllowPrereleaseResponse =
  | { success: true; allowPrerelease: boolean }
  | { success: false; error: string }

type setAllowPrereleaseResponse = { success: true } | { success: false; error: string }

type getSyncLanguageResponse =
  | { success: true; syncLanguage: boolean }
  | { success: false; error: string }

type setSyncLanguageResponse = { success: true } | { success: false; error: string }

type getCurrentLanguageResponse =
  | { success: true; language: string }
  | { success: false; error: string }

type setLanguageResponse = { success: true } | { success: false; error: string }

type getSelectedServerResponse =
  | { success: true; selectedServer: string }
  | { success: false; error: string }

type setSelectedServerResponse = { success: true } | { success: false; error: string }

type getMinRAMResponse = { success: true; minRAM: string } | { success: false; error: string }

type setMinRAMResponse = { success: true } | { success: false; error: string }

type getMaxRAMResponse = { success: true; maxRAM: string } | { success: false; error: string }

type setMaxRAMResponse = { success: true } | { success: false; error: string }

type getJavaExecutableResponse =
  | { success: true; executable: string }
  | { success: false; error: string }

type setJavaExecutableResponse = { success: true } | { success: false; error: string }

type getJVMOptionsResponse =
  | { success: true; jvmOptions: string[] }
  | { success: false; error: string }

type setJVMOptionsResponse = { success: true } | { success: false; error: string }

type ensureJavaConfigResponse = { success: true } | { success: false; error: string }

type getAbsoluteMinRAMResponse =
  | { success: true; minRAM: number }
  | { success: false; error: string }

type getAbsoluteMaxRAMResponse =
  | { success: true; maxRAM: number }
  | { success: false; error: string }

export default interface ConfigAPI {
  // Directories
  getLauncherDirectory: () => Promise<getLauncherResponse>
  getDataDirectory: (def?: boolean) => Promise<getDataDirectoryResponse>
  setDataDirectory: (directory: string) => Promise<setDataDirectoryResponse>
  getCommonDirectory: () => Promise<getCommonDirectoryResponse>
  getInstanceDirectory: () => Promise<getInstanceDirectoryResponse>

  // Config operations
  save: () => Promise<saveResponse>
  load: () => Promise<loadResponse>
  isFirstLaunch: () => Promise<isFirstLaunchResponse>

  // Game settings
  getGameWidth: (def?: boolean) => Promise<getGameWidthResponse>
  setGameWidth: (width: number) => Promise<setGameWidthResponse>
  getGameHeight: (def?: boolean) => Promise<getGameHeightResponse>
  setGameHeight: (height: number) => Promise<setGameHeightResponse>
  getFullscreen: (def?: boolean) => Promise<getFullscreenResponse>
  setFullscreen: (fullscreen: boolean) => Promise<setFullscreenResponse>
  getAutoConnect: (def?: boolean) => Promise<getAutoConnectResponse>
  setAutoConnect: (autoConnect: boolean) => Promise<setAutoConnectResponse>
  getLaunchDetached: (def?: boolean) => Promise<getLaunchDetachedResponse>
  setLaunchDetached: (detached: boolean) => Promise<setLaunchDetachedResponse>
  getAllowPrerelease: (def?: boolean) => Promise<getAllowPrereleaseResponse>
  setAllowPrerelease: (allow: boolean) => Promise<setAllowPrereleaseResponse>
  getSyncLanguage: (def?: boolean) => Promise<getSyncLanguageResponse>
  setSyncLanguage: (sync: boolean) => Promise<setSyncLanguageResponse>

  // Server settings
  getSelectedServer: (def?: boolean) => Promise<getSelectedServerResponse>
  setSelectedServer: (serverId: string) => Promise<setSelectedServerResponse>

  // Java settings
  getMinRAM: (serverId: string) => Promise<getMinRAMResponse>
  setMinRAM: (serverId: string, minRAM: string) => Promise<setMinRAMResponse>
  getMaxRAM: (serverId: string) => Promise<getMaxRAMResponse>
  setMaxRAM: (serverId: string, maxRAM: string) => Promise<setMaxRAMResponse>
  getJavaExecutable: (serverId: string) => Promise<getJavaExecutableResponse>
  setJavaExecutable: (serverId: string, executable: string) => Promise<setJavaExecutableResponse>
  getJVMOptions: (serverId: string) => Promise<getJVMOptionsResponse>
  setJVMOptions: (serverId: string, options: string[]) => Promise<setJVMOptionsResponse>
  ensureJavaConfig: (
    serverId: string,
    effectiveJavaOptions: any,
    ram?: any
  ) => Promise<ensureJavaConfigResponse>
  getAbsoluteMinRAM: (ram?: any) => Promise<getAbsoluteMinRAMResponse>
  getAbsoluteMaxRAM: () => Promise<getAbsoluteMaxRAMResponse>

  // Language settings
  getCurrentLanguage: (def?: boolean) => Promise<getCurrentLanguageResponse>
  setLanguage: (language: string) => Promise<setLanguageResponse>
}
