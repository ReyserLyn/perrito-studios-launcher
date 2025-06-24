import { Button } from '@/components/ui/button'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { Settings, User } from 'lucide-react'

interface AccountsEmptyProps {
  showManageButton?: boolean
}

export function AccountsEmpty({ showManageButton = true }: AccountsEmptyProps) {
  const { goToConfig } = useNavigationStore()

  return (
    <div className="text-center py-8 text-muted-foreground">
      <User size={48} className="mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium">No hay cuentas disponibles</p>
      <p className="text-sm mb-4">Agrega una cuenta desde la sección de Cuentas en configuración</p>

      {showManageButton && (
        <Button
          variant="outline"
          onClick={() => {
            goToConfig('account')
          }}
          className="bg-[#1d1332] border-[#2c1e4d] hover:bg-[#2c1e4d]"
        >
          <Settings size={16} className="mr-2" />
          Administrar Cuentas
        </Button>
      )}
    </div>
  )
}
