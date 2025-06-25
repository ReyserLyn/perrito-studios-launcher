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
  [modId: string]: boolean | ModConfigEntry
}

export interface ModConfigEntry {
  value: boolean
  mods?: ModConfigMods
}

export interface ModConfiguration {
  mods: ModConfigMods
}

// Tipos de respuesta del hook principal

export interface ModsData {
  requiredMods: ServerMod[]
  optionalMods: ServerMod[]
  dropinMods: DiscoveredMod[]
  modStats: ModStats
}

// Tipos para archivos de mods
export interface ModFile {
  id: string
  name: string
  path: string
  size: number
  type: string
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface ModFileInfo {
  name: string
  extension: string
  fullName: string
  isValid: boolean
}

// Tipos para operaciones de mods
export interface ModOperationResult {
  success: boolean
  addedCount?: number
  skippedCount?: number
  errors?: Array<{ fileName: string; error: string }>
  error?: string
}

// Tipos para configuración de drag & drop
export interface DndModsOptions {
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // en MB
}

export interface PlatformCapabilities {
  isWindows: boolean
  isMacOS: boolean
  isLinux: boolean
  isElectron: boolean
  supportsFilePath: boolean
}

// Tipos para operaciones del sistema de archivos
export interface BaseResult {
  result: boolean
  error?: string
}

// Tipos importados desde el backend
export interface DiscoveredMod {
  fullName: string
  name: string
  ext: string
  disabled: boolean
}
