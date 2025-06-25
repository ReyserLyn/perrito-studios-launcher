import { Package } from 'lucide-react'
import { useServerData } from '../../hooks'
import { useModsData, useToggleServerMod } from '../../hooks/mods'
import { DialogServers } from '../dialog-servers'
import { ModsLoading, ModsSection } from '../mods'
import { DropInModsSection } from '../mods/drop-in-mods-section'
import { ServerTriggerConfigButton } from '../servers'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export default function ConfigMods() {
  const { currentServer } = useServerData()
  const modsQuery = useModsData()

  const requiredMods = modsQuery.data?.requiredMods || []
  const optionalMods = modsQuery.data?.optionalMods || []
  const isLoading = modsQuery.isLoading
  const toggleServerMod = useToggleServerMod()

  const handleToggleServerMod = (modId: string, enabled: boolean) => {
    toggleServerMod.mutate({ modId, enabled })
  }

  if (isLoading) {
    return <ModsLoading />
  }

  return (
    <ConfigTab value="mods">
      <div className="flex flex-col gap-6">
        <ConfigTabHeader
          title="Mods"
          description={`Configura los mods para ${currentServer?.rawServer.name || 'el servidor actual'}`}
          Icon={Package}
        />
        {/* Información del servidor */}
        {currentServer && (
          <DialogServers
            trigger={<ServerTriggerConfigButton server={currentServer} className="w-full" />}
          />
        )}
        {/* Mods Obligatorios */}
        <ModsSection
          title="Mods Obligatorios"
          description="Estos mods son requeridos por el servidor y siempre están activos"
          mods={requiredMods}
          variant="required"
        />
        {/* Mods Opcionales */}
        <ModsSection
          title="Mods Opcionales"
          description="Estos mods pueden activarse o desactivarse según tus preferencias"
          mods={optionalMods}
          variant="optional"
          onToggle={handleToggleServerMod}
          isPending={toggleServerMod.isPending}
        />
        {/* Mods Drop-in (Locales) */}
        <DropInModsSection />
      </div>
    </ConfigTab>
  )
}
