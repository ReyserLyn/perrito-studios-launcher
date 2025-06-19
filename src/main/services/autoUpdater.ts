import { is } from '@electron-toolkit/utils'
import { app, ipcMain, IpcMainEvent } from 'electron'
import { autoUpdater, ProgressInfo, UpdateDownloadedEvent, UpdateInfo } from 'electron-updater'
import { join } from 'path'
import semver from 'semver'
import { AUTO_UPDATER } from '../constants/ipc'

class AutoUpdaterService {
  private isInitialized = false

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Escuchar acciones del renderer
    ipcMain.on(AUTO_UPDATER.INIT, (event: IpcMainEvent, action: string, data?: boolean) => {
      this.handleAction(event, action, data)
    })
  }

  private handleAction(event: IpcMainEvent, action: string, data?: boolean): void {
    switch (action) {
      case AUTO_UPDATER.ACTIONS.INIT_AUTO_UPDATER:
        console.log('Inicializando auto updater...')
        this.initAutoUpdater(event, data)
        event.sender.send(AUTO_UPDATER.NOTIFICATION, 'ready')
        break

      case AUTO_UPDATER.ACTIONS.CHECK_FOR_UPDATE:
        this.checkForUpdates(event)
        break

      case AUTO_UPDATER.ACTIONS.ALLOW_PRERELEASE_CHANGE:
        this.handlePrereleaseChange(data)
        break

      case AUTO_UPDATER.ACTIONS.INSTALL_UPDATE_NOW:
        autoUpdater.quitAndInstall()
        break

      default:
        console.warn('Acción de auto-updater desconocida:', action)
        break
    }
  }

  private initAutoUpdater(event: IpcMainEvent, allowPrerelease?: boolean): void {
    if (this.isInitialized) {
      console.log('Auto updater ya está inicializado')
      return
    }

    // Configuración de prerelease
    if (allowPrerelease !== undefined) {
      autoUpdater.allowPrerelease = allowPrerelease
    } else {
      // Por defecto, permitir prerelease si la versión actual es prerelease
      const currentVersion = app.getVersion()
      const preRelComp = semver.prerelease(currentVersion)
      autoUpdater.allowPrerelease = preRelComp !== null && preRelComp.length > 0
    }

    // Configuración para desarrollo
    if (is.dev) {
      autoUpdater.autoInstallOnAppQuit = false
      autoUpdater.updateConfigPath = join(__dirname, '../../../dev-app-update.yml')
      console.log('Modo desarrollo: usando dev-app-update.yml')
    }

    // En macOS, no descargar automáticamente
    if (process.platform === 'darwin') {
      autoUpdater.autoDownload = false
    }

    // Configurar eventos del auto-updater
    this.setupAutoUpdaterEvents(event)

    this.isInitialized = true
    console.log('Auto updater inicializado correctamente')
  }

  private setupAutoUpdaterEvents(event: IpcMainEvent): void {
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      console.log('Actualización disponible:', info.version)
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'update-available', info)
    })

    autoUpdater.on('update-downloaded', (info: UpdateDownloadedEvent) => {
      console.log('Actualización descargada:', info.version)
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'update-downloaded', info)
    })

    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      console.log('No hay actualizaciones disponibles')
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'update-not-available', info)
    })

    autoUpdater.on('checking-for-update', () => {
      console.log('Buscando actualizaciones...')
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'checking-for-update')
    })

    autoUpdater.on('error', (error: Error) => {
      console.error('Error en auto-updater:', error)
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'error', {
        message: error.message,
        stack: error.stack
      })
    })

    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      console.log(`Progreso de descarga: ${Math.round(progressObj.percent)}%`)
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'download-progress', progressObj)
    })
  }

  private async checkForUpdates(event: IpcMainEvent): Promise<void> {
    try {
      await autoUpdater.checkForUpdates()
    } catch (error) {
      console.error('Error al buscar actualizaciones:', error)
      event.sender.send(AUTO_UPDATER.NOTIFICATION, 'error', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  private handlePrereleaseChange(allowPrerelease?: boolean): void {
    if (allowPrerelease === undefined) {
      const currentVersion = app.getVersion()
      const preRelComp = semver.prerelease(currentVersion)
      autoUpdater.allowPrerelease = preRelComp !== null && preRelComp.length > 0
    } else {
      autoUpdater.allowPrerelease = allowPrerelease
    }

    console.log('Prerelease configurado a:', autoUpdater.allowPrerelease)
  }

  public getIsInitialized(): boolean {
    return this.isInitialized
  }
}

// Instancia singleton
export const autoUpdaterService = new AutoUpdaterService()
export default autoUpdaterService
