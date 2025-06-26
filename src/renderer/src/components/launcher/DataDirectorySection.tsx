import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/use-translation'
import { FolderOpen } from 'lucide-react'
import { ConfigCard } from '../config-manager/config-card'

interface DataDirectorySectionProps {
  dataDirectory: string
  isSelectingDirectory: boolean
  onSelectDirectory: () => void
}

export const DataDirectorySection = ({
  dataDirectory,
  isSelectingDirectory,
  onSelectDirectory
}: DataDirectorySectionProps) => {
  const { t } = useTranslation()

  return (
    <ConfigCard
      icon={FolderOpen}
      title={t('settings.launcher.data_directory.title')}
      description={t('settings.launcher.data_directory.description')}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={dataDirectory}
            readOnly
            className="flex-1 font-mono text-sm"
            placeholder={t('settings.launcher.data_directory.select_placeholder')}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onSelectDirectory}
            disabled={isSelectingDirectory}
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('settings.launcher.data_directory.warning')}
        </p>
      </div>
    </ConfigCard>
  )
}
