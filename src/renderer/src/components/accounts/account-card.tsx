import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks'
import { useRemoveAccount, useSelectAccount } from '@/hooks/auth/use-auth'
import { AuthAccount } from '@/types'
import { Loader2, LogOut, User, UserCheck } from 'lucide-react'

interface AccountCardProps {
  account: AuthAccount
  isSelected?: boolean
  onSelect?: () => void
  onLogout?: () => void
  showActions?: boolean
  className?: string
}

export function AccountCard({
  account,
  isSelected = false,
  onSelect,
  onLogout,
  className = ''
}: AccountCardProps) {
  const { t } = useTranslation()

  const selectAccount = useSelectAccount()
  const removeAccount = useRemoveAccount()

  const accountType = account.type === 'microsoft' ? 'Microsoft' : 'Mojang'

  const handleSelect = async () => {
    if (isSelected) {
      return
    }

    await selectAccount.mutateAsync(account.uuid)
    onSelect?.()
  }

  const handleLogout = async (event: React.MouseEvent) => {
    event.stopPropagation()

    await removeAccount.mutateAsync({
      uuid: account.uuid,
      type: account.type as 'microsoft' | 'mojang'
    })
    onLogout?.()
  }

  return (
    <div
      className={`
        w-full h-auto p-4 flex items-start gap-3 justify-start border rounded-lg transition-colors
        ${
          isSelected
            ? 'bg-[#1d1332] border-[#2c1e4d] border-1'
            : 'bg-gray-900 border-[#2c1e4d] border-1 hover:bg-[#1d1332]'
        }
        ${className}
      `}
    >
      {/* Avatar del usuario */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={`https://api.mineatar.io/face/${account.uuid || account.username}?scale=16&overlay=true`}
            alt={account.displayName}
          />
          <AvatarFallback>
            <User size={24} />
          </AvatarFallback>
        </Avatar>

        {/* Indicador de cuenta seleccionada */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 group">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <UserCheck size={12} className="text-white" fill="currentColor" />
            </div>
            <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {t('common.status.active')}
            </div>
          </div>
        )}
      </div>

      {/* Área clickeable para seleccionar cuenta */}
      <div
        className="flex-1 text-left space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleSelect}
      >
        <div className="font-medium text-sm">
          {account.displayName || t('auth.account.status.not-found')}
        </div>

        <div className="text-xs text-muted-foreground">UUID: {account.uuid}</div>

        <div className="flex flex-wrap gap-1 mt-2">
          <Badge
            variant={accountType === 'Microsoft' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {accountType}
          </Badge>

          {isSelected && (
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
              {t('common.status.active')}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {/* Indicador de carga o selección */}
        <div className="flex items-center">
          {selectAccount.isPending && selectAccount.variables === account.uuid ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isSelected ? (
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          ) : null}
        </div>

        {/* Botón de cerrar sesión */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          onClick={handleLogout}
          disabled={removeAccount.isPending}
          title="Cerrar sesión"
        >
          {removeAccount.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LogOut size={14} />
          )}
        </Button>
      </div>
    </div>
  )
}
