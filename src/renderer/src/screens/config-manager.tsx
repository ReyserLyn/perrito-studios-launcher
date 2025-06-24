import { MojangLoginForm } from '@/components/auth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStatus } from '@/hooks'
import { useNavigationStore } from '@/stores/use-navigation-store'
import {
  ArrowLeft,
  Bot,
  Cross,
  Download,
  Gamepad,
  Info,
  Settings,
  Square,
  SquareUser,
  User
} from 'lucide-react'
import { useState } from 'react'

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

type ConfigView = 'main' | 'add-perrito-account'

export default function ConfigManager({ tab = 'account' }: ConfigManagerProps) {
  const { backToHome } = useNavigationStore()
  const { refetchAccounts, refetchSelectedAccount } = useAuthStatus()
  const [currentView, setCurrentView] = useState<ConfigView>('main')

  const handleAddPerritoAccount = () => {
    setCurrentView('add-perrito-account')
  }

  const handleBackToConfig = () => {
    setCurrentView('main')
  }

  const handleAccountSuccess = () => {
    refetchAccounts()
    refetchSelectedAccount()
    setCurrentView('main')
  }

  if (currentView === 'add-perrito-account') {
    return (
      <MojangLoginForm
        onBack={handleBackToConfig}
        onSuccess={handleAccountSuccess}
        title="Agregar Cuenta Perrito Studios"
        description="Crea una nueva cuenta offline para Perrito Studios"
        placeholder="Nombre de usuario"
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a0515] to-[#1a1329] text-white">
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

            <TabsContent
              value="account"
              className="flex-1 mt-0 justify-center items-center border border-[#2c1e4d] rounded-lg bg-[#1d1332]/50 p-8 data-[state=active]:flex data-[state=inactive]:hidden"
            >
              <div className="flex flex-col h-full w-full gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-semibold">Cuenta</h2>
                  </div>

                  <p className="text-muted-foreground text-sm">
                    Añada nuevas cuentas o administre las existente.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Square size={15} />
                      <p className=" font-semibold">Microsoft</p>
                    </div>
                    <Button variant="ghost" className="gap-2">
                      <Cross size={15} />
                      <p>Añadir cuenta Microsft</p>
                    </Button>
                  </div>

                  <div>{/* Card de cuentas Microsfot*/}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SquareUser size={15} />
                      <p className=" font-semibold">Perrito Studios</p>
                    </div>
                    <Button variant="ghost" className="gap-2" onClick={handleAddPerritoAccount}>
                      <Cross size={15} />
                      <p>Añadir cuenta Perrito Studios</p>
                    </Button>
                  </div>

                  <div>{/* Card de cuentas Perrito Studios*/}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
