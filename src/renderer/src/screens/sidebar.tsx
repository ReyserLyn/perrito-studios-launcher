import { Settings } from 'lucide-react'

import { FaDiscord, FaFacebook, FaTiktok, FaXTwitter } from 'react-icons/fa6'
import logo from '../assets/images/logos/Cua_Color_LBlanco.webp'
import { Button } from '../components/ui/button'
import { useNavigationStore } from '../stores/use-navigation-store'

export function Sidebar() {
  const { goToConfig } = useNavigationStore()

  const openSocialLink = (url: string) => {
    window.api.system.openExternal?.(url)
  }

  return (
    <div className="h-screen w-20 bg-[#151126] border-r border-[#2c1e4d] flex flex-col">
      {/* Logo */}
      <div className="p-2 flex justify-center my-10">
        <img src={logo} alt="Perrito Studios Logo" className="w-20 h-auto object-contain" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 flex flex-col">
        <div className="gap-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            title="TikTok"
            onClick={() => openSocialLink('https://www.tiktok.com/@perritostudios')}
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <FaTiktok size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Twitter/X"
            onClick={() => openSocialLink('https://x.com/PerritoStudios')}
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <FaXTwitter size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Facebook"
            onClick={() => openSocialLink('https://x.com/PerritoStudios')}
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <FaFacebook size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Discord"
            onClick={() => openSocialLink('https://discord.gg/BGyGxeaq27')}
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <FaDiscord size={5} />
          </Button>
        </div>
      </nav>

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
