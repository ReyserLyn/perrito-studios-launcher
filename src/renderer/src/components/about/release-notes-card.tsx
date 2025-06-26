import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks'
import { useAppInfo } from '@/hooks/config/about/use-app-info'
import { Clock, ExternalLink, Loader2, ScrollText } from 'lucide-react'
import { FaGithub } from 'react-icons/fa6'
import { ConfigCard } from '../config-manager/config-card'

export const ReleaseNotesCard = () => {
  const { t } = useTranslation()

  const { isLoading, error, releaseInfo, actions } = useAppInfo()
  const { openReleaseNotes } = actions

  const getDescription = () => {
    if (isLoading) return t('settings.about.changelog.status.loading')
    if (error) return t('settings.about.changelog.status.error')
    if (!releaseInfo.hasReleases) return t('settings.about.changelog.empty.description')
    return t('settings.about.changelog.status.last-release')
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={14} className="animate-spin" />
          {t('settings.about.changelog.status.loading')}
        </div>
      )
    }

    if (error) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {t('settings.about.changelog.status.error')}: {error}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openReleaseNotes}
            className="flex items-center gap-2 text-sm w-full"
          >
            <FaGithub size={14} />
            {t('settings.about.changelog.actions.view-release')}
          </Button>
        </div>
      )
    }

    if (!releaseInfo.hasReleases) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={14} />
            {t('settings.about.changelog.empty.message')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('settings.about.changelog.empty.info')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={openReleaseNotes}
            className="flex items-center gap-2 text-sm w-full"
          >
            <FaGithub size={14} />
            {t('settings.about.changelog.empty.actions.view-release')}
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {releaseInfo.currentRelease ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {releaseInfo.currentRelease.name ||
                t('settings.about.changelog.release.name', {
                  name: releaseInfo.currentRelease.tag_name
                })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('settings.about.changelog.release.info', {
                date: new Date(releaseInfo.currentRelease.published_at).toLocaleDateString('es-ES')
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('settings.about.changelog.status.not-found')}
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={openReleaseNotes}
          className="flex items-center gap-2 text-sm w-full"
        >
          <ExternalLink size={14} />
          {releaseInfo.currentRelease
            ? t('settings.about.changelog.release.actions.view-release')
            : t('settings.about.changelog.release.actions.view-all')}
        </Button>
      </div>
    )
  }

  return (
    <ConfigCard
      icon={ScrollText}
      title={t('settings.about.changelog.title')}
      description={getDescription()}
    >
      {renderContent()}
    </ConfigCard>
  )
}
