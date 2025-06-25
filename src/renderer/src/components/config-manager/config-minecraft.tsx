import { useGameActions, useGameConfig } from '@/hooks'
import { Gamepad, Wifi } from 'lucide-react'
import { useCallback } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export function ConfigMinecraft() {
  const gameConfig = useGameConfig()

  const {
    setGameWidth,
    setGameHeight,
    setFullscreen,
    setAutoConnect,
    setLaunchDetached,
    setSyncLanguage
  } = useGameActions()

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value)
      if (!isNaN(value) && value > 0) {
        setGameWidth(value)
      }
    },
    [setGameWidth]
  )

  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value)
      if (!isNaN(value) && value > 0) {
        setGameHeight(value)
      }
    },
    [setGameHeight]
  )

  return (
    <ConfigTab value="minecraft">
      <div className="flex flex-col h-full w-full gap-4">
        <ConfigTabHeader
          title="Minecraft"
          description="Configura las opciones de lanzamiento de Minecraft"
          Icon={Gamepad}
        />

        {/* Resolución del juego */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Gamepad size={15} />
            <Label className="font-semibold">Resolución del Juego</Label>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="width" className="text-sm text-muted-foreground">
                Ancho
              </Label>
              <Input
                id="width"
                type="number"
                placeholder="1920"
                value={gameConfig.resWidth || ''}
                onChange={handleWidthChange}
                min="640"
                max="7680"
                className="w-24"
              />
            </div>
            <span className="text-muted-foreground mt-6">×</span>
            <div className="flex flex-col gap-1">
              <Label htmlFor="height" className="text-sm text-muted-foreground">
                Alto
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="1080"
                value={gameConfig.resHeight || ''}
                onChange={handleHeightChange}
                min="480"
                max="4320"
                className="w-24"
              />
            </div>
          </div>
        </div>

        {/* Pantalla Completa */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="fullscreen">Pantalla Completa</Label>
            <p className="text-sm text-muted-foreground">
              Lanza Minecraft en modo pantalla completa
            </p>
          </div>
          <Switch id="fullscreen" checked={gameConfig.fullscreen} onCheckedChange={setFullscreen} />
        </div>

        {/* Autoconexión */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Wifi size={15} />
              <Label htmlFor="autoConnect">Autoconexión al Servidor</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Conecta automáticamente al servidor cuando inicie el juego
            </p>
          </div>
          <Switch
            id="autoConnect"
            checked={gameConfig.autoConnect}
            onCheckedChange={setAutoConnect}
          />
        </div>

        {/* Sincronizar Idioma */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="syncLanguage">Sincronizar Idioma</Label>
            <p className="text-sm text-muted-foreground">
              Usa el mismo idioma del launcher en el juego
            </p>
          </div>
          <Switch
            id="syncLanguage"
            checked={gameConfig.syncLanguage}
            onCheckedChange={setSyncLanguage}
          />
        </div>

        {/* Proceso Independiente */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="launchDetached">Proceso Independiente</Label>
            <p className="text-sm text-muted-foreground">
              Permite cerrar el launcher después de iniciar el juego
            </p>
          </div>
          <Switch
            id="launchDetached"
            checked={gameConfig.launchDetached}
            onCheckedChange={setLaunchDetached}
          />
        </div>
      </div>
    </ConfigTab>
  )
}
