import { useTranslation } from '@/hooks/use-translation'
import { LucideIcon, Package } from 'lucide-react'
import type { ServerMod } from '../../types/mods'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { ModCard } from './mod-card'

interface ModsSectionProps {
  title: string
  description: string
  mods: ServerMod[]
  variant: 'required' | 'optional'
  onToggle?: (modId: string, enabled: boolean) => void
  isPending?: boolean
  icon?: LucideIcon
}

export function ModsSection({
  title,
  description,
  mods,
  variant,
  onToggle,
  isPending = false,
  icon: Icon = Package
}: ModsSectionProps) {
  const { t } = useTranslation()

  const emptyMessage =
    variant === 'required' ? t('settings.mods.required.empty') : t('settings.mods.optional.empty')

  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
          <Badge variant="secondary">{mods.length}</Badge>
        </CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {mods.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <div className="space-y-3">
            {mods.map((mod) => (
              <ModCard
                key={mod.id}
                mod={mod}
                variant={variant}
                onToggle={onToggle}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
