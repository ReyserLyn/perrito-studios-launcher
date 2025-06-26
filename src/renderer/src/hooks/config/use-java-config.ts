import { useTranslation } from '@/hooks/use-translation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import { useConfigStore } from '../../stores/config-store'
import { useServerData } from '../use-servers'

// ===== TIPOS =====

export interface JavaConfigData {
  minRAM: string
  maxRAM: string
  executable: string
  jvmOptions: string
}

// ===== HOOKS DE CONSULTA =====

/**
 * Hook para cargar la configuración de Java desde la API
 */
export const useJavaConfigQuery = (serverId?: string) => {
  const { t } = useTranslation()
  return useQuery({
    queryKey: queryKeys.javaConfig.byServer(serverId || ''),
    queryFn: async (): Promise<JavaConfigData> => {
      if (!serverId) {
        throw new Error(t('settings.java.error.no-server-selected'))
      }

      const [minRAMRes, maxRAMRes, executableRes, jvmOptionsRes] = await Promise.all([
        window.api.config.getMinRAM(serverId),
        window.api.config.getMaxRAM(serverId),
        window.api.config.getJavaExecutable(serverId),
        window.api.config.getJVMOptions(serverId)
      ])

      return {
        minRAM: minRAMRes.success ? minRAMRes.minRAM : '',
        maxRAM: maxRAMRes.success ? maxRAMRes.maxRAM : '',
        executable: executableRes.success ? (executableRes.executable ?? '') : '',
        jvmOptions: jvmOptionsRes.success ? jvmOptionsRes.jvmOptions.join(' ') : ''
      }
    },
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  })
}

// ===== HOOKS DE MUTACIÓN =====

/**
 * Hook para guardar la configuración de Java
 */
export const useSaveJavaConfig = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: async ({ serverId, config }: { serverId: string; config: JavaConfigData }) => {
      const jvmOptionsArray = config.jvmOptions.split(' ').filter(Boolean)

      await Promise.all([
        window.api.config.setMinRAM(serverId, config.minRAM),
        window.api.config.setMaxRAM(serverId, config.maxRAM),
        window.api.config.setJavaExecutable(serverId, config.executable),
        window.api.config.setJVMOptions(serverId, jvmOptionsArray)
      ])

      await window.api.config.save()
      return config
    },
    onSuccess: (_, { serverId }) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.javaConfig.byServer(serverId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.config.all })
      toast.success(t('settings.hook.success.save'))
    },
    onError: (error) => {
      console.error('[useSaveJavaConfig] Error:', error)
      toast.error(t('settings.hook.error.save'))
    }
  })
}

/**
 * Hook para seleccionar ejecutable de Java
 */
export const useSelectJavaExecutable = () => {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: async () => {
      const result = await window.api.system.selectJavaExecutable()
      if (!result.success || !result.path) {
        throw new Error(t('settings.java.error.no-executable-selected'))
      }
      return result.path
    },
    onError: (error) => {
      console.error('[useSelectJavaExecutable] Error:', error)
      toast.error(t('settings.java.error.select-executable'))
    }
  })
}

// ===== HOOK PRINCIPAL =====

/**
 * Hook principal para manejar la configuración de Java
 * Integra store de Zustand, API queries y mutaciones
 */
export const useJavaConfigManager = () => {
  const { currentServer } = useServerData()
  const serverId = currentServer?.rawServer.id

  const { java: javaConfigs, setJavaConfig, setDirty } = useConfigStore()

  // Query para cargar desde la API
  const javaQuery = useJavaConfigQuery(serverId)

  // Mutaciones
  const saveConfig = useSaveJavaConfig()
  const selectExecutable = useSelectJavaExecutable()

  // Configuración actual (store local o de la API)
  const currentConfig = useMemo(() => {
    if (!serverId) return null

    // Priorizar el store local si existe
    const storeConfig = javaConfigs[serverId]
    if (storeConfig) {
      return {
        minRAM: storeConfig.minRAM,
        maxRAM: storeConfig.maxRAM,
        executable: storeConfig.executable || '',
        jvmOptions: storeConfig.jvmOptions.join(' ')
      }
    }

    // Fallback a la data de la API
    return (
      javaQuery.data || {
        minRAM: '',
        maxRAM: '',
        executable: '',
        jvmOptions: ''
      }
    )
  }, [serverId, javaConfigs, javaQuery.data])

  // Función para actualizar configuración localmente
  const updateConfig = useCallback(
    (updates: Partial<JavaConfigData>) => {
      if (!serverId || !currentConfig) return

      const newConfig = { ...currentConfig, ...updates }

      // Convertir jvmOptions a array
      const jvmOptionsArray = newConfig.jvmOptions.split(' ').filter(Boolean)

      // Actualizar en el store
      setJavaConfig(serverId, {
        minRAM: newConfig.minRAM,
        maxRAM: newConfig.maxRAM,
        executable: newConfig.executable || null,
        jvmOptions: jvmOptionsArray
      })

      setDirty(true)
    },
    [serverId, currentConfig, setJavaConfig, setDirty]
  )

  // Función para guardar configuración
  const save = useCallback(() => {
    if (!serverId || !currentConfig) return

    saveConfig.mutate({ serverId, config: currentConfig })
  }, [serverId, currentConfig, saveConfig])

  // Función para seleccionar ejecutable
  const selectJavaExecutable = useCallback(async () => {
    try {
      const path = await selectExecutable.mutateAsync()
      updateConfig({ executable: path })
    } catch {
      // Error ya manejado en la mutación
    }
  }, [selectExecutable, updateConfig])

  // Estados derivados
  const isLoading = javaQuery.isLoading
  const isSaving = saveConfig.isPending
  const isSelectingExecutable = selectExecutable.isPending
  const hasUnsavedChanges = serverId ? !!javaConfigs[serverId] : false

  return {
    // Estados
    isLoading,
    isSaving,
    isSelectingExecutable,
    hasUnsavedChanges,

    // Datos
    config: currentConfig,
    serverId,

    // Acciones
    updateConfig,
    save,
    selectJavaExecutable,

    // Funciones de refetch
    refetch: javaQuery.refetch
  }
}
