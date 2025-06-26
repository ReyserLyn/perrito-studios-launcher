import { AppScreens } from './components/app-screens'
import { Toaster } from './components/ui/sonner'
import { UpdateNotification } from './components/updates/update-notification'
import { AppProvider } from './providers/app-provider'
import { TranslationProvider } from './providers/translation-provider'
import { SplashScreen } from './screens/splash-screen'
import { useNavigationStore } from './stores/use-navigation-store'

function App() {
  const { showSplash, hideSplash } = useNavigationStore()

  return (
    <TranslationProvider>
      <AppProvider>
        {showSplash && <SplashScreen onComplete={hideSplash} />}

        <AppScreens />
        <UpdateNotification />
        <Toaster richColors />
      </AppProvider>
    </TranslationProvider>
  )
}

export default App
