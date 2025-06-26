import { useTranslation } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { AppScreen } from '@/types/navigation'
import { Loader2, Plus, User, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import logoImage from '../assets/images/logos/Rec_Color_LBlanco.webp'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { useAuthData, useSelectAccount } from '../hooks/auth/use-auth'
import { AuthAccount } from '../types'

export function AccountsAvailable() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const selectAccount = useSelectAccount()
  const { goTo } = useNavigationStore()
  const { accounts } = useAuthData()
  const { t } = useTranslation()

  const handleAccountSelect = async (uuid: string) => {
    setSelectedAccountId(uuid)
    try {
      await selectAccount.mutateAsync(uuid)
      toast.success(t('auth.success.select'))
    } catch (error) {
      console.error('[AccountsAvailable] Error seleccionando cuenta:', error)
      toast.error(t('auth.error.select-account'))
      setSelectedAccountId(null)
    }
  }

  const AccountCard = ({ account }: { account: AuthAccount }) => {
    const accountType = account.type === 'microsoft' ? 'Microsoft' : 'Mojang'
    const isSelecting = selectedAccountId === account.uuid

    return (
      <Card
        className="w-full bg-gray-900/80 border-gray-700 hover:bg-gray-800/80 transition-all cursor-pointer"
        onClick={() => handleAccountSelect(account.uuid)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {/* Avatar del usuario */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={`https://api.mineatar.io/face/${account.uuid || account.username}?scale=16&overlay=true`}
                alt={account.displayName}
              />
              <AvatarFallback>
                <User size={24} />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Detalles de la cuenta */}
          <div className="flex-1 text-left space-y-2">
            <div className="font-medium text-lg text-white">
              {account.displayName || t('auth.account.status.not-found')}
            </div>

            <div className="text-sm text-gray-400">UUID: {account.uuid}</div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={accountType === 'Microsoft' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {accountType}
              </Badge>
            </div>
          </div>

          {/* Indicador de carga */}
          <div className="flex-shrink-0">
            {isSelecting ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full hover:bg-blue-400 transition-colors" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoImage}
            alt="Perrito Studios Logo"
            className="w-64 h-auto object-contain mx-auto mb-6 opacity-90"
          />
          <h1 className="text-3xl font-acherus text-white mb-2">
            {t('auth.account.other-accounts.title')}
          </h1>
          <p className="text-gray-400 text-lg">{t('auth.account.other-accounts.subtitle')}</p>
        </div>

        {/* Lista de cuentas */}
        <div className="space-y-3 mb-8 max-h-80 overflow-y-auto custom-scrollbar">
          {accounts.map((account) => (
            <AccountCard key={account.uuid} account={account} />
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <Button
            onClick={() => goTo(AppScreen.Login)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium"
            size="lg"
            disabled={selectAccount.isPending}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('auth.account.other-accounts.login')}
          </Button>
        </div>

        {/* Info adicional */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} disponible
            {accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
