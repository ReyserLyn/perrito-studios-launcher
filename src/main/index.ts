import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app } from 'electron'
import { LoggerUtil } from 'perrito-core'
import { setupIpcHandlers } from './ipcHandlers'
import { createMenu } from './menu'
import { runPreloadTasks } from './preloader'
import * as ConfigManager from './services/configManager'
import { languageManager } from './utils/language'
import { createMainWindow, getMainWindow } from './window'

import './services/microsoftAuth'

const logger = LoggerUtil.getLogger('Main')

app.disableHardwareAcceleration()

// Inicialización de la aplicación
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.perrito-studios.launcher')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Cargar configuración antes de inicializar otros sistemas
  try {
    ConfigManager.load()

    // Sincronizar idioma con la configuración
    const configLang = ConfigManager.getCurrentLanguage()
    if (configLang) {
      languageManager.setLanguage(configLang)
    }
  } catch (error) {
    logger.error('Error cargando configuración:', error)
  }

  setupIpcHandlers()

  const mainWindow = createMainWindow()

  // Ejecutar tareas de pre-carga
  runPreloadTasks(mainWindow).catch((err) =>
    logger.error('[PRELOADER] Error durante la pre-carga:', err)
  )

  createMenu()
})

// Manejar cierre de la aplicación
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
