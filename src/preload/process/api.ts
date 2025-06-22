import { ipcRenderer } from 'electron'
import { PROCESS_BUILDER_OPCODE } from '../../main/constants/ipc'
import { LaunchGameOptions } from './types'

export const processAPI = {
  killProcess: () => ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.KILL_PROCESS),
  getProcessStatus: () => ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.GET_PROCESS_STATUS),

  validateLaunch: () => ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.VALIDATE_LAUNCH),
  systemScan: (serverId: string) =>
    ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.SYSTEM_SCAN, serverId),
  downloadJava: (serverId: string) =>
    ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.DOWNLOAD_JAVA, serverId),
  validateAndDownload: (serverId: string) =>
    ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.VALIDATE_AND_DOWNLOAD, serverId),
  prepareLaunch: (serverId: string) =>
    ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.PREPARE_LAUNCH, serverId),
  launchGame: (options: LaunchGameOptions) =>
    ipcRenderer.invoke(PROCESS_BUILDER_OPCODE.LAUNCH_GAME, options)
}
