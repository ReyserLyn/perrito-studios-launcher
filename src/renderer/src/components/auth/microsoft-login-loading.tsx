import { useTranslation } from '@/hooks'
import { Loader2 } from 'lucide-react'
import logoImage from '../../assets/images/logos/Rec_Color_LBlanco.webp'

interface MicrosoftLoginLoadingProps {
  title?: string
  description?: string
  className?: string
}

export function MicrosoftLoginLoading({
  title,
  description,
  className = ''
}: MicrosoftLoginLoadingProps) {
  const { t } = useTranslation()

  const finalTitle = title || t('auth.microsoft.title')
  const finalDescription = description || t('auth.microsoft.subtitle')

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
          <span className="text-white text-lg font-acherus">{finalTitle}</span>
        </div>
        <p className="text-gray-400 mt-3 text-sm">{finalDescription}</p>
      </div>
    </div>
  )
}
