import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app } from 'electron'
import { LoggerUtil } from 'perrito-core'
import { setupIpcHandlers } from './ipcHandlers'
import { createMenu } from './menu'
import { runPreloadTasks } from './preloader'
import { languageManager } from './utils/language'
import { createMainWindow, getMainWindow } from './window'

import './services/microsoftAuth'

const logger = LoggerUtil.getLogger('Main')

app.disableHardwareAcceleration()

// Inicialización de la aplicación
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.perrito-studios.launcher')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Inicializar el sistema de idiomas
  languageManager.initialize()

  setupIpcHandlers()

  const mainWindow = createMainWindow()

  // Ejecutar tareas de pre-carga
  runPreloadTasks(mainWindow).catch((err) =>
    logger.error('[PRELOADER] Error durante la pre-carga:', err)
  )

  createMenu()

  logger.info('[+] Perrito Studios Launcher iniciado correctamente')
  logger.info('[+] Idioma actual:', languageManager.getCurrentLanguage())
})

// Cerrar cuando todas las ventanas estén cerradas
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Reactivación en macOS
app.on('activate', () => {
  if (!getMainWindow()) {
    createMainWindow()
  }
})

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error)
})

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason)
})

// Exportar para usar en otros módulos si es necesario
export { getMainWindow }
