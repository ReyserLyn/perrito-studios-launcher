import { ipcRenderer } from 'electron'
import { CONFIG_OPCODE } from '../../main/constants/ipc'

export const configAPI = {
  // Directories
  getLauncherDirectory: () => ipcRenderer.invoke(CONFIG_OPCODE.GET_LAUNCHER_DIRECTORY),
  getDataDirectory: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_DATA_DIRECTORY, def),
  setDataDirectory: (directory: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_DATA_DIRECTORY, directory),
  getCommonDirectory: () => ipcRenderer.invoke(CONFIG_OPCODE.GET_COMMON_DIRECTORY),
  getInstanceDirectory: () => ipcRenderer.invoke(CONFIG_OPCODE.GET_INSTANCE_DIRECTORY),

  // Config operations
  save: () => ipcRenderer.invoke(CONFIG_OPCODE.SAVE),
  load: () => ipcRenderer.invoke(CONFIG_OPCODE.LOAD),
  isFirstLaunch: () => ipcRenderer.invoke(CONFIG_OPCODE.IS_FIRST_LAUNCH),

  // Game settings
  getGameWidth: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_GAME_WIDTH, def),
  setGameWidth: (width: number) => ipcRenderer.invoke(CONFIG_OPCODE.SET_GAME_WIDTH, width),
  getGameHeight: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_GAME_HEIGHT, def),
  setGameHeight: (height: number) => ipcRenderer.invoke(CONFIG_OPCODE.SET_GAME_HEIGHT, height),
  getFullscreen: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_FULLSCREEN, def),
  setFullscreen: (fullscreen: boolean) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_FULLSCREEN, fullscreen),
  getAutoConnect: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_AUTO_CONNECT, def),
  setAutoConnect: (autoConnect: boolean) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_AUTO_CONNECT, autoConnect),
  getLaunchDetached: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_LAUNCH_DETACHED, def),
  setLaunchDetached: (detached: boolean) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_LAUNCH_DETACHED, detached),
  getAllowPrerelease: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_ALLOW_PRERELEASE, def),
  setAllowPrerelease: (allow: boolean) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_ALLOW_PRERELEASE, allow),
  getSyncLanguage: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_SYNC_LANGUAGE, def),
  setSyncLanguage: (sync: boolean) => ipcRenderer.invoke(CONFIG_OPCODE.SET_SYNC_LANGUAGE, sync),

  // Server settings
  getSelectedServer: (def = false) => ipcRenderer.invoke(CONFIG_OPCODE.GET_SELECTED_SERVER, def),
  setSelectedServer: (serverId: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_SELECTED_SERVER, serverId),

  // Java settings
  getMinRAM: (serverId: string) => ipcRenderer.invoke(CONFIG_OPCODE.GET_MIN_RAM, serverId),
  setMinRAM: (serverId: string, minRAM: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_MIN_RAM, serverId, minRAM),
  getMaxRAM: (serverId: string) => ipcRenderer.invoke(CONFIG_OPCODE.GET_MAX_RAM, serverId),
  setMaxRAM: (serverId: string, maxRAM: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_MAX_RAM, serverId, maxRAM),
  getJavaExecutable: (serverId: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.GET_JAVA_EXECUTABLE, serverId),
  setJavaExecutable: (serverId: string, executable: string) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_JAVA_EXECUTABLE, serverId, executable),
  getJVMOptions: (serverId: string) => ipcRenderer.invoke(CONFIG_OPCODE.GET_JVM_OPTIONS, serverId),
  setJVMOptions: (serverId: string, options: string[]) =>
    ipcRenderer.invoke(CONFIG_OPCODE.SET_JVM_OPTIONS, serverId, options),
  ensureJavaConfig: (serverId: string, effectiveJavaOptions: any, ram?: any) =>
    ipcRenderer.invoke(CONFIG_OPCODE.ENSURE_JAVA_CONFIG, serverId, effectiveJavaOptions, ram),
  getAbsoluteMinRAM: (ram?: any) => ipcRenderer.invoke(CONFIG_OPCODE.GET_ABSOLUTE_MIN_RAM, ram),
  getAbsoluteMaxRAM: () => ipcRenderer.invoke(CONFIG_OPCODE.GET_ABSOLUTE_MAX_RAM)
}
