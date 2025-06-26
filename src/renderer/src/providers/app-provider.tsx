import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PropsWithChildren } from 'react'
import { useAuthSync } from '../hooks'
import { queryClient } from '../lib/queryClient'

interface AppProviderProps extends PropsWithChildren {
  // Props adicionales si se necesitan
}

function AppInitializer({ children }: PropsWithChildren) {
  useAuthSync()

  return <>{children}</>
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>{children}</AppInitializer>

      {/* Solo mostrar devtools en desarrollo */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
