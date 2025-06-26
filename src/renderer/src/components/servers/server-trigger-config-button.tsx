import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/hooks/use-translation'
import { Package } from 'lucide-react'
import { HeliosServer } from 'perrito-core/common'

interface ServerTriggerConfigButtonProps {
  server: HeliosServer
  className?: string
  onClick?: () => void
}

export function ServerTriggerConfigButton({
  server,
  className = '',
  onClick
}: ServerTriggerConfigButtonProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`w-full p-4 border border-[#2c1e4d] rounded-lg bg-[#151126] hover:bg-[#1d1332] transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Logo del servidor */}
        <div className="flex-shrink-0">
          {server.rawServer?.icon ? (
            <img
              src={server.rawServer.icon}
              alt={server.rawServer.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              <Package size={32} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Información del servidor */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {server.rawServer?.name || 'Servidor'}
            </h3>
            {server.rawServer?.mainServer && (
              <Badge variant="default" className="text-xs bg-yellow-500 hover:bg-yellow-600">
                {t('server.status.main')}
              </Badge>
            )}
          </div>

          {server.rawServer?.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {server.rawServer.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {server.rawServer?.minecraftVersion && (
              <Badge variant="outline" className="text-xs">
                Minecraft {server.rawServer.minecraftVersion}
              </Badge>
            )}
            {server.rawServer?.version && (
              <Badge variant="outline" className="text-xs">
                v{server.rawServer.version}
              </Badge>
            )}
          </div>
        </div>

        {/* Indicador de cambio */}
        <div className="flex-shrink-0 text-muted-foreground">
          <span className="text-sm">{t('server.actions.change')}</span>
        </div>
      </div>
    </div>
  )
}
