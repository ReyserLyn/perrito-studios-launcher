import { useState, useCallback } from 'react'
import { useAuthStatus } from './useAuth'

export enum AppScreen {
  Splash = 'splash',
  Login = 'login',
  AccountsAvailable = 'accounts-available',
  Home = 'home'
}

export const useAppNavigation = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Splash)
  const authStatus = useAuthStatus()

  const navigateToScreen = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen)
  }, [])

  const checkAuthenticationState = useCallback(() => {
    if (!authStatus.isLoading) {
      if (!authStatus.hasAccounts) {
        // No hay cuentas - mostrar login
        navigateToScreen(AppScreen.Login)
      } else if (!authStatus.hasSelectedAccount) {
        // Hay cuentas pero ninguna seleccionada - mostrar selector de cuentas
        navigateToScreen(AppScreen.AccountsAvailable)
      } else {
        // Usuario autenticado - mostrar home
        navigateToScreen(AppScreen.Home)
      }
    }
  }, [
    authStatus.hasAccounts,
    authStatus.hasSelectedAccount,
    authStatus.isLoading,
    navigateToScreen
  ])

  const handleSplashComplete = useCallback(() => {
    checkAuthenticationState()
  }, [checkAuthenticationState])

  const handleLoginSuccess = useCallback(() => {
    authStatus.refetchAccounts()
    authStatus.refetchSelectedAccount()
  }, [authStatus])

  const handleAccountSelected = useCallback(() => {
    authStatus.refetchAll()
  }, [authStatus])

  const handleAddNewAccount = useCallback(() => {
    navigateToScreen(AppScreen.Login)
  }, [navigateToScreen])

  const handleShowAccountsAvailable = useCallback(() => {
    navigateToScreen(AppScreen.AccountsAvailable)
  }, [navigateToScreen])

  return {
    // Estado actual
    currentScreen,
    authStatus,

    // Funciones de navegación
    checkAuthenticationState,
    handleSplashComplete,
    handleLoginSuccess,
    handleAccountSelected,
    handleAddNewAccount,
    handleShowAccountsAvailable,

    // Función manual de navegación
    navigateToScreen
  }
}
