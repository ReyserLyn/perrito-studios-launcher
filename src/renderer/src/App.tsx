import { useEffect } from 'react'
import { Toaster } from './components/ui/sonner'
import { AppProvider } from './providers/AppProvider'
import { AppScreens } from './components/AppScreens'
import { SplashScreen } from './screens/SplashScreen'
import { useAppNavigation } from './hooks/useAppNavigation'

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
