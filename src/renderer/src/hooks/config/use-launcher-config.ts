import { useTranslation } from '@/hooks/use-translation'
import { queryKeys } from '@/lib/queryClient'
import { useLauncherConfigStore } from '@/stores/launcher-config-store'
import type { Language, LauncherConfigErrors, LauncherConfigReturn } from '@/types/launcher-config'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useConfigControlActions } from './use-config-state'

const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000 // 10 minutos
} as const

export const useLauncherConfig = (): LauncherConfigReturn => {
  const { t, changeLanguage } = useTranslation()
  const { setDirty } = useConfigControlActions()
  const queryClient = useQueryClient()
  const { isSelectingDirectory, setIsSelectingDirectory } = useLauncherConfigStore()

  // Query para obtener el idioma actual
  const {
    data: currentLanguage = 'es_ES' as Language,
    isLoading: isLoadingLanguage,
    error: languageError
  } = useQuery({
    queryKey: queryKeys.launcherConfig.language(),
    queryFn: async (): Promise<Language> => {
      const response = await window.api.config.getCurrentLanguage()
      if (!response.success) {
        throw new Error(response.error || 'Failed to get language')
      }
      return (response.language || 'es_ES') as Language
    },
    ...CACHE_CONFIG
  })

  // Query para obtener configuración de prerelease
  const {
    data: allowPrerelease = false,
    isLoading: isLoadingPrerelease,
    error: prereleaseError
  } = useQuery({
    queryKey: queryKeys.launcherConfig.prerelease(),
    queryFn: async (): Promise<boolean> => {
      const response = await window.api.config.getAllowPrerelease()
      if (!response.success) {
        throw new Error(response.error || 'Failed to get prerelease config')
      }
      return response.allowPrerelease
    },
    ...CACHE_CONFIG
  })

  // Query para obtener directorio de datos
  const {
    data: dataDirectory = '',
    isLoading: isLoadingDataDirectory,
    error: dataDirectoryError
  } = useQuery({
    queryKey: queryKeys.launcherConfig.dataDirectory(),
    queryFn: async (): Promise<string> => {
      const response = await window.api.config.getDataDirectory()
      if (!response.success) {
        throw new Error(response.error || 'Failed to get data directory')
      }
      return response.directory
    },
    ...CACHE_CONFIG
  })

  // Mutation para cambiar idioma
  const languageMutation = useMutation({
    mutationFn: async (language: Language): Promise<Language> => {
      const response = await window.api.config.setLanguage(language)
      if (!response.success) {
        throw new Error(response.error || 'Failed to set language')
      }
      return language
    },
    onMutate: async (newLanguage: Language) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.launcherConfig.language() })
      const previousLanguage = queryClient.getQueryData(queryKeys.launcherConfig.language())
      queryClient.setQueryData(queryKeys.launcherConfig.language(), newLanguage)
      changeLanguage(newLanguage)
      return { previousLanguage }
    },
    onError: (error: Error, _newLanguage: Language, context) => {
      if (context?.previousLanguage) {
        queryClient.setQueryData(queryKeys.launcherConfig.language(), context.previousLanguage)
        changeLanguage(context.previousLanguage as Language)
      }
      toast.error(t('launcher.errors.language_change', { error: error.message }))
    },
    onSuccess: () => {
      toast.success(t('launcher.success.language_changed'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.launcherConfig.language() })
    }
  })

  // Mutation para cambiar prerelease
  const prereleaseMutation = useMutation({
    mutationFn: async (enabled: boolean): Promise<boolean> => {
      const response = await window.api.config.setAllowPrerelease(enabled)
      if (!response.success) {
        throw new Error(response.error || 'Failed to set prerelease')
      }
      return enabled
    },
    onMutate: async (newValue: boolean) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.launcherConfig.prerelease() })
      const previousValue = queryClient.getQueryData(
        queryKeys.launcherConfig.prerelease()
      ) as boolean
      queryClient.setQueryData(queryKeys.launcherConfig.prerelease(), newValue)
      return { previousValue }
    },
    onError: (error: Error, _newValue: boolean, context) => {
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(queryKeys.launcherConfig.prerelease(), context.previousValue)
      }
      toast.error(t('launcher.errors.prerelease_change', { error: error.message }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.launcherConfig.prerelease() })
    },
    onSuccess: (enabled: boolean) => {
      toast.success(
        t(enabled ? 'launcher.success.prerelease_enabled' : 'launcher.success.prerelease_disabled')
      )
    }
  })

  // Mutation para cambiar directorio de datos
  const dataDirectoryMutation = useMutation({
    mutationFn: async (directory: string): Promise<string> => {
      const response = await window.api.config.setDataDirectory(directory)
      if (!response.success) {
        throw new Error(response.error || 'Failed to set data directory')
      }
      return directory
    },
    onMutate: async (newDirectory: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.launcherConfig.dataDirectory() })
      const previousDirectory = queryClient.getQueryData(queryKeys.launcherConfig.dataDirectory())
      queryClient.setQueryData(queryKeys.launcherConfig.dataDirectory(), newDirectory)
      setDirty(true)
      return { previousDirectory }
    },
    onError: (error: Error, _newDirectory: string, context) => {
      if (context?.previousDirectory !== undefined) {
        queryClient.setQueryData(
          queryKeys.launcherConfig.dataDirectory(),
          context.previousDirectory
        )
      }
      toast.error(t('launcher.errors.directory_set', { error: error.message }))
    },
    onSuccess: () => {
      toast.success(t('launcher.success.directory_selected'))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.launcherConfig.dataDirectory() })
    }
  })

  // Handler para seleccionar directorio
  const handleSelectDataDirectory = useCallback(async (): Promise<void> => {
    setIsSelectingDirectory(true)
    try {
      const result = await window.api.system.selectFolder()
      if (result.success && result.path) {
        dataDirectoryMutation.mutate(result.path)
      }
    } catch (error) {
      console.error('Error selecting directory:', error)
      toast.error(t('launcher.errors.directory_select'))
    } finally {
      setIsSelectingDirectory(false)
    }
  }, [dataDirectoryMutation, setIsSelectingDirectory, t])

  // Handlers
  const handleLanguageChange = useCallback(
    (language: Language) => languageMutation.mutate(language),
    [languageMutation]
  )

  const handlePrereleaseChange = useCallback(
    (enabled: boolean) => prereleaseMutation.mutate(enabled),
    [prereleaseMutation]
  )

  // Estados derivados
  const isLoading = useMemo(
    () => isLoadingLanguage || isLoadingPrerelease || isLoadingDataDirectory,
    [isLoadingLanguage, isLoadingPrerelease, isLoadingDataDirectory]
  )

  const errors: LauncherConfigErrors = useMemo(
    () => ({
      language: languageError,
      prerelease: prereleaseError,
      dataDirectory: dataDirectoryError
    }),
    [languageError, prereleaseError, dataDirectoryError]
  )

  // Log de errores
  useMemo(() => {
    const hasErrors = languageError || prereleaseError || dataDirectoryError
    if (hasErrors) {
      console.error('Launcher config errors:', errors)
    }
  }, [errors, languageError, prereleaseError, dataDirectoryError])

  return {
    // Data
    currentLanguage,
    allowPrerelease,
    dataDirectory,

    // Loading states
    isLoadingLanguage,
    isLoadingPrerelease,
    isLoadingDataDirectory,
    isLoading,
    isSelectingDirectory,

    // Mutation states
    isChangingLanguage: languageMutation.isPending,
    isChangingPrerelease: prereleaseMutation.isPending,
    isChangingDataDirectory: dataDirectoryMutation.isPending,

    // Handlers
    handleLanguageChange,
    handlePrereleaseChange,
    handleSelectDataDirectory,

    // Errors
    errors
  }
}
