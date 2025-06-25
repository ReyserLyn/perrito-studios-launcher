import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useServerData, useSetSelectedServer } from '@/hooks'
import { ReactNode, useState } from 'react'
import { ServerList, ServerTriggerButton } from './servers'

interface DialogServersProps {
  trigger?: ReactNode
  className?: string
}

export function DialogServers({ trigger, className }: DialogServersProps = {}) {
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

  // Trigger por defecto si no se proporciona uno personalizado
  const defaultTrigger = (
    <ServerTriggerButton
      displayName={displayName}
      displayVersion={displayVersion}
      className={className}
    />
  )

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-[#151126] border-[#2c1e4d] border-1">
        <DialogHeader>
          <DialogTitle className="text-center">Seleccionar Servidor</DialogTitle>
          <DialogDescription className="text-center">
            Elige el servidor en el que quieres jugar.
          </DialogDescription>
        </DialogHeader>

        <ServerList
          serverList={serverList || []}
          idSelectedServer={idSelectedServer || null}
          isLoading={isLoading}
          onServerSelect={handleServerSelect}
          isSelecting={setSelectedServer.isPending}
          selectingServerId={setSelectedServer.variables}
        />
      </DialogContent>
    </Dialog>
  )
}
