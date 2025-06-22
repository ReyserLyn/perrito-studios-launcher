export default interface MicrosoftAuthAPI {
  openLogin: (successCallback?: boolean, onCloseCallback?: boolean) => void
  openLogout: (uuid: string, isLastAccount: boolean) => void

  // Event listeners
  onLoginReply: (callback: (type: string, data: any, closeCallback?: boolean) => void) => void
  onLogoutReply: (callback: (type: string, uuid?: string, isLastAccount?: boolean) => void) => void
  removeLoginListener: () => void
  removeLogoutListener: () => void
}
