import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useUpdater } from '@/hooks/config/use-updater'
import { useTranslation } from '@/hooks/use-translation'
import { AlertCircle, Download, RefreshCw, Zap } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

export const UpdateStatus = () => {
  const { t } = useTranslation()

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
    if (error) return t('settings.updates.status.error')
    if (isUpdateReady) return t('settings.updates.status.ready')
    if (isDownloading) return t('settings.updates.status.downloading')
    if (isUpdateAvailable)
      return t('settings.updates.status.updateAvailable', { version: updateInfo?.version ?? '' })
    if (isChecking) return t('settings.updates.status.checking')
    return t('settings.updates.status.unknown')
  }

  return (
    <ConfigCard
      title={t('settings.updates.status.title')}
      description={t('settings.updates.status.description')}
      icon={RefreshCw}
    >
      <div className="space-y-4">
        {/* Versión Actual */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t('settings.updates.status.currentVersion')}
              </span>
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
            {t('settings.updates.actions.check')}
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
              <span>{t('settings.updates.status.downloading')}</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}
      </div>
    </ConfigCard>
  )
}
