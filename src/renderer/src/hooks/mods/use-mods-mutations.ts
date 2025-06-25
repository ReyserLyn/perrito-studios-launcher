import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '../../lib/queryClient'
import type { ModConfiguration } from '../../types/mods'
import { getModsDirectory } from '../../utils/mods'
import { useServerData } from '../use-servers'

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

  return useModsMutation(
    async ({ fullName, enable }: { fullName: string; enable: boolean }) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.toggleMod(modsDir, fullName, enable)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    {
      successMessage: 'Estado del mod actualizado',
      errorMessage: 'Error al cambiar el estado del mod'
    }
  )
}

/**
 * Hook para eliminar un mod drop-in
 */
export const useDeleteDropinMod = () => {
  const { currentServer } = useServerData()

  return useModsMutation(
    async (fullName: string) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      const modsDir = await getModsDirectory(currentServer.rawServer.id)
      const result = await window.api.mods.deleteMod(modsDir, fullName)

      if (!result.success) {
        throw new Error(result.error)
      }
    },
    {
      successMessage: 'Mod eliminado exitosamente',
      errorMessage: 'Error al eliminar el mod'
    }
  )
}

/**
 * Hook para alternar el estado de un mod opcional del servidor
 */
export const useToggleServerMod = () => {
  const { currentServer } = useServerData()

  return useModsMutation(
    async ({ modId, enabled }: { modId: string; enabled: boolean }) => {
      if (!currentServer) {
        throw new Error('No hay servidor seleccionado')
      }

      // Obtener configuración actual
      const configResult = await window.api.config.getModConfiguration(currentServer.rawServer.id)
      if (!configResult.success) {
        throw new Error(configResult.error || 'Error obteniendo configuración de mods')
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
      successMessage: 'Configuración de mod actualizada',
      errorMessage: 'Error al cambiar la configuración del mod'
    }
  )
}

/**
 * Hook para añadir mods drop-in
 */
export const useAddMods = () => {
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
        throw new Error(result.error || 'Error añadiendo mods')
      }

      return result
    },
    {
      onSuccess: (result) => {
        // Mostrar mensajes específicos según el resultado
        if (result.addedCount && result.addedCount > 0) {
          if (result.addedCount === 1) {
            toast.success(`${result.addedCount} mod añadido exitosamente`)
          } else {
            toast.success(`${result.addedCount} mods añadidos exitosamente`)
          }
        }

        if (result.skippedCount && result.skippedCount > 0) {
          const skippedFiles = result.errors
            ?.filter((error) => error.error === 'El archivo ya existe en el directorio de mods')
            .map((error) => error.fileName)

          if (skippedFiles && skippedFiles.length > 0) {
            if (skippedFiles.length === 1) {
              toast.warning(`${skippedFiles[0]} ya existe y fue omitido`)
            } else {
              toast.warning(`${skippedFiles.length} archivos ya existen y fueron omitidos`)
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
              `Errores al procesar archivos:\n${errorMessages}${otherErrors.length > 3 ? '\n...' : ''}`
            )
          }
        }
      },
      errorMessage: 'Error al añadir mods'
    }
  )
}
