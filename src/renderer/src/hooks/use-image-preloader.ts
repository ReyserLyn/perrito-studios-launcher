import { AuthAccount } from '@/types'
import { HeliosServer } from 'perrito-core/common'

export const useImagePreloader = () => {
  const preloadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // Importante para URLs externas
      img.onload = () => {
        resolve(src)
      }
      img.onerror = () => {
        reject(src)
      }
      img.src = src
    })
  }

  const preloadImages = async (imageUrls: string[]) => {
    const promises = imageUrls.map(async (url) => {
      try {
        await preloadImage(url)
        return url
      } catch {
        console.warn(`[useImagePreloader] Failed to preload image: ${url}`)
        return null
      }
    })

    await Promise.allSettled(promises)
  }

  // Lista de imágenes a precargar
  const getImagesToPreload = async (): Promise<string[]> => {
    // Obtener imágenes de servidores (íconos)
    let serverImages: string[] = []
    try {
      const result = await window.api.distribution.getDistribution()
      if (result.success && result.distribution) {
        const servers = Object.values(result.distribution.servers || {})
        serverImages = servers.map((server: HeliosServer) => server.rawServer.icon).filter(Boolean)
      }
    } catch (error) {
      console.warn('[useImagePreloader] No se pudieron obtener imágenes de servidores:', error)
    }

    // Obtener avatares de Minecraft de las cuentas
    let avatarImages: string[] = []
    try {
      const accountsResult = await window.api.auth.getAllAccounts()
      if (accountsResult.success && accountsResult.accounts) {
        const accounts = Object.values(accountsResult.accounts)
        avatarImages = accounts
          .map((account: AuthAccount) => {
            const identifier = account.uuid || account.username
            return `https://api.mineatar.io/face/${identifier}?scale=16&overlay=true`
          })
          .filter(Boolean)
      }
    } catch (error) {
      console.warn('[useImagePreloader] No se pudieron obtener avatares de cuentas:', error)
    }

    return [...serverImages, ...avatarImages]
  }

  const startPreloading = async () => {
    const imagesToPreload = await getImagesToPreload()
    await preloadImages(imagesToPreload)
  }

  return {
    startPreloading
  }
}
