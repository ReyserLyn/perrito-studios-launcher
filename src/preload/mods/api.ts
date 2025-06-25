import { ipcRenderer } from 'electron'
import { DROPIN_MOD_OPCODE } from '../../main/constants/ipc'

export const modsAPI = {
  // Mods
  scanMods: (modsDir: string, version: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.SCAN_MODS, modsDir, version),
  addMods: (files: any[], modsDir: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.ADD_MODS, files, modsDir),
  deleteMod: (modsDir: string, fullName: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.DELETE_MOD, modsDir, fullName),
  toggleMod: (modsDir: string, fullName: string, enable: boolean) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.TOGGLE_MOD, modsDir, fullName, enable),
  getModStats: (modsDir: string, version: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.GET_MOD_STATS, modsDir, version),

  // Shaderpacks
  scanShaderpacks: (instanceDir: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.SCAN_SHADERPACKS, instanceDir),
  getEnabledShaderpack: (instanceDir: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.GET_ENABLED_SHADERPACK, instanceDir),
  setEnabledShaderpack: (instanceDir: string, pack: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.SET_ENABLED_SHADERPACK, instanceDir, pack),
  addShaderpacks: (files: any[], instanceDir: string) =>
    ipcRenderer.invoke(DROPIN_MOD_OPCODE.ADD_SHADERPACKS, files, instanceDir)
}
