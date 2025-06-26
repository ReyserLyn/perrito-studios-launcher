import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  prerelease: boolean
  html_url: string
}

interface ReleaseInfo {
  hasReleases: boolean
  currentRelease?: GitHubRelease
  releases: GitHubRelease[]
  loading: boolean
  error?: string
}

const fetchGitHubReleases = async (): Promise<GitHubRelease[]> => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/ReyserLyn/perrito-studios-launcher/releases',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'perrito-studios-launcher'
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.warn('GitHub API returned non-array data:', data)
      return []
    }

    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Network error fetching releases, treating as no releases:', error.message)
      return []
    }
    throw error
  }
}

export const useGitHubReleases = (currentVersion: string): ReleaseInfo => {
  const {
    data: releases = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['github-releases'],
    queryFn: fetchGitHubReleases,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: (failureCount, error) => {
      if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: 2000,
    refetchOnWindowFocus: false,
    refetchInterval: false
  })

  return useMemo((): ReleaseInfo => {
    const hasReleases = releases.length > 0

    const currentRelease = releases.find(
      (release) => release.tag_name === `v${currentVersion}` || release.tag_name === currentVersion
    )

    return {
      hasReleases,
      currentRelease,
      releases,
      loading: isLoading,
      error: error && !error.message?.includes('fetch') ? error.message : undefined
    }
  }, [releases, currentVersion, isLoading, error])
}
