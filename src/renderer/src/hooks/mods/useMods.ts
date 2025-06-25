import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import type { ModsData } from '../../types/mods'
import { getModsDirectory, processModules } from '../../utils/mods'
import { useServerData } from '../use-servers'

// Re-exportar hooks de mutaciones
export {
  useAddMods,
  useDeleteDropinMod,
  useToggleDropinMod,
  useToggleServerMod
} from './use-mods-mutations'

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

      const modConfig = modConfigResult.success ? modConfigResult.modConfiguration : { mods: {} }

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
