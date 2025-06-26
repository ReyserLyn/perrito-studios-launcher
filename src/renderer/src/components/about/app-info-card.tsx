import logoImage from '@/assets/images/logos/Rec_Color_LBlanco.webp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks'
import { useAppInfo } from '@/hooks/config/about/use-app-info'
import { CheckCircle, ExternalLink, Info, Loader2, Settings } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { ConfigCard } from '../config-manager/config-card'

export const AppInfoCard = () => {
  const { t } = useTranslation()

  const { appInfo, isLoading, error, actions } = useAppInfo()
  const { version, isStable } = appInfo
  const { openGithub, openSupport, openDevTools } = actions

  return (
    <ConfigCard
      icon={Info}
      title={t('settings.about.info.title')}
      description={t('settings.about.info.description')}
    >
      <div className="space-y-4">
        {/* Version Info */}
        <div className="flex items-center space-x-3">
          <img
            src={logoImage}
            alt="Perrito Studios Launcher"
            className="w-40 rounded-lg object-contain p-1"
          />
          <div>
            <div className="font-semibold text-lg flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('settings.about.info.status.loading')}
                </>
              ) : error ? (
                `v${version} (${t('common.status.error')}: ${error})`
              ) : (
                `v${version}`
              )}
            </div>
            {!isLoading && !error && (
              <Badge variant={isStable ? 'default' : 'secondary'} className="text-xs">
                <CheckCircle size={12} className="mr-1" />
                {isStable
                  ? t('settings.about.info.versions.stable')
                  : t('settings.about.info.versions.prerelease')}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openGithub}
            className="flex items-center gap-2 text-sm"
          >
            <FaGithub size={14} />
            {t('settings.about.info.actions.source-code')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openSupport}
            className="flex items-center gap-2 text-sm"
          >
            <ExternalLink size={14} />
            {t('settings.about.info.actions.report-issue')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openDevTools}
            className="flex items-center gap-2 text-sm"
          >
            <Settings size={14} />
            {t('settings.about.info.actions.open-dev-tools')}
          </Button>
        </div>
      </div>
    </ConfigCard>
  )
}
