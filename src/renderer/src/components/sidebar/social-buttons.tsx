import { FaDiscord, FaFacebook, FaTiktok, FaXTwitter } from 'react-icons/fa6'
import { Button } from '../ui/button'

export const SocialButtons = () => {
  const openSocialLink = (url: string) => {
    window.api.system.openExternal?.(url)
  }

  return (
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
  )
}
