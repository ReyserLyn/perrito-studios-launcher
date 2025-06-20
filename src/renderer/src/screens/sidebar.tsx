import { Download, Home, Settings, Users } from 'lucide-react'
import logo from '../assets/images/logos/Cua_Color_LBlanco.webp'
import { Button } from '../components/ui/button'

export function Sidebar() {
  return (
    <div className="h-screen w-20 bg-[#151126] border-r border-[#2c1e4d] flex flex-col">
      {/* Logo */}
      <div className="p-2 flex justify-center my-10">
        <img src={logo} alt="Perrito Studios Logo" className="w-20 h-auto object-contain" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 flex flex-col ">
        <div className="gap-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            title="Inicio"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Home size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Descargas"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Download size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Servidores"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Users size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Configuración"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Settings size={5} />
          </Button>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 my-5">
        <div className="gap-2 flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            title="Cuentas"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Users size={5} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Configuración"
            asChild
            className="bg-[#1d1332] border-[#2c1e4d] border-1 p-3 h-11 w-11"
          >
            <Settings size={5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
