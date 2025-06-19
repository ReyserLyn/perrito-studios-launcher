/**
 * ProcessBuilder
 *
 * Modernización del constructor de procesos para lanzamiento de Minecraft.
 * Maneja la construcción de argumentos JVM, gestión de mods, librerías nativas
 * y el lanzamiento del proceso de Minecraft con soporte completo para:
 * - Forge (todas las versiones)
 * - Fabric
 * - LiteLoader
 * - Vanilla Minecraft
 *
 * @module processbuilder
 */

import AdmZip from 'adm-zip'
import { ChildProcess, spawn } from 'child_process'
import * as crypto from 'crypto'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { LoggerUtil } from 'perrito-core'
import { getMojangOS, isLibraryCompatible, mcVersionAtLeast } from 'perrito-core/common'
import {
  AuthUser,
  ConditionalArgument,
  DistroModule,
  DistroServer,
  Library,
  ModConfigEntry,
  ModConfiguration,
  ModManifest,
  ModuleType,
  ProcessBuilderOptions,
  Rule,
  VanillaManifest
} from '../types/processBuilder'
import * as ConfigManager from './configManager'

const logger = LoggerUtil.getLogger('ProcessBuilder')

/**
 * Clase principal para construir y lanzar procesos de Minecraft
 * Soporta Forge 1.13+, Fabric y LiteLoader con gestión completa de mods
 */
export class ProcessBuilder {
  // Propiedades de configuración
  private readonly gameDir: string
  private readonly commonDir: string
  private readonly server: DistroServer
  private readonly vanillaManifest: VanillaManifest
  private readonly modManifest: ModManifest
  private readonly authUser: AuthUser
  private readonly launcherVersion: string
  private readonly libPath: string

  // Archivos de configuración de mods
  private readonly forgeModListFile: string
  private readonly fmlDir: string
  private readonly llDir: string

  // Estado del launcher
  private usingLiteLoader: boolean = false
  private usingFabricLoader: boolean = false
  private llPath: string | null = null

  constructor(options: ProcessBuilderOptions) {
    this.server = options.distroServer
    this.vanillaManifest = options.vanillaManifest
    this.modManifest = options.modManifest
    this.authUser = options.authUser
    this.launcherVersion = options.launcherVersion

    // Configurar directorios
    this.gameDir = path.join(ConfigManager.getInstanceDirectory(), this.server.rawServer.id)
    this.commonDir = ConfigManager.getCommonDirectory()
    this.libPath = path.join(this.commonDir, 'libraries')

    // Archivos de configuración de mods
    this.forgeModListFile = path.join(this.gameDir, 'forgeMods.list') // 1.13+
    this.fmlDir = path.join(this.gameDir, 'forgeModList.json')
    this.llDir = path.join(this.gameDir, 'liteloaderModList.json')
  }

  /**
   * Método principal para construir y lanzar el proceso de Minecraft
   * @returns El proceso hijo de Minecraft
   */
  public async build(): Promise<ChildProcess> {
    logger.info('Iniciando construcción del proceso de Minecraft...')

    // Asegurar que el directorio del juego existe
    await fs.ensureDir(this.gameDir)

    // Crear directorio temporal para librerías nativas
    const tempNativePath = path.join(
      os.tmpdir(),
      ConfigManager.getTempNativeFolder(),
      crypto.randomBytes(16).toString('hex')
    )

    try {
      // Configurar LiteLoader si está presente
      await this.setupLiteLoader()
      logger.info(`Usando LiteLoader: ${this.usingLiteLoader}`)

      // Detectar si usamos Fabric
      this.usingFabricLoader = this.server.modules.some(
        (mdl) => mdl.rawModule.type === ModuleType.Fabric
      )
      logger.info(`Usando Fabric: ${this.usingFabricLoader}`)

      // Resolver configuración de mods
      const modConfig = ConfigManager.getModConfiguration(this.server.rawServer.id)
      const modObj = this.resolveModConfiguration(modConfig?.mods || {}, this.server.modules)

      // Generar listas de mods para versiones < 1.13
      if (!mcVersionAtLeast('1.13', this.server.rawServer.minecraftVersion)) {
        await this.constructJSONModList('forge', modObj.fMods, true)
        if (this.usingLiteLoader) {
          await this.constructJSONModList('liteloader', modObj.lMods, true)
        }
      }

      // Construir argumentos JVM
      const allMods = [...modObj.fMods, ...modObj.lMods]
      let args = await this.constructJVMArguments(allMods, tempNativePath)

      // Añadir argumentos de mods para versiones >= 1.13
      if (mcVersionAtLeast('1.13', this.server.rawServer.minecraftVersion)) {
        const modArgs = await this.constructModList(modObj.fMods)
        args = args.concat(modArgs)
      }

      logger.info('Argumentos de lanzamiento construidos:', args.length)
      logger.debug('Argumentos completos:', args)

      // Lanzar proceso
      return this.launchProcess(args, tempNativePath)
    } catch (error) {
      // Limpiar directorio temporal en caso de error
      await this.cleanupTempDirectory(tempNativePath)
      throw error
    }
  }

  /**
   * Lanza el proceso de Minecraft con los argumentos proporcionados
   */
  private launchProcess(args: string[], tempNativePath: string): ChildProcess {
    const javaExecutable = ConfigManager.getJavaExecutable(this.server.rawServer.id)

    if (!javaExecutable) {
      throw new Error('No se ha configurado un ejecutable de Java válido')
    }

    logger.info(`Lanzando Minecraft con Java: ${javaExecutable}`)

    const child = spawn(javaExecutable, args, {
      cwd: this.gameDir,
      detached: ConfigManager.getLaunchDetached(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    // Configurar detached si es necesario
    if (ConfigManager.getLaunchDetached()) {
      child.unref()
    }

    // Configurar encoding para la salida
    child.stdout?.setEncoding('utf8')
    child.stderr?.setEncoding('utf8')

    // Manejar salida estándar
    child.stdout?.on('data', (data: string) => {
      data
        .trim()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) {
            console.log(`\x1b[32m[Minecraft]\x1b[0m ${line}`)
          }
        })
    })

    // Manejar errores estándar
    child.stderr?.on('data', (data: string) => {
      data
        .trim()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) {
            console.log(`\x1b[31m[Minecraft]\x1b[0m ${line}`)
          }
        })
    })

    // Manejar cierre del proceso
    child.on('close', async (code: number | null, signal: NodeJS.Signals | null) => {
      logger.info(`Minecraft cerrado con código: ${code}, señal: ${signal}`)
      await this.cleanupTempDirectory(tempNativePath)
    })

    // Manejar errores del proceso
    child.on('error', (error: Error) => {
      logger.error('Error en el proceso de Minecraft:', error)
    })

    return child
  }

  /**
   * Limpia el directorio temporal de librerías nativas
   */
  private async cleanupTempDirectory(tempNativePath: string): Promise<void> {
    try {
      await fs.remove(tempNativePath)
      logger.info('Directorio temporal de nativos limpiado exitosamente')
    } catch (error) {
      logger.warn('Error al limpiar directorio temporal:', error)
    }
  }

  /**
   * Obtiene el separador de classpath específico de la plataforma
   */
  public static getClasspathSeparator(): string {
    return process.platform === 'win32' ? ';' : ':'
  }

  /**
   * Determina si un mod opcional está habilitado según su configuración
   */
  public static isModEnabled(
    modCfg: ModConfigEntry | boolean | null,
    required?: { def?: boolean } | null
  ): boolean {
    if (modCfg != null) {
      if (typeof modCfg === 'boolean') {
        return modCfg
      }
      if (typeof modCfg === 'object' && 'value' in modCfg) {
        return modCfg.value !== undefined ? modCfg.value : true
      }
      return true
    }

    return required?.def !== undefined ? required.def : true
  }

  /**
   * Configuración inicial de LiteLoader si está presente
   */
  private async setupLiteLoader(): Promise<void> {
    for (const module of this.server.modules) {
      if (module.rawModule.type === ModuleType.LiteLoader) {
        const required = module.getRequired()

        if (!required.value) {
          const modCfg = ConfigManager.getModConfiguration(this.server.rawServer.id)
          const modEnabled = ProcessBuilder.isModEnabled(
            modCfg?.mods?.[module.getVersionlessMavenIdentifier()],
            required
          )

          if (modEnabled && (await fs.pathExists(module.getPath()))) {
            this.usingLiteLoader = true
            this.llPath = module.getPath()
          }
        } else {
          if (await fs.pathExists(module.getPath())) {
            this.usingLiteLoader = true
            this.llPath = module.getPath()
          }
        }
      }
    }
  }

  /**
   * Resuelve la configuración de mods habilitados
   */
  private resolveModConfiguration(
    modCfg: Record<string, ModConfigEntry>,
    modules: DistroModule[]
  ): ModConfiguration {
    const fMods: DistroModule[] = []
    const lMods: DistroModule[] = []

    for (const module of modules) {
      const type = module.rawModule.type

      if (
        [
          ModuleType.ForgeMod,
          ModuleType.LiteMod,
          ModuleType.LiteLoader,
          ModuleType.FabricMod
        ].includes(type)
      ) {
        const required = module.getRequired()
        const isOptional = !required.value
        const isEnabled = ProcessBuilder.isModEnabled(
          modCfg[module.getVersionlessMavenIdentifier()],
          required
        )

        if (!isOptional || (isOptional && isEnabled)) {
          // Procesar submódulos recursivamente
          if (module.subModules.length > 0) {
            const subModConfig = modCfg[module.getVersionlessMavenIdentifier()]
            const subMods = this.resolveModConfiguration(
              subModConfig && typeof subModConfig === 'object' && 'mods' in subModConfig
                ? subModConfig.mods || {}
                : {},
              module.subModules
            )
            fMods.push(...subMods.fMods)
            lMods.push(...subMods.lMods)
          }

          // Añadir el módulo actual (excepto LiteLoader que se maneja por separado)
          if (type !== ModuleType.LiteLoader) {
            if (type === ModuleType.ForgeMod || type === ModuleType.FabricMod) {
              fMods.push(module)
            } else {
              lMods.push(module)
            }
          }
        }
      }
    }

    return { fMods, lMods }
  }

  /**
   * Verifica si la versión menor es menor o igual al número dado
   */
  private lteMinorVersion(version: number): boolean {
    const minorVersion = Number(this.modManifest.id.split('-')[0].split('.')[1])
    return minorVersion <= version
  }

  /**
   * Determina si esta versión de Forge requiere el prefijo 'absolute:'
   * en el campo modListFile del repositorio
   */
  private requiresAbsolute(): boolean {
    try {
      if (this.lteMinorVersion(9)) {
        return false
      }

      const version = this.modManifest.id.split('-')[2]
      const parts = version.split('.')
      const minVersion = [14, 23, 3, 2655]

      for (let i = 0; i < parts.length; i++) {
        const parsed = parseInt(parts[i], 10)
        if (parsed < minVersion[i]) {
          return false
        } else if (parsed > minVersion[i]) {
          return true
        }
      }
    } catch (error) {
      // Las versiones anteriores de Forge siguen este formato
      // El error debe ser causado por una versión más nueva
      logger.debug('Error al parsear versión de Forge, asumiendo versión nueva:', error)
    }

    return true
  }

  /**
   * Construye un objeto JSON de lista de mods
   */
  private async constructJSONModList(
    type: 'forge' | 'liteloader',
    mods: DistroModule[],
    save: boolean = false
  ): Promise<Record<string, any>> {
    const repositoryRoot =
      type === 'forge' && this.requiresAbsolute()
        ? 'absolute:' + path.join(this.commonDir, 'modstore')
        : path.join(this.commonDir, 'modstore')

    const modList = { repositoryRoot }

    const ids: string[] = []
    for (const mod of mods) {
      if (type === 'forge') {
        ids.push(mod.getExtensionlessMavenIdentifier())
      } else {
        ids.push(mod.getMavenIdentifier())
      }
    }

    const result = { ...modList, modRef: ids }

    if (save) {
      const filePath = type === 'forge' ? this.fmlDir : this.llDir
      await fs.writeFile(filePath, JSON.stringify(result, null, 4), 'utf8')
      logger.info(`Lista de mods ${type} guardada en: ${filePath}`)
    }

    return result
  }

  /**
   * Construye la lista de argumentos de mods para Forge 1.13+ y Fabric
   */
  private async constructModList(mods: DistroModule[]): Promise<string[]> {
    const writeBuffer = mods
      .map((mod) => {
        return this.usingFabricLoader ? mod.getPath() : mod.getExtensionlessMavenIdentifier()
      })
      .join('\n')

    if (writeBuffer) {
      await fs.writeFile(this.forgeModListFile, writeBuffer, 'utf8')
      logger.info(`Lista de mods escrita en: ${this.forgeModListFile}`)

      if (this.usingFabricLoader) {
        return ['--fabric.addMods', `@${this.forgeModListFile}`]
      } else {
        return [
          '--fml.mavenRoots',
          path.join('..', '..', 'common', 'modstore'),
          '--fml.modLists',
          this.forgeModListFile
        ]
      }
    }

    return []
  }

  /**
   * Procesa argumentos de autoconexión al servidor
   */
  private processAutoConnectArg(args: string[]): void {
    if (ConfigManager.getAutoConnect() && this.server.rawServer.autoconnect) {
      if (mcVersionAtLeast('1.20', this.server.rawServer.minecraftVersion)) {
        args.push('--quickPlayMultiplayer')
        args.push(`${this.server.hostname}:${this.server.port}`)
      } else {
        args.push('--server')
        args.push(this.server.hostname)
        args.push('--port')
        args.push(this.server.port)
      }
      logger.info(`Configurada autoconexión a: ${this.server.hostname}:${this.server.port}`)
    }
  }

  /**
   * Construye el array de argumentos que se pasará al proceso JVM
   */
  private async constructJVMArguments(
    mods: DistroModule[],
    tempNativePath: string
  ): Promise<string[]> {
    if (mcVersionAtLeast('1.13', this.server.rawServer.minecraftVersion)) {
      return this.constructJVMArguments113(mods, tempNativePath)
    } else {
      return this.constructJVMArguments112(mods, tempNativePath)
    }
  }

  /**
   * Construye argumentos JVM para Minecraft 1.12 y anteriores
   */
  private async constructJVMArguments112(
    mods: DistroModule[],
    tempNativePath: string
  ): Promise<string[]> {
    const args: string[] = []

    // Argumentos de Classpath
    args.push('-cp')
    const classpathArgs = await this.classpathArg(mods, tempNativePath)
    args.push(classpathArgs.join(ProcessBuilder.getClasspathSeparator()))

    // Argumentos específicos de plataforma
    if (process.platform === 'darwin') {
      args.push('-Xdock:name=PerritoStudiosLauncher')
      args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'))
    }

    // Argumentos de memoria
    args.push('-Xmx' + ConfigManager.getMaxRAM(this.server.rawServer.id))
    args.push('-Xms' + ConfigManager.getMinRAM(this.server.rawServer.id))

    // Argumentos JVM adicionales
    args.push(...ConfigManager.getJVMOptions(this.server.rawServer.id))

    // Directorio de librerías nativas
    args.push('-Djava.library.path=' + tempNativePath)

    // Clase principal
    args.push(this.modManifest.mainClass)

    // Argumentos específicos de Forge
    const forgeArgs = await this.resolveForgeArgs()
    args.push(...forgeArgs)

    return args
  }

  /**
   * Construye argumentos JVM para Minecraft 1.13+
   */
  private async constructJVMArguments113(
    mods: DistroModule[],
    tempNativePath: string
  ): Promise<string[]> {
    const argDiscovery = /\${*(.*)}/
    let args: string[] = []

    // Argumentos JVM de la versión vanilla
    if (this.vanillaManifest.arguments?.jvm) {
      args = [...this.vanillaManifest.arguments.jvm] as string[]
    }

    // Argumentos JVM del mod manifest
    if (this.modManifest.arguments?.jvm) {
      for (const argStr of this.modManifest.arguments.jvm) {
        args.push(
          argStr
            .replace(/\${library_directory}/g, this.libPath)
            .replace(/\${classpath_separator}/g, ProcessBuilder.getClasspathSeparator())
            .replace(/\${version_name}/g, this.modManifest.id)
        )
      }
    }

    // Sincronización de idioma si está habilitada
    if (ConfigManager.getSyncLanguage()) {
      await this.syncGameLanguage()
    }

    // Argumentos específicos de plataforma
    if (process.platform === 'darwin') {
      args.push('-Xdock:name=PerritoStudiosLauncher')
      args.push('-Xdock:icon=' + path.join(__dirname, '..', 'images', 'minecraft.icns'))
    }

    // Configuración de memoria y JVM
    args.push('-Xmx' + ConfigManager.getMaxRAM(this.server.rawServer.id))
    args.push('-Xms' + ConfigManager.getMinRAM(this.server.rawServer.id))
    args.push(...ConfigManager.getJVMOptions(this.server.rawServer.id))

    // Configuración de autenticación personalizada (si no es Microsoft)
    const currentAccount = ConfigManager.getSelectedAccount()
    if (currentAccount && currentAccount.type !== 'microsoft') {
      this.addCustomAuthArgs(args)
    }

    // Clase principal
    args.push(this.modManifest.mainClass)

    // Argumentos del juego vanilla
    if (this.vanillaManifest.arguments?.game) {
      args = args.concat(this.vanillaManifest.arguments.game as string[])
    }

    // Procesar argumentos condicionales y variables
    args = await this.processGameArguments(args, tempNativePath, mods, argDiscovery)

    // Autoconexión
    this.processAutoConnectArg(args)

    // Argumentos específicos del mod
    if (this.modManifest.arguments?.game) {
      args = args.concat(this.modManifest.arguments.game)
    }

    // Filtrar valores nulos
    return args.filter((arg) => arg != null)
  }

  /**
   * Sincroniza el idioma del juego con la configuración del launcher
   */
  private async syncGameLanguage(): Promise<void> {
    try {
      const optionsPath = path.join(this.gameDir, 'options.txt')
      const currentLang = ConfigManager.getCurrentLanguageLowercase()

      await this.updateGameOption(optionsPath, 'lang:', `lang:${currentLang}`)
      logger.info(`Idioma del juego sincronizado a: ${currentLang}`)
    } catch (error) {
      logger.warn('Error al sincronizar idioma del juego:', error)
    }
  }

  /**
   * Actualiza una opción en el archivo options.txt del juego
   */
  private async updateGameOption(
    filePath: string,
    searchString: string,
    newLine: string
  ): Promise<void> {
    try {
      const exists = await fs.pathExists(filePath)

      if (exists) {
        const content = await fs.readFile(filePath, 'utf8')
        const lines = content.split('\n')
        const lineIndex = lines.findIndex((line) => line.includes(searchString))

        if (lineIndex !== -1) {
          lines[lineIndex] = newLine
          await fs.writeFile(filePath, lines.join('\n'), 'utf8')
        } else {
          await fs.appendFile(filePath, '\n' + newLine)
        }
      } else {
        await fs.writeFile(filePath, newLine, 'utf8')
      }
    } catch (error) {
      logger.error('Error actualizando opción del juego:', error)
    }
  }

  /**
   * Añade argumentos de autenticación personalizada
   */
  private addCustomAuthArgs(args: string[]): void {
    args.push('-Duser.language=es')
    args.push('-Dminecraft.api.env=custom')

    // URLs de autenticación personalizada (Perrito Studios)
    const authBaseUrl = 'https://auth.perritostudios.com/api/yggdrasil'
    args.push(`-Dminecraft.api.auth.host=${authBaseUrl}/authserver`)
    args.push(`-Dminecraft.api.account.host=${authBaseUrl}/api`)
    args.push(`-Dminecraft.api.session.host=${authBaseUrl}/sessionserver`)
    args.push(`-Dminecraft.api.services.host=${authBaseUrl}/minecraftservices`)

    logger.info('Configurada autenticación personalizada de Perrito Studios')
  }

  /**
   * Procesa argumentos del juego, resolviendo variables y argumentos condicionales
   */
  private async processGameArguments(
    args: string[],
    tempNativePath: string,
    mods: DistroModule[],
    argDiscovery: RegExp
  ): Promise<string[]> {
    const processedArgs: string[] = []

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]

      if (typeof arg === 'object' && 'rules' in arg) {
        // Procesar argumento condicional
        const conditionalArg = arg as ConditionalArgument
        if (this.evaluateArgumentRules(conditionalArg.rules)) {
          if (typeof conditionalArg.value === 'string') {
            processedArgs.push(conditionalArg.value)
          } else {
            processedArgs.push(...conditionalArg.value)
          }
        }
      } else if (typeof arg === 'string') {
        // Procesar variable en argumento
        if (argDiscovery.test(arg)) {
          const resolvedArg = await this.resolveArgumentVariable(
            arg,
            tempNativePath,
            mods,
            argDiscovery
          )
          if (resolvedArg != null) {
            processedArgs.push(resolvedArg)
          }
        } else {
          processedArgs.push(arg)
        }
      }
    }

    return processedArgs
  }

  /**
   * Evalúa las reglas de un argumento condicional
   */
  private evaluateArgumentRules(rules: Rule[]): boolean {
    let checksum = 0

    for (const rule of rules) {
      if (rule.os) {
        const osMatches =
          rule.os.name === getMojangOS() &&
          (!rule.os.version || new RegExp(rule.os.version).test(os.release()))

        if (osMatches && rule.action === 'allow') {
          checksum++
        } else if (!osMatches && rule.action === 'disallow') {
          checksum++
        }
      } else if (rule.features) {
        if (rule.features.has_custom_resolution && ConfigManager.getFullscreen()) {
          checksum++
        }
      }
    }

    return checksum === rules.length
  }

  /**
   * Resuelve una variable de argumento
   */
  private async resolveArgumentVariable(
    arg: string,
    tempNativePath: string,
    mods: DistroModule[],
    argDiscovery: RegExp
  ): Promise<string | null> {
    const match = arg.match(argDiscovery)
    if (!match) return arg

    const identifier = match[1]

    switch (identifier) {
      case 'auth_player_name':
        return this.authUser.displayName.trim()
      case 'version_name':
        return this.server.rawServer.id
      case 'game_directory':
        return this.gameDir
      case 'assets_root':
        return path.join(this.commonDir, 'assets')
      case 'assets_index_name':
        return this.vanillaManifest.assets
      case 'auth_uuid':
        return this.authUser.uuid.trim()
      case 'auth_access_token':
        return this.authUser.accessToken
      case 'user_type':
        return this.authUser.type === 'microsoft' ? 'msa' : 'mojang'
      case 'version_type':
        return this.vanillaManifest.type
      case 'resolution_width':
        return ConfigManager.getGameWidth().toString()
      case 'resolution_height':
        return ConfigManager.getGameHeight().toString()
      case 'natives_directory':
        return tempNativePath
      case 'launcher_name':
        return 'PerritoStudiosLauncher'
      case 'launcher_version':
        return this.launcherVersion
      case 'classpath':
        // eslint-disable-next-line no-case-declarations
        const classpathArgs = await this.classpathArg(mods, tempNativePath)
        return classpathArgs.join(ProcessBuilder.getClasspathSeparator())
      default:
        logger.warn(`Variable de argumento desconocida: ${identifier}`)
        return null
    }
  }

  /**
   * Resuelve los argumentos requeridos por Forge (versiones anteriores a 1.13)
   */
  private async resolveForgeArgs(): Promise<string[]> {
    if (!this.modManifest.minecraftArguments) {
      return []
    }

    const mcArgs = this.modManifest.minecraftArguments.split(' ')
    const argDiscovery = /\${*(.*)}/

    // Reemplazar variables declaradas con sus valores apropiados
    for (let i = 0; i < mcArgs.length; i++) {
      if (argDiscovery.test(mcArgs[i])) {
        const resolved = await this.resolveArgumentVariable(mcArgs[i], '', [], argDiscovery)
        if (resolved != null) {
          mcArgs[i] = resolved
        }
      }
    }

    // Autoconexión
    this.processAutoConnectArg(mcArgs)

    // Configurar resolución del juego
    if (ConfigManager.getFullscreen()) {
      mcArgs.push('--fullscreen', 'true')
    } else {
      mcArgs.push('--width', ConfigManager.getGameWidth().toString())
      mcArgs.push('--height', ConfigManager.getGameHeight().toString())
    }

    // Archivo de lista de mods
    mcArgs.push('--modListFile')
    if (this.lteMinorVersion(9)) {
      mcArgs.push(path.basename(this.fmlDir))
    } else {
      mcArgs.push('absolute:' + this.fmlDir)
    }

    // LiteLoader
    if (this.usingLiteLoader) {
      mcArgs.push('--modRepo', this.llDir)
      mcArgs.unshift('--tweakClass', 'com.mumfrey.liteloader.launch.LiteLoaderTweaker')
    }

    return mcArgs
  }

  /**
   * Asegura que las entradas del classpath apunten a archivos JAR
   */
  private processClassPathList(list: string[]): void {
    const ext = '.jar'
    const extLen = ext.length

    for (let i = 0; i < list.length; i++) {
      const extIndex = list[i].indexOf(ext)
      if (extIndex > -1 && extIndex !== list[i].length - extLen) {
        list[i] = list[i].substring(0, extIndex + extLen)
      }
    }
  }

  /**
   * Resuelve el classpath completo para este proceso
   */
  private async classpathArg(mods: DistroModule[], tempNativePath: string): Promise<string[]> {
    const cpArgs: string[] = []

    // Añadir version.jar al classpath (no para Forge 1.17+ excepto Fabric)
    if (
      !mcVersionAtLeast('1.17', this.server.rawServer.minecraftVersion) ||
      this.usingFabricLoader
    ) {
      const version = this.vanillaManifest.id
      cpArgs.push(path.join(this.commonDir, 'versions', version, version + '.jar'))
    }

    // Añadir LiteLoader si se usa
    if (this.usingLiteLoader && this.llPath) {
      cpArgs.push(this.llPath)
    }

    // Resolver librerías de Mojang
    const mojangLibs = await this.resolveMojangLibraries(tempNativePath)

    // Resolver librerías del servidor
    const serverLibs = await this.resolveServerLibraries(mods)

    // Combinar librerías (las del servidor sobrescriben las de Mojang si tienen el mismo identificador Maven)
    const finalLibs = { ...mojangLibs, ...serverLibs }
    cpArgs.push(...Object.values(finalLibs))

    // Procesar lista de classpath
    this.processClassPathList(cpArgs)

    logger.info(`Classpath construido con ${cpArgs.length} entradas`)
    return cpArgs
  }

  /**
   * Resuelve las librerías definidas por Mojang
   */
  private async resolveMojangLibraries(tempNativePath: string): Promise<Record<string, string>> {
    const nativesRegex = /.+:natives-([^-]+)(?:-(.+))?/
    const libs: Record<string, string> = {}

    await fs.ensureDir(tempNativePath)

    for (const lib of this.vanillaManifest.libraries) {
      if (isLibraryCompatible(lib.rules, lib.natives)) {
        // Librerías nativas pre-1.19
        if (lib.natives != null) {
          await this.extractNativeLibrary(lib, tempNativePath, false)
        }
        // Librerías nativas 1.19+
        else if (lib.name.includes('natives-')) {
          const regexTest = nativesRegex.exec(lib.name)
          const arch = regexTest?.[2] ?? 'x64'

          if (arch === process.arch) {
            await this.extractNativeLibrary(lib, tempNativePath, true)
          }
        }
        // Librerías regulares
        else {
          const artifact = lib.downloads.artifact
          if (artifact) {
            const libPath = path.join(this.libPath, artifact.path)
            const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(':'))
            libs[versionIndependentId] = libPath
          }
        }
      }
    }

    logger.info(`Resueltas ${Object.keys(libs).length} librerías de Mojang`)
    return libs
  }

  /**
   * Extrae una librería nativa
   */
  private async extractNativeLibrary(
    lib: Library,
    tempNativePath: string,
    isModern: boolean
  ): Promise<void> {
    try {
      const exclusionArr = lib.extract?.exclude || ['META-INF/', '.git', '.sha1']
      let artifact

      if (isModern) {
        artifact = lib.downloads.artifact
      } else {
        const nativeKey = lib.natives?.[getMojangOS()]?.replace(
          '${arch}',
          process.arch.replace('x', '')
        )
        artifact = nativeKey ? lib.downloads.classifiers?.[nativeKey] : undefined
      }

      if (!artifact) {
        logger.warn(`No se pudo encontrar artefacto para librería nativa: ${lib.name}`)
        return
      }

      const zipPath = path.join(this.libPath, artifact.path)

      if (!(await fs.pathExists(zipPath))) {
        logger.warn(`Archivo de librería nativa no encontrado: ${zipPath}`)
        return
      }

      const zip = new AdmZip(zipPath)
      const zipEntries = zip.getEntries()

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue

        const fileName = entry.entryName
        const shouldExclude = exclusionArr.some((exclusion) => fileName.includes(exclusion))

        if (!shouldExclude) {
          const extractName = fileName.includes('/')
            ? fileName.substring(fileName.lastIndexOf('/') + 1)
            : fileName

          const extractPath = path.join(tempNativePath, extractName)
          await fs.writeFile(extractPath, entry.getData())
        }
      }

      logger.debug(`Librería nativa extraída: ${lib.name}`)
    } catch (error) {
      logger.error(`Error extrayendo librería nativa ${lib.name}:`, error)
    }
  }

  /**
   * Resuelve las librerías declaradas por el servidor
   */
  private async resolveServerLibraries(mods: DistroModule[]): Promise<Record<string, string>> {
    let libs: Record<string, string> = {}

    // Localizar Forge/Fabric/Librerías
    for (const module of this.server.modules) {
      const type = module.rawModule.type
      if ([ModuleType.ForgeHosted, ModuleType.Fabric, ModuleType.Library].includes(type)) {
        libs[module.getVersionlessMavenIdentifier()] = module.getPath()

        if (module.subModules.length > 0) {
          const subLibs = await this.resolveModuleLibraries(module)
          libs = { ...libs, ...subLibs }
        }
      }
    }

    // Verificar librerías en la lista de mods
    for (const mod of mods) {
      if (mod.subModules.length > 0) {
        const modLibs = await this.resolveModuleLibraries(mod)
        libs = { ...libs, ...modLibs }
      }
    }

    logger.info(`Resueltas ${Object.keys(libs).length} librerías del servidor`)
    return libs
  }

  /**
   * Resuelve recursivamente las librerías requeridas por un módulo
   */
  private async resolveModuleLibraries(module: DistroModule): Promise<Record<string, string>> {
    if (module.subModules.length === 0) {
      return {}
    }

    const libs: Record<string, string> = {}

    for (const subModule of module.subModules) {
      if (subModule.rawModule.type === ModuleType.Library) {
        // Verificar si la librería debe incluirse en el classpath
        const shouldInclude = subModule.rawModule.classpath !== false

        if (shouldInclude) {
          libs[subModule.getVersionlessMavenIdentifier()] = subModule.getPath()
        }
      }

      // Procesar submódulos recursivamente
      if (subModule.subModules.length > 0) {
        const subLibs = await this.resolveModuleLibraries(subModule)
        Object.assign(libs, subLibs)
      }
    }

    return libs
  }
}
