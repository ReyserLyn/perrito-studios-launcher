import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useAuthStatus, useSelectAccount, useLogout } from '@/hooks/useAuth'
import { useAuth } from '@/stores/appStore'
import { AuthAccount } from '@/types'
import { Loader2, LogOut, User, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'

export function DialogAccounts() {
  const { user } = useAuth()
  const { accountsList, isLoading } = useAuthStatus()
  const selectAccount = useSelectAccount()
  const logout = useLogout()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAccountSelect = async (uuid: string) => {
    try {
      await selectAccount.mutateAsync(uuid)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error seleccionando cuenta:', error)
    }
  }

  const handleLogout = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await logout.mutateAsync()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const AccountCard = ({ account }: { account: AuthAccount }) => {
    const isSelected = user?.uuid === account.uuid
    const accountType = account.type === 'microsoft' ? 'Microsoft' : 'Mojang'

    return (
      <div
        className={`
          w-full h-auto p-4 flex items-start gap-3 justify-start border rounded-lg
          ${
            isSelected
              ? 'bg-[#1d1332] border-[#2c1e4d] border-1 '
              : 'bg-gray-900 border-[#2c1e4d] border-1 hover:bg-[#1d1332]'
          }
        `}
      >
        {/* Avatar del usuario */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={`https://mc-heads.net/avatar/${account.uuid}/64`}
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
                Cuenta Activa
              </div>
            </div>
          )}
        </div>

        {/* Área clickeable para seleccionar cuenta */}
        <div
          className="flex-1 text-left space-y-1 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleAccountSelect(account.uuid)}
        >
          <div className="font-medium text-sm">{account.displayName || 'Usuario sin nombre'}</div>

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
                Activa
              </Badge>
            )}
          </div>
        </div>

        {/* Botones de acción */}
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
            onClick={(e) => handleLogout(e)}
            disabled={logout.isPending}
            title="Cerrar sesión"
          >
            {logout.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          title="Cuentas"
          className="px-8 py-5 flex items-center justify-center gap-4"
        >
          <span className="text-xl font-light">
            {user?.displayName || 'Sin cuenta seleccionada'}
          </span>
          <Users size={40} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-[#151126] border-[#2c1e4d] border-1">
        <DialogHeader>
          <DialogTitle className="text-center">Seleccionar Cuenta</DialogTitle>
          <DialogDescription>Elige la cuenta con la que quieres jugar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" />
              <span className="ml-2">Cargando cuentas...</span>
            </div>
          ) : accountsList.length > 0 ? (
            accountsList.map((account) => <AccountCard key={account.uuid} account={account} />)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay cuentas disponibles</p>
              <p className="text-sm">
                Agrega una cuenta desde la sección de Cuentas en configuración
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
