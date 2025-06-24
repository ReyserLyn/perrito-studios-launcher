import { LoginSelection, MicrosoftLoginLoading, MojangLoginForm } from '@/components/auth'
import { useAddMicrosoftAccount } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type LoginMode = 'selection' | 'mojang' | 'microsoft-loading'

export function Login() {
  const [mode, setMode] = useState<LoginMode>('selection')

  // Mutations
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
          onError: (error) => {
            console.error('[Login] Error adding Microsoft account:', error)
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

    window.api.microsoftAuth.onLoginReply(handleMicrosoftLogin)

    window.api.microsoftAuth.openLogin(true, true)

    return () => {
      window.api.microsoftAuth.removeLoginListener()
    }
  }, [mode, addMicrosoftAccount])

  const handleMicrosoftLogin = () => {
    console.log('[Login] Starting Microsoft login flow')
    setMode('microsoft-loading')
  }

  const handleBackToSelection = () => {
    setMode('selection')
  }

  if (mode === 'microsoft-loading') {
    return <MicrosoftLoginLoading />
  }

  if (mode === 'mojang') {
    return <MojangLoginForm onBack={handleBackToSelection} />
  }

  // Selection mode
  return (
    <LoginSelection
      onMicrosoftLogin={handleMicrosoftLogin}
      onMojangLogin={() => setMode('mojang')}
    />
  )
}
