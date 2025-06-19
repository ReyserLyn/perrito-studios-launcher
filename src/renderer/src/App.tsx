import { useState } from 'react'
import { LanguageTest } from './components/LanguageTest'
import { SplashScreen } from './components/SplashScreen'
import { AuthExample } from './components/examples/AuthExample'
import { AppProvider } from './providers/AppProvider'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

        <div
          className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Sistema de Idiomas</h2>
                <LanguageTest />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Sistema de Autenticación</h2>
                <AuthExample />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  )
}

export default App
