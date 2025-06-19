import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// Hook para obtener la distribución de servidores
export const useDistribution = () => {
  return useQuery({
    queryKey: queryKeys.distribution.list(),
    queryFn: async () => {
      const result = await window.api.distribution.getDistribution()
      if (result.success) {
        return result.distribution
      }
      throw new Error(result.error || 'Error obteniendo distribución')
    },
    staleTime: 10 * 60 * 1000 // 10 minutos antes de considerar stale
  })
}

// Hook para refrescar la distribución
export const useRefreshDistribution = () => {
  const queryClient = useQueryClient()
  const { addNotification } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      const result = await window.api.distribution.refreshDistribution()
      if (!result.success) {
        throw new Error(result.error || 'Error refrescando distribución')
      }
      return result.distribution
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.distribution.all })

      addNotification({
        type: 'success',
        message: 'Lista de servidores actualizada'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: `Error actualizando servidores: ${error.message}`
      })
    }
  })
}

// Hook para obtener un servidor específico
export const useServer = (serverId: string) => {
  return useQuery({
    queryKey: queryKeys.distribution.detail(serverId),
    queryFn: async () => {
      const result = await window.api.distribution.getServerById(serverId)
      if (result.success) {
        return result.server
      }
      throw new Error(result.error || 'Error obteniendo servidor')
    },
    enabled: !!serverId
  })
}

// Hook para obtener el servidor principal
export const useMainServer = () => {
  return useQuery({
    queryKey: queryKeys.distribution.mainServer(),
    queryFn: async () => {
      const result = await window.api.distribution.getMainServer()
      if (result.success) {
        return result.server
      }
      throw new Error(result.error || 'Error obteniendo servidor principal')
    }
  })
}

// Hook para obtener lista de servidores simplificada
export const useServerList = () => {
  const distribution = useDistribution()

  return {
    ...distribution,
    data: distribution.data ? extractServerList(distribution.data) : undefined
  }
}

// Función auxiliar para extraer lista de servidores
function extractServerList(distribution: any) {
  if (!distribution || !distribution.servers) {
    return []
  }

  return distribution.servers.map((server: any) => ({
    id: server.rawServer?.id || server.id,
    name: server.rawServer?.name || server.name,
    description: server.rawServer?.description || server.description,
    icon: server.rawServer?.icon || server.icon,
    version: server.rawServer?.minecraftVersion || server.version,
    address: server.rawServer?.address || server.address,
    mainServer: server.rawServer?.mainServer || false
  }))
}

// Hook combinado para toda la información de servidores
export const useServerData = (serverId?: string) => {
  const distribution = useDistribution()
  const mainServer = useMainServer()
  const currentServer = useServer(serverId || '')
  const { config } = useAppStore()

  // Determinar servidor activo
  const activeServerId = serverId || config.selectedServer || mainServer.data?.rawServer?.id
  const activeServer = activeServerId ? currentServer.data : mainServer.data

  return {
    // Estados de carga
    isLoading: distribution.isLoading || mainServer.isLoading,
    isError: distribution.isError || mainServer.isError,

    // Datos
    distribution: distribution.data,
    serverList: distribution.data ? extractServerList(distribution.data) : [],
    mainServer: mainServer.data,
    activeServer,
    activeServerId,

    // Funciones
    refetch: () => {
      distribution.refetch()
      mainServer.refetch()
      if (activeServerId) currentServer.refetch()
    }
  }
}
