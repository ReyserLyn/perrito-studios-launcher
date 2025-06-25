import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Tipos para la configuración
export interface GameConfig {
  resWidth: number
  resHeight: number
  fullscreen: boolean
  autoConnect: boolean
  launchDetached: boolean
  syncLanguage: boolean
}

export interface LauncherConfig {
  allowPrerelease: boolean
  language: string
}

export interface JavaConfig {
  minRAM: string
  maxRAM: string
  executable: string | null
  jvmOptions: string[]
}

export interface ConfigState {
  // Estados críticos
  game: GameConfig
  launcher: LauncherConfig
  java: Record<string, JavaConfig>
  isDirty: boolean

  // Acciones para Game Config
  setGameConfig: (config: Partial<GameConfig>) => void
  setGameWidth: (width: number) => void
  setGameHeight: (height: number) => void
  setFullscreen: (fullscreen: boolean) => void
  setAutoConnect: (autoConnect: boolean) => void
  setLaunchDetached: (detached: boolean) => void
  setSyncLanguage: (sync: boolean) => void

  // Acciones para Launcher Config
  setLauncherConfig: (config: Partial<LauncherConfig>) => void
  setAllowPrerelease: (allow: boolean) => void
  setLanguage: (language: string) => void

  // Acciones para Java Config
  setJavaConfig: (serverId: string, config: Partial<JavaConfig>) => void
  setMinRAM: (serverId: string, minRAM: string) => void
  setMaxRAM: (serverId: string, maxRAM: string) => void
  setJavaExecutable: (serverId: string, executable: string) => void
  setJVMOptions: (serverId: string, options: string[]) => void

  // Acciones de control
  setDirty: (dirty: boolean) => void
  reset: () => void
}

const defaultGameConfig: GameConfig = {
  resWidth: 1280,
  resHeight: 720,
  fullscreen: false,
  autoConnect: true,
  launchDetached: true,
  syncLanguage: true
}

const defaultLauncherConfig: LauncherConfig = {
  allowPrerelease: false,
  language: 'es_ES'
}

const initialConfigState = {
  game: defaultGameConfig,
  launcher: defaultLauncherConfig,
  java: {},
  isDirty: false
}

// Helper para crear/actualizar configuración de Java
const createOrUpdateJavaConfig = (
  state: ConfigState,
  serverId: string,
  updates: Partial<JavaConfig>
): ConfigState => {
  const defaultJavaConfig: JavaConfig = {
    minRAM: '',
    maxRAM: '',
    executable: null,
    jvmOptions: []
  }

  return {
    ...state,
    java: {
      ...state.java,
      [serverId]: {
        ...defaultJavaConfig,
        ...state.java[serverId],
        ...updates
      }
    },
    isDirty: true
  }
}

export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set) => ({
        ...initialConfigState,

        // Acciones para Game Config
        setGameConfig: (config) =>
          set(
            (state) => ({
              game: { ...state.game, ...config },
              isDirty: true
            }),
            false,
            'setGameConfig'
          ),

        setGameWidth: (width: number) =>
          set(
            (state) => ({
              game: { ...state.game, resWidth: width },
              isDirty: true
            }),
            false,
            'setGameWidth'
          ),

        setGameHeight: (height: number) =>
          set(
            (state) => ({
              game: { ...state.game, resHeight: height },
              isDirty: true
            }),
            false,
            'setGameHeight'
          ),

        setFullscreen: (fullscreen: boolean) =>
          set(
            (state) => ({
              game: { ...state.game, fullscreen },
              isDirty: true
            }),
            false,
            'setFullscreen'
          ),

        setAutoConnect: (autoConnect: boolean) =>
          set(
            (state) => ({
              game: { ...state.game, autoConnect },
              isDirty: true
            }),
            false,
            'setAutoConnect'
          ),

        setLaunchDetached: (detached: boolean) =>
          set(
            (state) => ({
              game: { ...state.game, launchDetached: detached },
              isDirty: true
            }),
            false,
            'setLaunchDetached'
          ),

        setSyncLanguage: (sync: boolean) =>
          set(
            (state) => ({
              game: { ...state.game, syncLanguage: sync },
              isDirty: true
            }),
            false,
            'setSyncLanguage'
          ),

        // Acciones para Launcher Config
        setLauncherConfig: (config) =>
          set(
            (state) => ({
              launcher: { ...state.launcher, ...config },
              isDirty: true
            }),
            false,
            'setLauncherConfig'
          ),

        setAllowPrerelease: (allow: boolean) =>
          set(
            (state) => ({
              launcher: { ...state.launcher, allowPrerelease: allow },
              isDirty: true
            }),
            false,
            'setAllowPrerelease'
          ),

        setLanguage: (language: string) =>
          set(
            (state) => ({
              launcher: { ...state.launcher, language },
              isDirty: true
            }),
            false,
            'setLanguage'
          ),

        // Acciones para Java Config
        setJavaConfig: (serverId: string, config: Partial<JavaConfig>) =>
          set((state) => createOrUpdateJavaConfig(state, serverId, config), false, 'setJavaConfig'),

        setMinRAM: (serverId: string, minRAM: string) =>
          set((state) => createOrUpdateJavaConfig(state, serverId, { minRAM }), false, 'setMinRAM'),

        setMaxRAM: (serverId: string, maxRAM: string) =>
          set((state) => createOrUpdateJavaConfig(state, serverId, { maxRAM }), false, 'setMaxRAM'),

        setJavaExecutable: (serverId: string, executable: string) =>
          set(
            (state) => createOrUpdateJavaConfig(state, serverId, { executable }),
            false,
            'setJavaExecutable'
          ),

        setJVMOptions: (serverId: string, options: string[]) =>
          set(
            (state) => createOrUpdateJavaConfig(state, serverId, { jvmOptions: options }),
            false,
            'setJVMOptions'
          ),

        // Acciones de control
        setDirty: (dirty: boolean) => set({ isDirty: dirty }, false, 'setDirty'),

        reset: () => set(initialConfigState, false, 'resetConfig')
      }),
      {
        name: 'config-storage',
        partialize: (state) => ({
          game: state.game,
          launcher: state.launcher,
          java: state.java
        })
      }
    ),
    {
      name: 'ConfigStore'
    }
  )
)
