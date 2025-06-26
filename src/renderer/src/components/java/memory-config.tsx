import { useTranslation } from '@/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

const MIN_RECOMMENDED_RAM = 5

export interface MemoryConfigProps {
  minRAM: number
  maxRAM: number
  totalMemory: number
  freeMemory: number
  isLoadingMemory: boolean
  onMinRAMChange: (value: number) => void
  onMaxRAMChange: (value: number) => void
}

export const MemoryConfig = ({
  minRAM,
  maxRAM,
  totalMemory,
  freeMemory,
  isLoadingMemory,
  onMinRAMChange,
  onMaxRAMChange
}: MemoryConfigProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle>{t('settings.java.memory.title')}</CardTitle>
        <CardDescription>
          {t('settings.java.memory.description')}
          {!isLoadingMemory && (
            <div className="mt-1 text-sm">
              {t('settings.java.memory.system', {
                totalMemory: totalMemory,
                freeMemory: freeMemory
              })}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Maximum RAM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('settings.java.memory.max')}</Label>
            <span className="text-sm text-muted-foreground">{maxRAM}GB</span>
          </div>
          <Slider
            value={[maxRAM]}
            min={1}
            max={totalMemory}
            step={1}
            onValueChange={(value) => onMaxRAMChange(value[0])}
            disabled={isLoadingMemory}
          />
        </div>

        {/* Minimum RAM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('settings.java.memory.min')}</Label>
            <span className="text-sm text-muted-foreground">{minRAM}GB</span>
          </div>
          <Slider
            value={[minRAM]}
            min={1}
            max={totalMemory}
            step={1}
            onValueChange={(value) => onMinRAMChange(value[0])}
            disabled={isLoadingMemory}
          />
        </div>

        {/* Advertencias básicas */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('settings.java.memory.info', {
              recommended: MIN_RECOMMENDED_RAM
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
