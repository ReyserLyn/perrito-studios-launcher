import { useQuery } from '@tanstack/react-query'
import { HeliosDistribution } from 'perrito-core/dist/common/distribution/DistributionFactory'

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

/*
export const useServerStatus = (serverId: string) => {
  return useQuery({
    queryKey: ['serverStatus', serverId],
    queryFn: async () => {
      const result = await window.api.server.getStatus(serverId)
      if (!result.success) throw new Error(result.error)
      return result.status
    },
    refetchInterval: 30000, // Poll cada 30 segundos
    retry: 1, // Solo 1 retry para server status
    enabled: !!serverId
  })
}

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

  return {
    // Estados de carga
    isLoading: distribution.isLoading,
    isError: distribution.isError,

    // Datos
    distribution: distribution.data,
    serverList: servers.data,

    // Funciones
    refetch: () => {
      distribution.refetch()
      servers.refetch()
    }
  }
}
