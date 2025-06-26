import { useTranslation } from '@/hooks'
import { FaJava } from 'react-icons/fa6'
import { ConfigTab, ConfigTabHeader } from '../config-manager/config-tab'

export const JavaLoadingState = () => {
  const { t } = useTranslation()

  return (
    <ConfigTab value="java">
      <div className="flex flex-col gap-6">
        <ConfigTabHeader
          title={t('settings.java.title')}
          description={t('settings.java.description')}
          Icon={FaJava}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('settings.java.status.loading')}</p>
        </div>
      </div>
    </ConfigTab>
  )
}

export const JavaEmptyState = () => {
  const { t } = useTranslation()

  return (
    <ConfigTab value="java">
      <div className="flex flex-col gap-6">
        <ConfigTabHeader
          title={t('settings.java.title')}
          description={t('settings.java.description')}
          Icon={FaJava}
        />
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('settings.java.status.empty')}</p>
        </div>
      </div>
    </ConfigTab>
  )
}
