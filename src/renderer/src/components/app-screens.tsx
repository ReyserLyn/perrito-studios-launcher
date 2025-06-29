import { useAuthData } from '@/hooks/auth/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { AccountsAvailable } from '@/screens/accounts-available'
import ConfigManager from '@/screens/config-manager'
import { Home } from '@/screens/home'
import { Login } from '@/screens/login'
import { Sidebar } from '@/screens/sidebar'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { AppScreen } from '@/types/navigation'
import { JSX, useEffect } from 'react'

export function AppScreens() {
  const { t } = useTranslation()

  const { screen, configTab, goTo } = useNavigationStore()
  const auth = useAuthData()
  // Lógica de navegación automática basada en estado de autenticación
  useEffect(() => {
    if (auth.isLoading) return

    if (!auth.hasAccounts) {
      goTo(AppScreen.Login)
    } else if (!auth.hasSelectedAccount) {
      goTo(AppScreen.AccountsAvailable)
    } else {
      goTo(AppScreen.Home)
    }
  }, [auth.hasAccounts, auth.hasSelectedAccount, auth.isLoading, goTo])

  if (auth.isLoading || !screen) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white text-xl font-acherus">{t('screens.status.loading')}</div>
      </div>
    )
  }

  const screens: Record<AppScreen, JSX.Element> = {
    [AppScreen.Login]: <Login />,
    [AppScreen.AccountsAvailable]: <AccountsAvailable />,
    [AppScreen.Home]: (
      <div className="flex h-full">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <Home />
        </main>
      </div>
    ),
    [AppScreen.ConfigManager]: <ConfigManager tab={configTab} />
  }

  const screenComponent = screens[screen]

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {screenComponent ?? (
        <div className="text-white text-xl font-acherus">{t('screens.status.error')}</div>
      )}
    </div>
  )
}
