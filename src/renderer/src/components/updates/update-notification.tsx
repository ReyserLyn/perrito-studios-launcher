import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUpdater } from '@/hooks/config/use-updater'
import { useTranslation } from '@/hooks/use-translation'
import { AlertTriangle, Download, X, Zap } from 'lucide-react'
import { useState } from 'react'
import { UpdateDetails } from './update-details'
import { UpdateProgress } from './update-progress'

export const UpdateNotification = () => {
  const { t } = useTranslation()

  const { isUpdateAvailable, updateInfo, actions, updateSeverity } = useUpdater()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !isUpdateAvailable || !updateInfo) {
    return null
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
        <UpdateDetails updateInfo={updateInfo} updateSeverity={updateSeverity} />
        <UpdateProgress updateInfo={updateInfo} />

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
      </CardContent>
    </Card>
  )
}
