import { TabsContent } from '@/components/ui/tabs'
import { useUpdater } from '@/hooks/config/use-updater'
import { UpdateAvailable, UpdateStatus } from '../updates'

export function ConfigUpdates() {
  const {
    isUpdateAvailable,

    updateInfo
  } = useUpdater()

  return (
    <TabsContent value="updates" className="flex-1 overflow-y-auto pr-2">
      <div className="space-y-6">
        <UpdateStatus />

        {isUpdateAvailable && updateInfo && <UpdateAvailable />}
      </div>
    </TabsContent>
  )
}
