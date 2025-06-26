import { useTranslation } from '@/hooks'
import { useLauncherConfig } from '@/hooks/config/use-launcher-config'
import { Settings } from 'lucide-react'
import { DataDirectorySection } from '../launcher/DataDirectorySection'
import { LanguageSection } from '../launcher/LanguageSection'
import { PrereleaseSection } from '../launcher/PrereleaseSection'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export const ConfigLauncher = () => {
  const { t } = useTranslation()

  const {
    currentLanguage,
    allowPrerelease,
    dataDirectory,
    isSelectingDirectory,
    handleLanguageChange,
    handlePrereleaseChange,
    handleSelectDataDirectory
  } = useLauncherConfig()

  return (
    <ConfigTab value="launcher">
      <div className="flex flex-col h-full w-full gap-6">
        <ConfigTabHeader
          title={t('settings.launcher.title')}
          description={t('settings.launcher.description')}
          Icon={Settings}
        />

        <div className="space-y-6 flex-1 overflow-y-auto">
          <LanguageSection
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />

          <PrereleaseSection
            allowPrerelease={allowPrerelease}
            onPrereleaseChange={handlePrereleaseChange}
          />

          <DataDirectorySection
            dataDirectory={dataDirectory}
            isSelectingDirectory={isSelectingDirectory}
            onSelectDirectory={handleSelectDataDirectory}
          />
        </div>
      </div>
    </ConfigTab>
  )
}
