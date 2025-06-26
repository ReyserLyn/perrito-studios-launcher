import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUpdater } from '@/hooks/config/use-updater'
import { useTranslation } from '@/hooks/use-translation'
import { AlertTriangle, Download, X, Zap } from 'lucide-react'
import { useState } from 'react'

export const UpdateNotification = () => {
  const { t } = useTranslation()

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
        return t('settings.updates.types.major')
      case 'minor':
        return t('settings.updates.types.minor')
      case 'patch':
        return t('settings.updates.types.patch')
      case 'prerelease':
        return t('settings.updates.types.prerelease')
      default:
        return t('settings.updates.notification.title')
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
                {updateInfo.isUpdateReady
                  ? t('settings.updates.notification.titleReady')
                  : t('settings.updates.notification.title')}
              </CardTitle>
              <CardDescription>
                {updateInfo.isUpdateReady
                  ? t('settings.updates.notification.descriptionReady')
                  : t('settings.updates.notification.description')}
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
              <span>{t('settings.updates.status.downloading')}</span>
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
              {t('settings.updates.actions.install')}
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
                  {t('settings.updates.actions.downloading')}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {t('settings.updates.actions.download')}
                </>
              )}
            </Button>
          )}

          <Button variant="outline" onClick={() => setDismissed(true)}>
            {t('settings.updates.actions.later')}
          </Button>
        </div>

        {/* Notas de la versión resumidas */}
        {updateInfo.releaseNotes && (
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              {t('settings.updates.releaseNotes.view')}
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
