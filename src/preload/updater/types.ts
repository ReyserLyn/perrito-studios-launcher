export interface UpdaterAPI {
  // Inicializar el updater
  initAutoUpdater: () => Promise<{ success: boolean; error?: string }>

  // Verificar actualizaciones manualmente
  checkForUpdate: () => Promise<{ success: boolean; error?: string }>

  // Cambiar configuración de prereleases
  allowPrereleaseChange: (allow: boolean) => Promise<{ success: boolean; error?: string }>

  // Descargar actualización
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>

  // Instalar actualización ahora
  installNow: () => Promise<{ success: boolean; error?: string }>

  // Escuchar notificaciones
  onNotification: (callback: (event: string, data?: any) => void) => void

  // Remover listener de notificaciones
  removeNotificationListener: () => void
}

export interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseName?: string
  releaseDate?: string
  downloadURL?: string
}

export interface DownloadProgress {
  percent: number
  bytesPerSecond: number
  total: number
  transferred: number
}

export interface UpdaterEvents {
  'checking-for-update': void
  'update-available': UpdateInfo
  'update-not-available': void
  'update-downloaded': UpdateInfo
  'download-progress': DownloadProgress
  error: { message: string }
  'installing-update': void
}
