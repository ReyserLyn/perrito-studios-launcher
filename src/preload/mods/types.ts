import { DiscoveredMod, DiscoveredShaderpack, FileItem, ModStats } from '../../main/types/mods'

type scanModsResponse = { success: true; mods: DiscoveredMod[] } | { success: false; error: string }

type addModsResponse = { success: true } | { success: false; error: string }

type deleteModResponse = { success: true } | { success: false; error: string }

type toggleModResponse = { success: true } | { success: false; error: string }

type getModStatsResponse = { success: true; stats: ModStats } | { success: false; error: string }

type scanShaderpacksResponse =
  | { success: true; shaderpacks: DiscoveredShaderpack[] }
  | { success: false; error: string }

type getEnabledShaderpackResponse =
  | { success: true; shaderpack: string }
  | { success: false; error: string }

type setEnabledShaderpackResponse = { success: true } | { success: false; error: string }

type addShaderpacksResponse = { success: true } | { success: false; error: string }

export default interface ModsAPI {
  // Mods
  scanMods: (modsDir: string, version: string) => Promise<scanModsResponse>
  addMods: (files: FileItem[], modsDir: string) => Promise<addModsResponse>
  deleteMod: (modsDir: string, fullName: string) => Promise<deleteModResponse>
  toggleMod: (modsDir: string, fullName: string, enable: boolean) => Promise<toggleModResponse>
  getModStats: (modsDir: string, version: string) => Promise<getModStatsResponse>

  // Shaderpacks
  scanShaderpacks: (instanceDir: string) => Promise<scanShaderpacksResponse>
  getEnabledShaderpack: (instanceDir: string) => Promise<getEnabledShaderpackResponse>
  setEnabledShaderpack: (instanceDir: string, pack: string) => Promise<setEnabledShaderpackResponse>
  addShaderpacks: (files: FileItem[], instanceDir: string) => Promise<addShaderpacksResponse>
}
