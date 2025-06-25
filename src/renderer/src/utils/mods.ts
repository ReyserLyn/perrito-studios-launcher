/**
 * Utilidades para el manejo de mods
 */
import { Type } from 'helios-distribution-types'
import { HeliosModule } from 'perrito-core/common'
import type {
  DndModsOptions,
  FileValidationResult,
  ModConfigMods,
  ModFile,
  PlatformCapabilities,
  ServerMod
} from '../types/mods'

// Constantes
export const MOD_EXTENSIONS = ['.jar', '.zip', '.litemod'] as const
export const MAX_MOD_SIZE_MB = 100
export const MAX_MODS_PER_UPLOAD = 50

export type ModExtension = (typeof MOD_EXTENSIONS)[number]

// Configuración por defecto para drag & drop
export const DEFAULT_DND_OPTIONS: DndModsOptions = {
  acceptedTypes: [...MOD_EXTENSIONS],
  maxFiles: MAX_MODS_PER_UPLOAD,
  maxSize: MAX_MOD_SIZE_MB
}

/**
 * Procesa módulos de forma recursiva y segura
 */
export const processModules = (
  modules: HeliosModule[],
  configMods: ModConfigMods = {}
): { required: ServerMod[]; optional: ServerMod[] } => {
  const required: ServerMod[] = []
  const optional: ServerMod[] = []

  for (const module of modules) {
    // Verificación de seguridad
    if (!module?.rawModule) {
      console.warn('Módulo inválido encontrado:', module)
      continue
    }

    const type = module.rawModule.type

    // Solo procesar mods de tipos válidos
    if (![Type.ForgeMod, Type.LiteMod, Type.LiteLoader, Type.FabricMod].includes(type)) {
      continue
    }

    // Determinar si es requerido de forma segura
    let isRequired = true // Por defecto es requerido
    let requiredInfo: any = null

    try {
      if (typeof module.getRequired === 'function') {
        requiredInfo = module.getRequired()
        // Si required.value es false, entonces es opcional
        isRequired = requiredInfo?.value !== false
      } else {
        const required = module.rawModule?.required
        if (typeof required === 'boolean') {
          isRequired = required
        } else if (required && typeof required === 'object' && 'value' in required) {
          // Si required.value es false, entonces es opcional
          isRequired = required.value !== false
        }
      }
    } catch {
      isRequired = true // En caso de error, asumir requerido
    }

    // Obtener ID del módulo de forma segura
    let moduleId: string
    try {
      moduleId =
        typeof module.getVersionlessMavenIdentifier === 'function'
          ? module.getVersionlessMavenIdentifier()
          : module.rawModule?.id || `unknown_${Math.random()}`
    } catch {
      moduleId = module.rawModule?.id || `unknown_${Math.random()}`
    }

    // Determinar si está habilitado
    let isEnabled = isRequired // Los requeridos siempre están habilitados
    if (!isRequired && configMods[moduleId] !== undefined) {
      const conf = configMods[moduleId]
      isEnabled = typeof conf === 'object' ? conf.value : conf
    } else if (!isRequired) {
      isEnabled = requiredInfo?.def !== undefined ? requiredInfo.def : true
    }

    // Obtener versión de forma segura
    let version = '1.0.0'
    try {
      if (module.rawModule?.id) {
        const parts = module.rawModule.id.split(':')
        if (parts.length >= 3) {
          version = parts[2].split('@')[0]
        }
      }
    } catch {
      version = '1.0.0'
    }

    const mod: ServerMod = {
      id: moduleId,
      name: module.rawModule.name || module.rawModule.id || 'Mod desconocido',
      version: version,
      required: isRequired,
      enabled: isEnabled,
      description: undefined
    }

    if (isRequired) {
      required.push(mod)
    } else {
      optional.push(mod)
    }

    // Procesar submódulos recursivamente
    if (module.subModules?.length > 0) {
      const subModConfig =
        configMods[moduleId] && typeof configMods[moduleId] === 'object'
          ? (configMods[moduleId] as { mods?: ModConfigMods }).mods || {}
          : {}

      const subMods = processModules(module.subModules, subModConfig)
      required.push(...subMods.required)
      optional.push(...subMods.optional)
    }
  }

  return { required, optional }
}

/**
 * Construye la ruta del directorio de mods para un servidor específico
 */
export async function getModsDirectory(serverId: string): Promise<string> {
  const instanceDirResult = await window.api.config.getInstanceDirectory()
  if (!instanceDirResult.success) {
    throw new Error('Error obteniendo directorio de instancia')
  }

  const modsPath = [instanceDirResult.directory, serverId, 'mods'].join('/')
  return modsPath
}

/**
 * Valida si un archivo es un mod válido
 */
export function validateModFile(
  file: File,
  options: DndModsOptions = DEFAULT_DND_OPTIONS
): FileValidationResult {
  // Verificar extensión
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!options.acceptedTypes?.includes(extension)) {
    return {
      isValid: false,
      error: `Tipo no soportado: ${extension}`
    }
  }

  // Verificar tamaño
  const sizeInMB = file.size / (1024 * 1024)
  if (options.maxSize && sizeInMB > options.maxSize) {
    return {
      isValid: false,
      error: `Archivo muy grande (${Math.round(sizeInMB)}MB)`
    }
  }

  return { isValid: true }
}

/**
 * Detecta las capacidades de la plataforma
 */
export function detectPlatformCapabilities(): PlatformCapabilities {
  const userAgent = navigator.userAgent.toLowerCase()
  const isElectron = !!(window as any).api

  return {
    isWindows: userAgent.includes('win'),
    isMacOS: userAgent.includes('mac'),
    isLinux: userAgent.includes('linux'),
    isElectron,
    supportsFilePath: isElectron
  }
}

/**
 * Procesa archivos desde drag & drop y los convierte a ModFile[]
 */
export async function processFilesToModFiles(
  files: FileList,
  options: DndModsOptions = DEFAULT_DND_OPTIONS,
  platformCapabilities: PlatformCapabilities
): Promise<{ validFiles: ModFile[]; errors: string[] }> {
  const validFiles: ModFile[] = []
  const errors: string[] = []

  for (
    let i = 0;
    i < files.length && validFiles.length < (options.maxFiles || MAX_MODS_PER_UPLOAD);
    i++
  ) {
    const file = files[i]
    const validation = validateModFile(file, options)

    if (validation.isValid) {
      let filePath = (file as any).path

      // Si no tenemos path directo, crear archivo temporal
      if (!filePath && platformCapabilities.supportsFilePath) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const tempResult = await window.api.system.resolveFilePath(file.name, arrayBuffer)

          if (tempResult.success) {
            filePath = tempResult.path
          } else {
            errors.push(`${file.name}: Error creando archivo temporal`)
            continue
          }
        } catch {
          errors.push(`${file.name}: Error procesando archivo`)
          continue
        }
      }

      validFiles.push({
        id: `${file.name}-${Date.now()}-${i}`,
        name: file.name,
        path: filePath || `temp_${file.name}`,
        size: file.size,
        type: file.type || 'application/octet-stream'
      })
    } else {
      errors.push(`${file.name}: ${validation.error}`)
    }
  }

  return { validFiles, errors }
}
