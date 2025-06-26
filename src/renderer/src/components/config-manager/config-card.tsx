import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface ConfigCardProps {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}

export const ConfigCard = ({ icon: Icon, title, description, children }: ConfigCardProps) => {
  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon size={20} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
