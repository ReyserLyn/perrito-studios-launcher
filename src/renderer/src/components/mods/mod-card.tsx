import type { ServerMod } from '../../types/mods'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'

interface ModCardProps {
  mod: ServerMod
  onToggle?: (modId: string, enabled: boolean) => void
  isPending?: boolean
  variant?: 'required' | 'optional'
}

export function ModCard({ mod, onToggle, isPending = false, variant = 'optional' }: ModCardProps) {
  const isRequired = variant === 'required'

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-[#1d1332] transition-colors cursor-pointer">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{mod.name || 'NOMBRE VACÍO'}</span>
          <Badge variant={isRequired ? 'secondary' : 'outline'} className="text-xs">
            {isRequired ? 'Requerido' : 'Opcional'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Versión: {mod.version}</p>
        {mod.description && <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {isRequired ? (
          <Badge variant="outline" className="text-green-600">
            Activo
          </Badge>
        ) : (
          <Switch
            checked={mod.enabled}
            onCheckedChange={(enabled) => onToggle?.(mod.id, enabled)}
            disabled={isPending}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  )
}
