import { ipcMain, shell } from 'electron'
import path from 'path'
import { DROPIN_MOD_OPCODE } from '../constants/ipc'
import * as DropinModUtil from '../services/dropinModUtil'

export default function setupDropinModHandlers(): void {
  type FileItem = { name: string; path: string }

  // Escanear mods
  ipcMain.handle(DROPIN_MOD_OPCODE.SCAN_MODS, async (_event, modsDir: string, version: string) => {
    try {
      const mods = DropinModUtil.scanForDropinMods(modsDir, version)
      return { success: true, mods }
    } catch (error) {
      console.error('Error escaneando mods:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al escanear mods'
      }
    }
  })

  // Añadir mods
  ipcMain.handle(DROPIN_MOD_OPCODE.ADD_MODS, async (_event, files: FileItem[], modsDir: string) => {
    try {
      DropinModUtil.addDropinMods(files, modsDir)
      return { success: true }
    } catch (error) {
      console.error('Error añadiendo mods:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al añadir mods'
      }
    }
  })

  // Eliminar mod
  ipcMain.handle(
    DROPIN_MOD_OPCODE.DELETE_MOD,
    async (_event, modsDir: string, fullName: string) => {
      try {
        const modPath = path.join(modsDir, fullName)
        await shell.trashItem(modPath)
        return { success: true }
      } catch (error) {
        console.error('Error eliminando mod:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al eliminar mod'
        }
      }
    }
  )

  // Activar / desactivar mod
  ipcMain.handle(
    DROPIN_MOD_OPCODE.TOGGLE_MOD,
    async (_event, modsDir: string, fullName: string, enable: boolean) => {
      try {
        await DropinModUtil.toggleDropinMod(modsDir, fullName, enable)
        return { success: true }
      } catch (error) {
        console.error('Error toggling mod:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al cambiar mod'
        }
      }
    }
  )

  // Escanear shaderpacks
  ipcMain.handle(DROPIN_MOD_OPCODE.SCAN_SHADERPACKS, async (_event, instanceDir: string) => {
    try {
      const packs = DropinModUtil.scanForShaderpacks(instanceDir)
      return { success: true, packs }
    } catch (error) {
      console.error('Error escaneando shaderpacks:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al escanear shaderpacks'
      }
    }
  })

  // Obtener shaderpack habilitado
  ipcMain.handle(DROPIN_MOD_OPCODE.GET_ENABLED_SHADERPACK, async (_event, instanceDir: string) => {
    try {
      const pack = DropinModUtil.getEnabledShaderpack(instanceDir)
      return { success: true, pack }
    } catch (error) {
      console.error('Error obteniendo shaderpack activo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener shaderpack'
      }
    }
  })

  // Establecer shaderpack habilitado
  ipcMain.handle(
    DROPIN_MOD_OPCODE.SET_ENABLED_SHADERPACK,
    async (_event, instanceDir: string, pack: string) => {
      try {
        DropinModUtil.setEnabledShaderpack(instanceDir, pack)
        return { success: true }
      } catch (error) {
        console.error('Error estableciendo shaderpack:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error desconocido al establecer shaderpack'
        }
      }
    }
  )

  // Añadir shaderpacks
  ipcMain.handle(
    DROPIN_MOD_OPCODE.ADD_SHADERPACKS,
    async (_event, files: FileItem[], instanceDir: string) => {
      try {
        DropinModUtil.addShaderpacks(files, instanceDir)
        return { success: true }
      } catch (error) {
        console.error('Error añadiendo shaderpacks:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido al añadir shaderpacks'
        }
      }
    }
  )

  // Obtener estadísticas de mods
  ipcMain.handle(
    DROPIN_MOD_OPCODE.GET_MOD_STATS,
    async (_event, modsDir: string, version: string) => {
      try {
        const stats = DropinModUtil.getModStats(modsDir, version)
        return { success: true, stats }
      } catch (error) {
        console.error('Error obteniendo estadísticas de mods:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Error desconocido al obtener estadísticas'
        }
      }
    }
  )
}
