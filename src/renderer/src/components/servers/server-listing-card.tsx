import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'
import { Loader2, Server } from 'lucide-react'
import { HeliosServer } from 'perrito-core/common'

export interface ServerListingCardProps {
  server: HeliosServer
  isSelected: boolean
  onSelect: (serverId: string) => void
  isLoading?: boolean
  loadingServerId?: string
}

export function ServerListingCard({
  server,
  isSelected,
  onSelect,
  isLoading = false,
  loadingServerId
}: ServerListingCardProps) {
  const { t } = useTranslation()

  const isMainServer = server.rawServer?.mainServer
  const isCurrentlyLoading = isLoading && loadingServerId === server.rawServer?.id

  return (
    <Button
      variant={isSelected ? 'outline' : 'default'}
      effect="shineHover"
      className={`
        w-full h-auto p-4 flex items-start gap-3 justify-start
        ${
          isSelected
            ? 'bg-[#1d1332] border-[#2c1e4d] border-1 '
            : 'bg-gray-900 border-[#2c1e4d] border-1 hover:bg-[#1d1332]'
        }
      `}
      onClick={() => onSelect(server.rawServer.id)}
      disabled={isLoading}
    >
      {/* Icono del servidor */}
      <div className="relative flex-shrink-0">
        {server.rawServer?.icon ? (
          <img
            src={server.rawServer.icon}
            alt={server.rawServer.name}
            className="w-12 h-12 rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
            <Server size={24} />
          </div>
        )}
      </div>

      {/* Detalles del servidor */}
      <div className="flex-1 text-left space-y-1">
        <div className="font-medium text-sm">
          {server.rawServer?.name || t('server.status.no-name')}
        </div>

        {server.rawServer?.description && (
          <div className="text-xs line-clamp-2">{server.rawServer.description}</div>
        )}

        <div className="flex flex-wrap gap-1 mt-2">
          {server.rawServer?.minecraftVersion && (
            <Badge variant="outline" className="text-xs">
              {server.rawServer.minecraftVersion}
            </Badge>
          )}

          {server.rawServer?.version && (
            <Badge variant="outline" className="text-xs">
              v{server.rawServer.version}
            </Badge>
          )}

          {isMainServer && (
            <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
              Principal
            </Badge>
          )}

          {isSelected && (
            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
              {t('server.status.selected')}
            </Badge>
          )}
        </div>
      </div>

      {/* Indicador de carga o selección */}
      <div className="flex-shrink-0">
        {isCurrentlyLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isSelected ? (
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        ) : null}
      </div>
    </Button>
  )
}
