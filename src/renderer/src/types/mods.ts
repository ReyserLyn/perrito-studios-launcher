/**
 * Tipos relacionados con mods del launcher
 */

export interface ServerMod {
  id: string
  name: string
  version: string
  required: boolean
  enabled: boolean
  description?: string
}

export interface DropinMod {
  fullName: string
  name: string
  ext: string
  disabled: boolean
}

export interface ModStats {
  total: number
  enabled: number
  disabled: number
  byExtension: Record<string, number>
}

// Tipos para configuración de mods
export interface ModConfigMods {
  [modId: string]: boolean | { value: boolean; mods?: ModConfigMods }
}

export interface ModConfiguration {
  mods: ModConfigMods
}

// Tipos de respuesta del hook principal

export interface ModsData {
  requiredMods: ServerMod[]
  optionalMods: ServerMod[]
  dropinMods: DropinMod[]
  modStats: ModStats
}
