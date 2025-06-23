import { Login } from '../screens/Login'
import { AccountsAvailable } from '../screens/AccountsAvailable'
import { Home } from '../screens/home'
import { Sidebar } from '../screens/sidebar'
import { AppScreen } from '../hooks/useAppNavigation'

interface AppScreensProps {
  currentScreen: AppScreen | null
  authStatus: {
    isLoading: boolean | undefined
    hasAccounts: boolean | undefined
    accountsList: any[]
  }
  onLoginSuccess: () => void
  onAccountSelected: () => void
  onAddNewAccount: () => void
  onShowAccountsAvailable: () => void
}

export function AppScreens({
  currentScreen,
  authStatus,
  onLoginSuccess,
  onAccountSelected,
  onAddNewAccount,
  onShowAccountsAvailable
}: AppScreensProps) {
  if (authStatus.isLoading || !currentScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl font-acherus">Cargando...</div>
      </div>
    )
  }

  // Pantalla de cuentas disponibles
  if (currentScreen === AppScreen.AccountsAvailable && authStatus.accountsList.length > 0) {
    return (
      <AccountsAvailable
        accounts={authStatus.accountsList}
        onAccountSelected={onAccountSelected}
        onAddNewAccount={onAddNewAccount}
      />
    )
  }

  // Pantalla de login
  if (currentScreen === AppScreen.Login) {
    return (
      <Login
        onLoginSuccess={onLoginSuccess}
        hasAvailableAccounts={authStatus.hasAccounts}
        onShowAccountsAvailable={onShowAccountsAvailable}
      />
    )
  }

  // Pantalla Home
  if (currentScreen === AppScreen.Home) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Home />
        </main>
      </div>
    )
  }

  // Fallback
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-white text-xl font-acherus">Error: Pantalla desconocida</div>
    </div>
  )
}
