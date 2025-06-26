import { Settings } from 'lucide-react'

import logo from '../assets/images/logos/Cua_Color_LBlanco.webp'
import { SocialButtons } from '../components/sidebar/social-buttons'
import { Button } from '../components/ui/button'
import { useNavigationStore } from '../stores/use-navigation-store'

export function Sidebar() {
  const { goToConfig } = useNavigationStore()

  return (
    <div className="h-screen w-20 bg-[#151126] border-r border-[#2c1e4d] flex flex-col">
      {/* Logo */}
      <div className="p-2 flex justify-center my-10">
        <img src={logo} alt="Perrito Studios Logo" className="w-20 h-auto object-contain" />
      </div>

      {/* Main Navigation */}
      <SocialButtons />

      {/* Bottom Actions */}
      <div className="p-2 my-5">
        <div className="gap-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            title="Configuración"
            onClick={() => goToConfig('minecraft')}
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Settings size={5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
