import { AccountsList } from '@/components/accounts'
import { MicrosoftLoginLoading, OfflineLoginForm } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { useAddMicrosoftAccount, useAuthData, useTranslation } from '@/hooks'
import { Cross, Square, SquareUser, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ConfigTab, ConfigTabHeader } from './config-tab'

interface ConfigAccountProps {
  setActiveTab: (tab: string) => void
}

type ConfigView = 'main' | 'add-perrito-account' | 'microsoft-loading'

export function ConfigAccount({ setActiveTab }: ConfigAccountProps) {
  const { t } = useTranslation()

  const [currentView, setCurrentView] = useState<ConfigView>('main')

  const { isLoading, microsoftAccounts, mojangAccounts } = useAuthData()
  const addMicrosoftAccount = useAddMicrosoftAccount()

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
            console.error('[ConfigAccount] Error adding Microsoft account:', error)
            setCurrentView('main')
          },
          onSuccess: () => {
            setCurrentView('main')
          }
        })
      } else if (type === 'MSFT_AUTH_REPLY_ERROR') {
        console.error('[ConfigAccount] Microsoft auth error:', data)
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

  const handleAddPerritoAccount = () => {
    setCurrentView('add-perrito-account')
  }

  const handleAddMicrosoftAccount = () => {
    console.log('[ConfigAccount] Starting Microsoft login flow')
    setCurrentView('microsoft-loading')
  }

  const handleBackToConfig = () => {
    setCurrentView('main')
  }

  const handleAccountSuccess = () => {
    setCurrentView('main')
    setActiveTab('account')
  }

  if (currentView === 'add-perrito-account') {
    return (
      <OfflineLoginForm
        onBack={handleBackToConfig}
        onSuccess={handleAccountSuccess}
        title={t('auth.offline.add-account.title')}
        description={t('auth.offline.add-account.description')}
        placeholder={t('auth.offline.form.placeholder')}
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
          title={t('settings.account.title')}
          description={t('settings.account.description')}
          Icon={User}
        />

        {/* Cuentas Microsoft */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Square size={15} />
              <p className="font-semibold">Microsoft</p>
            </div>
            <Button variant="ghost" className="gap-2" onClick={handleAddMicrosoftAccount}>
              <Cross size={15} />
              <p>{t('settings.account.actions.add-microsoft')}</p>
            </Button>
          </div>

          <AccountsList
            accounts={microsoftAccounts || []}
            isLoading={isLoading || false}
            className="space-y-2 pb-8"
            showManageButton={false}
          />
        </div>

        {/* Cuentas Perrito Studios */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SquareUser size={15} />
              <p className="font-semibold">Perrito Studios</p>
            </div>
            <Button variant="ghost" className="gap-2" onClick={handleAddPerritoAccount}>
              <Cross size={15} />
              <p>{t('settings.account.actions.add-offline')}</p>
            </Button>
          </div>
          <AccountsList
            accounts={mojangAccounts || []}
            isLoading={isLoading || false}
            className="space-y-2"
            showManageButton={false}
          />
        </div>
      </div>
    </ConfigTab>
  )
}
