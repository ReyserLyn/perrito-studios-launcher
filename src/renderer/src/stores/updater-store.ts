import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface UpdateInfo {
  version: string
  releaseNotes: string
  releaseName?: string
  releaseDate: string
  downloadURL?: string
  isUpdateReady?: boolean
  isDownloading?: boolean
  downloadProgress?: number
  severity?: 'major' | 'minor' | 'patch' | 'prerelease'
}

export interface UpdaterState {
  // Estado actual
  currentVersion: string
  isChecking: boolean
  isDownloading: boolean
  isUpdateAvailable: boolean
  isUpdateReady: boolean
  error?: string

  // Información de la actualización
  updateInfo?: UpdateInfo
  downloadProgress: number

  // Configuración
  allowPrerelease: boolean
  autoCheck: boolean

  // Acciones
  setCurrentVersion: (version: string) => void
  setChecking: (checking: boolean) => void
  setDownloading: (downloading: boolean) => void
  setUpdateAvailable: (available: boolean, info?: UpdateInfo) => void
  setUpdateReady: (ready: boolean) => void
  setError: (error?: string) => void
  setDownloadProgress: (progress: number) => void
  setAllowPrerelease: (allow: boolean) => void
  setAutoCheck: (auto: boolean) => void
  reset: () => void
}

const initialState = {
  currentVersion: '1.0.0',
  isChecking: false,
  isDownloading: false,
  isUpdateAvailable: false,
  isUpdateReady: false,
  error: undefined,
  updateInfo: undefined,
  downloadProgress: 0,
  allowPrerelease: false,
  autoCheck: true
}

export const useUpdaterStore = create<UpdaterState>()(
  devtools(
    (set) => ({
      ...initialState,

      setCurrentVersion: (version) => set({ currentVersion: version }, false, 'setCurrentVersion'),

      setChecking: (checking) =>
        set({ isChecking: checking, error: undefined }, false, 'setChecking'),

      setDownloading: (downloading) => set({ isDownloading: downloading }, false, 'setDownloading'),

      setUpdateAvailable: (available, info) =>
        set(
          {
            isUpdateAvailable: available,
            updateInfo: info,
            error: undefined
          },
          false,
          'setUpdateAvailable'
        ),

      setUpdateReady: (ready) => set({ isUpdateReady: ready }, false, 'setUpdateReady'),

      setError: (error) =>
        set(
          {
            error,
            isChecking: false,
            isDownloading: false
          },
          false,
          'setError'
        ),

      setDownloadProgress: (progress) =>
        set({ downloadProgress: progress }, false, 'setDownloadProgress'),

      setAllowPrerelease: (allow) => set({ allowPrerelease: allow }, false, 'setAllowPrerelease'),

      setAutoCheck: (auto) => set({ autoCheck: auto }, false, 'setAutoCheck'),

      reset: () => set(initialState, false, 'reset')
    }),
    {
      name: 'updater-store'
    }
  )
)
