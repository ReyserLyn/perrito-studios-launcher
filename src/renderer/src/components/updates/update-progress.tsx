import { Progress } from '@/components/ui/progress'
import { useTranslation } from '@/hooks/use-translation'
import type { UpdateInfo } from '@/stores/updater-store'

interface UpdateProgressProps {
  updateInfo: UpdateInfo
}

export const UpdateProgress = ({ updateInfo }: UpdateProgressProps) => {
  const { t } = useTranslation()

  if (!updateInfo.isDownloading) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{t('settings.updates.actions.downloading')}</span>
        <span>{Math.round(updateInfo.downloadProgress ?? 0)}%</span>
      </div>
      <Progress value={updateInfo.downloadProgress ?? 0} className="h-2" />
    </div>
  )
}
