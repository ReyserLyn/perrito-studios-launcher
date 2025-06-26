import { useTranslation } from '@/hooks/use-translation'
import { Package } from 'lucide-react'
import { ConfigTab, ConfigTabHeader } from '../config-manager/config-tab'

export function ModsLoading() {
  const { t } = useTranslation()
  return (
    <ConfigTab value="mods">
      <div className="flex flex-col h-full w-full gap-4">
        <ConfigTabHeader
          title={t('settings.mods.title')}
          description={t('settings.mods.description-default')}
          Icon={Package}
        />
        <div className="flex items-center justify-center py-8">
          <span className="text-muted-foreground">{t('settings.mods.status.loading')}</span>
        </div>
      </div>
    </ConfigTab>
  )
}
