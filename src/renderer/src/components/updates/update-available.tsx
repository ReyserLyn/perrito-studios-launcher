import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useUpdater } from '@/hooks/config/use-updater'
import { Download, ExternalLink, RefreshCw, Zap } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

export const UpdateAvailable = () => {
  const { isDownloading, isUpdateReady, updateInfo, actions } = useUpdater()
  const { downloadUpdate, installUpdate } = actions
  const { version, severity, releaseName, releaseDate, releaseNotes, downloadURL } =
    updateInfo ?? {}

  const getVersionBadgeVariant = () => {
    switch (severity) {
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

  const formatUpdateType = (type: string) => {
    const types = {
      major: 'Actualización Mayor',
      minor: 'Actualización Menor',
      patch: 'Parche',
      prerelease: 'Pre-lanzamiento'
    }
    return types[type] || type
  }

  const formatReleaseDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Fecha desconocida'
    }
  }

  return (
    <ConfigCard
      title="Nueva Actualización Disponible"
      description="Se ha encontrado una nueva versión del launcher"
      icon={Download}
    >
      <div className="space-y-4">
        {/* Info de la actualización */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={getVersionBadgeVariant()}>v{version}</Badge>
            <Badge variant="outline" className="text-xs">
              {formatUpdateType(severity ?? 'patch')}
            </Badge>
          </div>

          {releaseName && (
            <div>
              <h4 className="font-medium text-sm">{releaseName}</h4>
            </div>
          )}

          {releaseDate && (
            <p className="text-sm text-muted-foreground">
              Publicado el {formatReleaseDate(releaseDate)}
            </p>
          )}

          {releaseNotes && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Notas de la versión:</h5>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{releaseNotes}</pre>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Acciones */}
        <div className="flex gap-3">
          {isUpdateReady ? (
            <Button onClick={installUpdate} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Instalar y Reiniciar
            </Button>
          ) : (
            <Button onClick={downloadUpdate} disabled={isDownloading} className="flex-1">
              {isDownloading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Actualización
                </>
              )}
            </Button>
          )}

          {downloadURL && (
            <Button variant="outline" asChild>
              <a href={downloadURL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver en GitHub
              </a>
            </Button>
          )}
        </div>
      </div>
    </ConfigCard>
  )
}
