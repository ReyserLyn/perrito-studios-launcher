import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useGitHubReleases } from './use-github-releases'

interface AppInfo {
  version: string
  isStable: boolean
}

interface AppActions {
  openDevTools: () => void
  openGithub: () => void
  openSupport: () => void
  openReleaseNotes: () => void
}

interface UseAppInfoReturn {
  appInfo: AppInfo
  isLoading: boolean
  error?: string
  releaseInfo: ReturnType<typeof useGitHubReleases>
  actions: AppActions
}

const fetchAppVersion = async (): Promise<string> => {
  const version = await window.api.system.getAppVersion?.()
  return version || '1.0.0'
}

export const useAppInfo = (): UseAppInfoReturn => {
  const {
    data: version = '1.0.0',
    isLoading,
    error
  } = useQuery({
    queryKey: ['app-version'],
    queryFn: fetchAppVersion,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 2,
    retryDelay: 1000
  })

  // Información derivada de la versión
  const appInfo = useMemo((): AppInfo => {
    const isStable = !/-(alpha|beta|rc|dev)/i.test(version)
    return {
      version,
      isStable
    }
  }, [version])

  const releaseInfo = useGitHubReleases(version)

  // Handlers memoizados
  const actions = useMemo(
    (): AppActions => ({
      openDevTools: () => {
        window.api.system.openDevTools?.()
      },

      openGithub: () => {
        window.api.system.openExternal?.('https://github.com/ReyserLyn/perrito-studios-launcher')
      },

      openSupport: () => {
        window.api.system.openExternal?.(
          'https://github.com/ReyserLyn/perrito-studios-launcher/issues'
        )
      },

      openReleaseNotes: () => {
        if (releaseInfo.currentRelease) {
          window.api.system.openExternal?.(releaseInfo.currentRelease.html_url)
        } else {
          window.api.system.openExternal?.(
            'https://github.com/ReyserLyn/perrito-studios-launcher/releases'
          )
        }
      }
    }),
    [releaseInfo.currentRelease]
  )

  return {
    appInfo,
    isLoading,
    error: error?.message,
    releaseInfo,
    actions
  }
}
