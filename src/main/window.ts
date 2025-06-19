import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow | null = null

export function createMainWindow(): BrowserWindow {
  // Crear ventana principal
  mainWindow = new BrowserWindow({
    width: 1500,
    minWidth: 1255,
    height: 844,
    minHeight: 704,
    show: false,
    autoHideMenuBar: true,
    icon: icon,
    title: 'Perrito Studios Launcher',
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Desactivar las teclas de recarga
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control && input.key.toLowerCase() === 'r') || // Ctrl+R
      input.key === 'F5' // F5
    ) {
      event.preventDefault()
    }
  })

  // Cargar la aplicación
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // La ventana es redimensionable
  mainWindow.resizable = true

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}
