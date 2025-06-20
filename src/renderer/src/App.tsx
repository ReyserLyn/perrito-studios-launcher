import { useState } from 'react'
import fondo from './assets/images/fondos/noche-steve-dog.webp'
import { Toaster } from './components/ui/sonner'
import { AppProvider } from './providers/AppProvider'
import { Home } from './screens/home'
import { Sidebar } from './screens/sidebar'
import { SplashScreen } from './screens/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <AppProvider>
      <div className="min-h-screen">
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

        <div
          className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}
        >
          <img
            src={fondo}
            alt="Fondo de la aplicación"
            className="w-full h-full object-cover absolute top-0 left-0 -z-10"
          />

          {/* Layout con Sidebar */}
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Home />
            </main>
          </div>
        </div>
      </div>
      <Toaster />
    </AppProvider>
  )
}

export default App
