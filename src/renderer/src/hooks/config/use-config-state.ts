import { useConfigStore, type JavaConfig } from '../../stores/config-store'

/**
 * Hook para obtener la configuración del juego
 * @returns Configuración actual del juego
 */
export const useGameConfig = () => useConfigStore((state) => state.game)

/**
 * Hook para obtener la configuración del launcher
 * @returns Configuración actual del launcher
 */
export const useLauncherConfig = () => useConfigStore((state) => state.launcher)

/**
 * Hook para obtener la configuración de Java de un servidor específico
 * @param serverId ID del servidor
 * @returns Configuración de Java para el servidor o null si no existe
 */
export const useJavaConfig = (serverId: string): JavaConfig | null =>
  useConfigStore((state) => state.java[serverId] || null)

/**
 * Hook para obtener todas las configuraciones de Java
 * @returns Objeto con todas las configuraciones de Java por serverId
 */
export const useAllJavaConfigs = () => useConfigStore((state) => state.java)

/**
 * Hook para obtener el estado de cambios pendientes
 * @returns Estado de dirty
 */
export const useConfigStatus = () => {
  const store = useConfigStore()
  return {
    isDirty: store.isDirty,
    hasUnsavedChanges: store.isDirty
  }
}

/**
 * Hook para acciones específicas del juego
 * Agrupa solo las acciones relacionadas con la configuración del juego
 * @returns Acciones específicas del juego
 */
export const useGameActions = () => {
  const store = useConfigStore()
  return {
    setGameConfig: store.setGameConfig,
    setGameWidth: store.setGameWidth,
    setGameHeight: store.setGameHeight,
    setFullscreen: store.setFullscreen,
    setAutoConnect: store.setAutoConnect,
    setLaunchDetached: store.setLaunchDetached,
    setSyncLanguage: store.setSyncLanguage
  }
}

/**
 * Hook para acciones específicas del launcher
 * Agrupa solo las acciones relacionadas con la configuración del launcher
 * @returns Acciones específicas del launcher
 */
export const useLauncherActions = () => {
  const store = useConfigStore()
  return {
    setLauncherConfig: store.setLauncherConfig,
    setAllowPrerelease: store.setAllowPrerelease,
    setLanguage: store.setLanguage
  }
}

/**
 * Hook para acciones específicas de Java
 * Agrupa solo las acciones relacionadas con la configuración de Java
 * @returns Acciones específicas de Java
 */
export const useJavaActions = () => {
  const store = useConfigStore()
  return {
    setJavaConfig: store.setJavaConfig,
    setMinRAM: store.setMinRAM,
    setMaxRAM: store.setMaxRAM,
    setJavaExecutable: store.setJavaExecutable,
    setJVMOptions: store.setJVMOptions
  }
}

/**
 * Hook para acciones de control del store
 * @returns Acciones de control (setDirty, reset)
 */
export const useConfigControlActions = () => {
  const store = useConfigStore()
  return {
    setDirty: store.setDirty,
    reset: store.reset
  }
}
