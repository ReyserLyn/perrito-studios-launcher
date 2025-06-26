import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { Settings, User } from 'lucide-react'

interface AccountsEmptyProps {
  showManageButton?: boolean
}

export function AccountsEmpty({ showManageButton = true }: AccountsEmptyProps) {
  const { t } = useTranslation()
  const { goToConfig } = useNavigationStore()

  return (
    <div className="text-center py-8 text-muted-foreground">
      <User size={48} className="mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium">{t('settings.account.empty.title')}</p>
      <p className="text-sm mb-4">{t('settings.account.empty.description')}</p>

      {showManageButton && (
        <Button
          variant="outline"
          onClick={() => {
            goToConfig('account')
          }}
          className="bg-[#1d1332] border-[#2c1e4d] hover:bg-[#2c1e4d]"
        >
          <Settings size={16} className="mr-2" />
          {t('settings.account.actions.manage')}
        </Button>
      )}
    </div>
  )
}
