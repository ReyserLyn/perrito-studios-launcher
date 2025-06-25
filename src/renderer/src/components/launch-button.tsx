import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useGameLauncher } from '@/hooks/use-game-launcher'
import { Loader2, Play, Square } from 'lucide-react'

export const LaunchButton = () => {
  const {
    launchGame,
    killGame,
    canLaunch,
    isLaunching,
    isGameRunning,
    progressPercentage,
    currentStage,
    stageDetails,
    launchError
  } = useGameLauncher()

  const handleClick = () => {
    if (isGameRunning) {
      killGame()
    } else if (canLaunch) {
      launchGame()
    }
  }

  const getButtonText = () => {
    if (isGameRunning) return 'Terminar'
    if (isLaunching) {
      switch (currentStage) {
        case 'validating':
          return 'Validando...'
        case 'java-scan':
          return 'Verificando Java...'
        case 'java-download':
          return 'Descargando Java...'
        case 'file-validation':
          return 'Validando archivos...'
        case 'file-download':
          return 'Descargando archivos...'
        case 'launch-prep':
          return 'Preparando...'
        case 'launching':
          return 'Iniciando...'
        default:
          return 'Cargando...'
      }
    }
    return 'Play'
  }

  const getIcon = () => {
    if (isGameRunning) {
      return <Square size={25} />
    }
    if (isLaunching) {
      return <Loader2 size={25} className="animate-spin" />
    }
    return <Play size={25} />
  }

  return (
    <div className="flex flex-col gap-2 max-w-80">
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-[#151126] border-[#2c1e4d] border-1 justify-start h-auto disabled:opacity-50"
        effect="shineHover"
        onClick={handleClick}
        disabled={!canLaunch && !isGameRunning}
      >
        {getIcon()}
        <span className="text-xl font-medium">{getButtonText()}</span>
      </Button>

      {/* Mostrar progreso si está lanzando */}
      {isLaunching && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2 bg-[#2c1e4d]" />
          {stageDetails && <p className="text-sm text-gray-400 truncate">{stageDetails}</p>}
        </div>
      )}

      {/* Mostrar error si hay */}
      {launchError && <p className="text-sm text-red-400 truncate">Error: {launchError}</p>}
    </div>
  )
}
