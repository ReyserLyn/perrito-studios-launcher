import { useTranslation } from '@/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'

const DEFAULT_JVM_OPTIONS =
  '-XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M'

interface JVMOptionsConfigProps {
  jvmOptions: string
  onJVMOptionsChange: (options: string) => void
}

export const JVMOptionsConfig = ({ jvmOptions, onJVMOptionsChange }: JVMOptionsConfigProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle>{t('settings.java.jvm.title')}</CardTitle>
        <CardDescription>{t('settings.java.jvm.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={jvmOptions}
          onChange={(e) => onJVMOptionsChange(e.target.value)}
          placeholder={DEFAULT_JVM_OPTIONS}
        />

        <div className="text-sm text-muted-foreground space-y-2">
          <p>{t('settings.java.jvm.info')}</p>
          <p>
            <strong>{t('settings.java.jvm.recommended')}</strong> {DEFAULT_JVM_OPTIONS}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
