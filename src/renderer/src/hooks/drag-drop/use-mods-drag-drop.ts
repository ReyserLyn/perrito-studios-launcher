import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { DndModsOptions, ModFile, PlatformCapabilities } from '../../types/mods'
import {
  DEFAULT_DND_OPTIONS,
  detectPlatformCapabilities,
  getModsDirectory,
  processFilesToModFiles
} from '../../utils/mods'
import { useAddMods } from '../mods/use-mods-mutations'
import { useServerData } from '../use-servers'

/**
 * Hook específico para drag & drop de mods
 */
export const useModsDragDrop = (options: DndModsOptions = {}) => {
  const opts = { ...DEFAULT_DND_OPTIONS, ...options }
  const [draggedFiles, setDraggedFiles] = useState<ModFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const { currentServer } = useServerData()
  const addModsMutation = useAddMods()

  // Detectar capacidades de la plataforma
  const platformCapabilities = useMemo<PlatformCapabilities>(() => {
    return detectPlatformCapabilities()
  }, [])

  // Procesar archivos desde drag & drop nativo
  const processFilesFromDrop = async (files: FileList): Promise<ModFile[]> => {
    const { validFiles, errors } = await processFilesToModFiles(files, opts, platformCapabilities)

    if (errors.length > 0) {
      toast.warning(
        `Archivos rechazados:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`
      )
    }

    return validFiles
  }

  // Handlers para drag & drop nativo
  const handleNativeDrop = async (e: React.DragEvent) => {
    e.preventDefault()

    const droppedFiles = e.dataTransfer?.files
    if (droppedFiles && droppedFiles.length > 0) {
      try {
        const processedFiles = await processFilesFromDrop(droppedFiles)
        if (processedFiles.length > 0) {
          setDraggedFiles(processedFiles)

          // Obtener directorio de mods y añadir archivos
          if (currentServer) {
            const modsDir = await getModsDirectory(currentServer.rawServer.id)
            const fileItems = processedFiles.map((file) => ({
              name: file.name,
              path: file.path
            }))

            await addModsMutation.mutateAsync({ files: fileItems, modsDir })
          }
        }
      } catch (error) {
        console.error('Error procesando archivos:', error)
        toast.error('Error al procesar los archivos')
      }
    }

    setIsDragActive(false)
  }

  const handleNativeDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleNativeDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleNativeDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
    }
  }

  const handleDragStart = () => {
    setIsDragActive(true)
  }

  const handleDragOver = () => {
    // No necesario para archivos nativos
  }

  const handleDragEnd = () => {
    setIsDragActive(false)
  }

  // Props para el área de drop nativo
  const nativeDropProps = {
    onDrop: handleNativeDrop,
    onDragEnter: handleNativeDragEnter,
    onDragOver: handleNativeDragOver,
    onDragLeave: handleNativeDragLeave
  }

  // Props para DndContext de @dnd-kit
  const DndContextProps = {
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd
  }

  return {
    isDragActive,
    isUploading: addModsMutation.isPending,
    draggedFiles,
    nativeDropProps,
    DndContextProps,
    platformCapabilities
  }
}
