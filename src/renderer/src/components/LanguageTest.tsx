import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

export function LanguageTest() {
  const { t, plural, formatDate, formatNumber, currentLanguage, changeLanguage, isReady } =
    useTranslation()
  const [userName, setUserName] = useState('Usuario')
  const [gameCount, setGameCount] = useState(5)
  const [userCount, setUserCount] = useState(3)
  const [progressPercent, setProgressPercent] = useState(75)

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Cargando sistema de idiomas...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">{t('test.title')}</h1>
        <p className="text-slate-300 text-lg">{t('test.subtitle')}</p>

        {/* Language Selector */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => changeLanguage('es')}
            variant={currentLanguage === 'es' ? 'default' : 'outline'}
          >
            🇪🇸 Español
          </Button>
          <Button
            onClick={() => changeLanguage('en')}
            variant={currentLanguage === 'en' ? 'default' : 'outline'}
          >
            🇺🇸 English
          </Button>
        </div>

        <p className="text-sm text-slate-400">
          Idioma actual: <span className="font-mono text-blue-400">{currentLanguage}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uso Básico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📝 {t('test.sections.basic')}</CardTitle>
            <CardDescription>Traducciones simples sin variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">test.simple</p>
              <p className="p-2  rounded text-sm">{t('test.simple')}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">launcher.ready</p>
              <p className="p-2  rounded text-sm">{t('launcher.ready')}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">general.loading</p>
              <p className="p-2  rounded text-sm">{t('general.loading')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔀 {t('test.sections.variables')}
            </CardTitle>
            <CardDescription>Interpolación de variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario:</Label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">test.withVariable + name</p>
              <p className="p-2  rounded text-sm">{t('test.withVariable', { name: userName })}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">launcher.welcome + username</p>
              <p className="p-2  rounded text-sm">
                {t('launcher.welcome', { username: userName })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progreso (%):</Label>
              <Input
                id="progress"
                type="number"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                min="0"
                max="100"
              />
              <p className="text-xs text-slate-400 font-mono">test.progress + {progressPercent}%</p>
              <p className="p-2  rounded text-sm">
                {t('test.progress', { percent: progressPercent })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pluralización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔢 {t('test.sections.pluralization')}
            </CardTitle>
            <CardDescription>Pluralización automática según cantidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gamecount">Cantidad de juegos:</Label>
              <Input
                id="gamecount"
                type="number"
                value={gameCount}
                onChange={(e) => setGameCount(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">
                plural test.games count: {gameCount}
              </p>
              <p className="p-2  rounded text-sm">{plural('test.games', { count: gameCount })}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usercount">Usuarios conectados:</Label>
              <Input
                id="usercount"
                type="number"
                value={userCount}
                onChange={(e) => setUserCount(Number(e.target.value))}
                min="0"
                max="50"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">
                plural test.users count: {userCount}
              </p>
              <p className="p-2  rounded text-sm">{plural('test.users', { count: userCount })}</p>
            </div>

            {/* Ejemplo con 0 */}
            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-mono">plural test.games count: 0</p>
              <p className="p-2  rounded text-sm">{plural('test.games', { count: 0 })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Formateo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 {t('test.sections.formatting')}
            </CardTitle>
            <CardDescription>Formateo de fechas y números</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Fechas:</h4>
              <p className="text-xs text-slate-400 font-mono">formatDate - short</p>
              <p className="p-2  rounded text-sm">{formatDate(new Date(), 'short')}</p>
              <p className="text-xs text-slate-400 font-mono">formatDate - long</p>
              <p className="p-2  rounded text-sm">{formatDate(new Date(), 'long')}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Números:</h4>
              <p className="text-xs text-slate-400 font-mono">formatNumber 1234567</p>
              <p className="p-2  rounded text-sm">{formatNumber(1234567)}</p>
              <p className="text-xs text-slate-400 font-mono">formatNumber 3.14159</p>
              <p className="p-2  rounded text-sm">{formatNumber(3.14159)}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Combinado:</h4>
              <p className="text-xs text-slate-400 font-mono">test.lastSeen + date</p>
              <p className="p-2  rounded text-sm">
                {t('test.lastSeen', { date: formatDate(new Date(), 'long') })}
              </p>
              <p className="text-xs text-slate-400 font-mono">test.fileSize + size</p>
              <p className="p-2  rounded text-sm">
                {t('test.fileSize', { size: formatNumber(2048576) })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplos del launcher */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Ejemplos del Launcher</CardTitle>
          <CardDescription>Simulación de textos reales del launcher</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-300">Navegación:</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  {t('navigation.home')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('navigation.games')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('navigation.store')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('navigation.profile')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('navigation.settings')}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-300">Microsoft Auth:</h4>
              <div className="space-y-1 text-sm">
                <p>{t('microsoft.loginTitle')}</p>
                <p className="text-slate-400">{t('microsoft.connecting')}</p>
                <p className="text-green-400">{t('microsoft.success')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-300">Actualizaciones:</h4>
              <div className="space-y-1 text-sm">
                <p>{t('updater.checking')}</p>
                <p>{t('updater.available', { version: '2.1.0' })}</p>
                <p>{t('updater.progress', { percent: '65' })}</p>
                <div className="flex gap-2">
                  <Button size="sm">{t('updater.installNow')}</Button>
                  <Button variant="outline" size="sm">
                    {t('updater.installLater')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-300">Estadísticas:</h4>
              <div className="space-y-1 text-sm">
                <p>{t('launcher.totalGames', { count: gameCount })}</p>
                <p>{t('launcher.lastPlayed', { game: 'Minecraft' })}</p>
                <p>{t('launcher.playTime', { hours: formatNumber(127) })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del sistema */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Estado:</span>
              <p className="font-mono">{isReady ? '✅ Listo' : '⏳ Cargando'}</p>
            </div>
            <div>
              <span className="text-slate-400">Idioma:</span>
              <p className="font-mono">{currentLanguage}</p>
            </div>
            <div>
              <span className="text-slate-400">Hook:</span>
              <p className="font-mono">useTranslation</p>
            </div>
            <div>
              <span className="text-slate-400">IPC:</span>
              <p className="font-mono">✅ Conectado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
