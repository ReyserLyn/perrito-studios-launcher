export default interface UpdaterAPI {
  init: (allowPrerelease?: boolean) => void
  checkForUpdate: () => void
  allowPrereleaseChange: (allow: boolean) => void
  installNow: () => void

  // Event listeners
  onNotification: (callback: (event: string, data?: any) => void) => void
  removeNotificationListener: () => void
}
