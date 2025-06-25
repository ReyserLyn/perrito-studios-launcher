import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Type } from 'helios-distribution-types'
import { HeliosModule } from 'perrito-core/common'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import { useServerData } from '../use-servers'

// ===== TIPOS =====

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

// ===== HOOKS DE CONSULTA =====

/**
 * Hook para obtener los mods del servidor actual (requeridos y opcionales)
 */
export const useServerMods = () => {
  const { currentServer } = useServerData()

  return useQuery({
    queryKey: queryKeys.mods.serverMods(currentServer?.rawServer.id || ''),
    queryFn: async (): Promise<{ required: ServerMod[]; optional: ServerMod[] }> => {
      if (!currentServer) {
        return { required: [], optional: [] }
      }

      // Obtener configuración de mods guardada
      const modConfigResult = await window.api.config.getModConfiguration(
        currentServer.rawServer.id
      )
      const modConfig = modConfigResult.success ? modConfigResult.modConfiguration : null

      const required: ServerMod[] = []
      const optional: ServerMod[] = []

      // Función recursiva para procesar módulos y submódulos
      const processModules = (modules: HeliosModule[], configMods: any = {}) => {
        for (const module of modules) {
          // Verificación de seguridad
          if (!module || !module.rawModule) {
            console.warn('Módulo inválido encontrado:', module)
            continue
          }

          const type = module.rawModule.type

          // Solo procesar mods usando los tipos correctos de Helios
          if (
            type === Type.ForgeMod ||
            type === Type.LiteMod ||
            type === Type.LiteLoader ||
            type === Type.FabricMod
          ) {
            // Verificación segura para getRequired
            let requiredInfo
            let isRequired = false

            try {
              if (typeof module.getRequired === 'function') {
                requiredInfo = module.getRequired()
                isRequired = requiredInfo?.value || false
              } else {
                // Manejo seguro del tipo Required
                const required = module.rawModule?.required
                if (typeof required === 'boolean') {
                  isRequired = required
                } else if (required && typeof required === 'object' && 'value' in required) {
                  isRequired = required.value || false
                } else {
                  isRequired = false
                }
              }
            } catch {
              // Error obteniendo información de required, usar valor por defecto
              isRequired = false
            }

            // Verificación segura para getVersionlessMavenIdentifier
            let moduleId
            try {
              if (typeof module.getVersionlessMavenIdentifier === 'function') {
                moduleId = module.getVersionlessMavenIdentifier()
              } else {
                moduleId = module.rawModule?.id || `unknown_${Math.random()}`
              }
            } catch {
              // Error obteniendo ID, usar valor por defecto
              moduleId = module.rawModule?.id || `unknown_${Math.random()}`
            }

            // Determinar si el mod opcional está habilitado
            let isEnabled = isRequired // Los requeridos siempre están habilitados
            if (!isRequired && configMods && configMods[moduleId] !== undefined) {
              const conf = configMods[moduleId]
              isEnabled = typeof conf === 'object' ? conf.value : conf
            } else if (!isRequired) {
              // Valor por defecto si no hay configuración guardada
              isEnabled = requiredInfo?.def !== undefined ? requiredInfo.def : true
            }

            // Obtener versión de forma segura sin usar propiedades privadas
            let version = '1.0.0'
            try {
              if (module.rawModule?.id) {
                const parts = module.rawModule.id.split(':')
                if (parts.length >= 3) {
                  version = parts[2].split('@')[0] // Remover extensión si existe
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
              description: undefined // No usar propiedades que no existen
            }

            if (isRequired) {
              required.push(mod)
            } else {
              optional.push(mod)
            }

            // Procesar submódulos recursivamente
            if (
              module.subModules &&
              Array.isArray(module.subModules) &&
              module.subModules.length > 0
            ) {
              const subModConfig =
                configMods && configMods[moduleId] && typeof configMods[moduleId] === 'object'
                  ? configMods[moduleId].mods || {}
                  : {}
              processModules(module.subModules, subModConfig)
            }
          }
        }
      }

      processModules(currentServer.modules, modConfig?.mods)

      return { required, optional }
    },
    enabled: !!currentServer,
    staleTime: 5 * 60 * 1000 // 5 minutos
  })
}

/**
 * Hook para obtener mods drop-in del directorio local
 */
export const useDropinMods = () => {
  const { currentServer } = useServerData()

  return useQuery({
    queryKey: queryKeys.mods.dropinList(currentServer?.rawServer.id || ''),
    queryFn: async (): Promise<DropinMod[]> => {
      if (!currentServer) {
        return []
      }

      // Obtener el directorio de instancia y construir la ruta de mods
      const instanceDirResult = await window.api.config.getInstanceDirectory()
      if (!instanceDirResult.success) {
        throw new Error('No se pudo obtener el directorio de instancia')
      }

      const modsDir = `${instanceDirResult.directory}/${currentServer.rawServer.id}/mods`
      const result = await window.api.mods.scanMods(
        modsDir,
        currentServer.rawServer.minecraftVersion
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.mods
    },
    enabled: !!currentServer,
    staleTime: 2 * 60 * 1000 // 2 minutos (más frecuente porque pueden cambiar)
  })
}

/**
 * Hook para obtener estadísticas de mods drop-in
 */
export const useModStats = () => {
  const { currentServer } = useServerData()

  return useQuery({
    queryKey: queryKeys.mods.stats(
      currentServer?.rawServer.id || '',
      currentServer?.rawServer.minecraftVersion || ''
    ),
    queryFn: async (): Promise<ModStats> => {
      if (!currentServer) {
        return { total: 0, enabled: 0, disabled: 0, byExtension: {} }
      }

      // Obtener el directorio de instancia y construir la ruta de mods
      const instanceDirResult = await window.api.config.getInstanceDirectory()
      if (!instanceDirResult.success) {
        throw new Error('No se pudo obtener el directorio de instancia')
      }

      const modsDir = `${instanceDirResult.directory}/${currentServer.rawServer.id}/mods`
      const result = await window.api.mods.getModStats(
        modsDir,
        currentServer.rawServer.minecraftVersion
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.stats
    },
    enabled: !!currentServer,
    staleTime: 2 * 60 * 1000
  })
}

// ===== HOOKS DE MUTACIÓN =====

/**
 * Hook para alternar el estado de un mod drop-in
 */
export const useToggleDropinMod = () => {
  const queryClient = useQueryClient()
  const { currentServer } = useServerData()

  return useMutation({
    mutationFn: async ({ fullName, enable }: { fullName: string; enable: boolean }) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      // Obtener el directorio de instancia y construir la ruta de mods
      const instanceDirResult = await window.api.config.getInstanceDirectory()
      if (!instanceDirResult.success) {
        throw new Error('No se pudo obtener el directorio de instancia')
      }

      const modsDir = `${instanceDirResult.directory}/${currentServer.rawServer.id}/mods`
      const result = await window.api.mods.toggleMod(modsDir, fullName, enable)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      // Invalidar la query combinada optimizada
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.mods.all, 'combined', currentServer?.rawServer.id || '']
      })
      toast.success('Estado del mod actualizado')
    },
    onError: (error) => {
      console.error('[useToggleDropinMod] Error:', error)
      toast.error('Error al cambiar el estado del mod')
    }
  })
}

/**
 * Hook para eliminar un mod drop-in
 */
export const useDeleteDropinMod = () => {
  const queryClient = useQueryClient()
  const { currentServer } = useServerData()

  return useMutation({
    mutationFn: async (fullName: string) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      // Obtener el directorio de instancia y construir la ruta de mods
      const instanceDirResult = await window.api.config.getInstanceDirectory()
      if (!instanceDirResult.success) {
        throw new Error('No se pudo obtener el directorio de instancia')
      }

      const modsDir = `${instanceDirResult.directory}/${currentServer.rawServer.id}/mods`
      const result = await window.api.mods.deleteMod(modsDir, fullName)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      // Invalidar la query combinada optimizada
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.mods.all, 'combined', currentServer?.rawServer.id || '']
      })
      toast.success('Mod eliminado exitosamente')
    },
    onError: (error) => {
      console.error('[useDeleteDropinMod] Error:', error)
      toast.error('Error al eliminar el mod')
    }
  })
}

/**
 * Hook para alternar el estado de un mod opcional del servidor
 */
export const useToggleServerMod = () => {
  const queryClient = useQueryClient()
  const { currentServer } = useServerData()

  return useMutation({
    mutationFn: async ({ modId, enabled }: { modId: string; enabled: boolean }) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      // Obtener configuración actual de mods con manejo super seguro
      const configResult = await window.api.config.getModConfiguration(currentServer.rawServer.id)

      if (!configResult.success) {
        throw new Error(configResult.error || 'Error obteniendo configuración de mods')
      }

      // Asegurar que siempre tenemos un objeto válido
      let modConfig = configResult.modConfiguration
      if (!modConfig || typeof modConfig !== 'object') {
        modConfig = { mods: {} }
      }
      if (!modConfig.mods || typeof modConfig.mods !== 'object') {
        modConfig.mods = {}
      }

      // LÓGICA EXACTA del código original: manejar tanto boolean como object
      const existingConfig = modConfig.mods[modId]
      if (typeof existingConfig === 'object' && existingConfig !== null) {
        // Si ya es un objeto (con submódulos), mantener la estructura y solo cambiar .value
        modConfig.mods[modId] = {
          ...existingConfig,
          value: enabled
        }
      } else {
        // Si es boolean o no existe, guardarlo como boolean simple
        modConfig.mods[modId] = enabled
      }

      // Guardar la configuración actualizada
      const saveResult = await window.api.config.setModConfiguration(
        currentServer.rawServer.id,
        modConfig
      )

      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }

      // Guardar la configuración general
      await window.api.config.save()
    },
    onSuccess: () => {
      // Invalidar la query combinada optimizada
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.mods.all, 'combined', currentServer?.rawServer.id || '']
      })
      toast.success('Configuración de mod actualizada')
    },
    onError: (error) => {
      console.error('[useToggleServerMod] Error:', error)
      toast.error('Error al cambiar la configuración del mod')
    }
  })
}

// ===== HOOK COMBINADO =====

/**
 * Hook principal que combina toda la información de mods de forma optimizada
 */
export const useModsData = () => {
  const { currentServer } = useServerData()

  return useQuery({
    queryKey: [...queryKeys.mods.all, 'combined', currentServer?.rawServer.id || ''],
    queryFn: async () => {
      if (!currentServer) {
        return {
          required: [],
          optional: [],
          dropinMods: [],
          modStats: { total: 0, enabled: 0, disabled: 0, byExtension: {} }
        }
      }

      try {
        // Ejecutar todas las operaciones en paralelo para mejor performance
        const [modConfigResult, instanceDirResult] = await Promise.all([
          window.api.config.getModConfiguration(currentServer.rawServer.id),
          window.api.config.getInstanceDirectory()
        ])

        const modConfig =
          modConfigResult.success && modConfigResult.modConfiguration
            ? modConfigResult.modConfiguration
            : { mods: {} }

        if (!instanceDirResult.success) {
          throw new Error('No se pudo obtener el directorio de instancia')
        }

        const modsDir = `${instanceDirResult.directory}/${currentServer.rawServer.id}/mods`

        // Obtener mods drop-in y estadísticas en paralelo
        const [dropinResult, statsResult] = await Promise.all([
          window.api.mods.scanMods(modsDir, currentServer.rawServer.minecraftVersion),
          window.api.mods.getModStats(modsDir, currentServer.rawServer.minecraftVersion)
        ])

        // Procesar mods del servidor de forma simplificada
        const required: ServerMod[] = []
        const optional: ServerMod[] = []

        // Función adaptada del processModules original pero con manejo de errores seguro
        const processModulesSimple = (modules: any[], configMods: any = {}) => {
          for (const module of modules) {
            // Verificación de seguridad igual que en la función original
            if (!module || !module.rawModule) {
              console.warn('Módulo inválido encontrado:', module)
              continue
            }

            const type = module.rawModule.type

            // Solo procesar mods usando los tipos correctos de Helios
            if (
              type === Type.ForgeMod ||
              type === Type.LiteMod ||
              type === Type.LiteLoader ||
              type === Type.FabricMod
            ) {
              // Determinar si es requerido basándose en los datos reales del log
              let isRequired = false
              let requiredInfo

              // Lógica corregida basada en los logs reales
              if (module.rawModule?.required !== undefined) {
                if (typeof module.rawModule.required === 'boolean') {
                  isRequired = module.rawModule.required
                } else if (typeof module.rawModule.required === 'object') {
                  // Basado en el log: required.value === false significa OPCIONAL
                  // Si no tiene .value o .value === true, entonces es REQUERIDO
                  isRequired = module.rawModule.required.value === true
                }
              } else {
                // Si no tiene required definido, por defecto es requerido (según distribución estándar)
                isRequired = true
              }

              // Intentar obtener requiredInfo solo si es seguro
              try {
                if (typeof module.getRequired === 'function') {
                  requiredInfo = module.getRequired()
                }
              } catch {
                // Ignorar error silenciosamente, usar rawModule.required directamente
              }

              // Verificación segura para getVersionlessMavenIdentifier (igual que la función original)
              let moduleId
              try {
                if (typeof module.getVersionlessMavenIdentifier === 'function') {
                  moduleId = module.getVersionlessMavenIdentifier()
                } else {
                  moduleId = module.rawModule?.id || `unknown_${Math.random()}`
                }
              } catch {
                // Error obteniendo ID, usar valor por defecto
                moduleId = module.rawModule?.id || `unknown_${Math.random()}`
              }

              // Determinar si el mod opcional está habilitado (IGUAL que la implementación original)
              let isEnabled = isRequired // Los requeridos siempre están habilitados
              if (!isRequired && configMods && configMods[moduleId] !== undefined) {
                const conf = configMods[moduleId]
                // LÓGICA EXACTA del código original: soportar tanto boolean como object
                isEnabled = typeof conf === 'object' ? conf.value : conf
              } else if (!isRequired) {
                // Valor por defecto si no hay configuración guardada
                isEnabled = requiredInfo?.def !== undefined ? requiredInfo.def : true
              }

              // Obtener versión de forma segura (igual que el código original)
              let version = '1.0.0'
              try {
                // Intentar obtener la versión del maven identifier como en el código original
                if (module.rawModule?.id) {
                  const parts = module.rawModule.id.split(':')
                  if (parts.length >= 3) {
                    version = parts[2].split('@')[0] // Remover extensión si existe
                  }
                }
              } catch {
                // Error obteniendo versión, usar valor por defecto
              }

              const mod: ServerMod = {
                id: moduleId,
                name: module.rawModule.name || module.rawModule.id || 'Mod desconocido',
                version: version,
                required: isRequired,
                enabled: isEnabled,
                description: module.rawModule.description || undefined
              }

              console.log('Mod creado:', {
                id: mod.id,
                name: mod.name,
                version: mod.version,
                required: mod.required,
                enabled: mod.enabled
              })

              if (isRequired) {
                required.push(mod)
              } else {
                optional.push(mod)
              }

              // Procesar submódulos recursivamente (igual que la función original)
              if (
                module.subModules &&
                Array.isArray(module.subModules) &&
                module.subModules.length > 0
              ) {
                const subModConfig =
                  configMods && configMods[moduleId] && typeof configMods[moduleId] === 'object'
                    ? configMods[moduleId].mods || {}
                    : {}
                processModulesSimple(module.subModules, subModConfig)
              }
            }
          }
        }

        // Procesar módulos si existen
        if (currentServer.modules && Array.isArray(currentServer.modules)) {
          processModulesSimple(currentServer.modules, modConfig?.mods)
        }

        return {
          required,
          optional,
          dropinMods: dropinResult.success ? dropinResult.mods : [],
          modStats: statsResult.success
            ? statsResult.stats
            : { total: 0, enabled: 0, disabled: 0, byExtension: {} }
        }
      } catch (error) {
        console.error('[useModsData] Error:', error)
        throw error
      }
    },
    enabled: !!currentServer,
    staleTime: 3 * 60 * 1000, // 3 minutos
    select: (data) => ({
      // Datos de mods del servidor
      requiredMods: data.required,
      optionalMods: data.optional,

      // Datos de mods drop-in
      dropinMods: data.dropinMods,
      modStats: data.modStats
    })
  })
}
