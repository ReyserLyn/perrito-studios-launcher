import { BrowserWindow, ipcMain, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import { AUTO_UPDATER } from '../constants/ipc'

// Logger simple como fallback
const logger = {
  info: (message: string, ...args: any[]) => console.log('[INFO]', message, ...args),
  warn: (message: string, ...args: any[]) => console.warn('[WARN]', message, ...args),
  error: (message: string, ...args: any[]) => console.error('[ERROR]', message, ...args),
  transports: { file: { level: 'info' } }
}

// Configurar logger en autoUpdater
autoUpdater.logger = logger

// Estado del updater
let isCheckingForUpdate = false
let isUpdateDownloading = false
let isUpdateReady = false
let allowPrerelease = false
let allowNotifications = true
let mainWindow: BrowserWindow | null = null

// Función para enviar notificaciones al renderer
function sendNotification(event: string, data?: any) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(AUTO_UPDATER.NOTIFICATION, event, data)
  }
}

// Función para manejar errores de forma segura
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

// Configurar eventos del autoUpdater
function setupAutoUpdaterEvents() {
  // Verificando actualizaciones
  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for update...')
    isCheckingForUpdate = true
    sendNotification('checking-for-update')
  })

  // Actualización disponible
  autoUpdater.on('update-available', (info) => {
    logger.info('Update available:', info)
    isCheckingForUpdate = false
    sendNotification('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseName: info.releaseName,
      releaseDate: info.releaseDate,
      downloadURL: `https://github.com/ReyserLyn/perrito-studios-launcher/releases/tag/v${info.version}`
    })
  })

  // No hay actualizaciones
  autoUpdater.on('update-not-available', (info) => {
    logger.info('Update not available:', info)
    isCheckingForUpdate = false
    sendNotification('update-not-available')
  })

  // Error al verificar/descargar
  autoUpdater.on('error', (err) => {
    logger.error('Update error:', err)
    isCheckingForUpdate = false
    isUpdateDownloading = false
    sendNotification('error', {
      message: getErrorMessage(err)
    })
  })

  // Progreso de descarga
  autoUpdater.on('download-progress', (progressObj) => {
    isUpdateDownloading = true
    sendNotification('download-progress', {
      percent: progressObj.percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      total: progressObj.total,
      transferred: progressObj.transferred
    })
  })

  // Actualización descargada y lista
  autoUpdater.on('update-downloaded', (info) => {
    logger.info('Update downloaded:', info)
    isUpdateDownloading = false
    isUpdateReady = true
    sendNotification('update-downloaded', {
      version: info.version,
      releaseNotes: info.releaseNotes
    })

    // Notificación del sistema usando Electron
    if (mainWindow && allowNotifications) {
      new Notification({
        title: 'Actualización Descargada',
        body: `La versión ${info.version} está lista para instalar.`
      }).show()
    }
  })
}

// Handler principal para el IPC
function setupAutoUpdaterIPC() {
  ipcMain.handle(AUTO_UPDATER.ACTIONS.INIT_AUTO_UPDATER, async (event) => {
    try {
      // Obtener la ventana que envió el mensaje
      const senderWindow = BrowserWindow.fromWebContents(event.sender)
      if (senderWindow) {
        mainWindow = senderWindow
      }

      // Configurar autoUpdater
      autoUpdater.allowPrerelease = allowPrerelease
      autoUpdater.autoDownload = false // Descarga manual para control
      autoUpdater.autoInstallOnAppQuit = true

      logger.info('AutoUpdater initialized')
      return { success: true }
    } catch (error) {
      logger.error('Failed to initialize autoUpdater:', error)
      return { success: false, error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(AUTO_UPDATER.ACTIONS.CHECK_FOR_UPDATE, async () => {
    try {
      if (isCheckingForUpdate) {
        return { success: false, error: 'Ya verificando actualizaciones' }
      }

      logger.info('Manually checking for updates...')
      await autoUpdater.checkForUpdates()
      return { success: true }
    } catch (error) {
      logger.error('Failed to check for updates:', error)
      isCheckingForUpdate = false
      return { success: false, error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(AUTO_UPDATER.ACTIONS.ALLOW_PRERELEASE_CHANGE, async (_event, allow: boolean) => {
    try {
      allowPrerelease = allow
      autoUpdater.allowPrerelease = allow
      logger.info(`Prerelease updates ${allow ? 'enabled' : 'disabled'}`)
      return { success: true }
    } catch (error) {
      logger.error('Failed to change prerelease setting:', error)
      return { success: false, error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(
    AUTO_UPDATER.ACTIONS.ALLOW_NOTIFICATIONS_CHANGE,
    async (_event, allow: boolean) => {
      try {
        allowNotifications = allow
        logger.info(`Update notifications ${allow ? 'enabled' : 'disabled'}`)
        return { success: true }
      } catch (error) {
        logger.error('Failed to change notifications setting:', error)
        return { success: false, error: getErrorMessage(error) }
      }
    }
  )

  ipcMain.handle(AUTO_UPDATER.ACTIONS.INSTALL_UPDATE_NOW, async () => {
    try {
      if (!isUpdateReady) {
        return { success: false, error: 'No hay actualización lista para instalar' }
      }

      logger.info('Installing update now...')

      // Guardar el estado antes de reiniciar
      sendNotification('installing-update')

      // Instalar y reiniciar
      autoUpdater.quitAndInstall()
      return { success: true }
    } catch (error) {
      logger.error('Failed to install update:', error)
      return { success: false, error: getErrorMessage(error) }
    }
  })

  ipcMain.handle(AUTO_UPDATER.ACTIONS.DOWNLOAD_UPDATE, async () => {
    try {
      if (isUpdateDownloading) {
        return { success: false, error: 'Ya hay una descarga en progreso' }
      }

      logger.info('Downloading update...')
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      logger.error('Failed to download update:', error)
      isUpdateDownloading = false
      return { success: false, error: getErrorMessage(error) }
    }
  })

  // Acción legacy para compatibilidad
  ipcMain.on(AUTO_UPDATER.INIT, (event, action, ...args) => {
    const senderWindow = BrowserWindow.fromWebContents(event.sender)
    if (senderWindow) {
      mainWindow = senderWindow
    }

    switch (action) {
      case 'initAutoUpdater':
        autoUpdater.allowPrerelease = allowPrerelease
        autoUpdater.autoDownload = false
        autoUpdater.autoInstallOnAppQuit = true
        break

      case 'checkForUpdate':
        if (!isCheckingForUpdate) {
          autoUpdater.checkForUpdates().catch((err) => {
            logger.error('Legacy check for updates failed:', err)
          })
        }
        break

      case 'allowPrereleaseChange':
        allowPrerelease = args[0]
        autoUpdater.allowPrerelease = allowPrerelease
        break

      case 'installUpdateNow':
        if (isUpdateReady) {
          autoUpdater.quitAndInstall()
        }
        break
    }
  })
}

// Función para auto-check al iniciar la aplicación
export function startAutoUpdateCheck() {
  // Verificar automáticamente después de 30 segundos del inicio
  setTimeout(() => {
    if (!isCheckingForUpdate && mainWindow && !mainWindow.isDestroyed()) {
      logger.info('Starting automatic update check...')
      autoUpdater.checkForUpdates().catch((err) => {
        logger.error('Automatic update check failed:', err)
      })
    }
  }, 30000) // 30 segundos
}

// Función principal para configurar el auto updater
export function setupAutoUpdater() {
  setupAutoUpdaterEvents()
  setupAutoUpdaterIPC()

  // Configuración inicial
  autoUpdater.allowPrerelease = false
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  logger.info('AutoUpdater setup completed')
}

// Función para obtener el estado actual
export function getUpdaterState() {
  return {
    isCheckingForUpdate,
    isUpdateDownloading,
    isUpdateReady,
    allowPrerelease
  }
}
