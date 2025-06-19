import { useState } from 'react'
import { LanguageTest } from './components/LanguageTest'
import { SplashScreen } from './components/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div
        className={`transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}
      >
        <LanguageTest />
      </div>
    </div>
  )
}

export default App
