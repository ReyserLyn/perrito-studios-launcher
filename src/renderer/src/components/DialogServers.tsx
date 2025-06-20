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
import { useServerData, useSetSelectedServer } from '@/hooks'
import { Loader2, Server } from 'lucide-react'
import { useState } from 'react'

export function DialogServers() {
  const { serverList, idSelectedServer, isLoading, currentServer } = useServerData()
  const setSelectedServer = useSetSelectedServer()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const displayName = currentServer?.rawServer?.name || 'Seleccionar Servidor'
  const displayVersion = currentServer?.rawServer?.minecraftVersion
    ? `(Minecraft ${currentServer.rawServer.minecraftVersion})`
    : ''

  const handleServerSelect = async (serverId: string) => {
    try {
      await setSelectedServer.mutateAsync(serverId)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error seleccionando servidor:', error)
    }
  }

  const ServerListingCard = ({ server }: { server: any }) => {
    const isSelected = server.rawServer?.id === idSelectedServer
    const isMainServer = server.rawServer?.mainServer

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
        onClick={() => handleServerSelect(server.rawServer.id)}
        disabled={setSelectedServer.isPending}
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
            {server.rawServer?.name || 'Servidor sin nombre'}
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
                Seleccionado
              </Badge>
            )}
          </div>
        </div>

        {/* Indicador de carga o selección */}
        <div className="flex-shrink-0">
          {setSelectedServer.isPending && setSelectedServer.variables === server.rawServer.id ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isSelected ? (
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          ) : null}
        </div>
      </Button>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-[#151126] border-[#2c1e4d] border-1 max-w-72 justify-start h-auto p-3"
        >
          <Server size={20} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{displayName}</span>
            {displayVersion && (
              <span className="text-xs text-muted-foreground">{displayVersion}</span>
            )}
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-[#151126] border-[#2c1e4d] border-1">
        <DialogHeader>
          <DialogTitle className="text-center">Seleccionar Servidor</DialogTitle>
          <DialogDescription className="text-center">
            Elige el servidor en el que quieres jugar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" />
              <span className="ml-2">Cargando servidores...</span>
            </div>
          ) : serverList && serverList.length > 0 ? (
            serverList.map((server) => (
              <ServerListingCard key={server.rawServer?.id || server.id} server={server} />
            ))
          ) : (
            <div className="text-center py-8 ">No se encontraron servidores disponibles</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
