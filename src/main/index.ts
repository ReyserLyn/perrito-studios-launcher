import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app } from 'electron'
import { setupIpcHandlers } from './ipcHandlers'
import { createMenu } from './menu'
import { runPreloadTasks } from './preloader'
import { languageManager } from './utils/language'
import { createMainWindow, getMainWindow } from './window'

import './services/microsoftAuth'

app.disableHardwareAcceleration()

// Inicialización de la aplicación
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.perrito-studios.launcher')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()

  const mainWindow = createMainWindow()

  // Ejecutar tareas de pre-carga
  runPreloadTasks(mainWindow).catch((err) =>
    console.error('[PRELOADER] Error durante la pre-carga:', err)
  )

  createMenu()

  console.log('[+] Perrito Studios Launcher iniciado correctamente')
  console.log('[+] Idioma actual:', languageManager.getCurrentLanguage())
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

// Exportar para usar en otros módulos si es necesario
export { getMainWindow }
