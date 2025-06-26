import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import type { ModConfiguration } from '../../types/mods'
import { getModsDirectory } from '../../utils/mods'
import { useServerData } from '../use-servers'
import { useTranslation } from '../use-translation'

/**
 * Hook base para mutaciones de mods que incluye invalidación automática de queries
 */
export function useModsMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    successMessage?: string
    errorMessage?: string
  } = {}
) {
  const queryClient = useQueryClient()
  const { currentServer } = useServerData()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidar queries de mods automáticamente
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.mods.all, 'combined', currentServer?.rawServer.id || '']
      })

      if (options.successMessage) {
        toast.success(options.successMessage)
      }

      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('[useModsMutation] Error:', error)

      if (options.errorMessage) {
        toast.error(options.errorMessage)
      }

      options.onError?.(error, variables)
    }
  })
}

/**
 * Hook para alternar el estado de un mod drop-in
 */
export const useToggleDropinMod = () => {
  const { currentServer } = useServerData()
  const { t } = useTranslation()

  return useModsMutation(
    async ({ fullName, enable }: { fullName: string; enable: boolean }) => {
      if (!currentServer) {
        throw new Error(t('settings.mods.error.no-server-selected'))
      }

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.toggleMod(modsDir, fullName, enable)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    {
      successMessage: t('settings.mods.success.mod-toggled'),
      errorMessage: t('settings.mods.error.mod-toggled')
    }
  )
}

/**
 * Hook para eliminar un mod drop-in
 */
export const useDeleteDropinMod = () => {
  const { currentServer } = useServerData()
  const { t } = useTranslation()

  return useModsMutation(
    async (fullName: string) => {
      if (!currentServer) {
        throw new Error(t('settings.mods.error.no-server-selected'))
      }

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.deleteMod(modsDir, fullName)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    {
      successMessage: t('settings.mods.success.mod-deleted'),
      errorMessage: t('settings.mods.error.mod-deleted')
    }
  )
}

/**
 * Hook para alternar el estado de un mod opcional del servidor
 */
export const useToggleServerMod = () => {
  const { currentServer } = useServerData()
  const { t } = useTranslation()

  return useModsMutation(
    async ({ modId, enabled }: { modId: string; enabled: boolean }) => {
      if (!currentServer) {
        throw new Error(t('settings.mods.error.no-server-selected'))
      }

      // Obtener configuración actual
      const configResult = await window.api.config.getModConfiguration(currentServer.rawServer.id)
      if (!configResult.success) {
        throw new Error(configResult.error || t('settings.mods.error.getting-mod-configuration'))
      }

      // Preparar configuración de mods
      const modConfig: ModConfiguration = configResult.modConfiguration || { mods: {} }
      if (!modConfig.mods) {
        modConfig.mods = {}
      }

      // Actualizar configuración según el tipo existente
      const existingConfig = modConfig.mods[modId]
      if (typeof existingConfig === 'object' && existingConfig !== null) {
        // Mantener estructura de objeto para submódulos
        modConfig.mods[modId] = { ...existingConfig, value: enabled }
      } else {
        modConfig.mods[modId] = enabled
      }

      // Guardar configuración
      const saveResult = await window.api.config.setModConfiguration(
        currentServer.rawServer.id,
        modConfig
      )
      if (!saveResult.success) {
        throw new Error(saveResult.error)
      }

      await window.api.config.save()
    },
    {
      successMessage: t('settings.mods.success.mod-configuration-updated'),
      errorMessage: t('settings.mods.error.mod-configuration-updated')
    }
  )
}

/**
 * Hook para añadir mods drop-in
 */
export const useAddMods = () => {
  const { t } = useTranslation()

  return useModsMutation(
    async ({
      files,
      modsDir
    }: {
      files: Array<{ name: string; path: string }>
      modsDir: string
    }) => {
      const result = await window.api.mods.addMods(files, modsDir)

      if (!result.success) {
        throw new Error(result.error || t('settings.mods.error.adding-mods'))
      }

      return result
    },
    {
      onSuccess: (result) => {
        // Mostrar mensajes específicos según el resultado
        if (result.addedCount && result.addedCount > 0) {
          if (result.addedCount === 1) {
            toast.success(t('settings.mods.success.mod-added', { count: result.addedCount }))
          } else {
            toast.success(t('settings.mods.success.mods-added', { count: result.addedCount }))
          }
        }

        if (result.skippedCount && result.skippedCount > 0) {
          const skippedFiles = result.errors
            ?.filter((error) => error.error === 'El archivo ya existe en el directorio de mods')
            .map((error) => error.fileName)

          if (skippedFiles && skippedFiles.length > 0) {
            if (skippedFiles.length === 1) {
              toast.warning(
                t('settings.mods.error.file-already-exists', { fileName: skippedFiles[0] })
              )
            } else {
              toast.warning(
                t('settings.mods.error.files-already-exist', { count: skippedFiles.length })
              )
            }
          }

          // Mostrar otros errores si los hay
          const otherErrors = result.errors?.filter(
            (error) => error.error !== 'El archivo ya existe en el directorio de mods'
          )

          if (otherErrors && otherErrors.length > 0) {
            const errorMessages = otherErrors
              .slice(0, 3)
              .map((error) => `${error.fileName}: ${error.error}`)
              .join('\n')

            toast.error(
              t('settings.mods.error.processing-files', {
                errorMessages: errorMessages,
                otherErrors: otherErrors.length > 3 ? '\n...' : ''
              })
            )
          }
        }
      },
      errorMessage: t('settings.mods.error.adding-mods')
    }
  )
}
