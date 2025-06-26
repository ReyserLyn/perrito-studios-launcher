import { useTranslation } from '@/hooks'
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
}: JavaExecutableConfigProps) => {
  const { t } = useTranslation()

  return (
    <Card className="border-[#2c1e4d] rounded-lg bg-[#151126]">
      <CardHeader>
        <CardTitle>{t('settings.java.executable.title')}</CardTitle>
        <CardDescription>{t('settings.java.executable.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Code size={15} />
          <span>{t('settings.java.executable.selected')}</span>
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
          {t('settings.java.executable.required')}
          <br />
          {t('settings.java.executable.info')}
        </p>
      </CardContent>
    </Card>
  )
}
