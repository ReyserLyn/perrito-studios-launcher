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
  const hasEnoughMemory = freeMemory >= MIN_RECOMMENDED_RAM
  const isMemoryLow = freeMemory < maxRAM

  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle>Memoria</CardTitle>
        <CardDescription>
          Configura la memoria asignada a Minecraft
          {!isLoadingMemory && (
            <div className="mt-1 text-sm">
              Memoria del Sistema: {totalMemory}GB (Disponible: {freeMemory}GB)
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Maximum RAM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Memoria Máxima (RAM)</Label>
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
            <Label>Memoria Mínima (RAM)</Label>
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
            La memoria mínima recomendada es {MIN_RECOMMENDED_RAM}GB para un rendimiento óptimo.
          </p>
          {!hasEnoughMemory && (
            <p className="text-sm text-yellow-500">
              ¡Advertencia: La memoria disponible ({freeMemory}GB) es menor que la recomendada (
              {MIN_RECOMMENDED_RAM}GB)!
              {isMemoryLow && (
                <span> Considera cerrar otras aplicaciones antes de iniciar el juego.</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
