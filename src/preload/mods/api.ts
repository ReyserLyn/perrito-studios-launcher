import { ipcRenderer } from 'electron'

export const modsAPI = {
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
