import { useMutation } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCurrentServer } from './use-servers'
import { useTranslation } from './use-translation'

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
  const { t } = useTranslation()

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
        details: t('game.success.launching-game')
      })
      toast.success(t('game.success.launching-game'))
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
  }, [t])

  // Mutation para el proceso completo de lanzamiento
  const launchMutation = useMutation({
    mutationFn: async () => {
      // 1. Validación inicial
      setLaunchState({
        stage: 'validating',
        progress: 0,
        details: t('game.status.validating')
      })

      const validation = await window.api.process.validateLaunch()
      if (!validation.success) {
        throw new Error(validation.error || t('game.error.validating'))
      }

      // Verificar que tengamos un servidor
      if (!currentServer?.rawServer?.id) {
        throw new Error(t('game.error.no-server-selected'))
      }

      const serverId = currentServer.rawServer.id

      // 2. Escaneo del sistema (Java)
      const javaResult = await window.api.process.systemScan(serverId)
      if (!javaResult.success) {
        throw new Error(javaResult.error || t('game.error.scanning-java'))
      }

      // 3. Descargar Java si es necesario
      if (javaResult.needsDownload) {
        const downloadResult = await window.api.process.downloadJava(serverId)
        if (!downloadResult.success) {
          throw new Error(downloadResult.error || t('game.error.downloading-java'))
        }
      }

      // 4. Validar y descargar archivos (usando una sola instancia de FullRepair como en el código original)
      const validateAndDownloadResult = await window.api.process.validateAndDownload(serverId)
      if (!validateAndDownloadResult.success) {
        throw new Error(
          validateAndDownloadResult.error || t('game.error.validating-and-downloading-files')
        )
      }

      // 5. Preparar lanzamiento
      const prepResult = await window.api.process.prepareLaunch(serverId)
      if (!prepResult.success) {
        throw new Error(prepResult.error || t('game.error.preparing-launch'))
      }

      // 6. Lanzar juego
      const launchResult = await window.api.process.launchGame(prepResult)

      if (!launchResult.success) {
        throw new Error(launchResult.error || t('game.error.launching-game'))
      }

      return launchResult
    },
    onError: (error) => {
      setLaunchState({
        stage: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : t('game.error.unknown')
      })
      toast.error(error instanceof Error ? error.message : t('game.error.unknown'))
    },
    onSuccess: () => {
      setLaunchState({
        stage: 'running',
        progress: 100,
        details: t('game.success.launching-game')
      })
    }
  })

  // Mutation para terminar el juego
  const killMutation = useMutation({
    mutationFn: async () => {
      const result = await window.api.process.killProcess()
      if (!result.success) {
        throw new Error(result.error || t('game.error.terminating-process'))
      }
      return result
    },
    onSuccess: () => {
      setLaunchState({
        stage: 'idle',
        progress: 0,
        details: undefined
      })
      toast.success(t('game.success.terminating-process'))
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t('game.error.terminating-process'))
    }
  })

  // Funciones públicas
  const launchGame = useCallback(() => {
    if (!currentServer) {
      toast.error(t('game.error.no-server-selected'))
      return
    }
    launchMutation.mutate()
  }, [launchMutation, currentServer, t])

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
