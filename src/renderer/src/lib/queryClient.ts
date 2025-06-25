import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutos de cache por defecto
      staleTime: 5 * 60 * 1000,
      // 10 minutos antes de limpiar cache inactivo
      gcTime: 10 * 60 * 1000,
      // Retry 3 veces en caso de error
      retry: 3,
      // No refetch automático al focus
      refetchOnWindowFocus: false,
      // Refetch al reconectar
      refetchOnReconnect: true
    },
    mutations: {
      // Retry 1 vez las mutaciones
      retry: 1
    }
  }
})

// Query keys para mantener consistencia
export const queryKeys = {
  // Auth
  auth: {
    status: ['auth', 'status'] as const,
    accounts: ['auth', 'accounts'] as const,
    selectedAccount: ['auth', 'selected'] as const
  },

  // Distribution
  distribution: {
    all: ['distribution'] as const,
    list: () => [...queryKeys.distribution.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.distribution.all, 'detail', id] as const,
    mainServer: () => [...queryKeys.distribution.all, 'main'] as const
  },

  // Config
  config: {
    all: ['config'] as const,
    game: () => [...queryKeys.config.all, 'game'] as const,
    java: (serverId: string) => [...queryKeys.config.all, 'java', serverId] as const,
    directories: () => [...queryKeys.config.all, 'directories'] as const
  },

  // Mods
  mods: {
    all: ['mods'] as const,
    list: (modsDir: string, version: string) =>
      [...queryKeys.mods.all, 'list', modsDir, version] as const,
    stats: (modsDir: string, version: string) =>
      [...queryKeys.mods.all, 'stats', modsDir, version] as const,
    serverMods: (serverId: string) => [...queryKeys.mods.all, 'server', serverId] as const,
    dropinList: (serverId: string) => [...queryKeys.mods.all, 'dropin', serverId] as const
  },

  // Shaderpacks
  shaderpacks: {
    all: ['shaderpacks'] as const,
    list: (instanceDir: string) => [...queryKeys.shaderpacks.all, 'list', instanceDir] as const,
    enabled: (instanceDir: string) =>
      [...queryKeys.shaderpacks.all, 'enabled', instanceDir] as const
  },

  // Process
  process: {
    status: ['process', 'status'] as const
  }
} as const
