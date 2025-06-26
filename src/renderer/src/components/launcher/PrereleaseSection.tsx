import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from '@/hooks/use-translation'
import { Upload } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

interface PrereleaseSectionProps {
  allowPrerelease: boolean
  onPrereleaseChange: (enabled: boolean) => void
}

export const PrereleaseSection = ({
  allowPrerelease,
  onPrereleaseChange
}: PrereleaseSectionProps) => {
  const { t } = useTranslation()

  return (
    <ConfigCard
      icon={Upload}
      title={t('settings.launcher.prerelease.title')}
      description={t('settings.launcher.prerelease.description')}
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="allowPrerelease">{t('settings.launcher.prerelease.label')}</Label>
        <Switch
          id="allowPrerelease"
          checked={allowPrerelease}
          onCheckedChange={onPrereleaseChange}
        />
      </div>
    </ConfigCard>
  )
}
