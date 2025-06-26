import { useTranslation } from '@/hooks'
import { formatRAMValue, parseRAMValue } from '@/utils/ram-utils'
import { Code } from 'lucide-react'
import { useCallback } from 'react'
import { useJavaConfigManager } from '../../hooks/config/use-java-config'
import { useServerData } from '../../hooks/use-servers'
import { useSystemMemory } from '../../hooks/use-system-memory'
import { DialogServers } from '../dialog-servers'
import {
  JavaEmptyState,
  JavaExecutableConfig,
  JavaLoadingState,
  JVMOptionsConfig,
  MemoryConfig
} from '../java'
import { ServerTriggerConfigButton } from '../servers'
import { ConfigTab, ConfigTabHeader } from './config-tab'

const DEFAULT_MAX_RAM = 16

export const ConfigJava = () => {
  const { t } = useTranslation()

  const { currentServer } = useServerData()
  const { memoryInfo, isLoading: isLoadingMemory } = useSystemMemory()

  const { isLoading, isSelectingExecutable, config, updateConfig, selectJavaExecutable } =
    useJavaConfigManager()

  const handleMaxRAMChange = useCallback(
    (value: number) => {
      const newMaxRAM = value
      const currentMinRAM = parseRAMValue(config?.minRAM || '1G')

      // Si el nuevo maxRAM es menor que minRAM, igualar minRAM a maxRAM
      if (newMaxRAM < currentMinRAM) {
        updateConfig({
          maxRAM: formatRAMValue(newMaxRAM),
          minRAM: formatRAMValue(newMaxRAM)
        })
      } else {
        updateConfig({ maxRAM: formatRAMValue(newMaxRAM) })
      }
    },
    [updateConfig, config]
  )

  const handleMinRAMChange = useCallback(
    (value: number) => {
      const newMinRAM = value
      const currentMaxRAM = parseRAMValue(config?.maxRAM || '5G')

      // Si el nuevo minRAM es mayor que maxRAM, igualar maxRAM a minRAM
      if (newMinRAM > currentMaxRAM) {
        updateConfig({
          minRAM: formatRAMValue(newMinRAM),
          maxRAM: formatRAMValue(newMinRAM)
        })
      } else {
        updateConfig({ minRAM: formatRAMValue(newMinRAM) })
      }
    },
    [updateConfig, config]
  )

  const handleJVMOptionsChange = useCallback(
    (options: string) => {
      updateConfig({ jvmOptions: options })
    },
    [updateConfig]
  )

  if (isLoading) {
    return <JavaLoadingState />
  }

  if (!config) {
    return <JavaEmptyState />
  }

  const maxRAM = parseRAMValue(config.maxRAM)
  const minRAM = parseRAMValue(config.minRAM)
  const totalMemory = memoryInfo.total > 0 ? memoryInfo.total : DEFAULT_MAX_RAM
  const freeMemory = memoryInfo.free > 0 ? memoryInfo.free : 0

  return (
    <ConfigTab value="java">
      <div className="flex flex-col gap-6">
        <ConfigTabHeader
          title={t('settings.java.title')}
          description={t('settings.java.description')}
          Icon={Code}
        />

        {/* Selector de Servidor */}
        {currentServer && (
          <DialogServers
            trigger={<ServerTriggerConfigButton server={currentServer} className="w-full" />}
          />
        )}

        {/* Configuración de Memoria */}
        <MemoryConfig
          minRAM={minRAM}
          maxRAM={maxRAM}
          totalMemory={totalMemory}
          freeMemory={freeMemory}
          isLoadingMemory={isLoadingMemory}
          onMinRAMChange={handleMinRAMChange}
          onMaxRAMChange={handleMaxRAMChange}
        />

        {/* Configuración de Java */}
        <JavaExecutableConfig
          executable={config.executable}
          isSelecting={isSelectingExecutable}
          onSelectExecutable={selectJavaExecutable}
        />

        {/* Opciones de JVM */}
        <JVMOptionsConfig
          jvmOptions={config.jvmOptions}
          onJVMOptionsChange={handleJVMOptionsChange}
        />
      </div>
    </ConfigTab>
  )
}
