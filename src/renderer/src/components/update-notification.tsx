import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUpdater } from '@/hooks/config/use-updater'
import { AlertTriangle, Download, X, Zap } from 'lucide-react'
import { useState } from 'react'

export const UpdateNotification = () => {
  const { isUpdateAvailable, updateInfo, actions, updateSeverity } = useUpdater()

  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !isUpdateAvailable || !updateInfo) {
    return null
  }

  const getSeverityColor = () => {
    switch (updateSeverity) {
      case 'major':
        return 'destructive'
      case 'minor':
        return 'default'
      case 'patch':
        return 'secondary'
      case 'prerelease':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getSeverityText = () => {
    switch (updateSeverity) {
      case 'major':
        return 'Actualización Mayor'
      case 'minor':
        return 'Actualización Menor'
      case 'patch':
        return 'Parche de Corrección'
      case 'prerelease':
        return 'Pre-lanzamiento'
      default:
        return 'Actualización'
    }
  }

  const getIcon = () => {
    if (updateInfo.isUpdateReady) return <Zap className="h-5 w-5 text-green-500" />
    if (updateSeverity === 'major') return <AlertTriangle className="h-5 w-5 text-orange-500" />
    return <Download className="h-5 w-5 text-blue-500" />
  }

  return (
    <Card className="fixed top-4 right-4 w-96 z-50 bg-gradient-to-br from-blue-50 to-white border border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <CardTitle className="text-lg">
                {updateInfo.isUpdateReady ? 'Actualización Lista' : 'Nueva Actualización'}
              </CardTitle>
              <CardDescription>
                {updateInfo.isUpdateReady
                  ? 'La actualización se ha descargado correctamente'
                  : 'Una nueva versión está disponible'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información de la versión */}
        <div className="flex items-center gap-2">
          <Badge variant={getSeverityColor()}>v{updateInfo.version}</Badge>
          <Badge variant="outline" className="text-xs">
            {getSeverityText()}
          </Badge>
        </div>

        {/* Nombre del release */}
        {updateInfo.releaseName && (
          <p className="text-sm font-medium text-gray-700">{updateInfo.releaseName}</p>
        )}

        {/* Progreso de descarga */}
        {updateInfo.isDownloading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Descargando...</span>
              <span>{Math.round(updateInfo.downloadProgress ?? 0)}%</span>
            </div>
            <Progress value={updateInfo.downloadProgress ?? 0} className="h-2" />
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          {updateInfo.isUpdateReady ? (
            <Button onClick={actions.installUpdate} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Instalar y Reiniciar
            </Button>
          ) : (
            <Button
              onClick={actions.downloadUpdate}
              disabled={updateInfo.isDownloading}
              className="flex-1"
            >
              {updateInfo.isDownloading ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </>
              )}
            </Button>
          )}

          <Button variant="outline" onClick={() => setDismissed(true)}>
            Más tarde
          </Button>
        </div>

        {/* Notas de la versión resumidas */}
        {updateInfo.releaseNotes && (
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Ver notas de la versión
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-gray-700 max-h-24 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-xs">
                {updateInfo.releaseNotes.slice(0, 200)}
                {updateInfo.releaseNotes.length > 200 && '...'}
              </pre>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
