import { useCurrentUser } from '@/hooks'
import { AuthAccount } from '@/types'
import { Loader2 } from 'lucide-react'
import { AccountCard } from './account-card'
import { AccountsEmpty } from './accounts-empty'

interface AccountsListProps {
  accounts: AuthAccount[]
  isLoading: boolean
  onAccountSelect?: () => void
  onAccountLogout?: () => void
  showManageButton?: boolean
  className?: string
}

export function AccountsList({
  accounts,
  isLoading,
  onAccountSelect,
  onAccountLogout,
  showManageButton,
  className = ''
}: AccountsListProps) {
  const user = useCurrentUser()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin" />
        <span className="ml-2">Cargando cuentas...</span>
      </div>
    )
  }

  if (accounts.length === 0) {
    return <AccountsEmpty showManageButton={showManageButton} />
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {accounts.map((account) => (
        <AccountCard
          key={account.uuid}
          account={account}
          isSelected={user?.uuid === account.uuid}
          onSelect={onAccountSelect}
          onLogout={onAccountLogout}
        />
      ))}
    </div>
  )
}
