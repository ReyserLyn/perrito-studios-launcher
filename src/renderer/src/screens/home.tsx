import logo from '@/assets/images/logos/Rec_Color_LBlanco.webp'
import { DialogAccounts } from '@/components/DialogAccounts'
import { DialogServers } from '@/components/DialogServers'
import { LaunchButton } from '@/components/launchButton'
import { Badge } from '@/components/ui/badge'
import { useCurrentServerStatus, useServerData } from '@/hooks'
import { Loader2 } from 'lucide-react'
import fondo from '../assets/images/fondos/noche-steve-dog.webp'

export function Home() {
  const { currentServer, isLoading: serverLoading } = useServerData()
  const { data: currentServerStatus, isLoading: statusLoading } = useCurrentServerStatus()

  if (serverLoading) {
    return (
      <main className="px-12 py-24 w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin" />
          <p className="text-lg">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="px-12 py-24 w-full h-full">
      <img
        src={fondo}
        alt="Fondo de la aplicación"
        className="w-full h-full object-cover absolute top-0 left-0 -z-10"
      />
      <div className="flex flex-col gap-4 justify-between h-full">
        {/* Header */}
        <div className="flex justify-between">
          <img src={logo} alt="Perrito Studios" className="2xl:w-96 w-80 h-auto" />
          <h1 className="text-2xl font-bold hidden">Perrito Studios</h1>

          <DialogAccounts />
        </div>

        {/* Servidor */}
        <section className="flex gap-4 justify-between">
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="bg-[#151126] py-1 px-4 flex items-center">
              {statusLoading ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full mr-1 ${
                    currentServerStatus?.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              )}
              {statusLoading
                ? 'Cargando...'
                : currentServerStatus?.players?.label || 'Desconectado'}
            </Badge>

            <h1 className="text-5xl 2xl:text-6xl font-extrabold">
              {currentServer?.rawServer?.name} ({currentServer?.rawServer?.minecraftVersion})
            </h1>

            <div className="flex flex-col gap-2">
              <DialogServers />

              <LaunchButton />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-[400px] justify-center items-center">
            <div className="bg-[#151126] border-[#2c1e4d] border-1 rounded-full p-2">
              <img
                src={currentServer?.rawServer?.icon}
                alt="Perrito Studios"
                className="w-48 h-auto object-contain rounded-full"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
