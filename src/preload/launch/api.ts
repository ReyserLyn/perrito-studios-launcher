import { ipcRenderer } from 'electron'

export const launchAPI = {
  // Event listeners para progreso de lanzamiento
  onProgress: (callback: (stage: string, progress: number, details?: string) => void) => {
    ipcRenderer.on('launch:progress', (_, stage, progress, details) =>
      callback(stage, progress, details)
    )
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('launch:error', (_, error) => callback(error))
  },
  onSuccess: (callback: () => void) => {
    ipcRenderer.on('launch:success', () => callback())
  },
  onLog: (callback: (type: 'stdout' | 'stderr', data: string) => void) => {
    ipcRenderer.on('launch:log', (_, type, data) => callback(type, data))
  },
  removeProgressListener: () => {
    ipcRenderer.removeAllListeners('launch:progress')
  },
  removeErrorListener: () => {
    ipcRenderer.removeAllListeners('launch:error')
  },
  removeSuccessListener: () => {
    ipcRenderer.removeAllListeners('launch:success')
  },
  removeLogListener: () => {
    ipcRenderer.removeAllListeners('launch:log')
  }
}
