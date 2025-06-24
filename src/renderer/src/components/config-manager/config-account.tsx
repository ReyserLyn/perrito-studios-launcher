import { AccountsList } from '@/components/accounts'
import { Button } from '@/components/ui/button'
import { useAddMicrosoftAccount, useAuthStatus } from '@/hooks'
import { Cross, Square, SquareUser, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { MicrosoftLoginLoading, MojangLoginForm } from '../auth'
import { ConfigTab, ConfigTabHeader } from './config-tab'

type ConfigView = 'main' | 'add-perrito-account' | 'microsoft-loading'

interface ConfigAccountProps {
  setActiveTab: (tab: string) => void
}

export function ConfigAccount({ setActiveTab }: ConfigAccountProps) {
  const { microsoftAccounts, mojangAccounts, isLoading } = useAuthStatus()
  const [currentView, setCurrentView] = useState<ConfigView>('main')
  const addMicrosoftAccount = useAddMicrosoftAccount()

  const handleAddPerritoAccount = () => {
    setCurrentView('add-perrito-account')
  }

  const handleAddMicrosoftAccount = () => {
    console.log('[ConfigManager] Starting Microsoft login flow')
    setCurrentView('microsoft-loading')
  }

  const handleAccountSuccess = () => {
    setCurrentView('main')
    setActiveTab('account')
  }

  const handleBackToConfig = () => {
    setCurrentView('main')
  }

  // Handle Microsoft Auth
  useEffect(() => {
    if (currentView !== 'microsoft-loading') {
      return
    }

    const handleMicrosoftLogin = (type: string, data: any) => {
      if (type === 'MSFT_AUTH_REPLY_SUCCESS') {
        // data contiene el código de Microsoft
        addMicrosoftAccount.mutate(data.code, {
          onError: (error) => {
            console.error('[ConfigManager] Error adding Microsoft account:', error)
            setCurrentView('main')
          },
          onSuccess: () => {
            setCurrentView('main')
          }
        })
      } else if (type === 'MSFT_AUTH_REPLY_ERROR') {
        console.error('[ConfigManager] Microsoft auth error:', data)
        toast.error(`Error de autenticación: ${data.error || 'Error desconocido'}`)
        setCurrentView('main')
      } else if (type === 'close') {
        setCurrentView('main')
      }
    }

    window.api.microsoftAuth.onLoginReply(handleMicrosoftLogin)
    window.api.microsoftAuth.openLogin(true, true)

    return () => {
      window.api.microsoftAuth.removeLoginListener()
    }
  }, [currentView, addMicrosoftAccount])

  if (currentView === 'add-perrito-account') {
    return (
      <MojangLoginForm
        onBack={handleBackToConfig}
        onSuccess={handleAccountSuccess}
        title="Agregar Cuenta Perrito Studios"
        description="Crea una nueva cuenta offline para Perrito Studios"
        placeholder="Nombre de usuario"
      />
    )
  }

  if (currentView === 'microsoft-loading') {
    return <MicrosoftLoginLoading />
  }

  return (
    <ConfigTab value="account">
      <div className="flex flex-col h-full w-full gap-4">
        <ConfigTabHeader
          title="Cuenta"
          description="Añada nuevas cuentas o administre las existente."
          Icon={User}
        />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Square size={15} />
              <p className=" font-semibold">Microsoft</p>
            </div>
            <Button variant="ghost" className="gap-2" onClick={handleAddMicrosoftAccount}>
              <Cross size={15} />
              <p>Añadir cuenta Microsft</p>
            </Button>
          </div>
          <AccountsList
            accounts={microsoftAccounts || []}
            isLoading={isLoading || false}
            className="space-y-2 pb-8"
            showManageButton={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SquareUser size={15} />
              <p className=" font-semibold">Perrito Studios</p>
            </div>
            <Button variant="ghost" className="gap-2" onClick={handleAddPerritoAccount}>
              <Cross size={15} />
              <p>Añadir cuenta Perrito Studios</p>
            </Button>
          </div>
          <AccountsList
            accounts={mojangAccounts || []}
            isLoading={isLoading || false}
            className="space-y-2 pb-8"
            showManageButton={false}
          />
        </div>
      </div>
    </ConfigTab>
  )
}
