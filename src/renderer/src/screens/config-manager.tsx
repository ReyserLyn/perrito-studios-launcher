import { ConfigAccount } from '@/components/config-manager/config-account'
import { ConfigMinecraft } from '@/components/config-manager/config-minecraft'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfigManager } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import { ArrowLeft, Bot, Download, Gamepad, Info, Settings, User } from 'lucide-react'
import { useEffect, useState } from 'react'

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
    name: 'Launcher',
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
  const [activeTab, setActiveTab] = useState(tab)
  const { isLoading, isDirty, save, reset } = useConfigManager()

  useEffect(() => {
    setActiveTab(tab)
  }, [tab])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#0a0515] to-[#1a1329] text-white">
      {/* Header */}
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
      <div className="flex-1 p-8 overflow-hidden min-h-0">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <Tabs
            orientation="vertical"
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-row gap-6 min-h-0"
          >
            <TabsList className="h-fit flex-col min-w-48 p-1 bg-[#1d1332] border border-[#2c1e4d] py-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="w-full border-l-2 border-b-0 border-t-0 border-r-0 border-transparent justify-start rounded-l-none rounded-r-lg data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:bg-primary/20 py-3 px-4 text-white hover:bg-[#2c1e4d] transition-colors"
                >
                  <tab.icon className="h-5 w-5 me-3" /> {tab.name}
                </TabsTrigger>
              ))}
              <div className="flex flex-col items-center gap-2 mt-auto pt-4 border-t border-[#2c1e4d]">
                {isDirty && (
                  <Button
                    variant="outline"
                    onClick={() => reset()}
                    disabled={!isDirty || isLoading}
                    className="w-full"
                  >
                    Descartar Cambios
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={() => save()}
                  disabled={!isDirty || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </TabsList>

            <ConfigAccount setActiveTab={setActiveTab} />
            <ConfigMinecraft />
          </Tabs>
        </div>
      </div>
    </div>
  )
}
