import logo from '@/assets/images/logos/Rec_Color_LBlanco.webp'
import { DialogServers } from '@/components/DialogServers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useServerData } from '@/hooks'
import { Play } from 'lucide-react'

export function Home() {
  const { currentServer } = useServerData()

  return (
    <main className="px-12 py-24 w-full h-full">
      <div className="flex flex-col gap-4 justify-between h-full">
        {/* Header */}
        <div className="flex flex-col">
          <img src={logo} alt="Perrito Studios" className="2xl:w-96 w-80 h-auto" />
          <h1 className="text-2xl font-bold hidden">Perrito Studios</h1>
        </div>

        {/* Servidor */}
        <section className="flex gap-4 justify-between">
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="bg-[#151126] py-1 px-4 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              {currentServer?.rawServer?.address || 69} jugadores conectados
            </Badge>

            <h1 className="text-5xl 2xl:text-6xl font-extrabold">
              {currentServer?.rawServer?.name} ({currentServer?.rawServer?.minecraftVersion})
            </h1>

            <div className="flex flex-col gap-2">
              <DialogServers />

              <Button
                variant="outline"
                className="flex items-center gap-2 bg-[#151126] border-[#2c1e4d] border-1 max-w-80 justify-start h-auto"
                effect="shineHover"
              >
                <Play size={25} />
                <span className="text-xl font-medium">Play</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-[400px] justify-center items-center">
            <div className="bg-[#151126] border-[#2c1e4d] border-1 rounded-full p-4">
              <img
                src={currentServer?.rawServer?.icon}
                alt="Perrito Studios"
                className="w-48 h-auto object-contain"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
