import { Loader2 } from 'lucide-react'
import { HeliosServer } from 'perrito-core/common'
import { ServerListingCard } from './server-listing-card'

export interface ServerListProps {
  serverList: HeliosServer[]
  idSelectedServer: string | null
  isLoading: boolean
  onServerSelect: (serverId: string) => void
  isSelecting?: boolean
  selectingServerId?: string
  className?: string
}

export function ServerList({
  serverList,
  idSelectedServer,
  isLoading,
  onServerSelect,
  isSelecting = false,
  selectingServerId,
  className = 'space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2'
}: ServerListProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin" />
          <span className="ml-2">Cargando servidores...</span>
        </div>
      </div>
    )
  }

  if (!serverList || serverList.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-8">No se encontraron servidores disponibles</div>
      </div>
    )
  }

  return (
    <div className={className}>
      {serverList.map((server) => (
        <ServerListingCard
          key={server.rawServer?.id}
          server={server}
          isSelected={server.rawServer?.id === idSelectedServer}
          onSelect={onServerSelect}
          isLoading={isSelecting}
          loadingServerId={selectingServerId}
        />
      ))}
    </div>
  )
}
