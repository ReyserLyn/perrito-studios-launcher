import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import { useAppStore } from '../stores/appStore'

// Hook para obtener configuración del juego
export const useGameConfig = () => {
  const { updateConfig } = useAppStore()

  return useQuery({
    queryKey: queryKeys.config.game(),
    queryFn: async () => {
      const [width, height, fullscreen, autoConnect, launchDetached] = await Promise.all([
        window.api.config.getGameWidth(),
        window.api.config.getGameHeight(),
        window.api.config.getFullscreen(),
        window.api.config.getAutoConnect(),
        window.api.config.getLaunchDetached()
      ])

      const config = {
        gameWidth: width.success ? width.width : 1280,
        gameHeight: height.success ? height.height : 720,
        fullscreen: fullscreen.success ? fullscreen.fullscreen : false,
        autoConnect: autoConnect.success ? autoConnect.autoConnect : true,
        launchDetached: launchDetached.success ? launchDetached.launchDetached : true
      }

      updateConfig(config)
      return config
    }
  })
}

// Hook para obtener configuración de Java de un servidor
export const useJavaConfig = (serverId: string) => {
  return useQuery({
    queryKey: queryKeys.config.java(serverId),
    queryFn: async () => {
      const [minRAM, maxRAM, executable, jvmOptions] = await Promise.all([
        window.api.config.getMinRAM(serverId),
        window.api.config.getMaxRAM(serverId),
        window.api.config.getJavaExecutable(serverId),
        window.api.config.getJVMOptions(serverId)
      ])

      return {
        minRAM: minRAM.success ? minRAM.minRAM : '2G',
        maxRAM: maxRAM.success ? maxRAM.maxRAM : '4G',
        executable: executable.success ? executable.javaExecutable : null,
        jvmOptions: jvmOptions.success ? jvmOptions.jvmOptions : []
      }
    },
    enabled: !!serverId
  })
}

// Hook para obtener directorios
export const useDirectories = () => {
  return useQuery({
    queryKey: queryKeys.config.directories(),
    queryFn: async () => {
      const [launcher, data, common, instance] = await Promise.all([
        window.api.config.getLauncherDirectory(),
        window.api.config.getDataDirectory(),
        window.api.config.getCommonDirectory(),
        window.api.config.getInstanceDirectory()
      ])

      return {
        launcher: launcher.success ? launcher.directory : '',
        data: data.success ? data.directory : '',
        common: common.success ? common.directory : '',
        instance: instance.success ? instance.directory : ''
      }
    }
  })
}

// Hook para actualizar configuración del juego
export const useUpdateGameConfig = () => {
  const queryClient = useQueryClient()
  const { updateConfig, addNotification } = useAppStore()

  return useMutation({
    mutationFn: async (config: {
      gameWidth?: number
      gameHeight?: number
      fullscreen?: boolean
      autoConnect?: boolean
      launchDetached?: boolean
    }) => {
      const updates: Promise<any>[] = []

      if (config.gameWidth !== undefined) {
        updates.push(window.api.config.setGameWidth(config.gameWidth))
      }
      if (config.gameHeight !== undefined) {
        updates.push(window.api.config.setGameHeight(config.gameHeight))
      }
      if (config.fullscreen !== undefined) {
        updates.push(window.api.config.setFullscreen(config.fullscreen))
      }
      if (config.autoConnect !== undefined) {
        updates.push(window.api.config.setAutoConnect(config.autoConnect))
      }
      if (config.launchDetached !== undefined) {
        updates.push(window.api.config.setLaunchDetached(config.launchDetached))
      }

      const results = await Promise.all(updates)
      const hasError = results.some((result) => !result.success)

      if (hasError) {
        throw new Error('Error actualizando configuración del juego')
      }

      // Guardar configuración
      await window.api.config.save()
      return config
    },
    onSuccess: (config) => {
      updateConfig(config)
      queryClient.invalidateQueries({ queryKey: queryKeys.config.game() })

      addNotification({
        type: 'success',
        message: 'Configuración del juego actualizada'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para actualizar configuración de Java
export const useUpdateJavaConfig = (serverId: string) => {
  const queryClient = useQueryClient()
  const { addNotification } = useAppStore()

  return useMutation({
    mutationFn: async (config: {
      minRAM?: string
      maxRAM?: string
      executable?: string
      jvmOptions?: string[]
    }) => {
      const updates: Promise<any>[] = []

      if (config.minRAM !== undefined) {
        updates.push(window.api.config.setMinRAM(serverId, config.minRAM))
      }
      if (config.maxRAM !== undefined) {
        updates.push(window.api.config.setMaxRAM(serverId, config.maxRAM))
      }
      if (config.executable !== undefined) {
        updates.push(window.api.config.setJavaExecutable(serverId, config.executable))
      }
      if (config.jvmOptions !== undefined) {
        updates.push(window.api.config.setJVMOptions(serverId, config.jvmOptions))
      }

      const results = await Promise.all(updates)
      const hasError = results.some((result) => !result.success)

      if (hasError) {
        throw new Error('Error actualizando configuración de Java')
      }

      await window.api.config.save()
      return config
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config.java(serverId) })

      addNotification({
        type: 'success',
        message: 'Configuración de Java actualizada'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}

// Hook para obtener límites de RAM
export const useRAMLimits = () => {
  return useQuery({
    queryKey: ['config', 'ram-limits'],
    queryFn: async () => {
      const [minRAM, maxRAM] = await Promise.all([
        window.api.config.getAbsoluteMinRAM(),
        window.api.config.getAbsoluteMaxRAM()
      ])

      return {
        min: minRAM.success ? minRAM.absoluteMinRAM : 2,
        max: maxRAM.success ? maxRAM.absoluteMaxRAM : 8
      }
    },
    staleTime: Infinity // Los límites de RAM no cambian durante la sesión
  })
}

// Hook para cambiar servidor seleccionado
export const useSelectServer = () => {
  const queryClient = useQueryClient()
  const { updateConfig, addNotification } = useAppStore()

  return useMutation({
    mutationFn: async (serverId: string) => {
      const result = await window.api.config.setSelectedServer(serverId)
      if (!result.success) {
        throw new Error(result.error || 'Error seleccionando servidor')
      }

      await window.api.config.save()
      return serverId
    },
    onSuccess: (serverId) => {
      updateConfig({ selectedServer: serverId })
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all })

      addNotification({
        type: 'success',
        message: 'Servidor seleccionado'
      })
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        message: error.message
      })
    }
  })
}
