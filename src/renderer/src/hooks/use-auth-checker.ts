import { useNavigationStore } from '@/stores/use-navigation-store'
import { AppScreen } from '@/types/navigation'
import { useEffect } from 'react'
import { useAuthStatus } from './useAuth'

export const useAuthChecker = () => {
  const auth = useAuthStatus()
  const { goTo } = useNavigationStore()

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

  return auth
}
