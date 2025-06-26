import { Package } from 'lucide-react'
import { useServerData, useTranslation } from '../../hooks'
import { useModsData, useToggleServerMod } from '../../hooks/mods'
import { DialogServers } from '../dialog-servers'
import { ModsLoading, ModsSection } from '../mods'
import { DropInModsSection } from '../mods/drop-in-mods-section'
import { ServerTriggerConfigButton } from '../servers'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export default function ConfigMods() {
  const { t } = useTranslation()

  const { currentServer } = useServerData()
  const modsQuery = useModsData()

  const requiredMods = modsQuery.data?.requiredMods || []
  const optionalMods = modsQuery.data?.optionalMods || []
  const isLoading = modsQuery.isLoading
  const toggleServerMod = useToggleServerMod()

  const description = currentServer
    ? t('settings.mods.description', {
        serverName: currentServer?.rawServer.name
      })
    : t('settings.mods.description-default')

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
          title={t('settings.mods.title')}
          description={description}
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
          title={t('settings.mods.required.title')}
          description={t('settings.mods.required.description')}
          mods={requiredMods}
          variant="required"
        />
        {/* Mods Opcionales */}
        <ModsSection
          title={t('settings.mods.optional.title')}
          description={t('settings.mods.optional.description')}
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
