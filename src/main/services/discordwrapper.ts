import { Client } from '@xhayper/discord-rpc'
import { LoggerUtil } from 'perrito-core'
import { languageManager } from '../utils/language'

// Estructuras de los parámetros
export interface GeneralSettings {
  clientId?: string
  smallImageKey?: string
  smallImageText?: string
}

export interface ServerSettings {
  shortId?: string
  largeImageKey?: string
  largeImageText?: string
}

const logger = LoggerUtil.getLogger('DiscordRPC')
const DEFAULT_CLIENT_ID = '1207445012345678901' // Replace with your actual client ID

interface DiscordActivity {
  state?: string
  details?: string
  startTimestamp?: number
  endTimestamp?: number
  largeImageKey?: string
  largeImageText?: string
  smallImageKey?: string
  smallImageText?: string
  partyId?: string
  partySize?: number
  partyMax?: number
  matchSecret?: string
  spectateSecret?: string
  joinSecret?: string
  instance?: boolean
  buttons?: Array<{
    label: string
    url: string
  }>
}

let rpc: Client | null = null
let activity: DiscordActivity | null = null
let isReady = false

/**
 * Inicializa la Rich Presence de Discord.
 *
 * @param genSettings Configuración general con clientId e imágenes pequeñas (opcional).
 * @param servSettings Configuración específica del servidor (opcional).
 * @param initialDetails Texto inicial a mostrar (opcional).
 */
export async function initialize(
  genSettings: GeneralSettings = {},
  servSettings: ServerSettings = {},
  initialDetails: string = languageManager.getString('discord.waiting')
): Promise<void> {
  if (rpc) {
    throw new Error('Discord RPC ya está inicializado')
  }

  rpc = new Client({ clientId: genSettings.clientId || DEFAULT_CLIENT_ID })
  isReady = false

  // Construir actividad base
  activity = {
    details: initialDetails,
    state: servSettings.shortId
      ? languageManager.getString('discord.state').replace('{shortId}', servSettings.shortId)
      : undefined,
    largeImageKey: servSettings.largeImageKey,
    largeImageText: servSettings.largeImageText,
    smallImageKey: genSettings.smallImageKey,
    smallImageText: genSettings.smallImageText,
    startTimestamp: Date.now(),
    instance: false
  }

  try {
    await rpc.login()
    isReady = true
    logger.info('Discord RPC conectado')
    if (activity) {
      await updateActivity(activity)
    }
  } catch (error) {
    logger.error('Error conectando Discord RPC:', error)
    throw error
  }
}

/**
 * Actualiza el campo `details` de la actividad.
 *
 * @param details Nuevo texto de detalles.
 */
export function updateDetails(details: string): void {
  if (!activity) return
  activity.details = details
  updateActivity(activity)
}

/**
 * Actualiza completamente la actividad en Discord si el cliente está listo.
 */
export async function updateActivity(newActivity: DiscordActivity): Promise<void> {
  if (!rpc || !isReady) {
    throw new Error('Discord RPC no está inicializado o no está listo')
  }

  activity = newActivity

  try {
    await rpc.user?.setActivity(activity)
    logger.info('Actividad de Discord RPC actualizada')
  } catch (error) {
    logger.error('Error actualizando actividad de Discord RPC:', error)
    throw error
  }
}

/**
 * Detiene la Rich Presence y limpia recursos.
 */
export async function destroy(): Promise<void> {
  if (!rpc) {
    return
  }

  try {
    if (isReady) {
      await rpc.user?.clearActivity()
    }
    await rpc.destroy()
    rpc = null
    activity = null
    isReady = false
    logger.info('Discord RPC desconectado')
  } catch (error) {
    logger.error('Error desconectando Discord RPC:', error)
    throw error
  }
}
