import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import type { ModConfiguration, ModsData } from '../../types/mods'
import { getModsDirectory, processModules } from '../../utils/mods'
import { useServerData } from '../use-servers'

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

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.toggleMod(modsDir, fullName, enable)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
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

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.deleteMod(modsDir, fullName)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
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

      // Obtener configuración actual
      const configResult = await window.api.config.getModConfiguration(currentServer.rawServer.id)
      if (!configResult.success) {
        throw new Error(configResult.error || 'Error obteniendo configuración de mods')
      }

      // Preparar configuración de mods
      const modConfig: ModConfiguration = configResult.modConfiguration || { mods: {} }
      if (!modConfig.mods) {
        modConfig.mods = {}
      }

      // Actualizar configuración según el tipo existente
      const existingConfig = modConfig.mods[modId]
      if (typeof existingConfig === 'object' && existingConfig !== null) {
        // Mantener estructura de objeto para submódulos
        modConfig.mods[modId] = { ...existingConfig, value: enabled }
      } else {
        // Guardar como boolean simple
        modConfig.mods[modId] = enabled
      }

      // Guardar configuración
      const saveResult = await window.api.config.setModConfiguration(
        currentServer.rawServer.id,
        modConfig
      )
      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }

      await window.api.config.save()
    },
    onSuccess: () => {
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

// ===== HOOK PRINCIPAL =====

/**
 * Hook principal que obtiene toda la información de mods de forma optimizada
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

      // Ejecutar operaciones en paralelo para mejor rendimiento
      const [modConfigResult, modsDir] = await Promise.all([
        window.api.config.getModConfiguration(currentServer.rawServer.id),
        getModsDirectory(currentServer.rawServer.id)
      ])

      const modConfig: ModConfiguration = modConfigResult.success
        ? modConfigResult.modConfiguration
        : { mods: {} }

      // Obtener datos de mods drop-in en paralelo
      const [dropinResult, statsResult] = await Promise.all([
        window.api.mods.scanMods(modsDir, currentServer.rawServer.minecraftVersion),
        window.api.mods.getModStats(modsDir, currentServer.rawServer.minecraftVersion)
      ])

      // Procesar mods del servidor
      const { required, optional } = processModules(currentServer.modules, modConfig.mods)

      return {
        required,
        optional,
        dropinMods: dropinResult.success ? dropinResult.mods : [],
        modStats: statsResult.success
          ? statsResult.stats
          : { total: 0, enabled: 0, disabled: 0, byExtension: {} }
      }
    },
    enabled: !!currentServer,
    staleTime: 3 * 60 * 1000,
    select: (data): ModsData => ({
      requiredMods: data.required,
      optionalMods: data.optional,
      dropinMods: data.dropinMods,
      modStats: data.modStats
    })
  })
}
