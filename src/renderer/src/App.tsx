import { useEffect } from 'react'
import { Toaster } from './components/ui/sonner'
import { AppProvider } from './providers/AppProvider'
import { AppLayout } from './components/AppLayout'
import { AppScreens } from './components/AppScreens'
import { useAppNavigation, AppScreen } from './hooks/useAppNavigation'

function AppContent() {
  const navigation = useAppNavigation()
  const { checkAuthenticationState, currentScreen, authStatus } = navigation

  useEffect(() => {
    if (currentScreen !== AppScreen.Splash) {
      checkAuthenticationState()
    }
  }, [
    authStatus.hasAccounts,
    authStatus.hasSelectedAccount,
    currentScreen,
    checkAuthenticationState
  ])

  return (
    <AppLayout>
      <AppScreens
        currentScreen={navigation.currentScreen}
        authStatus={navigation.authStatus}
        onSplashComplete={navigation.handleSplashComplete}
        onLoginSuccess={navigation.handleLoginSuccess}
        onAccountSelected={navigation.handleAccountSelected}
        onAddNewAccount={navigation.handleAddNewAccount}
        onShowAccountsAvailable={navigation.handleShowAccountsAvailable}
      />
    </AppLayout>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster richColors />
    </AppProvider>
  )
}

export default App
