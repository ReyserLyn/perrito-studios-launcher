/**
 * Tipos e interfaces para el ProcessBuilder
 */

import { HeliosModule, HeliosServer } from 'perrito-core/common'
import { AuthAccount } from '../services/configManager'

export interface Rule {
  action: string
  os?: {
    name: string
    version?: string
  }
  features?: {
    [key: string]: boolean
  }
}

export interface Natives {
  linux?: string
  osx?: string
  windows?: string
}

export interface BaseArtifact {
  sha1: string
  size: number
  url: string
}

export interface LibraryArtifact extends BaseArtifact {
  path: string
}

export interface Library {
  downloads: {
    artifact: LibraryArtifact
    classifiers?: {
      javadoc?: LibraryArtifact
      'natives-linux'?: LibraryArtifact
      'natives-macos'?: LibraryArtifact
      'natives-windows'?: LibraryArtifact
      sources?: LibraryArtifact
    }
  }
  extract?: {
    exclude: string[]
  }
  name: string
  natives?: Natives
  rules?: Rule[]
}

// Manifiestos de versión
export interface VanillaManifest {
  arguments?: {
    game: (string | RuleBasedArgument)[]
    jvm: (string | RuleBasedArgument)[]
  }
  assetIndex: {
    id: string
    sha1: string
    size: number
    totalSize: number
    url: string
  }
  assets: string
  complianceLevel?: number
  downloads: {
    client: BaseArtifact
    client_mappings?: BaseArtifact
    server: BaseArtifact
    server_mappings?: BaseArtifact
  }
  id: string
  javaVersion?: {
    component: string
    majorVersion: number
  }
  libraries: Library[]
  logging: {
    client: {
      argument: string
      file: {
        id: string
        sha1: string
        size: number
        url: string
      }
      type: string
    }
  }
  mainClass: string
  minimumLauncherVersion?: number
  releaseTime: string
  time: string
  type: string
}

export interface RuleBasedArgument {
  rules: Rule[]
  value: string | string[]
}

export interface ModManifest extends VanillaManifest {
  inheritsFrom?: string
  minecraftArguments?: string
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
  authUser: AuthAccount
  launcherVersion: string
}
