import { useTranslation } from '@/hooks/use-translation'
import { Info } from 'lucide-react'
import { AppInfoCard } from '../about/app-info-card'
import { ReleaseNotesCard } from '../about/release-notes-card'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export const ConfigAbout = () => {
  const { t } = useTranslation()

  return (
    <ConfigTab value="about">
      <div className="flex flex-col h-full w-full gap-6">
        <ConfigTabHeader
          Icon={Info}
          title={t('settings.about.title')}
          description={t('settings.about.description')}
        />

        <div className="space-y-6 flex-1 overflow-y-auto">
          <AppInfoCard />

          <ReleaseNotesCard />
        </div>
      </div>
    </ConfigTab>
  )
}
