/**
 * Utilidades para el manejo de mods
 */
import { Type } from 'helios-distribution-types'
import { HeliosModule } from 'perrito-core/common'
import type { ModConfigMods, ServerMod } from '../types/mods'

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
 * Obtiene el directorio de mods para el servidor actual
 */
export const getModsDirectory = async (serverId: string): Promise<string> => {
  const instanceDirResult = await window.api.config.getInstanceDirectory()
  if (!instanceDirResult.success) {
    throw new Error('No se pudo obtener el directorio de instancia')
  }
  return `${instanceDirResult.directory}/${serverId}/mods`
}
