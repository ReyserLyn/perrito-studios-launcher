export interface AuthAccount {
  type?: 'mojang' | 'microsoft'
  accessToken: string
  username: string
  uuid: string
  displayName: string
  expiresAt?: Date
  microsoft?: {
    access_token: string
    refresh_token: string
    expires_at: Date
  }
}

// Types
export interface AuthState {
  user: AuthAccount | null
  isAuthenticated: boolean
  accounts: AuthAccount[]
}

export interface ConfigState {
  gameWidth: number
  gameHeight: number
  fullscreen: boolean
  autoConnect: boolean
  launchDetached: boolean
  allowPrerelease: boolean
  syncLanguage: boolean
  selectedServer: string | null
  language: string
}

export interface UIState {
  isLoading: boolean
  currentPage: string
  currentScreen: string | null
  configTab: string
  sidebarCollapsed: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
}

export interface GameState {
  isGameRunning: boolean
  processId: number | null
  lastLaunchTime: number | null
}

export interface AppState {
  // State
  auth: AuthState
  config: ConfigState
  ui: UIState
  game: GameState

  // Actions
  setUser: (user: AuthAccount | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setAccounts: (accounts: AuthAccount[]) => void
  updateConfig: (config: Partial<ConfigState>) => void
  setLoading: (loading: boolean) => void
  setCurrentPage: (page: string) => void
  setCurrentScreen: (screen: string | null) => void
  navigateToConfig: (tab?: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  setGameRunning: (running: boolean, processId?: number | null) => void
  reset: () => void
}
