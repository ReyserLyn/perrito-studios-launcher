import { TabsContent } from '../ui/tabs'

interface ConfigTabProps {
  value: string
  children: React.ReactNode
}

export function ConfigTab({ value, children }: ConfigTabProps) {
  return (
    <TabsContent
      value={value}
      className="flex-1 mt-0 justify-center items-center border border-[#2c1e4d] rounded-lg bg-[#1d1332]/50 p-8 data-[state=active]:flex data-[state=inactive]:hidden overflow-y-auto custom-scrollbar min-h-0"
    >
      {children}
    </TabsContent>
  )
}
