import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCurrentServer } from './useServers'

export interface LaunchState {
  stage:
    | 'idle'
    | 'validating'
    | 'java-scan'
    | 'java-download'
    | 'file-validation'
    | 'file-download'
    | 'launch-prep'
    | 'launching'
    | 'running'
    | 'error'
  progress: number
  details?: string
  error?: string
}

export const useGameLauncher = () => {
  const [launchState, setLaunchState] = useState<LaunchState>({
    stage: 'idle',
    progress: 0
  })

  const [gameLogs, setGameLogs] = useState<
    Array<{ type: 'stdout' | 'stderr'; message: string; timestamp: Date }>
  >([])
  const currentServer = useCurrentServer()

  // Configurar listeners de eventos de lanzamiento
  useEffect(() => {
    const handleProgress = (stage: string, progress: number, details?: string) => {
      setLaunchState({
        stage: stage as LaunchState['stage'],
        progress,
        details
      })
    }

    const handleError = (error: string) => {
      setLaunchState({
        stage: 'error',
        progress: 0,
        error
      })
      toast.error(error)
    }

    const handleSuccess = () => {
      setLaunchState({
        stage: 'running',
        progress: 100,
        details: 'Minecraft está ejecutándose'
      })
      toast.success('¡Minecraft iniciado exitosamente!')
    }

    const handleLog = (type: 'stdout' | 'stderr', data: string) => {
      setGameLogs((prev) => [
        ...prev.slice(-99),
        {
          type,
          message: data,
          timestamp: new Date()
        }
      ])
    }

    // Registrar listeners
    window.api.launch.onProgress(handleProgress)
    window.api.launch.onError(handleError)
    window.api.launch.onSuccess(handleSuccess)
    window.api.launch.onLog(handleLog)

    // Cleanup
    return () => {
      window.api.launch.removeProgressListener()
      window.api.launch.removeErrorListener()
      window.api.launch.removeSuccessListener()
      window.api.launch.removeLogListener()
    }
  }, [])

  // Mutation para el proceso completo de lanzamiento
  const launchMutation = useMutation({
    mutationFn: async () => {
      // 1. Validación inicial
      setLaunchState({ stage: 'validating', progress: 0, details: 'Validando prerrequisitos...' })

      const validation = await window.api.process.validateLaunch()
      if (!validation.success) {
        throw new Error(validation.error || 'Error en validación inicial')
      }

      // Verificar que tengamos un servidor
      if (!currentServer?.rawServer?.id) {
        throw new Error('No hay servidor seleccionado. Por favor selecciona un servidor.')
      }

      const serverId = currentServer.rawServer.id

      // 2. Escaneo del sistema (Java)
      const javaResult = await window.api.process.systemScan(serverId)
      if (!javaResult.success) {
        throw new Error(javaResult.error || 'Error en escaneo de Java')
      }

      // 3. Descargar Java si es necesario
      if (javaResult.needsDownload) {
        const downloadResult = await window.api.process.downloadJava(serverId)
        if (!downloadResult.success) {
          throw new Error(downloadResult.error || 'Error descargando Java')
        }
      }

      // 4. Validar y descargar archivos (usando una sola instancia de FullRepair como en el código original)
      const validateAndDownloadResult = await window.api.process.validateAndDownload(serverId)
      if (!validateAndDownloadResult.success) {
        throw new Error(validateAndDownloadResult.error || 'Error validando y descargando archivos')
      }

      console.log(
        `[GameLauncher] Validación y descarga completadas. Archivos inválidos iniciales: ${validateAndDownloadResult.invalidFileCount}, descarga realizada: ${validateAndDownloadResult.downloadPerformed}`
      )

      // 5. Preparar lanzamiento
      const prepResult = await window.api.process.prepareLaunch(serverId)
      if (!prepResult.success) {
        throw new Error(prepResult.error || 'Error preparando lanzamiento')
      }

      console.log('Pasó los resultados de prepareLaunch:', prepResult)

      // 6. Lanzar juego
      const launchResult = await window.api.process.launchGame(prepResult)
      if (!launchResult.success) {
        throw new Error(launchResult.error || 'Error lanzando Minecraft')
      }

      return launchResult
    },
    onError: (error) => {
      setLaunchState({
        stage: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
      toast.error(error instanceof Error ? error.message : 'Error desconocido')
    },
    onSuccess: () => {
      setLaunchState({
        stage: 'running',
        progress: 100,
        details: 'Minecraft iniciado exitosamente'
      })
    }
  })

  // Mutation para terminar el juego
  const killMutation = useMutation({
    mutationFn: async () => {
      const result = await window.api.process.killProcess()
      if (!result.success) {
        throw new Error(result.error || 'Error terminando proceso')
      }
      return result
    },
    onSuccess: () => {
      setLaunchState({
        stage: 'idle',
        progress: 0,
        details: undefined
      })
      toast.success('Minecraft terminado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error terminando proceso')
    }
  })

  // Funciones públicas
  const launchGame = useCallback(() => {
    if (!currentServer) {
      toast.error('No hay servidor seleccionado. Por favor selecciona un servidor.')
      return
    }
    launchMutation.mutate()
  }, [launchMutation, currentServer])

  const killGame = useCallback(() => {
    killMutation.mutate()
  }, [killMutation])

  // Estados derivados
  const isLaunching = launchMutation.isPending
  const isGameRunning = launchState.stage === 'running'
  const canLaunch = !isLaunching && !isGameRunning && !!currentServer
  const progressPercentage = launchState.progress
  const currentStage = launchState.stage
  const stageDetails = launchState.details
  const launchError = launchState.error

  return {
    // Funciones
    launchGame,
    killGame,

    // Estados
    canLaunch,
    isLaunching,
    isGameRunning,
    progressPercentage,
    currentStage,
    stageDetails,
    launchError,

    // Datos
    gameLogs,
    currentServer
  }
}
