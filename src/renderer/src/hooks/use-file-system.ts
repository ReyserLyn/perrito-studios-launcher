import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ShellOperationResult } from '../types/mods'

/**
 * Hook base para operaciones del sistema de archivos
 */
function useSystemOperation<TVariables>(
  operationFn: (variables: TVariables) => Promise<ShellOperationResult>,
  options: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
  } = {}
) {
  return useMutation<ShellOperationResult, Error, TVariables>({
    mutationFn: operationFn,
    onSuccess: () => {
      if (options.showSuccessToast && options.successMessage) {
        toast.success(options.successMessage)
      }
    },
    onError: (error) => {
      console.error('Error en operación del sistema:', error)
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
  return useSystemOperation(
    async (folderPath: string): Promise<ShellOperationResult> => {
      const result = await window.api.system.openFolder(folderPath)

      if (!result.result) {
        throw new Error(result.error || 'Error abriendo carpeta')
      }

      return result
    },
    {
      errorMessage: 'No se pudo abrir la carpeta'
    }
  )
}

/**
 * Hook para mostrar archivos en el explorador
 */
export function useShowItemInFolder() {
  return useSystemOperation(
    async (filePath: string): Promise<ShellOperationResult> => {
      const result = await window.api.system.showItemInFolder(filePath)

      if (!result.result) {
        throw new Error(result.error || 'Error mostrando archivo')
      }

      return result
    },
    {
      errorMessage: 'No se pudo mostrar el archivo'
    }
  )
}

/**
 * Hook para mover archivos a la papelera
 */
export function useTrashItem() {
  return useSystemOperation(
    async (filePath: string): Promise<ShellOperationResult> => {
      const result = await window.api.system.trashItem(filePath)

      if (!result.result) {
        throw new Error(result.error || 'Error moviendo archivo a papelera')
      }

      return result
    },
    {
      successMessage: 'Archivo movido a la papelera',
      errorMessage: 'No se pudo mover el archivo a la papelera',
      showSuccessToast: true
    }
  )
}
