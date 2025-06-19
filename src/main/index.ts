import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

// Importar servicios modernizados
import { DISTRIBUTION, SHELL_OPCODE } from './constants/ipc'
import './services/autoUpdater'
import './services/microsoftAuth'
import languageManager from './utils/language'

// Configuración de la aplicación
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
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
}

function createMenu(): void {
  if (process.platform === 'darwin') {
    // Menu para macOS
    const applicationSubMenu: MenuItemConstructorOptions = {
      label: 'Application',
      submenu: [
        {
          label: 'Acerca de Perrito Studios Launcher',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: 'Salir',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    }

    // Menu de edición para soporte de atajos de teclado
    const editSubMenu: MenuItemConstructorOptions = {
      label: 'Editar',
      submenu: [
        {
          label: 'Deshacer',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Rehacer',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cortar',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Pegar',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Seleccionar Todo',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    }

    const menuTemplate: MenuItemConstructorOptions[] = [applicationSubMenu, editSubMenu]
    const menuObject = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuObject)
  }
}

// Configurar handlers IPC adicionales
function setupIpcHandlers(): void {
  // Manejar distribución de índices
  ipcMain.on(DISTRIBUTION.INDEX_DONE, (event, res) => {
    event.sender.send(DISTRIBUTION.INDEX_DONE, res)
  })

  // Manejar eliminación de archivos a la papelera
  ipcMain.handle(SHELL_OPCODE.TRASH_ITEM, async (_event, filePath: string) => {
    try {
      await shell.trashItem(filePath)
      return {
        result: true
      }
    } catch (error) {
      console.error('Error al mover archivo a papelera:', error)
      return {
        result: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  })

  // === HANDLERS DEL SISTEMA DE IDIOMAS ===

  // Obtener traducción
  ipcMain.on(
    'language-query',
    (event, key: string, placeholders?: Record<string, string | number>) => {
      try {
        const translation = languageManager.query(key, placeholders)
        event.returnValue = translation
      } catch (error) {
        console.error('Error getting translation:', error)
        event.returnValue = key
      }
    }
  )

  // Obtener traducción con pluralización
  ipcMain.on(
    'language-plural',
    (
      event,
      key: string,
      options: { count: number; zero?: string; one?: string; other?: string }
    ) => {
      try {
        const translation = languageManager.plural(key, options)
        event.returnValue = translation
      } catch (error) {
        console.error('Error getting plural translation:', error)
        event.returnValue = key
      }
    }
  )

  // Formatear fecha
  ipcMain.on('language-format-date', (event, dateString: string, format: 'short' | 'long') => {
    try {
      const date = new Date(dateString)
      const formatted = languageManager.formatDate(date, format)
      event.returnValue = formatted
    } catch (error) {
      console.error('Error formatting date:', error)
      event.returnValue = dateString
    }
  })

  // Formatear número
  ipcMain.on('language-format-number', (event, num: number) => {
    try {
      const formatted = languageManager.formatNumber(num)
      event.returnValue = formatted
    } catch (error) {
      console.error('Error formatting number:', error)
      event.returnValue = num.toString()
    }
  })

  // Cambiar idioma
  ipcMain.on('language-change', (_event, lang: string) => {
    try {
      languageManager.setLanguage(lang)
      // Notificar a todos los renderers sobre el cambio
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('language-changed', lang)
      })
      console.log('[+] Idioma cambiado a:', lang)
    } catch (error) {
      console.error('Error changing language:', error)
    }
  })

  // Obtener idioma actual
  ipcMain.on('language-get-current', (event) => {
    try {
      const currentLang = languageManager.getCurrentLanguage()
      event.returnValue = currentLang
    } catch (error) {
      console.error('Error getting current language:', error)
      event.returnValue = 'es'
    }
  })

  // IPC test (mantener para compatibilidad)
  ipcMain.on('ping', () => console.log('pong'))
}

// Inicialización de la aplicación
app.whenReady().then(() => {
  // Configurar ID de la aplicación
  electronApp.setAppUserModelId('com.perrito-studios.launcher')

  // Configurar atajos de teclado para desarrollo
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Configurar handlers IPC
  setupIpcHandlers()

  // Crear ventana principal
  createWindow()

  // Crear menú
  createMenu()

  // Mensaje de inicio
  console.log('[+] Perrito Studios Launcher iniciado correctamente')
  console.log('[+] Idioma actual:', languageManager.getCurrentLanguage())

  app.on('activate', function () {
    // En macOS es común re-crear la ventana cuando se hace clic en el dock
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Cerrar cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // En macOS es común re-crear la ventana cuando se hace clic en el dock
  if (mainWindow === null) {
    createWindow()
  }
})

// Exportar para usar en otros módulos si es necesario
export { mainWindow }
