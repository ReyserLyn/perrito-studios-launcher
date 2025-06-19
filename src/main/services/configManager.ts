import { app } from 'electron'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { LoggerUtil } from 'perrito-core'

const logger = LoggerUtil.getLogger('ConfigManager')

// Detectar si estamos en desarrollo
const isDev = process.env.NODE_ENV === 'development'

const sysRoot =
  process.env.APPDATA ||
  (process.platform === 'darwin'
    ? process.env.HOME + '/Library/Application Support'
    : process.env.HOME)
const dataPath = path.join(sysRoot!, '.PerritoStudiosLauncher')
const launcherDir = app.getPath('userData')

// Interfaces para tipado
interface GameSettings {
  resWidth: number
  resHeight: number
  fullscreen: boolean
  autoConnect: boolean
  launchDetached: boolean
  SyncLanguage: boolean
}

interface LauncherSettings {
  resWidth: number
  resHeight: number
  language: string
  allowPrerelease: boolean
  dataDirectory: string
}

interface NewsCache {
  date: string | null
  content: string | null
  dismissed: boolean
}

interface AuthAccount {
  type?: 'mojang' | 'microsoft'
  accessToken: string
  username: string
  uuid: string
  displayName: string
  expiresAt?: Date
  microsoft?: {
    access_token: string
    refresh_token: string
    expires_at: Date
  }
}

interface JavaConfig {
  minRAM: string
  maxRAM: string
  executable: string | null
  jvmOptions: string[]
}

interface Config {
  settings: {
    game: GameSettings
    launcher: LauncherSettings
  }
  newsCache: NewsCache
  clientToken: string | null
  selectedServer: string | null
  selectedAccount: string | null
  authenticationDatabase: Record<string, AuthAccount>
  modConfigurations: any[]
  javaConfig: Record<string, JavaConfig>
}

interface RamConfig {
  minimum?: number
  recommended?: number
}

interface EffectiveJavaOptions {
  suggestedMajor: number
}

/**
 * Obtiene el directorio absoluto del launcher.
 *
 * @returns La ruta absoluta del directorio del launcher.
 */
export function getLauncherDirectory(): string {
  return launcherDir
}

/**
 * Obtiene el directorio de datos del launcher. Aquí se instalan todos los archivos
 * relacionados con el lanzamiento del juego (common, instances, java, etc).
 *
 * @param def Si es true, retorna el valor por defecto
 * @returns La ruta absoluta del directorio de datos del launcher.
 */
export function getDataDirectory(def = false): string {
  return !def && config
    ? config.settings.launcher.dataDirectory
    : DEFAULT_CONFIG.settings.launcher.dataDirectory
}

/**
 * Establece el nuevo directorio de datos.
 *
 * @param dataDirectory El nuevo directorio de datos.
 */
export function setDataDirectory(dataDirectory: string): void {
  if (!config) return
  config.settings.launcher.dataDirectory = dataDirectory
}

const configPath = path.join(getLauncherDirectory(), 'config.json')
const configPathLEGACY = path.join(dataPath, 'config.json')
const firstLaunch = !fs.existsSync(configPath) && !fs.existsSync(configPathLEGACY)

export function getAbsoluteMinRAM(ram?: RamConfig): number {
  if (ram?.minimum != null) {
    return ram.minimum / 1024
  } else {
    // Comportamiento legacy
    const mem = os.totalmem()
    return mem >= 6 * 1073741824 ? 3 : 2
  }
}

export function getAbsoluteMaxRAM(): number {
  const mem = os.totalmem()
  return Math.floor(mem / 1073741824)
}

function resolveSelectedRAM(ram?: RamConfig): string {
  if (ram?.recommended != null) {
    return `${ram.recommended}M`
  } else {
    // Comportamiento legacy
    const mem = os.totalmem()
    return mem >= 8 * 1073741824 ? '4G' : mem >= 6 * 1073741824 ? '3G' : '2G'
  }
}

/**
 * Configuración por defecto del launcher
 * Tres tipos de valores:
 * Static = Declarado explícitamente.
 * Dynamic = Calculado por una función privada.
 * Resolved = Resuelto externamente, por defecto null.
 */
const DEFAULT_CONFIG: Config = {
  settings: {
    game: {
      resWidth: 1280,
      resHeight: 720,
      fullscreen: false,
      autoConnect: true,
      launchDetached: true,
      SyncLanguage: true
    },
    launcher: {
      resWidth: 1920,
      resHeight: 1080,
      language: 'es_ES',
      allowPrerelease: false,
      dataDirectory: dataPath
    }
  },
  newsCache: {
    date: null,
    content: null,
    dismissed: false
  },
  clientToken: null,
  selectedServer: null,
  selectedAccount: null,
  authenticationDatabase: {},
  modConfigurations: [],
  javaConfig: {}
}

let config: Config | null = null

// Funciones de Persistencia

/**
 * Guarda la configuración actual en un archivo.
 */
export function save(): void {
  console.log(`[ConfigManager] Guardando configuración en: ${configPath}`)
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8')
  console.log(`[ConfigManager] Configuración guardada exitosamente`)
}

/**
 * Carga la configuración en memoria. Si existe un archivo de configuración,
 * será leído y guardado. De lo contrario, se generará una configuración por defecto.
 * Los valores "resolved" por defecto son null y necesitan ser asignados externamente.
 */
export function load(): void {
  let doLoad = true

  if (!fs.existsSync(configPath)) {
    // Crear todos los directorios padre
    fs.ensureDirSync(path.join(configPath, '..'))
    if (fs.existsSync(configPathLEGACY)) {
      fs.moveSync(configPathLEGACY, configPath)
    } else {
      doLoad = false
      config = DEFAULT_CONFIG
      save()
    }
  }

  if (doLoad) {
    let doValidate = false
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      doValidate = true
    } catch (err) {
      logger.error(err)
      logger.info('El archivo de configuración contiene JSON malformado o está corrupto.')
      logger.info('Generando un nuevo archivo de configuración.')
      fs.ensureDirSync(path.join(configPath, '..'))
      config = DEFAULT_CONFIG
      save()
    }
    if (doValidate) {
      config = validateKeySet(DEFAULT_CONFIG, config!)
      save()
    }
  }
  logger.info('Cargado exitosamente')
}

/**
 * @returns Si el manager ha sido cargado o no.
 */
export function isLoaded(): boolean {
  return config != null
}

/**
 * Valida que el objeto destino tenga al menos cada campo
 * presente en el objeto origen. Asigna un valor por defecto de lo contrario.
 *
 * @param srcObj El objeto origen como referencia.
 * @param destObj El objeto destino.
 * @returns Un objeto destino validado.
 */
function validateKeySet(srcObj: any, destObj: any): any {
  if (srcObj == null) {
    srcObj = {}
  }
  const validationBlacklist = ['authenticationDatabase', 'javaConfig']
  const keys = Object.keys(srcObj)

  for (let i = 0; i < keys.length; i++) {
    if (typeof destObj[keys[i]] === 'undefined') {
      destObj[keys[i]] = srcObj[keys[i]]
    } else if (
      typeof srcObj[keys[i]] === 'object' &&
      srcObj[keys[i]] != null &&
      !(srcObj[keys[i]] instanceof Array) &&
      validationBlacklist.indexOf(keys[i]) === -1
    ) {
      destObj[keys[i]] = validateKeySet(srcObj[keys[i]], destObj[keys[i]])
    }
  }
  return destObj
}

/**
 * Verifica si esta es la primera vez que el usuario ha lanzado la aplicación.
 * Esto se determina por la existencia del directorio de datos.
 *
 * @returns True si es el primer lanzamiento, false de lo contrario.
 */
export function isFirstLaunch(): boolean {
  return firstLaunch
}

/**
 * Retorna el nombre de la carpeta en el directorio temporal del SO que
 * usaremos para extraer y almacenar dependencias nativas para el lanzamiento del juego.
 *
 * @returns El nombre de la carpeta.
 */
export function getTempNativeFolder(): string {
  return 'PSNatives'
}

// Configuraciones del Sistema (No configurables en UI)

/**
 * Obtiene el cache de noticias para determinar
 * si hay noticias más nuevas.
 *
 * @returns El objeto cache de noticias.
 */
export function getNewsCache(): NewsCache {
  return config!.newsCache
}

/**
 * Establece el nuevo objeto cache de noticias.
 *
 * @param newsCache El nuevo objeto cache de noticias.
 */
export function setNewsCache(newsCache: NewsCache): void {
  config!.newsCache = newsCache
}

/**
 * Establece si las noticias han sido descartadas (verificadas)
 *
 * @param dismissed Si las noticias han sido descartadas (verificadas).
 */
export function setNewsCacheDismissed(dismissed: boolean): void {
  config!.newsCache.dismissed = dismissed
}

/**
 * Obtiene el directorio común para archivos de juego compartidos
 * (assets, librerías, etc).
 *
 * @returns El directorio común del launcher.
 */
export function getCommonDirectory(): string {
  return path.join(getDataDirectory(), 'common')
}

/**
 * Obtiene el directorio de instancias para los directorios
 * de juego por servidor.
 *
 * @returns El directorio de instancias del launcher.
 */
export function getInstanceDirectory(): string {
  return path.join(getDataDirectory(), 'instances')
}

/**
 * Obtiene el Client Token del launcher.
 * No hay client token por defecto.
 *
 * @returns El Client Token del launcher.
 */
export function getClientToken(): string | null {
  return config!.clientToken
}

/**
 * Establece el Client Token del launcher.
 *
 * @param clientToken El nuevo Client Token del launcher.
 */
export function setClientToken(clientToken: string): void {
  config!.clientToken = clientToken
}

export function addAuthAccount(
  uuid: string,
  accessToken: string,
  username: string,
  displayName: string
): AuthAccount {
  config!.selectedAccount = uuid
  config!.authenticationDatabase[uuid] = {
    accessToken,
    username: username.trim(),
    uuid: uuid.trim(),
    displayName: displayName.trim()
  }
  return config!.authenticationDatabase[uuid]
}

/**
 * Obtiene el ID del serverpack seleccionado.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns El ID del serverpack seleccionado.
 */
export function getSelectedServer(def = false): string | null {
  return !def ? config!.selectedServer : null
}

/**
 * Establece el ID del serverpack seleccionado.
 *
 * @param serverID El ID del nuevo serverpack seleccionado.
 */
export function setSelectedServer(serverID: string): void {
  config!.selectedServer = serverID
}

/**
 * Obtiene un array de cada cuenta actualmente autenticada por el launcher.
 *
 * @returns Un array de cada cuenta autenticada almacenada.
 */
export function getAuthAccounts(): Record<string, AuthAccount> {
  return config!.authenticationDatabase
}

/**
 * Retorna la cuenta autenticada con el uuid dado. El valor puede ser null.
 *
 * @param uuid El uuid de la cuenta autenticada.
 * @returns La cuenta autenticada con el uuid dado.
 */
export function getAuthAccount(uuid: string): AuthAccount | undefined {
  return config!.authenticationDatabase[uuid]
}

/**
 * Actualiza el access token de una cuenta mojang autenticada.
 *
 * @param uuid El uuid de la cuenta autenticada.
 * @param accessToken El nuevo Access Token.
 *
 * @returns El objeto de cuenta autenticada creado por esta acción.
 */
export function updateMojangAuthAccount(uuid: string, accessToken: string): AuthAccount {
  config!.authenticationDatabase[uuid].accessToken = accessToken
  config!.authenticationDatabase[uuid].type = 'mojang'
  return config!.authenticationDatabase[uuid]
}

/**
 * Añade una cuenta mojang autenticada a la base de datos para ser almacenada.
 *
 * @param uuid El uuid de la cuenta autenticada.
 * @param accessToken El accessToken de la cuenta autenticada.
 * @param username El username (usualmente email) de la cuenta autenticada.
 * @param displayName El nombre en el juego de la cuenta autenticada.
 *
 * @returns El objeto de cuenta autenticada creado por esta acción.
 */
export function addMojangAuthAccount(
  uuid: string,
  accessToken: string,
  username: string,
  displayName: string
): AuthAccount {
  config!.selectedAccount = uuid
  config!.authenticationDatabase[uuid] = {
    type: 'mojang',
    accessToken,
    username: username.trim(),
    uuid: uuid.trim(),
    displayName: displayName.trim()
  }
  return config!.authenticationDatabase[uuid]
}

/**
 * Actualiza los tokens de una cuenta microsoft autenticada.
 *
 * @param uuid El uuid de la cuenta autenticada.
 * @param accessToken El nuevo Access Token.
 * @param msAccessToken El nuevo Microsoft Access Token
 * @param msRefreshToken El nuevo Microsoft Refresh Token
 * @param msExpires La fecha cuando expira el microsoft access token
 * @param mcExpires La fecha cuando expira el mojang access token
 *
 * @returns El objeto de cuenta autenticada creado por esta acción.
 */
export function updateMicrosoftAuthAccount(
  uuid: string,
  accessToken: string,
  msAccessToken: string,
  msRefreshToken: string,
  msExpires: Date,
  mcExpires: Date
): AuthAccount {
  config!.authenticationDatabase[uuid].accessToken = accessToken
  config!.authenticationDatabase[uuid].expiresAt = mcExpires
  config!.authenticationDatabase[uuid].microsoft!.access_token = msAccessToken
  config!.authenticationDatabase[uuid].microsoft!.refresh_token = msRefreshToken
  config!.authenticationDatabase[uuid].microsoft!.expires_at = msExpires
  return config!.authenticationDatabase[uuid]
}

/**
 * Añade una cuenta microsoft autenticada a la base de datos para ser almacenada.
 *
 * @param uuid El uuid de la cuenta autenticada.
 * @param accessToken El accessToken de la cuenta autenticada.
 * @param name El nombre en el juego de la cuenta autenticada.
 * @param mcExpires La fecha cuando expira el mojang access token
 * @param msAccessToken El microsoft access token
 * @param msRefreshToken El microsoft refresh token
 * @param msExpires La fecha cuando expira el microsoft access token
 *
 * @returns El objeto de cuenta autenticada creado por esta acción.
 */
export function addMicrosoftAuthAccount(
  uuid: string,
  accessToken: string,
  name: string,
  mcExpires: Date,
  msAccessToken: string,
  msRefreshToken: string,
  msExpires: Date
): AuthAccount {
  config!.selectedAccount = uuid
  config!.authenticationDatabase[uuid] = {
    type: 'microsoft',
    accessToken,
    username: name.trim(),
    uuid: uuid.trim(),
    displayName: name.trim(),
    expiresAt: mcExpires,
    microsoft: {
      access_token: msAccessToken,
      refresh_token: msRefreshToken,
      expires_at: msExpires
    }
  }
  return config!.authenticationDatabase[uuid]
}

/**
 * Remueve una cuenta autenticada de la base de datos. Si la cuenta
 * también era la cuenta seleccionada, se seleccionará una nueva. Si no hay
 * cuentas, la cuenta seleccionada será null.
 *
 * @param uuid El uuid de la cuenta autenticada.
 *
 * @returns True si la cuenta fue removida, false si nunca existió.
 */
export function removeAuthAccount(uuid: string): boolean {
  if (config!.authenticationDatabase[uuid] != null) {
    delete config!.authenticationDatabase[uuid]
    if (config!.selectedAccount === uuid) {
      const keys = Object.keys(config!.authenticationDatabase)
      if (keys.length > 0) {
        config!.selectedAccount = keys[0]
      } else {
        config!.selectedAccount = null
        config!.clientToken = null
      }
    }
    return true
  }
  return false
}

/**
 * Obtiene la cuenta autenticada actualmente seleccionada.
 *
 * @returns La cuenta autenticada seleccionada.
 */
export function getSelectedAccount(): AuthAccount | null {
  return config!.selectedAccount ? config!.authenticationDatabase[config!.selectedAccount] : null
}

/**
 * Establece la cuenta autenticada seleccionada.
 *
 * @param uuid El UUID de la cuenta que será establecida como cuenta seleccionada.
 *
 * @returns La cuenta autenticada seleccionada.
 */
export function setSelectedAccount(uuid: string): AuthAccount | null {
  const authAcc = config!.authenticationDatabase[uuid]
  if (authAcc != null) {
    config!.selectedAccount = uuid
  }
  return authAcc || null
}

/**
 * Obtiene un array de cada configuración de mod actualmente almacenada.
 *
 * @returns Un array de cada configuración de mod almacenada.
 */
export function getModConfigurations(): any[] {
  return config!.modConfigurations
}

/**
 * Establece el array de configuraciones de mod almacenadas.
 *
 * @param configurations Un array de configuraciones de mod.
 */
export function setModConfigurations(configurations: any[]): void {
  config!.modConfigurations = configurations
}

/**
 * Obtiene la configuración de mod para un servidor específico.
 *
 * @param serverid El id del servidor.
 * @returns La configuración de mod para el servidor dado.
 */
export function getModConfiguration(serverid: string): any | null {
  const cfgs = config!.modConfigurations
  for (let i = 0; i < cfgs.length; i++) {
    if (cfgs[i].id === serverid) {
      return cfgs[i]
    }
  }
  return null
}

/**
 * Establece la configuración de mod para un servidor específico. Esto sobrescribe cualquier valor existente.
 *
 * @param serverid El id del servidor para la configuración de mod dada.
 * @param configuration La configuración de mod para el servidor dado.
 */
export function setModConfiguration(serverid: string, configuration: any): void {
  const cfgs = config!.modConfigurations
  for (let i = 0; i < cfgs.length; i++) {
    if (cfgs[i].id === serverid) {
      cfgs[i] = configuration
      return
    }
  }
  cfgs.push(configuration)
}

// Configuraciones Configurables por el Usuario

// Configuraciones de Java

function defaultJavaConfig(
  effectiveJavaOptions: EffectiveJavaOptions,
  ram?: RamConfig
): JavaConfig {
  if (effectiveJavaOptions.suggestedMajor > 8) {
    return defaultJavaConfig17(ram)
  } else {
    return defaultJavaConfig8(ram)
  }
}

function defaultJavaConfig8(ram?: RamConfig): JavaConfig {
  return {
    minRAM: resolveSelectedRAM(ram),
    maxRAM: resolveSelectedRAM(ram),
    executable: null,
    jvmOptions: [
      '-XX:+UseConcMarkSweepGC',
      '-XX:+CMSIncrementalMode',
      '-XX:-UseAdaptiveSizePolicy',
      '-Xmn128M'
    ]
  }
}

function defaultJavaConfig17(ram?: RamConfig): JavaConfig {
  return {
    minRAM: resolveSelectedRAM(ram),
    maxRAM: resolveSelectedRAM(ram),
    executable: null,
    jvmOptions: [
      '-XX:+UnlockExperimentalVMOptions',
      '-XX:+UseG1GC',
      '-XX:G1NewSizePercent=20',
      '-XX:G1ReservePercent=20',
      '-XX:MaxGCPauseMillis=50',
      '-XX:G1HeapRegionSize=32M'
    ]
  }
}

/**
 * Asegura que una propiedad de configuración de java esté establecida para el servidor dado.
 *
 * @param serverid El id del servidor.
 * @param effectiveJavaOptions Las opciones efectivas de Java.
 * @param ram La configuración de RAM.
 */
export function ensureJavaConfig(
  serverid: string,
  effectiveJavaOptions: EffectiveJavaOptions,
  ram?: RamConfig
): void {
  if (!Object.prototype.hasOwnProperty.call(config!.javaConfig, serverid)) {
    config!.javaConfig[serverid] = defaultJavaConfig(effectiveJavaOptions, ram)
  }
}

/**
 * Obtiene la cantidad mínima de memoria para inicialización de JVM. Este valor
 * contiene las unidades de memoria. Por ejemplo, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param serverid El id del servidor.
 * @returns La cantidad mínima de memoria para inicialización de JVM.
 */
export function getMinRAM(serverid: string): string {
  return config!.javaConfig[serverid].minRAM
}

/**
 * Establece la cantidad mínima de memoria para inicialización de JVM. Este valor debe
 * contener las unidades de memoria. Por ejemplo, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param serverid El id del servidor.
 * @param minRAM La nueva cantidad mínima de memoria para inicialización de JVM.
 */
export function setMinRAM(serverid: string, minRAM: string): void {
  config!.javaConfig[serverid].minRAM = minRAM
}

/**
 * Obtiene la cantidad máxima de memoria para inicialización de JVM. Este valor
 * contiene las unidades de memoria. Por ejemplo, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param serverid El id del servidor.
 * @returns La cantidad máxima de memoria para inicialización de JVM.
 */
export function getMaxRAM(serverid: string): string {
  return config!.javaConfig[serverid].maxRAM
}

/**
 * Establece la cantidad máxima de memoria para inicialización de JVM. Este valor debe
 * contener las unidades de memoria. Por ejemplo, '5G' = 5 GigaBytes, '1024M' =
 * 1024 MegaBytes, etc.
 *
 * @param serverid El id del servidor.
 * @param maxRAM La nueva cantidad máxima de memoria para inicialización de JVM.
 */
export function setMaxRAM(serverid: string, maxRAM: string): void {
  config!.javaConfig[serverid].maxRAM = maxRAM
}

/**
 * Obtiene la ruta del Ejecutable de Java.
 *
 * Este es un valor de configuración resuelto y por defecto es null hasta ser asignado externamente.
 *
 * @param serverid El id del servidor.
 * @returns La ruta del Ejecutable de Java.
 */
export function getJavaExecutable(serverid: string): string | null {
  return config!.javaConfig[serverid].executable
}

/**
 * Establece la ruta del Ejecutable de Java.
 *
 * @param serverid El id del servidor.
 * @param executable La nueva ruta del Ejecutable de Java.
 */
export function setJavaExecutable(serverid: string, executable: string): void {
  config!.javaConfig[serverid].executable = executable
}

/**
 * Obtiene los argumentos adicionales para inicialización de JVM. Los argumentos requeridos,
 * como asignación de memoria, serán resueltos dinámicamente y no estarán incluidos
 * en este valor.
 *
 * @param serverid El id del servidor.
 * @returns Un array de los argumentos adicionales para inicialización de JVM.
 */
export function getJVMOptions(serverid: string): string[] {
  return config!.javaConfig[serverid].jvmOptions
}

/**
 * Establece los argumentos adicionales para inicialización de JVM. Los argumentos requeridos,
 * como asignación de memoria, serán resueltos dinámicamente y no deberían estar
 * incluidos en este valor.
 *
 * @param serverid El id del servidor.
 * @param jvmOptions Un array de los nuevos argumentos adicionales para inicialización de JVM.
 */
export function setJVMOptions(serverid: string, jvmOptions: string[]): void {
  config!.javaConfig[serverid].jvmOptions = jvmOptions
}

// Configuraciones del Juego

/**
 * Obtiene el ancho de la ventana del juego.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns El ancho de la ventana del juego.
 */
export function getGameWidth(def = false): number {
  return !def ? config!.settings.game.resWidth : DEFAULT_CONFIG.settings.game.resWidth
}

/**
 * Establece el ancho de la ventana del juego.
 *
 * @param resWidth El nuevo ancho de la ventana del juego.
 */
export function setGameWidth(resWidth: number | string): void {
  config!.settings.game.resWidth = Number.parseInt(resWidth.toString())
}

/**
 * Valida un potencial nuevo valor de ancho.
 *
 * @param resWidth El valor de ancho a validar.
 * @returns Si el valor es válido o no.
 */
export function validateGameWidth(resWidth: number | string): boolean {
  const nVal = Number.parseInt(resWidth.toString())
  return Number.isInteger(nVal) && nVal >= 0
}

/**
 * Obtiene la altura de la ventana del juego.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns La altura de la ventana del juego.
 */
export function getGameHeight(def = false): number {
  return !def ? config!.settings.game.resHeight : DEFAULT_CONFIG.settings.game.resHeight
}

/**
 * Establece la altura de la ventana del juego.
 *
 * @param resHeight La nueva altura de la ventana del juego.
 */
export function setGameHeight(resHeight: number | string): void {
  config!.settings.game.resHeight = Number.parseInt(resHeight.toString())
}

/**
 * Valida un potencial nuevo valor de altura.
 *
 * @param resHeight El valor de altura a validar.
 * @returns Si el valor es válido o no.
 */
export function validateGameHeight(resHeight: number | string): boolean {
  const nVal = Number.parseInt(resHeight.toString())
  return Number.isInteger(nVal) && nVal >= 0
}

/**
 * Verifica si el juego debería lanzarse en modo pantalla completa.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns Si el juego está configurado para lanzarse en modo pantalla completa o no.
 */
export function getFullscreen(def = false): boolean {
  return !def ? config!.settings.game.fullscreen : DEFAULT_CONFIG.settings.game.fullscreen
}

/**
 * Cambia el estado de si el juego debería lanzarse en modo pantalla completa.
 *
 * @param fullscreen Si el juego debería lanzarse en modo pantalla completa o no.
 */
export function setFullscreen(fullscreen: boolean): void {
  config!.settings.game.fullscreen = fullscreen
}

/**
 * Verifica si el juego debería conectarse automáticamente a servidores.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns Si el juego debería conectarse automáticamente a servidores o no.
 */
export function getAutoConnect(def = false): boolean {
  return !def ? config!.settings.game.autoConnect : DEFAULT_CONFIG.settings.game.autoConnect
}

/**
 * Cambia el estado de si el juego debería conectarse automáticamente a servidores.
 *
 * @param autoConnect Si el juego debería conectarse automáticamente a servidores o no.
 */
export function setAutoConnect(autoConnect: boolean): void {
  config!.settings.game.autoConnect = autoConnect
}

/**
 * Verifica si el juego debería lanzarse como un proceso independiente.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns Si el juego se lanzará como un proceso independiente o no.
 */
export function getLaunchDetached(def = false): boolean {
  return !def ? config!.settings.game.launchDetached : DEFAULT_CONFIG.settings.game.launchDetached
}

/**
 * Cambia el estado de si el juego debería lanzarse como un proceso independiente.
 *
 * @param launchDetached Si el juego debería lanzarse como un proceso independiente o no.
 */
export function setLaunchDetached(launchDetached: boolean): void {
  config!.settings.game.launchDetached = launchDetached
}

// Configuraciones del Launcher

/**
 * Verifica si el launcher debería descargar versiones prerelease.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns Si el launcher debería descargar versiones prerelease o no.
 */
export function getAllowPrerelease(def = false): boolean {
  return !def
    ? config!.settings.launcher.allowPrerelease
    : DEFAULT_CONFIG.settings.launcher.allowPrerelease
}

/**
 * Cambia el estado de si el launcher debería descargar versiones prerelease.
 *
 * @param allowPrerelease Si el launcher debería descargar versiones prerelease o no.
 */
export function setAllowPrerelease(allowPrerelease: boolean): void {
  config!.settings.launcher.allowPrerelease = allowPrerelease
}

export function getCurrentLanguage(def = false): string {
  return !def ? config!.settings.launcher.language : DEFAULT_CONFIG.settings.launcher.language
}

/**
 * Convierte el código de idioma a minúsculas para la sincronización de idioma del launcher y juego.
 */
export function getCurrentLanguageLowercase(def = false): string {
  const language = !def
    ? config!.settings.launcher.language
    : DEFAULT_CONFIG.settings.launcher.language
  return language.toLowerCase()
}

/**
 * Cambia el estado de si el juego debería sincronizar el idioma.
 *
 * @param syncLanguage Si el juego debería sincronizar el idioma o no.
 */
export function setSyncLanguage(syncLanguage: boolean): void {
  config!.settings.game.SyncLanguage = syncLanguage
}

/**
 * Verifica si el juego debería sincronizar el idioma.
 *
 * @param def Opcional. Si es true, se retornará el valor por defecto.
 * @returns Si el juego debería sincronizar el idioma o no.
 */
export function getSyncLanguage(def = false): boolean {
  return !def ? config!.settings.game.SyncLanguage : DEFAULT_CONFIG.settings.game.SyncLanguage
}

/**
 * Cambia el idioma actual
 *
 * @param lang El idioma que debería ser seleccionado
 */
export function setLanguage(lang: string): void {
  config!.settings.launcher.language = lang
  save()
  app.relaunch()
  app.quit()
}

/**
 * Obtiene la lista de todos los idiomas disponibles
 *
 * Los idiomas ahora son un recurso
 * esto detecta el entorno del launcher (si está en dev, si es un release de MacOS o un release de Windows/Ubuntu) y aplica el directorio en cualquier caso
 * esto apunta a arreglar los releases porque antes solo funcionaba en el entorno dev, funciona en Windows pero aún necesita pruebas en MacOS y Ubuntu
 *
 * @param callback Función de callback para manejar la respuesta
 */
export function getAllLanguages(callback: (err: Error | null, files?: string[]) => void): void {
  let langDir: string

  if (isDev) {
    langDir = path.join(process.cwd(), 'resources', 'lang')
  } else {
    if (process.platform === 'darwin') {
      langDir = path.join(process.cwd(), 'Contents', 'Resources', 'lang')
    } else {
      langDir = path.join(process.cwd(), 'Resources', 'lang')
    }
  }

  fs.readdir(langDir, (err, files) => {
    if (err) {
      callback(err)
    } else {
      const fileNames = files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''))
      callback(null, fileNames)
    }
  })
}
