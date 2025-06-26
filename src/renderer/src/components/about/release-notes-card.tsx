import { Button } from '@/components/ui/button'
import { useAppInfo } from '@/hooks/config/about/use-app-info'
import { Clock, ExternalLink, Github, Loader2, ScrollText } from 'lucide-react'
import { ConfigCard } from '../config-card'

export const ReleaseNotesCard = () => {
  const { isLoading, error, releaseInfo, actions } = useAppInfo()
  const { openReleaseNotes } = actions

  const getDescription = () => {
    if (isLoading) return 'Cargando información de releases...'
    if (error) return 'Error al conectar con GitHub'
    if (!releaseInfo.hasReleases) return 'Información de release disponible una vez publicada'
    return 'Información del último release'
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          Cargando información de releases...
        </div>
      )
    }

    if (error) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            No se pudo conectar con GitHub: {error}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openReleaseNotes}
            className="flex items-center gap-2 text-sm w-full"
          >
            <Github size={14} />
            Ver en GitHub
          </Button>
        </div>
      )
    }

    if (!releaseInfo.hasReleases) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} />
            Aún no se han publicado releases
          </div>
          <p className="text-sm text-muted-foreground">
            Este launcher está actualmente en desarrollo. Las notas de release estarán disponibles
            una vez que se publique la primera versión oficial.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={openReleaseNotes}
            className="flex items-center gap-2 text-sm w-full"
          >
            <Github size={14} />
            Ver Progreso de Desarrollo
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {releaseInfo.currentRelease ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {releaseInfo.currentRelease.name || `Versión ${releaseInfo.currentRelease.tag_name}`}
            </p>
            <p className="text-sm text-muted-foreground">
              Publicado el{' '}
              {new Date(releaseInfo.currentRelease.published_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Notas de release no encontradas para la versión actual
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={openReleaseNotes}
          className="flex items-center gap-2 text-sm w-full"
        >
          <ExternalLink size={14} />
          {releaseInfo.currentRelease ? 'Ver Notas de Release' : 'Ver Todos los Releases'}
        </Button>
      </div>
    )
  }

  return (
    <ConfigCard icon={ScrollText} title="Notas de Release" description={getDescription()}>
      {renderContent()}
    </ConfigCard>
  )
}
