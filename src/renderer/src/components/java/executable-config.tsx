import { Code, FileInput } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

interface JavaExecutableConfigProps {
  executable: string
  isSelecting: boolean
  onSelectExecutable: () => void
}

export const JavaExecutableConfig = ({
  executable,
  isSelecting,
  onSelectExecutable
}: JavaExecutableConfigProps) => (
  <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
    <CardHeader>
      <CardTitle>Ejecutable de Java</CardTitle>
      <CardDescription>Selecciona la versión de Java a utilizar</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2">
        <Code size={15} />
        <span>Seleccionado: Java 21 (Oracle Corporation)</span>
      </div>

      <div className="flex gap-2">
        <Input
          value={executable}
          readOnly
          className="flex-1"
          placeholder="C:\Program Files\Java\jdk-21\bin\javaw.exe"
        />
        <Button variant="outline" size="icon" onClick={onSelectExecutable} disabled={isSelecting}>
          <FileInput className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        El ejecutable de Java es validado antes del lanzamiento del juego. Se requiere Java 21 x64.
        <br />
        La ruta debe terminar con bin\javaw.exe
      </p>
    </CardContent>
  </Card>
)
