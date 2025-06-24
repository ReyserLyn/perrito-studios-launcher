import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { ArrowLeft, Bot, Download, Gamepad, Info, Settings, User } from 'lucide-react'

const tabs = [
  {
    name: 'Cuenta',
    value: 'account',
    icon: User
  },
  {
    name: 'Minecraft',
    value: 'minecraft',
    icon: Gamepad
  },
  {
    name: 'Mods',
    value: 'mods',
    icon: Bot
  },
  {
    name: 'Java',
    value: 'java',
    icon: Settings
  },
  {
    name: 'Launcher ',
    value: 'launcher',
    icon: Settings
  },
  {
    name: 'Acerca de',
    value: 'about',
    icon: Info
  },
  {
    name: 'Actualizaciones',
    value: 'updates',
    icon: Download
  }
]

interface ConfigManagerProps {
  tab?: string
}

export default function ConfigManager({ tab = 'account' }: ConfigManagerProps) {
  const { backToHome } = useNavigationStore()
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a0515] to-[#1a1329] text-white">
      {/* Header con botón de retroceso */}
      <div className="flex items-center p-4 border-b border-[#2c1e4d]">
        <Button
          variant="ghost"
          size="icon"
          onClick={backToHome}
          className="mr-4 hover:bg-[#2c1e4d]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-acherus font-bold">Configuración</h1>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto h-full">
          <Tabs orientation="vertical" defaultValue={tab} className="h-full flex flex-row gap-6">
            <TabsList className="h-fit flex-col min-w-48 p-1 bg-[#1d1332] border border-[#2c1e4d] py-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full border-l-2 border-b-0 border-t-0 border-r-0 border-transparent justify-start rounded-l-none rounded-r-lg data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:bg-primary/20 py-3 px-4 text-whizte hover:bg-[#2c1e4d] transition-colors"
                >
                  <tab.icon className="h-5 w-5 me-3" /> {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="flex-1 mt-0 justify-center items-center border border-[#2c1e4d] rounded-lg bg-[#1d1332]/50 p-8 data-[state=active]:flex data-[state=inactive]:hidden"
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <tab.icon className="h-20 w-20 mb-6 text-primary" />
                  <h2 className="text-2xl font-semibold mb-4">{tab.name}</h2>
                  <p className="text-muted-foreground text-lg">
                    Configuración de {tab.name.toLowerCase()} próximamente disponible
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
