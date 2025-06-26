import { LucideIcon } from 'lucide-react'
import { IconType } from 'react-icons'
import { TabsContent } from '../ui/tabs'

interface ConfigTabProps {
  value: string
  children: React.ReactNode
}

interface ConfigTabHeaderProps {
  title: string
  description: string
  Icon: LucideIcon | IconType
}

export function ConfigTab({ value, children }: ConfigTabProps) {
  return (
    <TabsContent
      value={value}
      className="flex-1 mt-0 border border-[#2c1e4d] rounded-lg bg-[#1d1332]/50 data-[state=active]:flex data-[state=inactive]:hidden overflow-hidden min-h-0"
    >
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <div className="p-8 min-h-full">{children}</div>
      </div>
    </TabsContent>
  )
}

export function ConfigTabHeader({ title, description, Icon }: ConfigTabHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
