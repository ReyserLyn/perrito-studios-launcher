import type { UpdateInfo } from '@/stores/updater-store'
import { useUpdaterStore } from '@/stores/updater-store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

interface UpdaterActions {
  checkForUpdates: () => void
  downloadUpdate: () => void
  installUpdate: () => void
}

interface UseUpdaterReturn {
  // Estado
  isChecking: boolean
  isDownloading: boolean
  isUpdateAvailable: boolean
  isUpdateReady: boolean
  currentVersion: string
  updateInfo?: UpdateInfo
  downloadProgress: number
  error?: string

  // Estado derivado
  isLatestVersion: boolean
  updateSeverity: 'major' | 'minor' | 'patch' | 'prerelease'

  // Acciones
  actions: UpdaterActions
}

// Función para determinar el tipo de actualización
const getUpdateSeverity = (
  current: string,
  latest: string
): 'major' | 'minor' | 'patch' | 'prerelease' => {
  try {
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)

    if (latest.includes('-')) return 'prerelease'
    if (latestParts[0] > currentParts[0]) return 'major'
    if (latestParts[1] > currentParts[1]) return 'minor'
    if (latestParts[2] > currentParts[2]) return 'patch'

    return 'patch'
  } catch {
    return 'patch'
  }
}

export const useUpdater = (): UseUpdaterReturn => {
  const {
    currentVersion,
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdateReady,
    updateInfo,
    downloadProgress,
    error,
    setCurrentVersion,
    setChecking,
    setDownloading,
    setUpdateAvailable,
    setUpdateReady,
    setError,
    setDownloadProgress
  } = useUpdaterStore()

  // Query para obtener la versión actual
  const { data: appVersion } = useQuery({
    queryKey: ['app-version'],
    queryFn: async () => {
      const version = await window.api.system.getAppVersion?.()
      return version || '1.0.0'
    },
    staleTime: 1000 * 60 * 60 // 1 hora
  })

  // Efecto para actualizar la versión cuando cambie
  useEffect(() => {
    if (appVersion) {
      setCurrentVersion(appVersion)
    }
  }, [appVersion, setCurrentVersion])

  // Mutation para verificar actualizaciones
  const checkUpdatesMutation = useMutation({
    mutationFn: async () => {
      setChecking(true)
      setError(undefined)

      try {
        const result = await window.api.updater.checkForUpdate()
        if (!result.success) {
          throw new Error(result.error || 'Error verificando actualizaciones')
        }
        return result
      } catch (error) {
        setChecking(false)
        throw error
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error checking for updates')
    }
  })

  // Mutation para descargar actualización
  const downloadUpdateMutation = useMutation({
    mutationFn: async () => {
      setDownloading(true)
      setError(undefined)

      try {
        const result = await window.updater.downloadUpdate()
        if (!result.success) {
          throw new Error(result.error)
        }
        return result
      } catch (error) {
        setDownloading(false)
        throw error
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error downloading update')
    }
  })

  // Mutation para instalar actualización
  const installUpdateMutation = useMutation({
    mutationFn: async () => {
      const result = await window.api.updater.installNow()
      if (!result.success) {
        throw new Error(result.error || 'Error instalando actualización')
      }
      return result
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error installing update')
    }
  })

  // Escuchar eventos del updater
  useEffect(() => {
    const handleUpdateNotification = (event: string, data?: any) => {
      console.log('Update event:', event, data)

      switch (event) {
        case 'checking-for-update':
          setChecking(true)
          break

        case 'update-available':
          setChecking(false)
          setUpdateAvailable(true, {
            version: data?.version || 'Unknown',
            releaseNotes: data?.releaseNotes || '',
            releaseName: data?.releaseName,
            releaseDate: data?.releaseDate || new Date().toISOString(),
            downloadURL: data?.downloadURL
          })
          // Iniciar descarga automáticamente en electron-updater
          setDownloading(true)
          break

        case 'update-not-available':
          setChecking(false)
          setUpdateAvailable(false)
          break

        case 'update-downloaded':
          setDownloading(false)
          setUpdateReady(true)
          break

        case 'download-progress':
          setDownloadProgress(data?.percent || 0)
          break

        case 'error':
          setError(data?.message || 'Unknown error occurred')
          break

        case 'installing-update':
          // La aplicación está cerrando para instalar
          break
      }
    }

    // Registrar listener
    window.api.updater?.onNotification?.(handleUpdateNotification)

    // Inicializar el updater
    window.api.updater?.initAutoUpdater?.().catch((err) => {
      console.error('Failed to initialize auto updater:', err)
    })

    return () => {
      // Cleanup listener
      window.api.updater?.removeNotificationListener?.()
    }
  }, [
    setChecking,
    setUpdateAvailable,
    setDownloading,
    setUpdateReady,
    setDownloadProgress,
    setError
  ])

  // Estado derivado
  const isLatestVersion = useMemo(() => {
    return !isUpdateAvailable
  }, [isUpdateAvailable])

  const updateSeverity = useMemo(() => {
    if (!updateInfo) return 'patch'
    return getUpdateSeverity(currentVersion, updateInfo.version)
  }, [currentVersion, updateInfo])

  // Acciones memoizadas
  const actions = useMemo(
    (): UpdaterActions => ({
      checkForUpdates: () => {
        checkUpdatesMutation.mutate()
      },

      downloadUpdate: () => {
        downloadUpdateMutation.mutate()
      },

      installUpdate: () => {
        installUpdateMutation.mutate()
      }
    }),
    [checkUpdatesMutation, downloadUpdateMutation, installUpdateMutation]
  )

  return {
    // Estado
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdateReady,
    currentVersion,
    updateInfo,
    downloadProgress,
    error,

    // Estado derivado
    isLatestVersion,
    updateSeverity,

    // Acciones
    actions
  }
}
