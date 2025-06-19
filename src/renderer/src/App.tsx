import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 font-sans">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img alt="logo" className="w-24 h-24 mx-auto mb-4" src={electronLogo} />
          <h1 className="text-4xl font-bold text-white mb-2">Perrito Studios Launcher</h1>
          <p className="text-slate-300">
            Construido con Electron, React, TypeScript, Tailwind CSS 4 y shadcn/ui
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🚀 Características</CardTitle>
              <CardDescription>Tecnologías modernas integradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-sm">Electron para aplicaciones de escritorio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                <span className="text-sm">React 19 con TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-sm">Tailwind CSS 4 (Next)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm">shadcn/ui Components</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Rápida</CardTitle>
              <CardDescription>Personaliza tu launcher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="launcher-name">Nombre del Launcher</Label>
                <Input
                  id="launcher-name"
                  placeholder="Mi Launcher Personalizado"
                  defaultValue="Perrito Studios Launcher"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={ipcHandle} variant="default" className="flex-1">
                  Enviar IPC
                </Button>
                <Button variant="outline" className="flex-1">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="secondary" asChild>
            <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
              📚 Documentación
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="https://ui.shadcn.com/" target="_blank" rel="noreferrer">
              🎨 shadcn/ui
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer">
              🎯 Tailwind CSS
            </a>
          </Button>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Presiona F12 para abrir DevTools</p>
          <div className="inline-flex items-center gap-4 text-xs text-slate-500">
            <span>Electron v{window.electron.process.versions.electron}</span>
            <span>•</span>
            <span>Chromium v{window.electron.process.versions.chrome}</span>
            <span>•</span>
            <span>Node v{window.electron.process.versions.node}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
