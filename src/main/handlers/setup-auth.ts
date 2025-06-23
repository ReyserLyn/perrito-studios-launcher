import { ipcMain } from 'electron'
import * as AuthManager from '../services/authManager'
import { AUTH_OPCODE } from '../constants/ipc'

export default function setupAuthHandlers(): void {
  // === HANDLERS DE CUENTAS MOJANG ===

  // Añadir cuenta Mojang
  ipcMain.handle(AUTH_OPCODE.ADD_MOJANG_ACCOUNT, async (_event, username: string) => {
    try {
      const account = await AuthManager.addAccount(username)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error añadiendo cuenta Mojang:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error añadiendo cuenta Mojang'
      }
    }
  })

  // Remover cuenta Mojang
  ipcMain.handle(AUTH_OPCODE.REMOVE_MOJANG_ACCOUNT, async (_event, uuid: string) => {
    try {
      console.log(`[+] Removiendo cuenta Mojang: ${uuid}`)
      await AuthManager.removeMojangAccount(uuid)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removiendo cuenta Mojang:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error removiendo cuenta Mojang'
      }
    }
  })

  // === HANDLERS DE CUENTAS MICROSOFT ===

  // Añadir cuenta Microsoft
  ipcMain.handle(AUTH_OPCODE.ADD_MICROSOFT_ACCOUNT, async (_event, authCode: string) => {
    try {
      console.log('[+] Añadiendo cuenta Microsoft...')
      const account = await AuthManager.addMicrosoftAccount(authCode)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error añadiendo cuenta Microsoft:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error añadiendo cuenta Microsoft'
      }
    }
  })

  // Remover cuenta Microsoft
  ipcMain.handle(AUTH_OPCODE.REMOVE_MICROSOFT_ACCOUNT, async (_event, uuid: string) => {
    try {
      console.log(`[+] Removiendo cuenta Microsoft: ${uuid}`)
      await AuthManager.removeMicrosoftAccount(uuid)
      return {
        success: true
      }
    } catch (error) {
      console.error('Error removiendo cuenta Microsoft:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error removiendo cuenta Microsoft'
      }
    }
  })

  // === HANDLERS DE GESTIÓN DE CUENTAS ===

  // Obtener cuenta seleccionada
  ipcMain.handle(AUTH_OPCODE.GET_SELECTED_ACCOUNT, async () => {
    try {
      const account = AuthManager.getSelectedAccount()
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error obteniendo cuenta seleccionada:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo cuenta seleccionada'
      }
    }
  })

  // Obtener todas las cuentas
  ipcMain.handle(AUTH_OPCODE.GET_ALL_ACCOUNTS, async () => {
    try {
      const accounts = AuthManager.getAuthAccounts()
      return {
        success: true,
        accounts
      }
    } catch (error) {
      console.error('Error obteniendo cuentas:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error obteniendo cuentas'
      }
    }
  })

  // Seleccionar cuenta
  ipcMain.handle(AUTH_OPCODE.SELECT_ACCOUNT, async (_event, uuid: string) => {
    try {
      console.log(`[+] Seleccionando cuenta: ${uuid}`)
      const account = AuthManager.setSelectedAccount(uuid)
      return {
        success: true,
        account
      }
    } catch (error) {
      console.error('Error seleccionando cuenta:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error seleccionando cuenta'
      }
    }
  })

  // Validar cuenta seleccionada
  ipcMain.handle(AUTH_OPCODE.VALIDATE_SELECTED, async () => {
    try {
      console.log('[+] Validando cuenta seleccionada...')
      const isValid = await AuthManager.validateSelected()
      return {
        success: true,
        isValid
      }
    } catch (error) {
      console.error('Error validando cuenta:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando cuenta'
      }
    }
  })

  // Logout
  ipcMain.handle(AUTH_OPCODE.LOGOUT, async () => {
    try {
      console.log('[+] Cerrando sesión...')
      const account = AuthManager.getSelectedAccount()

      if (account) {
        if (account.type === 'microsoft') {
          await AuthManager.removeMicrosoftAccount(account.uuid)
        } else {
          await AuthManager.removeMojangAccount(account.uuid)
        }
      }

      console.log('[+] Sesión cerrada exitosamente')
      return { success: true }
    } catch (error) {
      console.error('Error logout:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      }
    }
  })
}
