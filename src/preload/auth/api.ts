import { ipcRenderer } from 'electron'
import { AUTH_OPCODE } from '../../main/constants/ipc'

export const authAPI = {
  // Mojang accounts
  addMojangAccount: (username: string) =>
    ipcRenderer.invoke(AUTH_OPCODE.ADD_MOJANG_ACCOUNT, username),
  removeMojangAccount: (uuid: string) =>
    ipcRenderer.invoke(AUTH_OPCODE.REMOVE_MOJANG_ACCOUNT, uuid),

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) =>
    ipcRenderer.invoke(AUTH_OPCODE.ADD_MICROSOFT_ACCOUNT, authCode),
  removeMicrosoftAccount: (uuid: string) =>
    ipcRenderer.invoke(AUTH_OPCODE.REMOVE_MICROSOFT_ACCOUNT, uuid),

  // Account management
  getSelectedAccount: () => ipcRenderer.invoke(AUTH_OPCODE.GET_SELECTED_ACCOUNT),
  getAllAccounts: () => ipcRenderer.invoke(AUTH_OPCODE.GET_ALL_ACCOUNTS),
  selectAccount: (uuid: string) => ipcRenderer.invoke(AUTH_OPCODE.SELECT_ACCOUNT, uuid),
  validateSelected: () => ipcRenderer.invoke(AUTH_OPCODE.VALIDATE_SELECTED),
  logout: () => ipcRenderer.invoke(AUTH_OPCODE.LOGOUT)
}
