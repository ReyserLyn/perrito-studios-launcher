import { BrowserWindow } from 'electron'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { LoggerUtil } from 'perrito-core'
import { DISTRIBUTION } from './constants/ipc'
import * as ConfigManager from './services/configManager'
import { distroAPI } from './services/distributionManager'

const log = LoggerUtil.getLogger('Preloader')

/**
 * @param win Ventana principal a la que se le enviarán los eventos por IPC.
 */
export async function runPreloadTasks(win: BrowserWindow): Promise<void> {
  log.info('[i] Iniciando tareas de pre-carga…')

  // 1) Cargar configuración del usuario.
  try {
    ConfigManager.load()
    log.info('[+] Configuración cargada')
  } catch (error) {
    log.error('No se pudo cargar la configuración:', error)
  }

  // 2) Asegurar que la API de distribución usa los directorios correctos.
  try {
    // @ts-ignore distroAPI expone estas propiedades dinámicamente en perrito-core
    distroAPI.commonDir = ConfigManager.getCommonDirectory()
    // @ts-ignore Propiedad dinámica en la implementación original del core
    distroAPI.instanceDir = ConfigManager.getInstanceDirectory()
  } catch (error) {
    log.warn('No se pudieron establecer los directorios comunes de distroAPI:', error)
  }

  // 3) Descargar o cargar en caché el índice de distribución.
  let distroLoaded = false
  try {
    const distro = await distroAPI.getDistribution()
    distroLoaded = distro != null
    log.info('[+] Índice de distribución cargado')

    if (distro) {
      const currentServer = ConfigManager.getSelectedServer()
      if (currentServer == null || (distro as any).getServerById(currentServer) == null) {
        log.info('Resolviendo servidor seleccionado por defecto…')
        ConfigManager.setSelectedServer((distro as any).getMainServer().rawServer.id)
        ConfigManager.save()
      }
    }
  } catch (error) {
    log.error('Error al obtener el índice de distribución:', error)
  }

  // Notificar al renderizador que el índice se cargó (o falló).
  win.webContents.send(DISTRIBUTION.DISTRIBUTION_INDEX_DONE, distroLoaded)

  // 4) Limpiar directorio temporal de nativos por si el launcher se cerró bruscamente antes.
  try {
    await fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()))
    log.info('[+] Directorio de nativos temporales limpiado')
  } catch (error) {
    log.warn('No se pudo limpiar el directorio de nativos temporales:', error)
  }

  // 5) La recarga periódica del nombre de usuario se eliminó.
  // Esta funcionalidad ahora se maneja a través del sistema de autenticación.

  log.info('[+] Pre-carga finalizada')
}
