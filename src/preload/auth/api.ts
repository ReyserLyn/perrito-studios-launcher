import { ipcRenderer } from 'electron'

export const authAPI = {
  // Mojang accounts
  addMojangAccount: (username: string) => ipcRenderer.invoke('auth:add-mojang-account', username),
  removeMojangAccount: (uuid: string) => ipcRenderer.invoke('auth:remove-mojang-account', uuid),

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) =>
    ipcRenderer.invoke('auth:add-microsoft-account', authCode),
  removeMicrosoftAccount: (uuid: string) =>
    ipcRenderer.invoke('auth:remove-microsoft-account', uuid),
  microsoftLogin: (authCode?: string) => ipcRenderer.invoke('auth:microsoft-login', authCode),

  // Account management
  getSelectedAccount: () => ipcRenderer.invoke('auth:get-selected-account'),
  getAllAccounts: () => ipcRenderer.invoke('auth:get-all-accounts'),
  selectAccount: (uuid: string) => ipcRenderer.invoke('auth:select-account', uuid),
  validateSelected: () => ipcRenderer.invoke('auth:validate-selected'),
  checkStatus: () => ipcRenderer.invoke('auth:check-status'),
  logout: () => ipcRenderer.invoke('auth:logout')
}
