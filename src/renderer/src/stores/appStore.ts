import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { AppState } from '../types'

const initialState = {
  auth: {
    user: null,
    isAuthenticated: false,
    accounts: []
  },
  config: {
    gameWidth: 1280,
    gameHeight: 720,
    fullscreen: false,
    autoConnect: true,
    launchDetached: true,
    allowPrerelease: false,
    syncLanguage: true,
    selectedServer: null,
    language: 'es'
  },
  ui: {
    isLoading: false,
    currentPage: 'home',
    sidebarCollapsed: false,
    notifications: []
  },
  game: {
    isGameRunning: false,
    processId: null,
    lastLaunchTime: null
  }
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Auth actions
        setUser: (user) =>
          set(
            (state) => ({
              auth: { ...state.auth, user, isAuthenticated: !!user }
            }),
            false,
            'setUser'
          ),

        setAuthenticated: (authenticated) =>
          set(
            (state) => ({
              auth: { ...state.auth, isAuthenticated: authenticated }
            }),
            false,
            'setAuthenticated'
          ),

        setAccounts: (accounts) =>
          set(
            (state) => ({
              auth: { ...state.auth, accounts }
            }),
            false,
            'setAccounts'
          ),

        // Config actions
        updateConfig: (configUpdate) =>
          set(
            (state) => ({
              config: { ...state.config, ...configUpdate }
            }),
            false,
            'updateConfig'
          ),

        // UI actions
        setLoading: (loading) =>
          set(
            (state) => ({
              ui: { ...state.ui, isLoading: loading }
            }),
            false,
            'setLoading'
          ),

        setCurrentPage: (page) =>
          set(
            (state) => ({
              ui: { ...state.ui, currentPage: page }
            }),
            false,
            'setCurrentPage'
          ),

        setSidebarCollapsed: (collapsed) =>
          set(
            (state) => ({
              ui: { ...state.ui, sidebarCollapsed: collapsed }
            }),
            false,
            'setSidebarCollapsed'
          ),

        addNotification: (notification) =>
          set(
            (state) => ({
              ui: {
                ...state.ui,
                notifications: [
                  ...state.ui.notifications,
                  {
                    ...notification,
                    id: Date.now().toString(),
                    timestamp: Date.now()
                  }
                ]
              }
            }),
            false,
            'addNotification'
          ),

        removeNotification: (id) =>
          set(
            (state) => ({
              ui: {
                ...state.ui,
                notifications: state.ui.notifications.filter((n) => n.id !== id)
              }
            }),
            false,
            'removeNotification'
          ),

        // Game actions
        setGameRunning: (running, processId = null) =>
          set(
            (state) => ({
              game: {
                ...state.game,
                isGameRunning: running,
                processId,
                lastLaunchTime: running ? Date.now() : state.game.lastLaunchTime
              }
            }),
            false,
            'setGameRunning'
          ),

        // Reset
        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'perrito-launcher-store',
        partialize: (state) => ({
          config: state.config,
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            currentPage: state.ui.currentPage
          }
        })
      }
    ),
    {
      name: 'PerritoLauncherStore'
    }
  )
)

// Selectores útiles
export const useAuth = () => useAppStore((state) => state.auth)
export const useConfig = () => useAppStore((state) => state.config)
export const useUI = () => useAppStore((state) => state.ui)
export const useGame = () => useAppStore((state) => state.game)
export const useIsLoading = () => useAppStore((state) => state.ui.isLoading)
export const useNotifications = () => useAppStore((state) => state.ui.notifications)
