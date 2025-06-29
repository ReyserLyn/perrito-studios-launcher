import { useEffect, useState } from 'react'
import logoImage from '../assets/images/logos/Rec_Color_LBlanco.webp'
import { useImagePreloader } from '../hooks/use-image-preloader'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const { startPreloading } = useImagePreloader()

  useEffect(() => {
    startPreloading()
  }, [startPreloading])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onComplete, 750)
    }, duration)

    return () => clearTimeout(timer)
  }, [onComplete, duration])

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-750 ease-out ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center h-full w-full px-8">
        <div className="flex flex-col items-center space-y-8 max-w-4xl w-full">
          <div className="relative flex items-center justify-center">
            <img
              src={logoImage}
              alt="Perrito Studios Logo"
              className={`w-full max-w-[600px] h-auto object-contain transition-all duration-1000 ${
                logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => {
                console.error('[SplashScreen] Error cargando logo:', e)
                setLogoLoaded(true)
              }}
            />
          </div>

          <div className="text-center">
            <span className="text-[#9d9d9d] text-xl sm:text-2xl font-acherus tracking-wide">
              Powered by Perrito Studios
            </span>
          </div>

          <div className="w-64 sm:w-80 h-0.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-loading-bar opacity-70" />
          </div>
        </div>
      </div>
    </div>
  )
}
