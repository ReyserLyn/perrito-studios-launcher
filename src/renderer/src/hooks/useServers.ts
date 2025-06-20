import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  HeliosDistribution,
  HeliosServer
} from 'perrito-core/dist/common/distribution/DistributionFactory'

// Hook para obtener la distribución de servidores
export const useDistribution = () => {
  return useQuery<HeliosDistribution>({
    queryKey: ['distribution'],
    queryFn: async () => {
      const result = await window.api.distribution.getDistribution()

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo distribución')
      }

      return result.distribution as HeliosDistribution
    },
    staleTime: 10 * 60 * 1000,
    retry: 2
  })
}

// Hook para obtener todos los servidores
export const useAllServers = () => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const result = await window.api.distribution.getDistribution()

      if (!result.success) {
        throw new Error(result.error || 'No se encontraron servidores')
      }

      return result.distribution.servers || []
    }
  })
}

// Hook para obtener el ID del servidor seleccionado
export const useGetIdSelectedServer = () => {
  return useQuery({
    queryKey: ['selectedServer'],
    queryFn: async () => {
      const result = await window.api.config.getSelectedServer()

      if (!result.success) {
        throw new Error(result.error || 'Error obteniendo servidor seleccionado')
      }

      return result.selectedServer
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  })
}

// Hook para obtener el servidor actual
export const useCurrentServer = (): HeliosServer | undefined => {
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

  return useQuery({
    queryKey: ['currentServerStatus', currentServer?.rawServer?.id],
    queryFn: async () => {
      if (!currentServer?.rawServer) {
        return {
          status: 'offline' as const,
          players: { online: 0, max: 0, label: 'Sin servidor' },
          version: 'Desconocido',
          motd: 'No hay servidor seleccionado'
        }
      }

      const result = await window.api.server.getStatus(
        currentServer.hostname,
        currentServer.port || 25565
      )

      return result.status
    },
    enabled: true,
    refetchInterval: currentServer?.rawServer ? 30000 : false,
    retry: 1,
    staleTime: 25000
  })
}

/*

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const result = await window.api.news.getNews()
      if (!result.success) throw new Error(result.error)
      return result.articles
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2
  })
}

// Hook para validar archivos durante el launch
export const useFileValidation = () => {
  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await window.api.launcher.validateFiles(serverId)
      if (!result.success) throw new Error(result.error)
      return result
    },
    onSuccess: (data) => {
      console.log('Files validated:', data)
    }
  })
}
*/

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

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await window.api.config.setSelectedServer(serverId)

      if (!result.success) {
        throw new Error(result.error || 'Error estableciendo servidor seleccionado')
      }

      return result
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['selectedServer'] })
    }
  })
}
