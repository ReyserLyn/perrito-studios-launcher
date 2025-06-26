import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUpdater } from '@/hooks/config/use-updater'
import { AlertCircle, Download, RefreshCw, Zap } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

export const UpdateStatus = () => {
  const {
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdateReady,
    currentVersion,
    updateInfo,
    downloadProgress,
    error,
    actions
  } = useUpdater()

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (isUpdateReady) return <Zap className="h-4 w-4 text-green-500" />
    if (isUpdateAvailable) return <Download className="h-4 w-4 text-blue-500" />
    return <RefreshCw className={`h-4 w-4 text-gray-500 ${isChecking ? 'animate-spin' : ''}`} />
  }

  const getStatusText = () => {
    if (error) return 'Error al verificar actualizaciones'
    if (isUpdateReady) return 'Actualización lista para instalar'
    if (isDownloading) return 'Descargando actualización...'
    if (isUpdateAvailable) return `Nueva versión disponible: ${updateInfo?.version}`
    if (isChecking) return 'Verificando actualizaciones...'
    return 'Estado desconocido'
  }

  return (
    <ConfigCard
      title="Estado del Launcher"
      description="Información sobre la versión actual y actualizaciones"
      icon={RefreshCw}
    >
      <div className="space-y-4">
        {/* Versión Actual */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Versión Actual</span>
              <Badge variant={currentVersion.includes('-') ? 'outline' : 'secondary'}>
                v{currentVersion}
              </Badge>
              {currentVersion.includes('-') && (
                <Badge variant="outline" className="text-xs">
                  Pre-release
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={actions.checkForUpdates}
            disabled={isChecking || isDownloading}
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progreso de Descarga */}
        {isDownloading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Descargando actualización...</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}
      </div>
    </ConfigCard>
  )
}
