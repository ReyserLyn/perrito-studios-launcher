import { ipcRenderer } from 'electron'

export const updaterAPI = {
  init: (allowPrerelease?: boolean) =>
    ipcRenderer.send('autoUpdateAction', 'initAutoUpdater', allowPrerelease),
  checkForUpdate: () => ipcRenderer.send('autoUpdateAction', 'checkForUpdate'),
  allowPrereleaseChange: (allow: boolean) =>
    ipcRenderer.send('autoUpdateAction', 'allowPrereleaseChange', allow),
  installNow: () => ipcRenderer.send('autoUpdateAction', 'installUpdateNow'),

  // Event listeners
  onNotification: (callback: (event: string, data?: any) => void) => {
    ipcRenderer.on('autoUpdateNotification', (_, event, data) => callback(event, data))
  },
  removeNotificationListener: () => {
    ipcRenderer.removeAllListeners('autoUpdateNotification')
  }
}
