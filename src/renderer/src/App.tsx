import { AppScreens } from './components/app-screens'
import { Toaster } from './components/ui/sonner'
import { UpdateNotification } from './components/update-notification'
import { AppProvider } from './providers/app-provider'
import { SplashScreen } from './screens/splash-screen'
import { useNavigationStore } from './stores/use-navigation-store'

function App() {
  const { showSplash, hideSplash } = useNavigationStore()

  return (
    <AppProvider>
      {showSplash && <SplashScreen onComplete={hideSplash} />}

      <AppScreens />
      <UpdateNotification />
      <Toaster richColors />
    </AppProvider>
  )
}

export default App
