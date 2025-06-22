import { validateLocalFile } from 'perrito-core/common'
import { app, BrowserWindow, ipcMain } from 'electron'
import { distroAPI } from '../services/distributionManager'
import { ProcessBuilder } from '../services/processBuilder'
import * as ConfigManager from '../services/configManager'
import {
  DistributionIndexProcessor,
  downloadFile,
  FullRepair,
  MojangIndexProcessor
} from 'perrito-core/dl'
import {
  discoverBestJvmInstallation,
  ensureJavaDirIsRoot,
  extractJdk,
  javaExecFromRoot,
  latestOpenJDK,
  validateSelectedJvm
} from 'perrito-core/java'
import { PROCESS_BUILDER_OPCODE } from '../constants/ipc'
import { ModManifest, VanillaManifest } from '../types/processBuilder'
import { LaunchGameOptions } from '../../preload/process/types'

export default function setupProcessBuilderHandlers(): void {
  // Helper para emitir eventos de progreso
  const emitProgress = (stage: string, progress: number, details?: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:progress', stage, progress, details)
    })
  }

  const emitError = (error: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:error', error)
    })
  }

  const emitSuccess = () => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:success')
    })
  }

  const emitLog = (type: 'stdout' | 'stderr', data: string) => {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send('launch:log', type, data)
    })
  }

  // Validación inicial del lanzamiento
  ipcMain.handle(PROCESS_BUILDER_OPCODE.VALIDATE_LAUNCH, async () => {
    try {
      const selectedAccount = ConfigManager.getSelectedAccount()
      const selectedServer = ConfigManager.getSelectedServer()

      if (!selectedAccount) {
        throw new Error('No hay cuenta seleccionada')
      }

      if (!selectedServer) {
        throw new Error('No hay servidor seleccionado')
      }

      const distro = await distroAPI.getDistribution()
      const server = distro.getServerById(selectedServer)

      if (!server) {
        throw new Error('Servidor no encontrado en la distribución')
      }

      return { success: true, server, account: selectedAccount }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Escaneo del sistema (Java)
  ipcMain.handle(PROCESS_BUILDER_OPCODE.SYSTEM_SCAN, async (_event, serverId: string) => {
    try {
      emitProgress('java-scan', 0, 'Verificando instalación de Java...')

      const distro = await distroAPI.getDistribution()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error('Servidor no encontrado')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      const jExe = ConfigManager.getJavaExecutable(serverId)

      if (jExe) {
        emitProgress('java-scan', 50, 'Validando Java existente...')
        const details = await validateSelectedJvm(
          ensureJavaDirIsRoot(jExe),
          server.effectiveJavaOptions.supported
        )

        if (details) {
          emitProgress('java-scan', 100, 'Java válido encontrado')
          return { success: true, javaPath: jExe, needsDownload: false }
        }
      }

      emitProgress('java-scan', 75, 'Buscando instalaciones de Java...')
      const jvmDetails = await discoverBestJvmInstallation(
        ConfigManager.getDataDirectory(),
        server.effectiveJavaOptions.supported
      )

      if (jvmDetails) {
        const javaExec = javaExecFromRoot(jvmDetails.path)
        ConfigManager.setJavaExecutable(serverId, javaExec)
        ConfigManager.save()

        emitProgress('java-scan', 100, 'Java encontrado y configurado')
        return { success: true, javaPath: javaExec, needsDownload: false }
      }

      emitProgress('java-scan', 100, 'Java no encontrado, descarga requerida')
      return {
        success: true,
        needsDownload: true,
        suggestedMajor: server.effectiveJavaOptions.suggestedMajor
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error en escaneo de Java')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Descarga de Java
  ipcMain.handle(PROCESS_BUILDER_OPCODE.DOWNLOAD_JAVA, async (_event, serverId: string) => {
    try {
      emitProgress('java-download', 0, 'Preparando descarga de Java...')

      const distro = await distroAPI.getDistribution()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error('Servidor no encontrado')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      const asset = await latestOpenJDK(
        server.effectiveJavaOptions.suggestedMajor,
        ConfigManager.getDataDirectory(),
        server.effectiveJavaOptions.distribution
      )

      if (!asset) {
        throw new Error('No se pudo encontrar una versión de Java compatible')
      }

      emitProgress(
        'java-download',
        10,
        `Descargando Java ${server.effectiveJavaOptions.suggestedMajor}...`
      )

      let received = 0
      await downloadFile(asset.url, asset.path, ({ transferred }) => {
        received = transferred
        const progress = Math.trunc((transferred / asset.size) * 80) + 10 // 10-90%
        emitProgress(
          'java-download',
          progress,
          `Descargando Java... ${Math.trunc((transferred / asset.size) * 100)}%`
        )
      })

      if (received !== asset.size) {
        if (!(await validateLocalFile(asset.path, asset.algo, asset.hash))) {
          throw new Error('El archivo de Java descargado está corrupto')
        }
      }

      emitProgress('java-download', 90, 'Extrayendo Java...')
      const newJavaExec = await extractJdk(asset.path)

      ConfigManager.setJavaExecutable(serverId, newJavaExec)
      ConfigManager.save()

      emitProgress('java-download', 100, 'Java instalado exitosamente')
      return { success: true, javaPath: newJavaExec }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error descargando Java')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Handler combinado de validación y descarga (como en el código original)
  ipcMain.handle(PROCESS_BUILDER_OPCODE.VALIDATE_AND_DOWNLOAD, async (_event, serverId: string) => {
    let fullRepairModule: FullRepair | null = null

    try {
      // Refrescar distribución para asegurar que tenemos la información más actualizada
      console.log(`[FullRepair] Refrescando distribución para validación y descarga...`)
      const distro = await distroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)

      if (!server) {
        throw new Error(`Servidor ${serverId} no encontrado en la distribución`)
      }

      console.log(`[FullRepair] Iniciando validación y descarga para servidor: ${serverId}`)
      console.log(`[FullRepair] Versión de Minecraft: ${server.rawServer.minecraftVersion}`)
      console.log(`[FullRepair] Common directory: ${ConfigManager.getCommonDirectory()}`)
      console.log(`[FullRepair] Instance directory: ${ConfigManager.getInstanceDirectory()}`)
      console.log(`[FullRepair] Launcher directory: ${ConfigManager.getLauncherDirectory()}`)
      console.log(`[FullRepair] Dev mode: ${distroAPI.isDevMode()}`)

      // Crear UNA SOLA instancia de FullRepair (como en el código original)
      fullRepairModule = new FullRepair(
        ConfigManager.getCommonDirectory(),
        ConfigManager.getInstanceDirectory(),
        ConfigManager.getLauncherDirectory(),
        serverId,
        distroAPI.isDevMode()
      )

      fullRepairModule.spawnReceiver()

      // Configurar listeners
      fullRepairModule.childProcess.on('error', (err) => {
        console.error('[FullRepair] Error en proceso hijo:', err)
      })

      fullRepairModule.childProcess.on('close', (code, signal) => {
        console.log(`[FullRepair] Proceso hijo cerrado con código: ${code}, señal: ${signal}`)
        if (code !== 0) {
          console.error(`[FullRepair] Proceso hijo terminó con código de error: ${code}`)
        }
      })

      if (fullRepairModule.childProcess.stdout) {
        fullRepairModule.childProcess.stdout.on('data', (data) => {
          console.log(`[FullRepair] stdout: ${data.toString().trim()}`)
        })
      }

      if (fullRepairModule.childProcess.stderr) {
        fullRepairModule.childProcess.stderr.on('data', (data) => {
          console.error(`[FullRepair] stderr: ${data.toString().trim()}`)
        })
      }

      // PASO 1: Validación de archivos
      emitProgress('file-validation', 0, 'Validando integridad de archivos...')
      console.log('[FullRepair] Iniciando validación...')

      const invalidFileCount = await fullRepairModule.verifyFiles((percent: number) => {
        console.log(`[FullRepair] Progreso de validación: ${percent}%`)
        emitProgress('file-validation', percent, 'Validando integridad de archivos...')
      })

      console.log(`[FullRepair] Validación completada. Archivos inválidos: ${invalidFileCount}`)

      // PASO 2: Descarga de archivos (si es necesario)
      if (invalidFileCount > 0) {
        emitProgress('file-download', 0, 'Descargando archivos necesarios...')
        console.log('[FullRepair] Iniciando descarga...')

        await fullRepairModule.download((percent: number) => {
          console.log(`[FullRepair] Progreso de descarga: ${percent}%`)
          emitProgress('file-download', percent, 'Descargando archivos...')
        })

        console.log('[FullRepair] Descarga completada')
      } else {
        console.log('[FullRepair] No hay archivos que descargar, omitiendo descarga')
      }

      // Destruir la instancia al final
      fullRepairModule.destroyReceiver()
      fullRepairModule = null

      emitProgress('file-download', 100, 'Validación y descarga completadas')
      return {
        success: true,
        invalidFileCount,
        downloadPerformed: invalidFileCount > 0
      }
    } catch (error) {
      console.error('[FullRepair] Error en validación y descarga:', error)

      // Limpiar en caso de error
      if (fullRepairModule) {
        try {
          fullRepairModule.destroyReceiver()
        } catch (cleanupError) {
          console.error('[FullRepair] Error limpiando FullRepair:', cleanupError)
        }
      }

      emitError(error instanceof Error ? error.message : 'Error validando y descargando archivos')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Preparación del lanzamiento
  ipcMain.handle(PROCESS_BUILDER_OPCODE.PREPARE_LAUNCH, async (_event, serverId: string) => {
    try {
      emitProgress('launch-prep', 0, 'Preparando lanzamiento...')

      const distro = await distroAPI.refreshDistributionOrFallback()
      const server = distro.getServerById(serverId)
      const authUser = ConfigManager.getSelectedAccount()

      if (!server || !authUser) {
        throw new Error('Servidor o cuenta no encontrados')
      }

      // Asegurar que la configuración de Java esté inicializada
      ConfigManager.ensureJavaConfig(serverId, server.effectiveJavaOptions)

      // Verificar que Java esté configurado
      const javaExec = ConfigManager.getJavaExecutable(serverId)
      if (!javaExec) {
        throw new Error('Java no está configurado. Ejecuta primero el escaneo del sistema.')
      }

      emitProgress('launch-prep', 25, 'Procesando manifiestos...')

      const mojangIndexProcessor = new MojangIndexProcessor(
        ConfigManager.getCommonDirectory(),
        server.rawServer.minecraftVersion
      )

      const distributionIndexProcessor = new DistributionIndexProcessor(
        ConfigManager.getCommonDirectory(),
        distro,
        server.rawServer.id
      )

      emitProgress('launch-prep', 50, 'Cargando datos de versión...')

      let modLoaderData: ModManifest, versionData: VanillaManifest

      try {
        ;[modLoaderData, versionData] = await Promise.all([
          distributionIndexProcessor.loadModLoaderVersionJson(),
          mojangIndexProcessor.getVersionJson()
        ])
      } catch (manifestError) {
        throw new Error(
          `Error cargando manifiestos: ${manifestError instanceof Error ? manifestError.message : 'Error desconocido'}. Asegúrate de que la validación y descarga de archivos se completó correctamente.`
        )
      }

      emitProgress('launch-prep', 100, 'Preparación completada')

      return {
        success: true,
        server,
        authUser,
        modLoaderData,
        versionData
      }
    } catch (error) {
      emitError(error instanceof Error ? error.message : 'Error preparando lanzamiento')
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Lanzamiento del juego
  ipcMain.handle(
    PROCESS_BUILDER_OPCODE.LAUNCH_GAME,
    async (_event, launchData: LaunchGameOptions) => {
      try {
        emitProgress('launching', 0, 'Construyendo proceso de Minecraft...')

        const { server, account, modLoaderData, versionData } = launchData

        const distro = await distroAPI.refreshDistributionOrFallback()
        const perritoServer = distro.getServerById(server.rawServer.id)

        if (!perritoServer) {
          throw new Error(`No se pudo encontrar el servidor ${server.rawServer.id}`)
        }

        console.log(`[ProcessBuilder] Servidor reconstruido: ${perritoServer.rawServer.id}`)
        console.log(`[ProcessBuilder] Módulos en servidor: ${perritoServer.modules.length}`)
        console.log(
          `[ProcessBuilder] Primer módulo tipo: ${perritoServer.modules[0]?.rawModule?.type}`
        )

        const pb = new ProcessBuilder({
          distroServer: perritoServer,
          vanillaManifest: versionData,
          modManifest: modLoaderData,
          authUser: account,
          launcherVersion: app.getVersion()
        })

        emitProgress('launching', 50, 'Iniciando Minecraft...')

        const proc = await pb.build()

        // Configurar listeners para logs
        proc.stdout?.on('data', (data: string) => {
          emitLog('stdout', data.toString())
        })

        proc.stderr?.on('data', (data: string) => {
          emitLog('stderr', data.toString())
        })

        proc.on('close', (code: number | null) => {
          if (code !== 0) {
            emitError(`Minecraft cerró con código: ${code}`)
          }
        })

        emitProgress('launching', 100, 'Minecraft iniciado exitosamente')
        emitSuccess()

        return { success: true, pid: proc.pid }
      } catch (error) {
        emitError(error instanceof Error ? error.message : 'Error lanzando Minecraft')
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }
    }
  )

  // Terminar proceso
  ipcMain.handle(PROCESS_BUILDER_OPCODE.KILL_PROCESS, async () => {
    try {
      // Implementar lógica para terminar el proceso de Minecraft
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })

  // Estado del proceso
  ipcMain.handle(PROCESS_BUILDER_OPCODE.GET_PROCESS_STATUS, async () => {
    try {
      // Implementar lógica para obtener estado del proceso
      return { success: true, status: 'idle' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  })
}
