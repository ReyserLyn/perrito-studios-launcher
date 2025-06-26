import { Badge } from '@/components/ui/badge'
import type { UpdateInfo } from '@/stores/updater-store'

interface UpdateDetailsProps {
  updateInfo: UpdateInfo
  updateSeverity: 'major' | 'minor' | 'patch' | 'prerelease'
}

export const UpdateDetails = ({ updateInfo, updateSeverity }: UpdateDetailsProps) => {
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge variant={getSeverityColor()}>v{updateInfo.version}</Badge>
        <Badge variant="outline" className="text-xs">
          {getSeverityText()}
        </Badge>
      </div>

      {updateInfo.releaseName && (
        <div>
          <h4 className="font-medium text-sm">{updateInfo.releaseName}</h4>
        </div>
      )}

      {updateInfo.releaseDate && (
        <p className="text-sm text-muted-foreground">
          Publicado el {formatReleaseDate(updateInfo.releaseDate)}
        </p>
      )}

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
    </div>
  )
}
