import { AccountsList } from '@/components/accounts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useAuthData, useCurrentUser } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { Settings, User } from 'lucide-react'
import { useState } from 'react'

interface DialogAccountsProps {
  triggerClassName?: string
}

export function DialogAccounts({ triggerClassName }: DialogAccountsProps) {
  const user = useCurrentUser()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { goToConfig } = useNavigationStore()

  const { accounts, isLoading } = useAuthData()

  const handleAccountSelect = () => {
    setIsDialogOpen(false)
  }

  const handleAccountLogout = () => {
    setIsDialogOpen(false)
  }

  const handleManageAccounts = () => {
    goToConfig('account')
    setIsDialogOpen(false)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`px-8 py-5 flex items-center justify-center gap-4 transition-all duration-300 hover:shadow-none group hover:bg-transparent ${triggerClassName}`}
        >
          <span className="text-xl font-light transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.9)] group-hover:text-purple-200 group-hover:filter group-hover:brightness-110">
            {user?.displayName || 'Sin cuenta seleccionada'}
          </span>
          <Avatar className="w-12 h-12 transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,1)] group-hover:scale-110 group-hover:brightness-105 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]">
            <AvatarImage
              src={`https://api.mineatar.io/face/${user?.uuid || user?.username}?scale=16&overlay=true`}
              alt={user?.displayName}
            />
            <AvatarFallback>
              <User size={24} />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-[#151126] border-[#2c1e4d] border-1">
        <DialogHeader>
          <DialogTitle className="text-center">Seleccionar Cuenta</DialogTitle>
          <DialogDescription>Elige la cuenta con la que quieres jugar.</DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
          <AccountsList
            accounts={accounts}
            isLoading={isLoading || false}
            onAccountSelect={handleAccountSelect}
            onAccountLogout={handleAccountLogout}
            className="space-y-2"
          />
        </div>

        <div className="flex justify-center mt-4 pt-4 border-t border-[#2c1e4d]">
          <Button
            variant="outline"
            onClick={handleManageAccounts}
            className="bg-[#1d1332] border-[#2c1e4d] hover:bg-[#2c1e4d]"
          >
            <Settings size={16} className="mr-2" />
            Administrar Cuentas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
