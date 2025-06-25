export interface DiscoveredMod {
  fullName: string
  name: string
  ext: string
  disabled: boolean
}

export interface DiscoveredShaderpack {
  fullName: string
  name: string
}

export interface FileItem {
  name: string
  path: string
}

export interface ModStats {
  total: number
  enabled: number
  disabled: number
  byExtension: Record<string, number>
}
