export default interface AuthAPI {
  // Mojang accounts
  addMojangAccount: (username: string) => Promise<any>
  removeMojangAccount: (uuid: string) => Promise<any>

  // Microsoft accounts
  addMicrosoftAccount: (authCode: string) => Promise<any>
  removeMicrosoftAccount: (uuid: string) => Promise<any>
  microsoftLogin: (authCode?: string) => Promise<any>

  // Account management
  getSelectedAccount: () => Promise<any>
  getAllAccounts: () => Promise<any>
  selectAccount: (uuid: string) => Promise<any>
  validateSelected: () => Promise<any>
  checkStatus: () => Promise<any>
  logout: () => Promise<any>
}
