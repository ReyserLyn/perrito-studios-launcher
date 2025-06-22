export default interface LaunchAPI {
  // Event listeners para progreso de lanzamiento
  onProgress: (callback: (stage: string, progress: number, details?: string) => void) => void
  onError: (callback: (error: string) => void) => void
  onSuccess: (callback: () => void) => void
  onLog: (callback: (type: 'stdout' | 'stderr', data: string) => void) => void
  removeProgressListener: () => void
  removeErrorListener: () => void
  removeSuccessListener: () => void
  removeLogListener: () => void
}
