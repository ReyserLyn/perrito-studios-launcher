import type { IpcRendererEvent } from 'electron'
import { ipcRenderer } from 'electron'
import { AUTO_UPDATER } from '../../main/constants/ipc'
import type { UpdaterAPI } from './types'

let notificationListener:
  | ((event: IpcRendererEvent, eventType: string, data?: any) => void)
  | null = null

export const updaterAPI: UpdaterAPI = {
  // Inicializar el updater
  initAutoUpdater: () => {
    return ipcRenderer.invoke(AUTO_UPDATER.ACTIONS.INIT_AUTO_UPDATER)
  },

  // Verificar actualizaciones manualmente
  checkForUpdate: () => {
    return ipcRenderer.invoke(AUTO_UPDATER.ACTIONS.CHECK_FOR_UPDATE)
  },

  // Cambiar configuración de prereleases
  allowPrereleaseChange: (allow: boolean) => {
    return ipcRenderer.invoke(AUTO_UPDATER.ACTIONS.ALLOW_PRERELEASE_CHANGE, allow)
  },

  // Descargar actualización
  downloadUpdate: () => {
    return ipcRenderer.invoke(AUTO_UPDATER.ACTIONS.DOWNLOAD_UPDATE)
  },

  // Instalar actualización ahora
  installNow: () => {
    return ipcRenderer.invoke(AUTO_UPDATER.ACTIONS.INSTALL_UPDATE_NOW)
  },

  // Escuchar notificaciones del updater
  onNotification: (callback: (event: string, data?: any) => void) => {
    // Remover listener anterior si existe
    if (notificationListener) {
      ipcRenderer.removeListener(AUTO_UPDATER.NOTIFICATION, notificationListener)
    }

    // Crear nuevo listener
    notificationListener = (_event: IpcRendererEvent, eventType: string, data?: any) => {
      callback(eventType, data)
    }

    // Registrar el listener
    ipcRenderer.on(AUTO_UPDATER.NOTIFICATION, notificationListener)
  },

  // Remover listener de notificaciones
  removeNotificationListener: () => {
    if (notificationListener) {
      ipcRenderer.removeListener(AUTO_UPDATER.NOTIFICATION, notificationListener)
      notificationListener = null
    }
  }
}
