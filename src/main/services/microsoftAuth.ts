import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { join } from 'path'
import { AZURE_CLIENT_ID, MSFT_ERROR, MSFT_OPCODE, MSFT_REPLY_TYPE } from '../constants/ipc'
import { languageManager } from '../utils/language'

interface QueryMap {
  [key: string]: string
}

interface AuthWindow {
  window: BrowserWindow | null
  success: boolean
  successCallback?: boolean
  onCloseCallback?: boolean
}

class MicrosoftAuthService {
  private loginWindow: AuthWindow = { window: null, success: false }
  private logoutWindow: AuthWindow = { window: null, success: false }
  private logoutSuccessSent = false

  private readonly REDIRECT_URI_PREFIX =
    'https://login.microsoftonline.com/common/oauth2/nativeclient?'

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    ipcMain.on(MSFT_OPCODE.OPEN_LOGIN, (event, ...args) => {
      this.handleLogin(event, args[0], args[1])
    })

    ipcMain.on(MSFT_OPCODE.OPEN_LOGOUT, (event, uuid: string, isLastAccount: boolean) => {
      this.handleLogout(event, uuid, isLastAccount)
    })
  }

  private handleLogin(
    event: IpcMainEvent,
    successCallback?: boolean,
    onCloseCallback?: boolean
  ): void {
    if (this.loginWindow.window) {
      event.reply(
        MSFT_OPCODE.REPLY_LOGIN,
        MSFT_REPLY_TYPE.ERROR,
        MSFT_ERROR.ALREADY_OPEN,
        onCloseCallback
      )
      return
    }

    this.loginWindow = {
      window: null,
      success: false,
      successCallback,
      onCloseCallback
    }

    this.createLoginWindow(event)
  }

  private createLoginWindow(event: IpcMainEvent): void {
    this.loginWindow.window = new BrowserWindow({
      title: languageManager.getString('microsoft.loginTitle'),
      backgroundColor: '#222222',
      width: 520,
      height: 600,
      frame: true,
      icon: this.getPlatformIcon('icon'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    this.loginWindow.window.on('closed', () => {
      this.loginWindow.window = null
    })

    this.loginWindow.window.on('close', () => {
      if (!this.loginWindow.success) {
        event.reply(
          MSFT_OPCODE.REPLY_LOGIN,
          MSFT_REPLY_TYPE.ERROR,
          MSFT_ERROR.NOT_FINISHED,
          this.loginWindow.onCloseCallback
        )
      }
    })

    this.loginWindow.window.webContents.on('did-navigate', (_, uri) => {
      this.handleLoginNavigation(event, uri)
    })

    this.loginWindow.window.removeMenu()
    this.loginWindow.window.loadURL(this.buildAuthUrl())
  }

  private handleLoginNavigation(event: IpcMainEvent, uri: string): void {
    if (uri.startsWith(this.REDIRECT_URI_PREFIX)) {
      const queries = uri
        .substring(this.REDIRECT_URI_PREFIX.length)
        .split('#', 1)
        .toString()
        .split('&')
      const queryMap: QueryMap = {}

      queries.forEach((query) => {
        const [name, value] = query.split('=')
        if (name && value) {
          queryMap[name] = decodeURI(value)
        }
      })

      event.reply(
        MSFT_OPCODE.REPLY_LOGIN,
        MSFT_REPLY_TYPE.SUCCESS,
        queryMap,
        this.loginWindow.successCallback
      )

      this.loginWindow.success = true
      this.closeLoginWindow()
    }
  }

  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      prompt: 'select_account',
      client_id: AZURE_CLIENT_ID,
      response_type: 'code',
      scope: 'XboxLive.signin offline_access',
      redirect_uri: 'https://login.microsoftonline.com/common/oauth2/nativeclient',
      cobrandid: '8058f65d-ce06-4c30-9559-473c9275a65d'
    })

    return `https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?${params.toString()}`
  }

  private closeLoginWindow(): void {
    if (this.loginWindow.window) {
      this.loginWindow.window.close()
      this.loginWindow.window = null
    }
  }

  private handleLogout(event: IpcMainEvent, uuid: string, isLastAccount: boolean): void {
    if (this.logoutWindow.window) {
      event.reply(MSFT_OPCODE.REPLY_LOGOUT, MSFT_REPLY_TYPE.ERROR, MSFT_ERROR.ALREADY_OPEN)
      return
    }

    this.logoutWindow = {
      window: null,
      success: false
    }
    this.logoutSuccessSent = false

    this.createLogoutWindow(event, uuid, isLastAccount)
  }

  private createLogoutWindow(event: IpcMainEvent, uuid: string, isLastAccount: boolean): void {
    this.logoutWindow.window = new BrowserWindow({
      title: languageManager.getString('microsoft.logoutTitle'),
      backgroundColor: '#222222',
      width: 520,
      height: 600,
      frame: true,
      icon: this.getPlatformIcon('icon'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    this.logoutWindow.window.on('closed', () => {
      this.logoutWindow.window = null
    })

    this.logoutWindow.window.on('close', () => {
      if (!this.logoutWindow.success) {
        event.reply(MSFT_OPCODE.REPLY_LOGOUT, MSFT_REPLY_TYPE.ERROR, MSFT_ERROR.NOT_FINISHED)
      } else if (!this.logoutSuccessSent) {
        this.logoutSuccessSent = true
        event.reply(MSFT_OPCODE.REPLY_LOGOUT, MSFT_REPLY_TYPE.SUCCESS, uuid, isLastAccount)
      }
    })

    this.logoutWindow.window.webContents.on('did-navigate', (_, uri) => {
      this.handleLogoutNavigation(event, uri, uuid, isLastAccount)
    })

    this.logoutWindow.window.removeMenu()
    this.logoutWindow.window.loadURL('https://login.microsoftonline.com/common/oauth2/v2.0/logout')
  }

  private handleLogoutNavigation(
    event: IpcMainEvent,
    uri: string,
    uuid: string,
    isLastAccount: boolean
  ): void {
    if (uri.startsWith('https://login.microsoftonline.com/common/oauth2/v2.0/logoutsession')) {
      this.logoutWindow.success = true

      setTimeout(() => {
        if (!this.logoutSuccessSent) {
          this.logoutSuccessSent = true
          event.reply(MSFT_OPCODE.REPLY_LOGOUT, MSFT_REPLY_TYPE.SUCCESS, uuid, isLastAccount)
        }

        this.closeLogoutWindow()
      }, 5000)
    }
  }

  private closeLogoutWindow(): void {
    if (this.logoutWindow.window) {
      this.logoutWindow.window.close()
      this.logoutWindow.window = null
    }
  }

  private getPlatformIcon(filename: string): string {
    const ext = process.platform === 'win32' ? 'ico' : 'png'
    return join(__dirname, '../../../resources', `${filename}.${ext}`)
  }
}

// Instancia singleton
export const microsoftAuthService = new MicrosoftAuthService()
export default microsoftAuthService
