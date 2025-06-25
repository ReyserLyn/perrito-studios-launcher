/**
 * DropinModUtil
 *
 * Este módulo maneja la gestión de mods drop-in y shaderpacks.
 * Proporciona funcionalidades para escanear, añadir, eliminar y toggle mods,
 * así como gestión de shaderpacks para las instancias de Minecraft.
 *
 * @module dropinmodutil
 */

import { ipcRenderer, shell } from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import { LoggerUtil } from 'perrito-core'
import { SHELL_OPCODE } from '../constants/ipc'
import { DiscoveredMod, DiscoveredShaderpack, FileItem, ModStats } from '../types/mods'

const log = LoggerUtil.getLogger('DropinModUtil')

// Constantes y expresiones regulares
// Group #1: File Name (without .disabled, if any)
// Group #2: File Extension (jar, zip, or litemod)
// Group #3: If it is disabled (if string 'disabled' is present)
const MOD_REGEX = /^(.+(jar|zip|litemod))(?:\.(disabled))?$/
const DISABLED_EXT = '.disabled'

const SHADER_REGEX = /^(.+)\.zip$/
const SHADER_OPTION = /shaderPack=(.+)/
const SHADER_DIR = 'shaderpacks'
const SHADER_CONFIG = 'optionsshaders.txt'

/**
 * Valida que el directorio dado existe. Si no existe, lo crea.
 *
 * @param dir La ruta al directorio.
 */
export function validateDir(dir: string): void {
  try {
    fs.ensureDirSync(dir)
    log.debug(`Directorio validado/creado: ${dir}`)
  } catch (error) {
    log.error(`Error validando directorio ${dir}:`, error)
    throw error
  }
}

/**
 * Escanea mods drop-in en la carpeta de mods y en la carpeta de mods
 * específica de la versión.
 *
 * @param modsDir La ruta al directorio de mods.
 * @param version La versión de Minecraft de la configuración del servidor.
 *
 * @returns Un array de objetos que almacenan metadatos sobre cada mod descubierto.
 */
export function scanForDropinMods(modsDir: string, version: string): DiscoveredMod[] {
  const modsDiscovered: DiscoveredMod[] = []

  try {
    if (!fs.existsSync(modsDir)) {
      log.warn(`Directorio de mods no existe: ${modsDir}`)
      return modsDiscovered
    }

    // Escanear mods en el directorio principal
    const modCandidates = fs.readdirSync(modsDir)
    let verCandidates: string[] = []

    // Escanear mods en el directorio específico de la versión
    const versionDir = path.join(modsDir, version)
    if (fs.existsSync(versionDir)) {
      verCandidates = fs.readdirSync(versionDir)
    }

    // Procesar mods del directorio principal
    for (const file of modCandidates) {
      const match = MOD_REGEX.exec(file)
      if (match != null) {
        modsDiscovered.push({
          fullName: match[0],
          name: match[1],
          ext: match[2],
          disabled: match[3] != null
        })
      }
    }

    // Procesar mods del directorio de versión
    for (const file of verCandidates) {
      const match = MOD_REGEX.exec(file)
      if (match != null) {
        modsDiscovered.push({
          fullName: path.join(version, match[0]),
          name: match[1],
          ext: match[2],
          disabled: match[3] != null
        })
      }
    }

    log.info(`Escaneados ${modsDiscovered.length} mods en ${modsDir}`)
    return modsDiscovered
  } catch (error) {
    log.error(`Error escaneando mods en ${modsDir}:`, error)
    return modsDiscovered
  }
}

/**
 * Añade mods drop-in.
 *
 * @param files Los archivos a añadir.
 * @param modsDir La ruta al directorio de mods.
 * @returns Un objeto con información sobre el resultado de la operación.
 */
export function addDropinMods(
  files: FileItem[],
  modsDir: string
): {
  success: boolean
  addedCount: number
  skippedCount: number
  errors: Array<{ fileName: string; error: string }>
} {
  const result = {
    success: true,
    addedCount: 0,
    skippedCount: 0,
    errors: [] as Array<{ fileName: string; error: string }>
  }

  try {
    validateDir(modsDir)

    for (const file of files) {
      if (MOD_REGEX.exec(file.name) != null) {
        const targetPath = path.join(modsDir, file.name)

        try {
          // Verificar si el archivo ya existe
          if (fs.existsSync(targetPath)) {
            result.skippedCount++
            result.errors.push({
              fileName: file.name,
              error: 'El archivo ya existe en el directorio de mods'
            })
            log.warn(`Mod omitido (ya existe): ${file.name}`)
            continue
          }

          fs.moveSync(file.path, targetPath)
          result.addedCount++
          log.debug(`Mod añadido: ${file.name}`)
        } catch (moveError) {
          result.success = false
          result.errors.push({
            fileName: file.name,
            error:
              moveError instanceof Error ? moveError.message : 'Error desconocido al mover archivo'
          })
          log.error(`Error moviendo mod ${file.name}:`, moveError)
        }
      } else {
        result.skippedCount++
        result.errors.push({
          fileName: file.name,
          error: 'Archivo no válido (no es un mod reconocido)'
        })
        log.warn(`Archivo omitido (no es un mod válido): ${file.name}`)
      }
    }

    if (result.addedCount > 0) {
      log.info(`${result.addedCount} mods añadidos a ${modsDir}`)
    }

    if (result.skippedCount > 0) {
      log.info(`${result.skippedCount} archivos omitidos`)
    }

    return result
  } catch (error) {
    log.error(`Error añadiendo mods a ${modsDir}:`, error)
    result.success = false
    result.errors.push({
      fileName: 'General',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
    return result
  }
}

/**
 * Elimina un mod drop-in del sistema de archivos.
 *
 * @param modsDir La ruta al directorio de mods.
 * @param fullName El nombre completo del mod descubierto a eliminar.
 *
 * @returns Promise que resuelve a true si el mod fue eliminado, false en caso contrario.
 */
export async function deleteDropinMod(modsDir: string, fullName: string): Promise<boolean> {
  try {
    const modPath = path.join(modsDir, fullName)
    log.debug(`Eliminando mod: ${modPath}`)

    // Usar el IPC para mover a la papelera de manera segura
    const res = await ipcRenderer.invoke(SHELL_OPCODE.TRASH_ITEM, modPath)

    if (!res.result) {
      shell.beep()
      log.error(`Error eliminando mod drop-in ${fullName}:`, res.error)
      return false
    }

    log.info(`Mod eliminado exitosamente: ${fullName}`)
    return true
  } catch (error) {
    log.error(`Error eliminando mod ${fullName}:`, error)
    shell.beep()
    return false
  }
}

/**
 * Activa o desactiva un mod descubierto. Esto se logra añadiendo o
 * quitando la extensión .disabled al archivo local.
 *
 * @param modsDir La ruta al directorio de mods.
 * @param fullName El nombre completo del mod descubierto a cambiar.
 * @param enable Si activar o desactivar el mod.
 *
 * @returns Promise que se resuelve cuando el mod ha sido cambiado.
 * Si ocurre un error de E/S, la promesa será rechazada.
 */
export function toggleDropinMod(modsDir: string, fullName: string, enable: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const oldPath = path.join(modsDir, fullName)
      const newPath = path.join(
        modsDir,
        enable ? fullName.substring(0, fullName.indexOf(DISABLED_EXT)) : fullName + DISABLED_EXT
      )

      log.debug(`Toggling mod: ${oldPath} -> ${newPath}`)

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          log.error(`Error toggling mod ${fullName}:`, err)
          reject(err)
        } else {
          log.info(`Mod ${enable ? 'activado' : 'desactivado'}: ${fullName}`)
          resolve()
        }
      })
    } catch (error) {
      log.error(`Error en toggleDropinMod:`, error)
      reject(error)
    }
  })
}

/**
 * Verifica si un mod drop-in está habilitado.
 *
 * @param fullName El nombre completo del mod descubierto.
 * @returns True si el mod está habilitado, false en caso contrario.
 */
export function isDropinModEnabled(fullName: string): boolean {
  return !fullName.endsWith(DISABLED_EXT)
}

/**
 * Escanea shaderpacks dentro de la carpeta shaderpacks.
 *
 * @param instanceDir La ruta al directorio de la instancia del servidor.
 *
 * @returns Un array de objetos que almacenan metadatos sobre cada shaderpack descubierto.
 */
export function scanForShaderpacks(instanceDir: string): DiscoveredShaderpack[] {
  const shaderDir = path.join(instanceDir, SHADER_DIR)
  const packsDiscovered: DiscoveredShaderpack[] = [
    {
      fullName: 'OFF',
      name: 'Off (Default)'
    }
  ]

  try {
    if (!fs.existsSync(shaderDir)) {
      log.debug(`Directorio de shaderpacks no existe: ${shaderDir}`)
      return packsDiscovered
    }

    const shaderCandidates = fs.readdirSync(shaderDir)
    for (const file of shaderCandidates) {
      const match = SHADER_REGEX.exec(file)
      if (match != null) {
        packsDiscovered.push({
          fullName: match[0],
          name: match[1]
        })
      }
    }

    log.info(`Escaneados ${packsDiscovered.length - 1} shaderpacks en ${shaderDir}`)
    return packsDiscovered
  } catch (error) {
    log.error(`Error escaneando shaderpacks en ${instanceDir}:`, error)
    return packsDiscovered
  }
}

/**
 * Lee el archivo optionsshaders.txt para localizar el pack
 * habilitado actualmente. Si el archivo no existe, se retorna OFF.
 *
 * @param instanceDir La ruta al directorio de la instancia del servidor.
 *
 * @returns El nombre del archivo del shaderpack habilitado.
 */
export function getEnabledShaderpack(instanceDir: string): string {
  try {
    validateDir(instanceDir)

    const optionsShaders = path.join(instanceDir, SHADER_CONFIG)
    if (!fs.existsSync(optionsShaders)) {
      log.debug(`Archivo optionsshaders.txt no existe: ${optionsShaders}`)
      return 'OFF'
    }

    const buf = fs.readFileSync(optionsShaders, { encoding: 'utf-8' })
    const match = SHADER_OPTION.exec(buf)

    if (match != null) {
      log.debug(`Shaderpack habilitado: ${match[1]}`)
      return match[1]
    } else {
      log.warn('WARNING: Shaderpack regex failed.')
      return 'OFF'
    }
  } catch (error) {
    log.error(`Error obteniendo shaderpack habilitado:`, error)
    return 'OFF'
  }
}

/**
 * Establece el shaderpack habilitado.
 *
 * @param instanceDir La ruta al directorio de la instancia del servidor.
 * @param pack El nombre del archivo del shaderpack.
 */
export function setEnabledShaderpack(instanceDir: string, pack: string): void {
  try {
    validateDir(instanceDir)

    const optionsShaders = path.join(instanceDir, SHADER_CONFIG)
    let buf: string

    if (fs.existsSync(optionsShaders)) {
      buf = fs.readFileSync(optionsShaders, { encoding: 'utf-8' })
      buf = buf.replace(SHADER_OPTION, `shaderPack=${pack}`)
    } else {
      buf = `shaderPack=${pack}`
    }

    fs.writeFileSync(optionsShaders, buf, { encoding: 'utf-8' })
    log.info(`Shaderpack establecido: ${pack}`)
  } catch (error) {
    log.error(`Error estableciendo shaderpack ${pack}:`, error)
    throw error
  }
}

/**
 * Añade shaderpacks.
 *
 * @param files Los archivos a añadir.
 * @param instanceDir La ruta al directorio de la instancia del servidor.
 */
export function addShaderpacks(files: FileItem[], instanceDir: string): void {
  try {
    const shaderPacksPath = path.join(instanceDir, SHADER_DIR)
    validateDir(shaderPacksPath)

    let addedCount = 0
    for (const file of files) {
      if (SHADER_REGEX.exec(file.name) != null) {
        const targetPath = path.join(shaderPacksPath, file.name)
        fs.moveSync(file.path, targetPath)
        addedCount++
        log.debug(`Shaderpack añadido: ${file.name}`)
      }
    }

    log.info(`${addedCount} shaderpacks añadidos a ${instanceDir}`)
  } catch (error) {
    log.error(`Error añadiendo shaderpacks a ${instanceDir}:`, error)
    throw error
  }
}

// Funciones utilitarias adicionales

/**
 * Obtiene estadísticas de mods en un directorio.
 *
 * @param modsDir La ruta al directorio de mods.
 * @param version La versión de Minecraft.
 * @returns Estadísticas de mods.
 */
export function getModStats(modsDir: string, version: string): ModStats {
  const mods = scanForDropinMods(modsDir, version)
  const stats = {
    total: mods.length,
    enabled: 0,
    disabled: 0,
    byExtension: {} as Record<string, number>
  }

  for (const mod of mods) {
    if (mod.disabled) {
      stats.disabled++
    } else {
      stats.enabled++
    }

    stats.byExtension[mod.ext] = (stats.byExtension[mod.ext] || 0) + 1
  }

  return stats
}

/**
 * Verifica si un archivo es un mod válido.
 *
 * @param fileName El nombre del archivo a verificar.
 * @returns True si es un mod válido, false en caso contrario.
 */
export function isValidMod(fileName: string): boolean {
  return MOD_REGEX.test(fileName)
}

/**
 * Verifica si un archivo es un shaderpack válido.
 *
 * @param fileName El nombre del archivo a verificar.
 * @returns True si es un shaderpack válido, false en caso contrario.
 */
export function isValidShaderpack(fileName: string): boolean {
  return SHADER_REGEX.test(fileName)
}
