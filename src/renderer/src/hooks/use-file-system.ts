import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { BaseResult } from '../types/mods'
import { useTranslation } from './use-translation'

/**
 * Hook base para operaciones del sistema de archivos
 */
function useSystemOperation<TVariables>(
  operationFn: (variables: TVariables) => Promise<BaseResult>,
  options: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
  } = {}
) {
  return useMutation<BaseResult, Error, TVariables>({
    mutationFn: operationFn,
    onSuccess: () => {
      if (options.showSuccessToast && options.successMessage) {
        toast.success(options.successMessage)
      }
    },
    onError: (error) => {
      console.error('[useSystemOperation] Error in system operation:', error)
      if (options.errorMessage) {
        toast.error(options.errorMessage)
      }
    }
  })
}

/**
 * Hook para abrir carpetas
 */
export function useOpenFolder() {
  const { t } = useTranslation()

  return useSystemOperation(
    async (folderPath: string): Promise<BaseResult> => {
      const result = await window.api.system.openFolder(folderPath)

      if (!result.result) {
        throw new Error(result.error || t('common.system.error.opening-folder'))
      }

      return result
    },
    {
      errorMessage: t('common.system.error.open-folder')
    }
  )
}

/**
 * Hook para mostrar archivos en el explorador
 */
export function useShowItemInFolder() {
  const { t } = useTranslation()

  return useSystemOperation(
    async (filePath: string): Promise<BaseResult> => {
      const result = await window.api.system.showItemInFolder(filePath)

      if (!result.result) {
        throw new Error(result.error || t('common.system.error.showing-file'))
      }

      return result
    },
    {
      errorMessage: t('common.system.error.show-file')
    }
  )
}

/**
 * Hook para mover archivos a la papelera
 */
export function useTrashItem() {
  const { t } = useTranslation()

  return useSystemOperation(
    async (filePath: string): Promise<BaseResult> => {
      const result = await window.api.system.trashItem(filePath)

      if (!result.result) {
        throw new Error(result.error || t('common.system.error.moving-file'))
      }

      return result
    },
    {
      successMessage: t('common.system.success.moving-file'),
      errorMessage: t('common.system.error.move-file'),
      showSuccessToast: true
    }
  )
}
