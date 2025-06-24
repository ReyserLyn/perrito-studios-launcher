import { useEffect } from 'react'
import { AppScreens } from './components/app-screens'
import { Toaster } from './components/ui/sonner'
import { useAppNavigation } from './hooks/useAppNavigation'
import { AppProvider } from './providers/AppProvider'
import { SplashScreen } from './screens/splash-screen'

function AppContent() {
  const navigation = useAppNavigation()
  const { checkAuthenticationState, currentScreen, authStatus, showSplash } = navigation

  useEffect(() => {
    checkAuthenticationState()
  }, [authStatus.hasAccounts, authStatus.hasSelectedAccount, checkAuthenticationState])

  return (
    <div className="min-h-screen">
      {/* Contenido principal */}
      <AppScreens
        currentScreen={currentScreen}
        authStatus={authStatus}
        onLoginSuccess={navigation.handleLoginSuccess}
        onAccountSelected={navigation.handleAccountSelected}
        onAddNewAccount={navigation.handleAddNewAccount}
        onShowAccountsAvailable={navigation.handleShowAccountsAvailable}
      />

      {/* Splash overlay */}
      {showSplash && <SplashScreen onComplete={navigation.handleSplashComplete} />}
    </div>
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
