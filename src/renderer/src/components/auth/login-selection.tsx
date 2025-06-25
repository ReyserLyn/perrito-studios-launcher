import { Button } from '@/components/ui/button'
import { useAuthData } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { AppScreen } from '@/types/navigation'
import logoImage from '../../assets/images/logos/Rec_Color_LBlanco.webp'

interface LoginSelectionProps {
  onMicrosoftLogin: () => void
  onMojangLogin: () => void
}

export function LoginSelection({ onMicrosoftLogin, onMojangLogin }: LoginSelectionProps) {
  const { goTo } = useNavigationStore()
  const { hasAccounts } = useAuthData()

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center max-w-md w-full mx-8">
        <img
          src={logoImage}
          alt="Perrito Studios Logo"
          className="w-80 h-auto object-contain mx-auto mb-12 opacity-90"
        />

        <h1 className="text-3xl font-acherus text-white mb-3">Bienvenido a Perrito Launcher</h1>
        <p className="text-gray-400 mb-8 text-lg">
          Para continuar, debes iniciar sesión con una cuenta
        </p>

        <div className="space-y-4">
          <Button
            onClick={onMicrosoftLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
            size="lg"
          >
            Iniciar Sesión con Microsoft
          </Button>

          <Button
            onClick={onMojangLogin}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-6 text-lg font-medium"
            size="lg"
          >
            Modo Offline (Mojang)
          </Button>

          {hasAccounts && (
            <Button
              onClick={() => goTo(AppScreen.AccountsAvailable)}
              variant="outline"
              className="w-full border-blue-600 text-blue-300 hover:bg-blue-900/20 py-6 text-lg font-medium"
              size="lg"
            >
              Ver Cuentas Disponibles
            </Button>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-8">
          Es obligatorio tener una cuenta para usar el launcher
        </p>
      </div>
    </div>
  )
}
