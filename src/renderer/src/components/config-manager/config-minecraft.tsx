import { Gamepad } from 'lucide-react'
import { ConfigTab, ConfigTabHeader } from './config-tab'

export function ConfigMinecraft() {
  return (
    <ConfigTab value="minecraft">
      <div className="flex flex-col h-full w-full gap-4">
        <ConfigTabHeader
          title="Minecraft"
          description="Configura tu cuenta de Minecraft"
          Icon={Gamepad}
        />
      </div>
    </ConfigTab>
  )
}
