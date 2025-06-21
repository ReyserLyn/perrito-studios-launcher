/**
 * Tipos e interfaces para el ProcessBuilder
 */

import { HeliosModule, HeliosServer } from 'perrito-core/common'

// Tipos base del sistema de distribución
export interface RawServer {
  id: string
  minecraftVersion: string
  autoconnect?: boolean
}

export interface Downloads {
  artifact?: Artifact
  classifiers?: Record<string, Artifact>
}

export interface Artifact {
  path: string
  url?: string
  sha1?: string
  size?: number
}

export interface Library {
  name: string
  downloads: Downloads
  rules?: Rule[]
  natives?: Record<string, string>
  extract?: {
    exclude: string[]
  }
}

export interface Rule {
  action: 'allow' | 'disallow'
  os?: {
    name: string
    version?: string
  }
  features?: Record<string, boolean>
}

// Manifiestos de versión
export interface VanillaManifest {
  id: string
  type: string
  assets: string
  libraries: Library[]
  arguments: {
    jvm: Array<string | ConditionalArgument>
    game: Array<string | ConditionalArgument>
  }
  mainClass: string
}

export interface ModManifest {
  id: string
  mainClass: string
  minecraftArguments?: string
  arguments?: {
    jvm?: string[]
    game?: string[]
  }
}

export interface ConditionalArgument {
  rules: Rule[]
  value: string | string[]
}

// Usuario autenticado
export interface AuthUser {
  displayName: string
  uuid: string
  accessToken: string
  type: 'microsoft' | 'mojang'
}

// Configuración de mods
export interface ModConfiguration {
  fMods: HeliosModule[]
  lMods: HeliosModule[]
}

export interface ModConfigEntry {
  mods?: Record<string, ModConfigEntry>
  value?: boolean
}

// Opciones de construcción del proceso
export interface ProcessBuilderOptions {
  distroServer: HeliosServer
  vanillaManifest: VanillaManifest
  modManifest: ModManifest
  authUser: AuthUser
  launcherVersion: string
}
