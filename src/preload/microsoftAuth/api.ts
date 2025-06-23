import { ipcRenderer } from 'electron'
import { MSFT_OPCODE } from '../../main/constants/ipc'

export const microsoftAuthAPI = {
  openLogin: (successCallback?: boolean, onCloseCallback?: boolean) =>
    ipcRenderer.send(MSFT_OPCODE.OPEN_LOGIN, successCallback, onCloseCallback),
  openLogout: (uuid: string, isLastAccount: boolean) =>
    ipcRenderer.send(MSFT_OPCODE.OPEN_LOGOUT, uuid, isLastAccount),

  // Event listeners
  onLoginReply: (callback: (type: string, data: any, closeCallback?: boolean) => void) => {
    ipcRenderer.on(MSFT_OPCODE.REPLY_LOGIN, (_, type, data, closeCallback) =>
      callback(type, data, closeCallback)
    )
  },
  onLogoutReply: (callback: (type: string, uuid?: string, isLastAccount?: boolean) => void) => {
    ipcRenderer.on(MSFT_OPCODE.REPLY_LOGOUT, (_, type, uuid, isLastAccount) =>
      callback(type, uuid, isLastAccount)
    )
  },
  removeLoginListener: () => {
    ipcRenderer.removeAllListeners(MSFT_OPCODE.REPLY_LOGIN)
  },
  removeLogoutListener: () => {
    ipcRenderer.removeAllListeners(MSFT_OPCODE.REPLY_LOGOUT)
  }
}
