import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from './use-translation'

// Hook para obtener la distribución de servidores
export const useDistribution = () => {
  const { t } = useTranslation()

  return useQuery({
    queryKey: ['distribution'],
    queryFn: async () => {
      const result = await window.api.distribution.getDistribution()

      if (!result.success) {
        throw new Error(result.error || t('server.error.get-distribution'))
      }

      return result.distribution
    },
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

// Hook para obtener todos los servidores
export const useAllServers = () => {
  const { t } = useTranslation()

  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const result = await window.api.distribution.getDistribution()

      if (!result.success) {
        throw new Error(result.error || t('server.error.no-servers'))
      }

      return result.distribution.servers || []
    }
  })
}

// Hook para obtener el ID del servidor seleccionado
export const useGetIdSelectedServer = () => {
  const { t } = useTranslation()

  return useQuery({
    queryKey: ['selectedServer'],
    queryFn: async () => {
      const result = await window.api.config.getSelectedServer()

      if (!result.success) {
        throw new Error(result.error || t('server.error.no-selected'))
      }

      return result.selectedServer
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  })
}

// Hook para obtener el servidor actual
export const useCurrentServer = () => {
  const idSelectedServer = useGetIdSelectedServer()
  const serverList = useAllServers()

  const selectedServer = serverList.data?.find(
    (server) => server.rawServer?.id === idSelectedServer.data
  )

  if (!selectedServer && serverList.data && serverList.data.length > 0) {
    return serverList.data[0]
  }

  return selectedServer
}

// Hook para obtener el estado del servidor actual
export const useCurrentServerStatus = () => {
  const currentServer = useCurrentServer()
  const { t } = useTranslation()

  return useQuery({
    queryKey: ['currentServerStatus', currentServer?.rawServer?.id],
    queryFn: async () => {
      if (!currentServer?.rawServer) {
        return {
          status: 'offline' as const,
          players: { online: 0, max: 0, label: t('server.status.no-selected') },
          version: t('server.status.unknown'),
          motd: t('server.status.no-selected')
        }
      }

      try {
        const result = await window.api.server.getStatus(
          currentServer.hostname,
          currentServer.port || 25565
        )
        return result.status
      } catch (error) {
        // Si hay error de conexión, devolver estado offline sin hacer throw
        console.warn('[useCurrentServerStatus] Error obteniendo estado del servidor:', error)
        return {
          status: 'offline' as const,
          players: { online: 0, max: 0, label: t('server.status.connection-lost') },
          version: t('server.status.unknown'),
          motd: t('server.status.connection-error')
        }
      }
    },
    enabled: true,
    refetchInterval: currentServer?.rawServer ? 45000 : false,
    retry: 1,
    retryDelay: 5000,
    staleTime: 40000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true
  })
}

// Hook combinado para toda la información de servidores
export const useServerData = () => {
  const distribution = useDistribution()
  const servers = useAllServers()
  const idSelectedServer = useGetIdSelectedServer()
  const currentServer = useCurrentServer()
  const currentServerStatus = useCurrentServerStatus()

  return {
    // Estados de carga
    isLoading: distribution.isLoading,
    isError: distribution.isError,

    // Datos
    distribution: distribution.data,
    serverList: servers.data,
    idSelectedServer: idSelectedServer.data,
    currentServer: currentServer,
    currentServerStatus: currentServerStatus.data,

    // Funciones
    refetch: () => {
      distribution.refetch()
      servers.refetch()
      idSelectedServer.refetch()
      currentServerStatus.refetch()
    }
  }
}

export const useSetSelectedServer = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await window.api.config.setSelectedServer(serverId)

      if (!result.success) {
        throw new Error(result.error || t('server.error.set-selected'))
      }

      return result
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['selectedServer'] })
    }
  })
}
