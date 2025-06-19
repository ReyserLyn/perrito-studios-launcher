/**
 * AuthManager
 *
 * Este módulo tiene como objetivo abstraer los procedimientos de inicio de sesión.
 * Los resultados de la API REST de Mojang se obtienen a través del módulo Mojang de perrito-core.
 * Estos resultados se procesan y almacenan, si corresponde, en la configuración usando el ConfigManager.
 * Todos los procedimientos de inicio de sesión deben realizarse a través de este módulo.
 *
 * @module authmanager
 */

import * as crypto from 'crypto'
import { LoggerUtil } from 'perrito-core'
import { RestResponseStatus } from 'perrito-core/common'
import { MicrosoftAuth, MicrosoftErrorCode } from 'perrito-core/microsoft'
import { AZURE_CLIENT_ID } from '../constants/ipc'
import * as ConfigManager from './configManager'

const log = LoggerUtil.getLogger('AuthManager')

// Tipos e interfaces
interface MicrosoftAuthData {
  accessToken: {
    access_token: string
    refresh_token: string
    expires_in: number
  }
  accessTokenRaw: string
  xbl: any
  xsts: any
  mcToken: {
    access_token: string
    expires_in: number
  }
  mcProfile: {
    id: string
    name: string
  }
}

enum AUTH_MODE {
  FULL = 0,
  MS_REFRESH = 1,
  MC_REFRESH = 2
}

// Funciones utilitarias

/**
 * Convierte códigos de error de Microsoft a mensajes más amigables para el usuario
 */
function microsoftErrorDisplayable(errorCode: MicrosoftErrorCode): string {
  switch (errorCode) {
    case MicrosoftErrorCode.NO_PROFILE:
      return 'Esta cuenta de Microsoft no tiene un perfil de Minecraft asociado.'
    case MicrosoftErrorCode.NO_XBOX_ACCOUNT:
      return 'Esta cuenta de Microsoft no tiene una cuenta de Xbox asociada.'
    case MicrosoftErrorCode.XBL_BANNED:
      return 'Esta cuenta ha sido suspendida de Xbox Live.'
    case MicrosoftErrorCode.UNDER_18:
      return 'Los menores de 18 años necesitan que un adulto agregue la cuenta a una familia.'
    case MicrosoftErrorCode.UNKNOWN:
    default:
      return 'Error desconocido durante la autenticación con Microsoft.'
  }
}

/**
 * Calcula la fecha de expiración. Adelanta el tiempo de expiración 10 segundos
 * para reducir la probabilidad de trabajar con un token expirado.
 */
function calculateExpiryDate(nowMs: number, expiresInS: number): Date {
  return new Date(nowMs + (expiresInS - 10) * 1000)
}

/**
 * Realiza el flujo completo de autenticación de Microsoft en un modo dado.
 *
 * AUTH_MODE.FULL = Autorización completa para una nueva cuenta.
 * AUTH_MODE.MS_REFRESH = Autorización de actualización completa.
 * AUTH_MODE.MC_REFRESH = Actualización del token MC, reutilizando el token MS.
 */
async function fullMicrosoftAuthFlow(
  entryCode: string,
  authMode: AUTH_MODE
): Promise<MicrosoftAuthData> {
  try {
    let accessTokenRaw: string
    let accessToken: any

    if (authMode !== AUTH_MODE.MC_REFRESH) {
      const accessTokenResponse = await MicrosoftAuth.getAccessToken(
        entryCode,
        authMode === AUTH_MODE.MS_REFRESH,
        AZURE_CLIENT_ID
      )

      if (accessTokenResponse.responseStatus === RestResponseStatus.ERROR) {
        const errorCode = accessTokenResponse.microsoftErrorCode || MicrosoftErrorCode.UNKNOWN
        return Promise.reject(microsoftErrorDisplayable(errorCode))
      }

      accessToken = accessTokenResponse.data
      accessTokenRaw = accessToken.access_token
    } else {
      accessTokenRaw = entryCode
    }

    const xblResponse = await MicrosoftAuth.getXBLToken(accessTokenRaw)
    if (xblResponse.responseStatus === RestResponseStatus.ERROR) {
      const errorCode = xblResponse.microsoftErrorCode || MicrosoftErrorCode.UNKNOWN
      return Promise.reject(microsoftErrorDisplayable(errorCode))
    }

    if (!xblResponse.data) {
      return Promise.reject(new Error('No se pudo obtener el token XBL'))
    }

    const xstsResponse = await MicrosoftAuth.getXSTSToken(xblResponse.data)
    if (xstsResponse.responseStatus === RestResponseStatus.ERROR) {
      const errorCode = xstsResponse.microsoftErrorCode || MicrosoftErrorCode.UNKNOWN
      return Promise.reject(microsoftErrorDisplayable(errorCode))
    }

    if (!xstsResponse.data) {
      return Promise.reject(new Error('No se pudo obtener el token XSTS'))
    }

    const mcTokenResponse = await MicrosoftAuth.getMCAccessToken(xstsResponse.data)
    if (mcTokenResponse.responseStatus === RestResponseStatus.ERROR) {
      const errorCode = mcTokenResponse.microsoftErrorCode || MicrosoftErrorCode.UNKNOWN
      return Promise.reject(microsoftErrorDisplayable(errorCode))
    }

    if (!mcTokenResponse.data) {
      return Promise.reject(new Error('No se pudo obtener el token MC'))
    }

    const mcProfileResponse = await MicrosoftAuth.getMCProfile(mcTokenResponse.data.access_token)
    if (mcProfileResponse.responseStatus === RestResponseStatus.ERROR) {
      const errorCode = mcProfileResponse.microsoftErrorCode || MicrosoftErrorCode.UNKNOWN
      return Promise.reject(microsoftErrorDisplayable(errorCode))
    }

    return {
      accessToken,
      accessTokenRaw,
      xbl: xblResponse.data,
      xsts: xstsResponse.data,
      mcToken: mcTokenResponse.data,
      mcProfile: mcProfileResponse.data || { id: '', name: '' }
    }
  } catch (err) {
    log.error('Error en el flujo de autenticación Microsoft:', err)
    return Promise.reject(microsoftErrorDisplayable(MicrosoftErrorCode.UNKNOWN))
  }
}

// Funciones públicas

/**
 * Añade una cuenta Mojang. Esto autenticará el nombre de usuario dado con el
 * servidor de autenticación de Mojang. Los datos resultantes se almacenarán
 * como una cuenta de autenticación en la base de datos de configuración.
 */
export async function addAccount(username: string): Promise<any> {
  try {
    const hash = crypto.createHash('md5')
    hash.update(username)
    const userId = hash.digest('hex')

    const ret = ConfigManager.addMojangAuthAccount(userId, 'sry', username, username)

    if (ConfigManager.getClientToken() == null) {
      ConfigManager.setClientToken('sry')
    }

    ConfigManager.save()
    return ret
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * Añade una cuenta Microsoft. Esto pasará el código de autenticación proporcionado
 * al flujo OAuth2.0 de Mojang. Los datos resultantes se almacenarán como una cuenta
 * de autenticación en la base de datos de configuración.
 */
export async function addMicrosoftAccount(authCode: string): Promise<any> {
  try {
    const fullAuth = await fullMicrosoftAuthFlow(authCode, AUTH_MODE.FULL)

    // Adelantar la expiración 10 segundos para evitar llamadas cercanas
    const now = new Date().getTime()

    const ret = ConfigManager.addMicrosoftAuthAccount(
      fullAuth.mcProfile.id,
      fullAuth.mcToken.access_token,
      fullAuth.mcProfile.name,
      calculateExpiryDate(now, fullAuth.mcToken.expires_in),
      fullAuth.accessToken.access_token,
      fullAuth.accessToken.refresh_token,
      calculateExpiryDate(now, fullAuth.accessToken.expires_in)
    )

    ConfigManager.save()
    return ret
  } catch (err) {
    log.error('Error al añadir cuenta Microsoft:', err)
    return Promise.reject(err)
  }
}

/**
 * Remueve una cuenta Mojang. Esto invalidará el token de acceso asociado
 * con la cuenta y luego la removerá de la base de datos.
 */
export function removeMojangAccount(uuid: string): Promise<void> {
  try {
    ConfigManager.removeAuthAccount(uuid)
    ConfigManager.save()
    return Promise.resolve()
  } catch (err) {
    log.error('Error al remover cuenta Mojang:', err)
    return Promise.reject(err)
  }
}

/**
 * Remueve una cuenta Microsoft. Se espera que el llamador invoque el cierre
 * de sesión OAuth a través del renderizador IPC.
 */
export async function removeMicrosoftAccount(uuid: string): Promise<void> {
  try {
    ConfigManager.removeAuthAccount(uuid)
    ConfigManager.save()
    return Promise.resolve()
  } catch (err) {
    log.error('Error al remover cuenta Microsoft:', err)
    return Promise.reject(err)
  }
}

/**
 * Valida la cuenta Microsoft seleccionada con el servidor de autenticación de Microsoft.
 * Si la cuenta no es válida, intentaremos actualizar el token de acceso y actualizar ese valor.
 * Si eso falla, se requerirá un nuevo inicio de sesión.
 */
async function validateSelectedMicrosoftAccount(): Promise<boolean> {
  const current = ConfigManager.getSelectedAccount()

  if (!current || current.type !== 'microsoft') {
    return false
  }

  const now = new Date().getTime()
  const mcExpiresAt = current.expiresAt?.getTime() || 0
  const mcExpired = now >= mcExpiresAt

  if (!mcExpired) {
    return true
  }

  // Token MC expirado. Verificar token MS.
  const msExpiresAt = current.microsoft?.expires_at.getTime() || 0
  const msExpired = now >= msExpiresAt

  if (msExpired) {
    // MS expirado, hacer actualización completa.
    try {
      const res = await fullMicrosoftAuthFlow(
        current.microsoft!.refresh_token,
        AUTH_MODE.MS_REFRESH
      )

      ConfigManager.updateMicrosoftAuthAccount(
        current.uuid,
        res.mcToken.access_token,
        res.accessToken.access_token,
        res.accessToken.refresh_token,
        calculateExpiryDate(now, res.accessToken.expires_in),
        calculateExpiryDate(now, res.mcToken.expires_in)
      )

      ConfigManager.save()
      return true
    } catch (err) {
      log.error('Error al actualizar tokens Microsoft (completo):', err)
      return false
    }
  } else {
    // Solo MC expirado, usar token MS existente.
    try {
      const res = await fullMicrosoftAuthFlow(current.microsoft!.access_token, AUTH_MODE.MC_REFRESH)

      ConfigManager.updateMicrosoftAuthAccount(
        current.uuid,
        res.mcToken.access_token,
        current.microsoft!.access_token,
        current.microsoft!.refresh_token,
        current.microsoft!.expires_at,
        calculateExpiryDate(now, res.mcToken.expires_in)
      )

      ConfigManager.save()
      return true
    } catch (err) {
      log.error('Error al actualizar token MC:', err)
      return false
    }
  }
}

/**
 * Valida la cuenta seleccionada según su tipo
 */
export async function validateSelected(): Promise<boolean> {
  const current = ConfigManager.getSelectedAccount()

  if (!current) {
    return false
  }

  if (current.type === 'microsoft') {
    return await validateSelectedMicrosoftAccount()
  } else {
    // Para cuentas Mojang, siempre devolvemos true por ahora
    return true
  }
}

/**
 * Obtiene información de la cuenta seleccionada
 */
export function getSelectedAccount(): any {
  return ConfigManager.getSelectedAccount()
}

/**
 * Obtiene todas las cuentas autenticadas
 */
export function getAuthAccounts(): any {
  return ConfigManager.getAuthAccounts()
}

/**
 * Selecciona una cuenta por UUID
 */
export function setSelectedAccount(uuid: string): any {
  return ConfigManager.setSelectedAccount(uuid)
}
