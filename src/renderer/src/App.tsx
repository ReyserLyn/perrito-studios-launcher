import { AppScreens } from './components/app-screens'
import { Toaster } from './components/ui/sonner'
import { AppProvider } from './providers/AppProvider'
import { SplashScreen } from './screens/splash-screen'
import { useNavigationStore } from './stores/use-navigation-store'

function App() {
  const { showSplash, hideSplash } = useNavigationStore()
  return (
    <AppProvider>
      {showSplash && <SplashScreen onComplete={hideSplash} />}

      <AppScreens />
      <Toaster richColors />
    </AppProvider>
  )
}

export default App
