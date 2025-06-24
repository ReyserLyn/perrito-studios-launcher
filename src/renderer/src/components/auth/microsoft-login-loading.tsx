import { Loader2 } from 'lucide-react'
import logoImage from '../../assets/images/logos/Rec_Color_LBlanco.webp'

interface MicrosoftLoginLoadingProps {
  title?: string
  description?: string
  className?: string
}

export function MicrosoftLoginLoading({
  title = 'Iniciando sesión con Microsoft...',
  description = 'Se abrirá una ventana para iniciar sesión. Una vez que completes el proceso, esta ventana se cerrará automáticamente.',
  className = ''
}: MicrosoftLoginLoadingProps) {
  return (
    <div className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <img
          src={logoImage}
          alt="Perrito Studios Logo"
          className="w-64 h-auto object-contain mx-auto mb-8 opacity-90"
        />
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-white text-lg font-acherus">{title}</span>
        </div>
        <p className="text-gray-400 mt-3 text-sm">{description}</p>
      </div>
    </div>
  )
}
