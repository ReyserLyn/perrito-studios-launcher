import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import logoImage from '../assets/images/logos/Rec_Color_LBlanco.webp'
import { useAddMojangAccount, useAddMicrosoftAccount } from '../hooks/useAuth'

interface LoginProps {
  onLoginSuccess: () => void
  hasAvailableAccounts?: boolean
  onShowAccountsAvailable?: () => void
}

type LoginMode = 'selection' | 'mojang' | 'microsoft-loading'

export function Login({
  onLoginSuccess,
  hasAvailableAccounts,
  onShowAccountsAvailable
}: LoginProps) {
  const [mode, setMode] = useState<LoginMode>('selection')
  const [username, setUsername] = useState('')

  // Mutations
  const addMojangAccount = useAddMojangAccount()
  const addMicrosoftAccount = useAddMicrosoftAccount()

  // Handle Microsoft Auth
  useEffect(() => {
    if (mode !== 'microsoft-loading') {
      return
    }

    const handleMicrosoftLogin = (type: string, data: any) => {
      if (type === 'MSFT_AUTH_REPLY_SUCCESS') {
        // data contiene el código de Microsoft
        addMicrosoftAccount.mutate(data.code, {
          onSuccess: () => {
            onLoginSuccess()
          },
          onError: (error) => {
            console.error('[Login] Error adding Microsoft account:', error)
            // No mostrar toast aquí porque el hook ya lo maneja
            setMode('selection')
          }
        })
      } else if (type === 'MSFT_AUTH_REPLY_ERROR') {
        console.error('[Login] Microsoft auth error:', data)
        toast.error(`Error de autenticación: ${data.error || 'Error desconocido'}`)
        setMode('selection')
      } else if (type === 'close') {
        setMode('selection')
      }
    }

    // Set up listener
    window.api.microsoftAuth.onLoginReply(handleMicrosoftLogin)

    // Open Microsoft login
    window.api.microsoftAuth.openLogin(true, true)

    // Cleanup function
    return () => {
      window.api.microsoftAuth.removeLoginListener()
    }
  }, [mode, addMicrosoftAccount, onLoginSuccess])

  const handleMojangLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Por favor ingresa un nombre de usuario')
      return
    }

    addMojangAccount.mutate(username.trim(), {
      onSuccess: () => {
        console.log('[Login] Mojang login successful')
        setUsername('')
        onLoginSuccess()
      },
      onError: (error) => {
        console.error('[Login] Mojang login error:', error)
      }
    })
  }

  const handleMicrosoftLogin = () => {
    console.log('[Login] Starting Microsoft login flow')
    setMode('microsoft-loading')
  }

  const handleBackToSelection = () => {
    setMode('selection')
    setUsername('')
  }

  if (mode === 'microsoft-loading') {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-center">
          <img
            src={logoImage}
            alt="Perrito Studios Logo"
            className="w-64 h-auto object-contain mx-auto mb-8 opacity-90"
          />
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-white text-lg font-acherus">
              Iniciando sesión con Microsoft...
            </span>
          </div>
          <p className="text-gray-400 mt-3 text-sm">
            Se abrirá una ventana para iniciar sesión. Una vez que completes el proceso, esta
            ventana se cerrará automáticamente.
          </p>
        </div>
      </div>
    )
  }

  if (mode === 'mojang') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex">
        {/* Logo Section - 50% */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <div className="text-center">
            <img
              src={logoImage}
              alt="Perrito Studios Logo"
              className="w-80 h-auto object-contain mx-auto opacity-90"
            />
          </div>
        </div>

        {/* Form Section - 50% */}
        <div className="flex-1 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-8 bg-gray-900/80 border-gray-700">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-2xl font-acherus text-white">
                Perrito Launcher Login
              </CardTitle>
              <p className="text-gray-400 text-sm">Ingresa tu nombre de usuario offline</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleMojangLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-300">
                    Nombre de Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu username"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    disabled={addMojangAccount.isPending}
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToSelection}
                    className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                    disabled={addMojangAccount.isPending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={addMojangAccount.isPending}
                  >
                    {addMojangAccount.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Selection mode
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
            onClick={handleMicrosoftLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
            size="lg"
          >
            Iniciar Sesión con Microsoft
          </Button>

          <Button
            onClick={() => setMode('mojang')}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-6 text-lg font-medium"
            size="lg"
          >
            Modo Offline (Mojang)
          </Button>

          {/* Botón para mostrar cuentas disponibles si las hay */}
          {hasAvailableAccounts && onShowAccountsAvailable && (
            <Button
              onClick={onShowAccountsAvailable}
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
