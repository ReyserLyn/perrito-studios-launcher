import { useTranslation } from '@/hooks/use-translation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import { useConfigStore, type GameConfig, type LauncherConfig } from '../../stores/config-store'
import { useServerData } from '../use-servers'

// ===== HOOKS PARA CONSULTAS =====

/**
 * Hook para cargar la configuración completa desde la API
 */
export const useConfigQuery = () => {
  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: async () => {
      const [
        gameWidth,
        gameHeight,
        fullscreen,
        autoConnect,
        launchDetached,
        syncLanguage,
        allowPrerelease
      ] = await Promise.all([
        window.api.config.getGameWidth(),
        window.api.config.getGameHeight(),
        window.api.config.getFullscreen(),
        window.api.config.getAutoConnect(),
        window.api.config.getLaunchDetached(),
        window.api.config.getSyncLanguage(),
        window.api.config.getAllowPrerelease()
      ])

      const gameConfig: GameConfig = {
        resWidth: gameWidth.success ? gameWidth.width : 1280,
        resHeight: gameHeight.success ? gameHeight.height : 720,
        fullscreen: fullscreen.success ? fullscreen.fullscreen : false,
        autoConnect: autoConnect.success ? autoConnect.autoConnect : true,
        launchDetached: launchDetached.success ? launchDetached.detached : true,
        syncLanguage: syncLanguage.success ? syncLanguage.syncLanguage : true
      }

      const launcherConfig: LauncherConfig = {
        allowPrerelease: allowPrerelease.success ? allowPrerelease.allowPrerelease : false,
        language: 'es_ES'
      }

      return {
        game: gameConfig,
        launcher: launcherConfig
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: 1
  })
}

// ===== HOOKS DE MUTACIONES =====

/**
 * Hook para guardar la configuración completa (game, launcher y Java)
 */
export const useSaveConfig = () => {
  const queryClient = useQueryClient()
  const { game, launcher, java, setDirty } = useConfigStore()
  const { currentServer } = useServerData()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: async () => {
      // Guardar configuración del juego y launcher
      await Promise.all([
        window.api.config.setGameWidth(game.resWidth),
        window.api.config.setGameHeight(game.resHeight),
        window.api.config.setFullscreen(game.fullscreen),
        window.api.config.setAutoConnect(game.autoConnect),
        window.api.config.setLaunchDetached(game.launchDetached),
        window.api.config.setSyncLanguage(game.syncLanguage),
        window.api.config.setAllowPrerelease(launcher.allowPrerelease)
      ])

      // Guardar configuración de Java si existe en el store
      if (currentServer && java[currentServer.rawServer.id]) {
        const javaConfig = java[currentServer.rawServer.id]
        await Promise.all([
          window.api.config.setMinRAM(currentServer.rawServer.id, javaConfig.minRAM),
          window.api.config.setMaxRAM(currentServer.rawServer.id, javaConfig.maxRAM),
          window.api.config.setJavaExecutable(
            currentServer.rawServer.id,
            javaConfig.executable || ''
          ),
          window.api.config.setJVMOptions(currentServer.rawServer.id, javaConfig.jvmOptions)
        ])
      }

      await window.api.config.save()
    },
    onSuccess: () => {
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all })
      if (currentServer) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.javaConfig.byServer(currentServer.rawServer.id)
        })
      }
      toast.success(t('settings.hook.success.save'))
    },
    onError: (error) => {
      console.error('[useSaveConfig] Error:', error)
      toast.error(t('settings.hook.error.save'))
    }
  })
}

/**
 * Hook para resetear configuración
 */
export const useResetConfig = () => {
  const queryClient = useQueryClient()
  const { setGameConfig, setLauncherConfig, setDirty, reset } = useConfigStore()
  const { currentServer } = useServerData()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: async () => {
      // Refetch la configuración desde la API
      const result = await queryClient.fetchQuery({
        queryKey: queryKeys.config.all,
        queryFn: async () => {
          const [
            gameWidth,
            gameHeight,
            fullscreen,
            autoConnect,
            launchDetached,
            syncLanguage,
            allowPrerelease
          ] = await Promise.all([
            window.api.config.getGameWidth(),
            window.api.config.getGameHeight(),
            window.api.config.getFullscreen(),
            window.api.config.getAutoConnect(),
            window.api.config.getLaunchDetached(),
            window.api.config.getSyncLanguage(),
            window.api.config.getAllowPrerelease()
          ])

          const gameConfig: GameConfig = {
            resWidth: gameWidth.success ? gameWidth.width : 1280,
            resHeight: gameHeight.success ? gameHeight.height : 720,
            fullscreen: fullscreen.success ? fullscreen.fullscreen : false,
            autoConnect: autoConnect.success ? autoConnect.autoConnect : true,
            launchDetached: launchDetached.success ? launchDetached.detached : true,
            syncLanguage: syncLanguage.success ? syncLanguage.syncLanguage : true
          }

          const launcherConfig: LauncherConfig = {
            allowPrerelease: allowPrerelease.success ? allowPrerelease.allowPrerelease : false,
            language: 'es_ES'
          }

          return {
            game: gameConfig,
            launcher: launcherConfig
          }
        }
      })

      // Actualizar el store
      setGameConfig(result.game)
      setLauncherConfig(result.launcher)

      // Limpiar configuraciones de Java pendientes en el store
      // Esto fuerza a que se recarguen desde la API
      reset()
      setGameConfig(result.game)
      setLauncherConfig(result.launcher)

      // Refetch también la configuración de Java si hay servidor seleccionado
      if (currentServer) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.javaConfig.byServer(currentServer.rawServer.id)
        })
      }

      setDirty(false)

      return result
    },
    onSuccess: () => {
      toast.success(t('settings.hook.success.reset'))
    },
    onError: (error) => {
      console.error('[useResetConfig] Error:', error)
      toast.error(t('settings.hook.error.reset'))
    }
  })
}

// ===== HOOK PRINCIPAL =====

/**
 * Hook para manejar operaciones de configuración
 */
export const useConfigManager = () => {
  const { isDirty, setGameConfig, setLauncherConfig, setDirty } = useConfigStore()
  const configQuery = useConfigQuery()
  const saveConfig = useSaveConfig()
  const resetConfig = useResetConfig()
  const { t } = useTranslation()

  // Sincronizar datos de la query con el store cuando cambien
  useEffect(() => {
    if (configQuery.data && !configQuery.isLoading) {
      setGameConfig(configQuery.data.game)
      setLauncherConfig(configQuery.data.launcher)
      setDirty(false)
    }
  }, [configQuery.data, configQuery.isLoading, setGameConfig, setLauncherConfig, setDirty])

  // Hook para recargar manualmente
  const reloadConfig = useMutation({
    mutationFn: async () => {
      const result = await configQuery.refetch()
      return result.data
    },
    onSuccess: (data) => {
      if (data) {
        setGameConfig(data.game)
        setLauncherConfig(data.launcher)
        setDirty(false)
        toast.success(t('settings.hook.success.reload'))
      }
    },
    onError: (error) => {
      console.error('[useConfigManager] Error reloading:', error)
      toast.error(t('settings.hook.error.reload'))
    }
  })

  return {
    // Estados
    isLoading: configQuery.isLoading,
    isDirty,
    hasUnsavedChanges: isDirty,

    // Estados específicos de operaciones
    isSaving: saveConfig.isPending,
    isResetting: resetConfig.isPending,
    isReloading: reloadConfig.isPending,

    // Datos
    configData: configQuery.data,

    // Operaciones
    save: saveConfig.mutate,
    reset: resetConfig.mutate,
    reload: reloadConfig.mutate,

    // Funciones de refetch
    refetchConfig: configQuery.refetch
  }
}
