import { useMemo, useState } from 'react'
import type { PlatformCapabilities } from '../../types/mods'
import { detectPlatformCapabilities } from '../../utils/mods'

export interface GenericDragDropOptions {
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // en MB
  onFilesDrop?: (files: File[]) => void | Promise<void>
}

export interface GenericDragDropReturn {
  isDragActive: boolean
  draggedFiles: File[]
  nativeDropProps: {
    onDrop: (e: React.DragEvent) => void
    onDragEnter: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDragLeave: (e: React.DragEvent) => void
  }
  DndContextProps: {
    onDragStart: () => void
    onDragOver: () => void
    onDragEnd: () => void
  }
  platformCapabilities: PlatformCapabilities
}

/**
 * Hook genérico para drag & drop de archivos
 */
export const useGenericDragDrop = (options: GenericDragDropOptions = {}): GenericDragDropReturn => {
  const [draggedFiles, setDraggedFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  // Detectar capacidades de la plataforma
  const platformCapabilities = useMemo<PlatformCapabilities>(() => {
    return detectPlatformCapabilities()
  }, [])

  // Validar archivo
  const validateFile = (file: File): boolean => {
    // Verificar extensión si se especifica
    if (options.acceptedTypes && options.acceptedTypes.length > 0) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!options.acceptedTypes.includes(extension)) {
        return false
      }
    }

    // Verificar tamaño si se especifica
    if (options.maxSize) {
      const sizeInMB = file.size / (1024 * 1024)
      if (sizeInMB > options.maxSize) {
        return false
      }
    }

    return true
  }

  // Procesar archivos
  const processFiles = (files: FileList): File[] => {
    const validFiles: File[] = []
    const maxFiles = options.maxFiles || 50

    for (let i = 0; i < files.length && validFiles.length < maxFiles; i++) {
      const file = files[i]
      if (validateFile(file)) {
        validFiles.push(file)
      }
    }

    return validFiles
  }

  // Handlers para drag & drop nativo
  const handleNativeDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)

    const droppedFiles = e.dataTransfer?.files
    if (droppedFiles && droppedFiles.length > 0) {
      const processedFiles = processFiles(droppedFiles)
      if (processedFiles.length > 0) {
        setDraggedFiles(processedFiles)

        // Llamar callback si se proporciona
        if (options.onFilesDrop) {
          await options.onFilesDrop(processedFiles)
        }
      }
    }
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
    // Solo desactivar si realmente salimos del elemento
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
      setIsDragActive(false)
    }
  }

  // Handlers para @dnd-kit (para consistencia)
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
    draggedFiles,
    nativeDropProps,
    DndContextProps,
    platformCapabilities
  }
}
