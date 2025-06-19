import { Client } from '@xhayper/discord-rpc'
import { LoggerUtil } from 'perrito-core'
import { languageManager } from '../utils/language'

// Estructuras de los parámetros
export interface GeneralSettings {
  clientId: string
  smallImageKey?: string
  smallImageText?: string
}

export interface ServerSettings {
  shortId?: string
  largeImageKey?: string
  largeImageText?: string
}

const log = LoggerUtil.getLogger('DiscordWrapper')

let client: Client | null = null
let activity: Record<string, any> | null = null
let isReady = false

/**
 * Inicializa la Rich Presence de Discord.
 *
 * @param genSettings Configuración general con clientId e imágenes pequeñas.
 * @param servSettings Configuración específica del servidor (imágenes grandes, shortId).
 * @param initialDetails Texto inicial a mostrar. Por defecto usa la key de idioma `discord.waiting`.
 */
export function initRPC(
  genSettings: GeneralSettings,
  servSettings: ServerSettings,
  initialDetails: string = languageManager.query('discord.waiting')
): void {
  // Evitar doble inicialización.
  if (client) {
    log.warn('Discord RPC ya estaba inicializado, reiniciando…')
    shutdownRPC()
  }

  // Crear cliente.
  client = new Client({ clientId: genSettings.clientId })
  isReady = false

  // Construir actividad base.
  activity = {
    details: initialDetails,
    state: languageManager.query('discord.state', { shortId: servSettings.shortId ?? '' }),
    largeImageKey: servSettings.largeImageKey,
    largeImageText: servSettings.largeImageText,
    smallImageKey: genSettings.smallImageKey,
    smallImageText: genSettings.smallImageText,
    startTimestamp: Date.now(),
    instance: false
  }

  // Conexión lista.
  client.on('ready', () => {
    isReady = true
    log.info('Discord RPC conectado')
    updateActivity()
  })

  // Manejar errores.
  client.on('error', (error) => {
    log.error('Discord RPC error:', error)
  })

  // Intentar login.
  client.login().catch((error: Error) => {
    if (error.message.includes('ENOENT')) {
      log.info('No se detectó cliente de Discord, Rich Presence deshabilitado.')
    } else {
      log.error('No se pudo iniciar Rich Presence:', error)
    }
  })
}

/**
 * Actualiza el campo `details` de la actividad.
 *
 * @param details Nuevo texto de detalles.
 */
export function updateDetails(details: string): void {
  if (!activity) return
  activity.details = details
  updateActivity()
}

/**
 * Actualiza completamente la actividad en Discord si el cliente está listo.
 */
function updateActivity(): void {
  if (!client || !activity || !isReady) return

  try {
    client.user?.setActivity(activity)
  } catch (error) {
    log.error('Error actualizando actividad RPC:', error)
  }
}

/**
 * Detiene la Rich Presence y limpia recursos.
 */
export function shutdownRPC(): void {
  if (!client) return

  try {
    if (isReady) {
      client.user?.clearActivity()
    }
    client.destroy()
  } catch (error) {
    log.error('Error cerrando Discord RPC:', error)
  }

  client = null
  activity = null
  isReady = false
}
