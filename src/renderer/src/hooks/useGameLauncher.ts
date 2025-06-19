import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// Hook para obtener el estado del proceso del juego
export const useGameProcess = () => {
  const { setGameRunning } = useAppStore()

  return useQuery({
    queryKey: queryKeys.process.status,
    queryFn: async () => {
      const result = await window.api.process.getProcessStatus()
      if (result.success) {
        setGameRunning(result.isRunning, result.processId)
        return {
          isRunning: result.isRunning,
          processId: result.processId
        }
      }
      throw new Error(result.error || 'Error obteniendo estado del proceso')
    },
    refetchInterval: (query) => (query.state.data?.isRunning ? 5000 : false) // Poll cada 5s si está corriendo
  })
}

// Hook para lanzar el juego
export const useLaunchGame = () => {
  const queryClient = useQueryClient()
  const { addNotification, setGameRunning, setLoading } = useAppStore()

  return useMutation({
    mutationFn: async (options: {
      serverId: string
      authUser: any
      distroServer: any
      vanillaManifest: any
      modManifest: any
    }) => {
      setLoading(true)

      const result = await window.api.process.launchGame({
        distroServer: options.distroServer,
        vanillaManifest: options.vanillaManifest,
        modManifest: options.modManifest,
        authUser: options.authUser,
        launcherVersion: '1.0.0' // O obtener de package.json
      })

      if (!result.success) {
        throw new Error(result.error || 'Error lanzando el juego')
      }

      return result
    },
    onSuccess: (data) => {
      setGameRunning(true, data.processId)
      setLoading(false)

      // Invalidar estado del proceso
      queryClient.invalidateQueries({ queryKey: queryKeys.process.status })

      addNotification({
        type: 'success',
        message: '¡Juego lanzado exitosamente!'
      })

      // Configurar Discord RPC si está disponible
      window.api.discord.updateDetails('En el juego')
    },
    onError: (error: Error) => {
      setLoading(false)
      setGameRunning(false)

      addNotification({
        type: 'error',
        message: `Error lanzando el juego: ${error.message}`
      })
    }
  })
}

// Hook para matar el proceso del juego
export const useKillGame = () => {
  const queryClient = useQueryClient()
  const { addNotification, setGameRunning } = useAppStore()

  return useMutation({
    mutationFn: async () => {
      const result = await window.api.process.killProcess()
      if (!result.success) {
        throw new Error(result.error || 'Error terminando el juego')
      }
      return result
    },
    onSuccess: () => {
      setGameRunning(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.process.status })

      addNotification({
        type: 'success',
        message: 'Juego terminado exitosamente'
      })

      // Actualizar Discord RPC
      window.api.discord.updateDetails('En el launcher')
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook compuesto para controlar el juego fácilmente
export const useGameControl = () => {
  const gameProcess = useGameProcess()
  const launchGame = useLaunchGame()
  const killGame = useKillGame()

  return {
    // Estado
    isRunning: gameProcess.data?.isRunning || false,
    processId: gameProcess.data?.processId || null,
    isLoading: gameProcess.isLoading,

    // Acciones
    launch: launchGame.mutate,
    kill: killGame.mutate,

    // Estados de las mutaciones
    isLaunching: launchGame.isPending,
    isKilling: killGame.isPending,

    // Errores
    launchError: launchGame.error,
    killError: killGame.error,

    // Refetch manual
    refetch: gameProcess.refetch
  }
}
