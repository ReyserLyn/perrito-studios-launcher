import { useEffect, useState } from 'react'

interface SystemMemoryInfo {
  total: number
  free: number
}

export function useSystemMemory() {
  const [memoryInfo, setMemoryInfo] = useState<SystemMemoryInfo>({ total: 0, free: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getMemoryInfo = async () => {
      try {
        setIsLoading(true)
        const [maxRAM, currentMemory] = await Promise.all([
          window.api.config.getAbsoluteMaxRAM(),
          window.api.system.getSystemMemory()
        ])

        if (maxRAM.success) {
          setMemoryInfo({
            total: maxRAM.maxRAM,
            free: currentMemory.free
          })
        } else {
          console.error('[useSystemMemory] Error obteniendo RAM máxima:', maxRAM.error)
        }
      } catch (error) {
        console.error('[useSystemMemory] Error obteniendo información de memoria:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getMemoryInfo()
  }, [])

  return {
    memoryInfo,
    isLoading
  }
}
