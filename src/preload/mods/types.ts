export default interface ModsAPI {
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
