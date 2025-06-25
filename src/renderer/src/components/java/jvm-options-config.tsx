import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

const DEFAULT_JVM_OPTIONS =
  '-XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M'

interface JVMOptionsConfigProps {
  jvmOptions: string
  onJVMOptionsChange: (options: string) => void
}

export const JVMOptionsConfig = ({ jvmOptions, onJVMOptionsChange }: JVMOptionsConfigProps) => (
  <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
    <CardHeader>
      <CardTitle>Opciones Adicionales de JVM</CardTitle>
      <CardDescription>Configura opciones adicionales para la JVM</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input
        value={jvmOptions}
        onChange={(e) => onJVMOptionsChange(e.target.value)}
        placeholder={DEFAULT_JVM_OPTIONS}
      />

      <div className="text-sm text-muted-foreground space-y-2">
        <p>
          Opciones que serán proporcionadas a la JVM en tiempo de ejecución. -Xms y -Xmx no deben
          incluirse.
        </p>
        <p>
          <strong>Opciones recomendadas:</strong> {DEFAULT_JVM_OPTIONS}
        </p>
      </div>
    </CardContent>
  </Card>
)
