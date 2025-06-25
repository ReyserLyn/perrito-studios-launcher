import { Package } from 'lucide-react'
import { ConfigTab, ConfigTabHeader } from '../config-manager/config-tab'

export function ModsLoading() {
  return (
    <ConfigTab value="mods">
      <div className="flex flex-col h-full w-full gap-4">
        <ConfigTabHeader
          title="Mods"
          description="Configura los mods de Minecraft"
          Icon={Package}
        />
        <div className="flex items-center justify-center py-8">
          <span className="text-muted-foreground">Cargando información de mods...</span>
        </div>
      </div>
    </ConfigTab>
  )
}
